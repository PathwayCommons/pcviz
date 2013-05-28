package org.pathwaycommons.pcviz.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pathwaycommons.pcviz.model.AutoCompleteResult;
import org.pathwaycommons.pcviz.model.GeneValidation;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.*;

public class GeneNameService {
    private static Log log = LogFactory.getLog(GeneNameService.class);

    private Resource geneResource;
    private HashMap<String, HashSet<String>> geneMaps = null;
    private Integer autoCompleteLimit = Integer.MAX_VALUE;

    public Resource getGeneResource() {
        return geneResource;
    }

    public void setGeneResource(Resource geneResource) {
        this.geneResource = geneResource;
    }

    public Integer getAutoCompleteLimit() {
        return autoCompleteLimit;
    }

    public void setAutoCompleteLimit(Integer autoCompleteLimit) {
        this.autoCompleteLimit = autoCompleteLimit;
    }

    public GeneValidation validate(String name) {
        initializeNameMap();

        GeneValidation geneValidation = new GeneValidation();
        geneValidation.setQuery(name);
        HashSet<String> names = geneMaps.get(name.toUpperCase());
        if(names != null) geneValidation.getMatches().addAll(names);

        return geneValidation;
    }

    private void initializeNameMap() {
        if(geneMaps != null) return;

        try {
            geneMaps = new HashMap<String, HashSet<String>>();
            Scanner scanner = new Scanner(getGeneResource().getInputStream());
            // Skip the first (header) line
            scanner.nextLine();

            while(scanner.hasNext()) {
                String line = scanner.nextLine();
                String[] tokens = line.split("\t", -1);
                assert tokens.length == 2;

                String primaryName = tokens[0].trim().toUpperCase();
                addToMap(primaryName, primaryName);

                String[] secondaryNames = tokens[1].split(", ");
                for (String secondaryName : secondaryNames) {
                    secondaryName = secondaryName.trim().toUpperCase();
                    if(!secondaryName.isEmpty()) addToMap(secondaryName, primaryName);
                }
            }

        } catch (IOException e) {
            log.error("Could not initialize the gene map: " + e.getLocalizedMessage());
        }

    }

    private void addToMap(String secondaryName, String primaryName) {
        HashSet<String> strings = geneMaps.get(secondaryName);
        if(strings == null) {
            strings = new HashSet<String>();
            geneMaps.put(secondaryName, strings);
        }

        strings.add(primaryName);
    }

    public List<AutoCompleteResult> autoComplete(String term) {
        initializeNameMap();

        List<AutoCompleteResult> autoCompleteResults = new ArrayList<AutoCompleteResult>();

        term = term.toUpperCase();

        for (String key : geneMaps.keySet()) {
            if(key.startsWith(term)) {
                HashSet<String> matches = geneMaps.get(key);
                assert matches != null;

                for (String match : matches) {
                    AutoCompleteResult autoCompleteResult = new AutoCompleteResult();
                    autoCompleteResult.setId(match);
                    String label = key.equalsIgnoreCase(match)
                            ? key
                            : match + " (" + key + ")";
                    autoCompleteResult.setLabel(label);
                    autoCompleteResult.setValue(match);
                    autoCompleteResults.add(autoCompleteResult);
                }

                if(autoCompleteResults.size() >= getAutoCompleteLimit())
                    break;
            }

        }

        return autoCompleteResults;
    }
}
