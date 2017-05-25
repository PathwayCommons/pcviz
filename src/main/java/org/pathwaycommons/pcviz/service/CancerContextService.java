package org.pathwaycommons.pcviz.service;

import flexjson.JSONSerializer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pathwaycommons.pcviz.model.CancerStudyDetails;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.pathwaycommons.pcviz.cbioportal.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;

@Service
public class CancerContextService {

    private static final Log log = LogFactory.getLog(CancerContextService.class);

    private final CBioPortalAccessor cBioPortalAccessor;

    @Value("${cache.folder}")
    private String cacheDir;

    @Autowired
    public CancerContextService(GeneNameService geneNameService) {
        cBioPortalAccessor = new CBioPortalAccessor();
        cBioPortalAccessor.setGeneNameService(geneNameService);
    }

    @PostConstruct
    void init() throws IOException {
        Path dir = Paths.get(cacheDir, "cbioportal");
        if(!Files.exists(dir))
            Files.createDirectories(dir);

        cBioPortalAccessor.setCacheDir(cacheDir + FileSystems.getDefault().getSeparator() + "cbioportal");

        try {
            cBioPortalAccessor.initializeStudies();
        } catch (IOException e) {
            log.error("Failed to init studies from cBioPOrtal", e);
        }
    }

    @Cacheable("cancerContextStudiesCache")
    public String listAvailableCancers() throws IOException {
        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
        return jsonSerializer.deepSerialize(cBioPortalAccessor.getCancerStudies());
    }

    @Cacheable("cancerContextDetailsCache")
    public String getStudyDetails(String study) throws IOException {
        CancerStudyDetails cancerStudyDetails = new CancerStudyDetails();

        // Get/set cancer study
        CancerStudy cancerStudyById = cBioPortalAccessor.getCancerStudyById(study);
        cBioPortalAccessor.setCurrentCancerStudy(cancerStudyById);
        cancerStudyDetails.setCancerStudy(cancerStudyById);

        // Now use the biggest case set as default
        CaseList caseListById = cBioPortalAccessor.getCaseListById(study + "_all");
        if(cancerStudyById != null) {
            if(caseListById.getCases()!=null)
                cancerStudyDetails.setNumberOfCases(caseListById.getCases().length);
            // Now find out if there is profiles
            for (GeneticProfile geneticProfile : cBioPortalAccessor.getGeneticProfilesForCurrentStudy()) {
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

        CancerStudy cancerStudyById = cBioPortalAccessor.getCancerStudyById(studyId);
        cBioPortalAccessor.setCurrentCancerStudy(cancerStudyById);
        CaseList caseListById = cBioPortalAccessor.getCaseListById(studyId + "_all");
        cBioPortalAccessor.setCurrentCaseList(caseListById);

        ArrayList<GeneticProfile> geneticProfiles = new ArrayList<GeneticProfile>();
        for (GeneticProfile geneticProfile : cBioPortalAccessor.getGeneticProfilesForCurrentStudy()) {
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
        cBioPortalAccessor.setCurrentGeneticProfiles(geneticProfiles);

        for (String gene : genes.split(",")) {
            try {
                AlterationPack alterations = cBioPortalAccessor.getAlterations(gene);
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
