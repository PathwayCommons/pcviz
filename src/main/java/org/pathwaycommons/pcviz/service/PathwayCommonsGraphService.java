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

import cpath.client.CPathClient;
import cpath.service.GraphType;
import flexjson.JSONSerializer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.biopax.paxtools.model.Model;
import org.biopax.paxtools.pattern.miner.*;
import org.pathwaycommons.pcviz.cocitation.CocitationManager;
import org.pathwaycommons.pcviz.model.CytoscapeJsEdge;
import org.pathwaycommons.pcviz.model.CytoscapeJsGraph;
import org.pathwaycommons.pcviz.model.CytoscapeJsNode;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.springframework.cache.annotation.Cacheable;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class PathwayCommonsGraphService {
    private static final Log log = LogFactory.getLog(PathwayCommonsGraphService.class);

    private CPathClient client;

    private Integer minNumberOfCoCitationsForEdges = 0;
    private Integer minNumberOfCoCitationsForNodes = 0;

    public Integer getMinNumberOfCoCitationsForEdges() {
        return minNumberOfCoCitationsForEdges;
    }

    public void setMinNumberOfCoCitationsForEdges(Integer minNumberOfCoCitationsForEdges) {
        this.minNumberOfCoCitationsForEdges = minNumberOfCoCitationsForEdges;
    }

    public Integer getMinNumberOfCoCitationsForNodes() {
        return minNumberOfCoCitationsForNodes;
    }

    public void setMinNumberOfCoCitationsForNodes(Integer minNumberOfCoCitationsForNodes) {
        this.minNumberOfCoCitationsForNodes = minNumberOfCoCitationsForNodes;
    }

    private String pathwayCommonsUrl;

    public String getPathwayCommonsUrl() {
        return pathwayCommonsUrl;
    }

    public void setPathwayCommonsUrl(String pathwayCommonsUrl) {
        this.pathwayCommonsUrl = pathwayCommonsUrl;
    }

    private GeneNameService geneNameService;

    public GeneNameService getGeneNameService() {
        return geneNameService;
    }

    public void setGeneNameService(GeneNameService geneNameService) {
        this.geneNameService = geneNameService;
    }

    private String precalculatedFolder;

    public String getPrecalculatedFolder() {
        return precalculatedFolder;
    }

    public void setPrecalculatedFolder(String precalculatedFolder) {
        this.precalculatedFolder = precalculatedFolder;
    }

    /**
     * Cache for co-citations.
     */
    private static Map<String, Map<String, Integer>> cocitationMap = new HashMap<String, Map<String, Integer>>();

    /**
     * Accessor for new co-citations.
     */
    private CocitationManager cocitMan;

    private UniProtService uniProtService;

    public UniProtService getUniProtService() {
        return uniProtService;
    }

    public void setUniProtService(UniProtService uniProtService) {
        this.uniProtService = uniProtService;
    }

    public static Map<String, Map<String, Integer>> getCocitationMap() {
        return cocitationMap;
    }

    public static void setCocitationMap(Map<String, Map<String, Integer>> cocitationMap) {
        PathwayCommonsGraphService.cocitationMap = cocitationMap;
    }

    public CocitationManager getCocitMan() {
        return cocitMan;
    }

    public void setCocitMan(CocitationManager cocitMan) {
        this.cocitMan = cocitMan;
    }

    public PathwayCommonsGraphService(String pathwayCommonsUrl, CocitationManager cocitMan) {
        this();
        this.pathwayCommonsUrl = pathwayCommonsUrl;
        this.cocitMan = cocitMan;
    }

    public PathwayCommonsGraphService() {
        client = CPathClient.newInstance();
    }

    @Cacheable("metadataCache")
    public String getMetadata(String datatype) {
        String urlStr = getPathwayCommonsUrl() + "/metadata/" + datatype;
        try {
            URL url = new URL(urlStr);
            URLConnection urlConnection = url.openConnection();
            StringBuilder builder = new StringBuilder();
            Scanner scanner = new Scanner(urlConnection.getInputStream());
            while(scanner.hasNextLine()) {
                builder.append(scanner.nextLine() + "\n");
            }
            scanner.close();

            return builder.toString();
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return null;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private String readFile(String path, Charset encoding) throws IOException {
        byte[] encoded = Files.readAllBytes(Paths.get(path));
        return new String(encoded, encoding);
    }

    @Cacheable("networkCache")
    public String createNetwork(GraphType type, Collection<String> genes) {
        String networkJson;
        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
        CytoscapeJsGraph graph = new CytoscapeJsGraph();
        HashSet<String> nodeNames = new HashSet<String>();

        /* Short-cut start! */
        if(genes.size() == 1) { // If it is a singleton
            String gene = genes.iterator().next();
            String uniprotId = geneNameService.getUniprotId(gene);
            String filePath = getPrecalculatedFolder() + "/" + uniprotId + ".json";
            File file = new File(filePath);
            if(file.exists()) {
                log.debug("Found cache for " + gene + ": " + uniprotId + ".json");
                try {
                    return readFile(filePath, Charset.defaultCharset());
                } catch (IOException e) {
                    log.error("Problem reading cached file: " + filePath + ". Falling back to normal method.");
                }
            }
        }
        /* Short-cut end */

        // Execute a graph query using the cpath2 client
        try {
            Model model = client.createGraphQuery().kind(type).sources(genes).result();

            // the Pattern framework can generate SIF too
            SIFSearcher searcher = new SIFSearcher(new CommonIDFetcher(),
                SIFEnum.CONTROLS_STATE_CHANGE_OF,
				SIFEnum.CONTROLS_EXPRESSION_OF,
                SIFEnum.CATALYSIS_PRECEDES
            );

            for (SIFInteraction sif : searcher.searchSIF(model))
            {
                String srcName = sif.sourceID;
                String targetName = sif.targetID;

                int cocitations = getCocitations(srcName, targetName);
                if(cocitations < getMinNumberOfCoCitationsForEdges())
                    continue;

                nodeNames.add(srcName);
                nodeNames.add(targetName);
                SIFType sifType = sif.type;

                CytoscapeJsEdge edge = new CytoscapeJsEdge();
                edge.setProperty(PropertyKey.ID, srcName + "-" + sifType.getTag() + "-" + targetName);
                edge.setProperty(PropertyKey.SOURCE, srcName);
                edge.setProperty(PropertyKey.TARGET, targetName);
                edge.setProperty(PropertyKey.ISDIRECTED, sifType.isDirected());
                edge.setProperty(PropertyKey.TYPE, sifType.getTag());
                edge.setProperty(PropertyKey.DATASOURCE, sif.getDataSources() == null ? Collections.emptyList() : sif.getDataSources());
				edge.setProperty(PropertyKey.PUBMED,
					sif.getPubmedIDs() == null ? Collections.emptyList() : sif.getPubmedIDs());

                edge.setProperty(PropertyKey.CITED, cocitations);
                graph.getEdges().add(edge);
            }
        }
        catch (Exception e) {
            log.debug("There was a problem loading the network: " + e.getMessage());
            //add the query genes (to be displayed as disconnected nodes...)
            for (String gene : genes)
                nodeNames.add(gene);
        } finally {
            for (String nodeName : nodeNames)
            {
                int totalCocitations = getTotalCocitations(nodeName);
                if(totalCocitations < getMinNumberOfCoCitationsForNodes())
                    continue;

                CytoscapeJsNode node = new CytoscapeJsNode();
                node.setProperty(PropertyKey.ID, nodeName);
                boolean isValid = !geneNameService.validate(nodeName).getMatches().isEmpty();
                node.setProperty(PropertyKey.ISVALID, isValid);
                node.setProperty(PropertyKey.CITED, isValid ? totalCocitations : 0);
                boolean isSeed = genes.contains(nodeName);
                node.setProperty(PropertyKey.ISSEED, isSeed);
                node.setProperty(PropertyKey.RANK, 0);
                node.setProperty(PropertyKey.ALTERED, 0);
                String uniprotId = geneNameService.getUniprotId(nodeName);
                node.setProperty(PropertyKey.UNIPROT, uniprotId);
                String description = uniProtService.getDescription(uniprotId);
                node.setProperty(PropertyKey.UNIPROTDESC, description);
                graph.getNodes().add(node);
            }
        }

        networkJson = jsonSerializer.deepSerialize(graph);
        return networkJson;

    }

    /**
     * Gets co-citations of the given gene. Uses local cache if accessed in this run.
     *
     * @param gene gene symbol
     * @return co-citations
     */
    private Map<String, Integer> getCocitationMap(String gene)
    {
        if (!cocitationMap.containsKey(gene))
        {
            cocitationMap.put(gene, cocitMan.getCocitations(gene));
        }

        return cocitationMap.get(gene);
    }

    /**
     * Gets the co-citations of two genes.
     *
     * @param gene1 first gene
     * @param gene2 second gene
     * @return co-citations
     */
    private int getCocitations(String gene1, String gene2)
    {
        Map<String, Integer> map = getCocitationMap(gene1);
        if (map != null && map.containsKey(gene2))
        {
            return map.get(gene2);
        } else return 0;
    }

    /**
     * Calculates the total co-citations of a given gene. This value is useful for co-citation count
     * normalizations purposes.
     *
     * @param gene gene symbol
     * @return total co-citations
     */
    private int getTotalCocitations(String gene)
    {
        Map<String, Integer> map = getCocitationMap(gene);
        if (map == null) return 0;

        int cnt = 0;
        for (Integer i : map.values())
        {
            cnt += i;
        }
        return cnt;
    }

}
