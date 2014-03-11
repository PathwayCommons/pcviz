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
import org.biopax.paxtools.io.SimpleIOHandler;
import org.biopax.paxtools.model.Model;
import org.biopax.paxtools.pattern.miner.*;
import org.pathwaycommons.pcviz.cocitation.CocitationManager;
import org.pathwaycommons.pcviz.model.CytoscapeJsEdge;
import org.pathwaycommons.pcviz.model.CytoscapeJsGraph;
import org.pathwaycommons.pcviz.model.CytoscapeJsNode;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.pathwaycommons.pcviz.util.SBGNConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;

import java.net.URL;
import java.net.URLConnection;
import java.util.*;

public class PathwayCommonsGraphService {
    private static final Log log = LogFactory.getLog(PathwayCommonsGraphService.class);

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

    private SBGNConverter sbgnConverter;

    public SBGNConverter getSbgnConverter() {
        return sbgnConverter;
    }

    public void setSbgnConverter(SBGNConverter sbgnConverter) {
        this.sbgnConverter = sbgnConverter;
    }

    /**
     * Cache for co-citations.
     */
    private static Map<String, Map<String, Integer>> cocitationMap = new HashMap<String, Map<String, Integer>>();

    /**
     * Accessor for new co-citations.
     */
    private CocitationManager cocitMan;

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
        this.pathwayCommonsUrl = pathwayCommonsUrl;
        this.cocitMan = cocitMan;
    }

    public PathwayCommonsGraphService() {
    }

    @Cacheable("networkCache")
    public String createNetwork(NETWORK_FORMAT format, NETWORK_TYPE type, Collection<String> genes) {
        String networkJson;
        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
        CytoscapeJsGraph graph;

        // TODO: Use cpath2 client for this
        String biopaxUrl = getPathwayCommonsUrl() + "/graph?";
        for (String gene : genes)
        {
            biopaxUrl += "source=" + gene + "&";
        }
        biopaxUrl += "kind=" + type.toString();

        SimpleIOHandler ioHandler = new SimpleIOHandler();
        try
        {
            URL url = new URL(biopaxUrl);
            URLConnection urlConnection = url.openConnection();
            Model model = ioHandler.convertFromOWL(urlConnection.getInputStream());

            switch (format) {
                case DETAILED:
                    graph = getDetailedNetwork(model, genes);
                    break;
                default:
                case SIMPLE:
                    graph = getSimpleNetwork(model, genes);
                    break;
            }

        }
        catch (Exception e)
        {
            log.debug("There was a problem loading the network: " + e.getMessage());
            // Simply create an empty model
            graph = new CytoscapeJsGraph();
        }

        networkJson = jsonSerializer.deepSerialize(graph);
        return networkJson;

    }

    /**
     * Takes a BioPAX model and a set of 'seed' genes as input;
     * first converts the graph into an SBGN and then the SBGN to cytospace.js native graph
     *
     * @param model BioPAX model to be converted to SBGN-like
     * @param genes Seed genes (for secondary annotation)
     * @return JSONazible CytoscapeJSNetwork
     */
    private CytoscapeJsGraph getDetailedNetwork(Model model, Collection<String> genes) {
        // This probably requires a util method; because the conversion is more harder
        // hence passing it along
        return getSbgnConverter().toSBGNCompoundGraph(model, genes);
    }

    /**
     * Takes a BioPAX model and a set of 'seed' genes as input;
     * first converts the graph into a SIF and then the SIF to cytospace.js native graph
     *
     * @param model BioPAX model to be converted to SIF
     * @param genes Seed genes (for secondary annotation)
     * @return JSONazible CytoscapeJSNetwork
     */
    private CytoscapeJsGraph getSimpleNetwork(Model model, Collection<String> genes) {
        CytoscapeJsGraph graph = new CytoscapeJsGraph();

        HashSet<String> nodeNames = new HashSet<String>();
        nodeNames.addAll(genes);

        // the Pattern framework can generate SIF too
        SIFSearcher searcher = new SIFSearcher(
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

            edge.setProperty(PropertyKey.PUBMED,
                    sif.getPubmedIDs() == null ? Collections.emptyList() : sif.getPubmedIDs());

            edge.setProperty(PropertyKey.CITED, cocitations);
            graph.getEdges().add(edge);
        }

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
            graph.getNodes().add(node);

        }

        return graph;
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

    public enum NETWORK_TYPE {
        NEIGHBOORHOOD("neighborhood"),
        PATHSBETWEEN("pathsbetween");

        private final String name;

        NETWORK_TYPE(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        @Override
        public String toString() {
            return name;
        }
    }

    public enum NETWORK_FORMAT {
        SIMPLE("simple"),
        DETAILED("detailed");

        private final String name;

        NETWORK_FORMAT(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        @Override
        public String toString() {
            return name;
        }
    }


}
