/*
 * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
 *
 * This file is part of PCViz.
 *
 * PCViz is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PCViz is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
 */

package org.pathwaycommons.pcviz.service;

import flexjson.JSONSerializer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.cbio.causality.data.portal.*;
import org.cbio.causality.model.Alteration;
import org.cbio.causality.model.AlterationPack;
import org.pathwaycommons.pcviz.model.CancerStudyDetails;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

@Service
public class CancerContextService {

    private static final Log log = LogFactory.getLog(CancerContextService.class);

    private CBioPortalAccessor cBioPortalAccessor;

    private String dataCacheFolder;

    @Value("${cbioportal.cache.folder}")
    public void setDataCacheFolder(String dataCacheFolder) {
        this.dataCacheFolder = dataCacheFolder;
    }

    public String getDataCacheFolder() {
        return dataCacheFolder;
    }

    public CBioPortalAccessor getcBioPortalAccessor() {
        return cBioPortalAccessor;
    }

    /**
     * Default Constructor.
     */
    public CancerContextService() {
    }

    @Autowired
    public void setcBioPortalAccessor(CBioPortalAccessor cBioPortalAccessor) {
        this.cBioPortalAccessor = cBioPortalAccessor;
    }

    @Cacheable("cancerContextStudiesCache")
    public String listAvailableCancers() throws IOException {
        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
        return jsonSerializer.deepSerialize(getcBioPortalAccessor().getCancerStudies());
    }

    @Cacheable("cancerContextDetailsCache")
    public String getStudyDetails(String study) throws IOException {
        CancerStudyDetails cancerStudyDetails = new CancerStudyDetails();

        // Get/set cancer study
        CBioPortalAccessor portal = getcBioPortalAccessor();
        CancerStudy cancerStudyById = portal.getCancerStudyById(study);
        portal.setCurrentCancerStudy(cancerStudyById);
        cancerStudyDetails.setCancerStudy(cancerStudyById);

        // Now use the biggest case set as default
        CaseList caseListById = portal.getCaseListById(study + "_all");
        if(cancerStudyById != null) {
            cancerStudyDetails.setNumberOfCases(caseListById.getCases().length); //TODO: it throws NPE sometimes
            // Now find out if there is profiles
            for (GeneticProfile geneticProfile : portal.getGeneticProfilesForCurrentStudy()) {
                if (isCNA(geneticProfile)) cancerStudyDetails.setHasCNA(true);
                if (isExtendedMutation(geneticProfile)) cancerStudyDetails.setHasMutation(true);
                if (isZscores(geneticProfile)) cancerStudyDetails.setHasExpression(true);
            }
        }

        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
        return jsonSerializer.deepSerialize(cancerStudyDetails);
    }

    private boolean isZscores(GeneticProfile geneticProfile) {
        return geneticProfile.getType().equals(ProfileType.MRNA_EXPRESSION)
                    && geneticProfile.getId().toLowerCase().endsWith("_zscores");
    }

    private boolean isExtendedMutation(GeneticProfile geneticProfile) {
        return geneticProfile.getId().toLowerCase().endsWith("_mutations");
    }

    private boolean isCNA(GeneticProfile profile) {
        return profile.getId().toLowerCase().endsWith("_gistic")
                || profile.getId().toLowerCase().endsWith("_cna");
    }

    @Cacheable("cancerContextAlterationsCache")
    public HashMap<String, HashMap<String, Double>> loadContext(String studyId, String profiles, String genes) throws IOException {
        HashMap<String, HashMap<String, Double>> context = new HashMap<String, HashMap<String, Double>>();

        CBioPortalAccessor.setCacheDir(getDataCacheFolder());
        CBioPortalAccessor portal = getcBioPortalAccessor();
        CancerStudy cancerStudyById = portal.getCancerStudyById(studyId);
        portal.setCurrentCancerStudy(cancerStudyById);
        CaseList caseListById = portal.getCaseListById(studyId + "_all");
        portal.setCurrentCaseList(caseListById);

        ArrayList<GeneticProfile> geneticProfiles = new ArrayList<GeneticProfile>();
        for (GeneticProfile geneticProfile : portal.getGeneticProfilesForCurrentStudy()) {
            if(profiles.contains("cna") && isCNA(geneticProfile)) {
                geneticProfiles.add(geneticProfile);

            }

            if(profiles.contains("mutation") && isExtendedMutation(geneticProfile)) {
                geneticProfiles.add(geneticProfile);
            }

            if(profiles.contains("exp") && isCNA(geneticProfile)) {
                geneticProfiles.add(geneticProfile);
            }
        }
        portal.setCurrentGeneticProfiles(geneticProfiles);

        for (String gene : genes.split(",")) {
            try {
                AlterationPack alterations = portal.getAlterations(gene);
                if (alterations != null) {
                    alterations.complete(Alteration.ANY);
                    double altered = alterations.calcAlteredRatio(Alteration.ANY);
                    HashMap<String, Double> dataMap = new HashMap<String, Double>();
                    dataMap.put(PropertyKey.ALTERED.toString(), altered);
                    context.put(gene.toUpperCase(), dataMap);
                }
            } catch (Exception e) {
                log.error("Cannot get alterations from cBio portal for: " + gene + ". " + e);
            }
        }

        return context;
    }
}
