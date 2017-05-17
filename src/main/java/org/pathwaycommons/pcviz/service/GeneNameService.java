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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pathwaycommons.pcviz.model.AutoCompleteResult;
import org.pathwaycommons.pcviz.model.GeneValidation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

@Service
public class GeneNameService {
    private static Log log = LogFactory.getLog(GeneNameService.class);

    @Value("${hgnc.location}")
    private Resource hgncResource;

    @Value("${ncbigene.location}")
    private Resource ncbigeneResource;

    @Value("${autoCompleteResult.limit:10}")
    private Integer autoCompleteLimit;

    private final Map<String, String> sym2id;
    private final Map<String, String> id2sym;
    private final HashMap<String, HashSet<String>> geneMaps;
    private final ArrayList<String> geneMapKeysSorted;
    private final HashMap<String, String> symbolToUniprot;

    public GeneNameService() {
        symbolToUniprot = new HashMap<String, String>();
        sym2id = new HashMap<String, String>();
        id2sym = new HashMap<String, String>();
        geneMaps = new HashMap<String, HashSet<String>>();
        geneMapKeysSorted = new ArrayList<String>();
    }

    public GeneValidation validate(String name) {
        GeneValidation geneValidation = new GeneValidation();
        geneValidation.setQuery(name);
        HashSet<String> names = geneMaps.get(name.toUpperCase());
        if(names != null) geneValidation.getMatches().addAll(names);

        return geneValidation;
    }

    @PostConstruct
    private void initializeNameMap() {
        try {
            Scanner scanner = new Scanner(hgncResource.getInputStream());
            // Skip the first (header) line
            scanner.nextLine();
            while (scanner.hasNext()) {
                String line = scanner.nextLine();
                String[] tokens = line.split("\t", -1);
                assert tokens.length == 3;

                String primaryName = tokens[0].trim().toUpperCase();
                addToMap(primaryName, primaryName);

                String[] secondaryNames = tokens[1].split(", ");
                for (String secondaryName : secondaryNames) {
                    secondaryName = secondaryName.trim().toUpperCase();
                    if (!secondaryName.isEmpty()) {
                        addToMap(secondaryName, primaryName);
                    }
                }

                String[] uniprotIds = tokens[2].split(", ");
                for (String uniprotId : uniprotIds) {
                    uniprotId = uniprotId.trim().toUpperCase();
                    if (!uniprotId.isEmpty()) {
                        addToMap(uniprotId, primaryName);
                        symbolToUniprot.put(primaryName, uniprotId);
                    }
                }
            }
            scanner.close();

            Collections.sort(geneMapKeysSorted);

        } catch (IOException e) {
            log.error("Could not initialize the gene map: " + e.getLocalizedMessage());
        }

        try {
            Scanner scanner = new Scanner(ncbigeneResource.getInputStream());
            // Skip the first (header) line
            scanner.nextLine();

            while (scanner.hasNext()) {
                String line = scanner.nextLine();
                String[] token = line.split("\t");
                if (token.length < 2)
                    continue;

                String sym = token[0];
                if (sym == null) {
                    continue;
                }
                String id = token[1];
                if (sym.length() > 0 && id.length() > 0) sym2id.put(sym, id);
            }
            scanner.close();

            for (String key : sym2id.keySet()) {
                id2sym.put(sym2id.get(key), key);
            }
        } catch (IOException e) {
            throw new RuntimeException("Initialization failed", e);
        }
    }

    private void addToMap(String secondaryName, String primaryName) {
        HashSet<String> strings = geneMaps.get(secondaryName);
        if(strings == null) {
            strings = new HashSet<String>();
            geneMaps.put(secondaryName, strings);
            geneMapKeysSorted.add(secondaryName);
        }
        strings.add(primaryName);
    }

    public List<AutoCompleteResult> autoComplete(String term) {
        initializeNameMap();

        List<AutoCompleteResult> autoCompleteResults = new ArrayList<AutoCompleteResult>();

        term = term.toUpperCase();

        for (String key : geneMapKeysSorted) {
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

                if(autoCompleteResults.size() >= autoCompleteLimit)
                    break;
            }

        }

        return autoCompleteResults;
    }

    /**
     * Gets UniProt Accession, given gene symbol.
     * @param symbol gene symbol
     * @return UniProt AC
     */
    public String getUniprotId(String symbol) {
        return this.symbolToUniprot.get(symbol);
    }

    /**
     * Gets NCBI Gene ID, given gene symbol.
     * @param symbol gene symbol
     * @return gene ID
     */
    public String getID(String symbol)
    {
        return sym2id.get(symbol);
    }

    /**
     * Gets gene symbol, given NCBI Gene ID.
     * @param id gene id
     * @return gene symbol
     */
    public String getSymbol(String id)
    {
        return id2sym.get(id);
    }
}
