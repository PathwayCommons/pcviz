package org.pathwaycommons.pcviz.service;

import org.cbio.causality.data.portal.CBioPortalAccessor;
import org.cbio.causality.data.portal.CancerStudy;
import org.cbio.causality.data.portal.CaseList;
import org.cbio.causality.data.portal.GeneticProfile;
import org.cbio.causality.model.Alteration;
import org.cbio.causality.model.AlterationPack;
import org.pathwaycommons.pcviz.model.CancerStudyDetails;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class CancerContextService {
    @Autowired
    private CBioPortalAccessor cBioPortalAccessor;

    private String portalUrl;

    private String dataCacheFolder;

    public String getDataCacheFolder() {
        return dataCacheFolder;
    }

    public void setDataCacheFolder(String dataCacheFolder) {
        this.dataCacheFolder = dataCacheFolder;
    }

    public String getPortalUrl() {
        return portalUrl;
    }

    public void setPortalUrl(String portalUrl) {
        this.portalUrl = portalUrl;
    }

    public CBioPortalAccessor getcBioPortalAccessor() {
        return cBioPortalAccessor;
    }

    public void setcBioPortalAccessor(CBioPortalAccessor cBioPortalAccessor) {
        this.cBioPortalAccessor = cBioPortalAccessor;
    }

    public List<CancerStudy> listAvailableCancers() throws IOException {
        return getcBioPortalAccessor().getCancerStudies();
    }

    public CancerStudyDetails getStudyDetails(String study) throws IOException {
        CancerStudyDetails cancerStudyDetails = new CancerStudyDetails();

        // Get/set cancer study
        CBioPortalAccessor portal = getcBioPortalAccessor();
        CancerStudy cancerStudyById = portal.getCancerStudyById(study);
        portal.setCurrentCancerStudy(cancerStudyById);
        cancerStudyDetails.setCancerStudy(cancerStudyById);

        // Now use the biggest case set as default
        CaseList caseListById = portal.getCaseListById(study + "_all");
        cancerStudyDetails.setNumberOfCases(caseListById.getCases().length);

        // Now find out if there is profiles
        for (GeneticProfile geneticProfile : portal.getGeneticProfilesForCurrentStudy()) {
            if(isCNA(geneticProfile)) cancerStudyDetails.setHasCNA(true);
            if(isExtendedMutation(geneticProfile)) cancerStudyDetails.setHasMutation(true);
            if(isZscores(geneticProfile)) cancerStudyDetails.setHasExpression(true);
        }

        return cancerStudyDetails;
    }

    private boolean isZscores(GeneticProfile geneticProfile) {
        return geneticProfile.getId().toLowerCase().endsWith("_mrna_median_zscores");
    }

    private boolean isExtendedMutation(GeneticProfile geneticProfile) {
        return geneticProfile.getId().toLowerCase().endsWith("_mutations");
    }

    private boolean isCNA(GeneticProfile profile) {
        return profile.getId().toLowerCase().endsWith("_gistic")
                || profile.getId().toLowerCase().endsWith("_cna");
    }

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
            AlterationPack alterations = portal.getAlterations(gene);
            double altered = alterations.calcAlteredRatio(Alteration.ANY);
            HashMap<String, Double> dataMap = new HashMap<String, Double>();
            dataMap.put(PropertyKey.ALTERED.toString(), altered);
            context.put(gene.toUpperCase(), dataMap);
        }

        return context;
    }
}
