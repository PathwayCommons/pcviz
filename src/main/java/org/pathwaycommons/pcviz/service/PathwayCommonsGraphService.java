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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;

import java.net.URL;
import java.net.URLConnection;
import java.util.*;

public class PathwayCommonsGraphService {
    private static final Log log = LogFactory.getLog(PathwayCommonsGraphService.class);

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
    public String createNetwork(NETWORK_TYPE type, Collection<String> genes) {
        String networkJson;
        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
        CytoscapeJsGraph graph = new CytoscapeJsGraph();

        HashSet<String> nodeNames = new HashSet<String>();

        // TODO: Use cpath2 client for this
        String biopaxUrl = getPathwayCommonsUrl() + "/graph?";
        for (String gene : genes)
        {
            biopaxUrl += "source=" + gene + "&";
            nodeNames.add(gene);
        }
        biopaxUrl += "kind=" + type.toString();

        SimpleIOHandler ioHandler = new SimpleIOHandler();
        try
        {
            URL url = new URL(biopaxUrl);
            URLConnection urlConnection = url.openConnection();
            Model model = ioHandler.convertFromOWL(urlConnection.getInputStream());

            // the Pattern framework can generate SIF too
            SIFSearcher searcher = new SIFSearcher(
                    new ControlsStateChangeMiner(),
                    new ControlsStateChangeButIsParticipantMiner(),
                    new ConsecutiveCatalysisMiner(null), // todo pass black list here
    //				new InSameComplexMiner(), // add this line after implementing ranking
                    new DegradesMiner()
            );

            for (SIFInteraction sif : searcher.searchSIF(model))
            {
                String srcName = sif.source;
                String targetName = sif.target;

                nodeNames.add(srcName);
                nodeNames.add(targetName);

                CytoscapeJsEdge edge = new CytoscapeJsEdge();
                edge.setProperty(PropertyKey.ID, srcName + targetName);
                edge.setProperty(PropertyKey.SOURCE, srcName);
                edge.setProperty(PropertyKey.TARGET, targetName);
                edge.setProperty(PropertyKey.ISDIRECTED, sif.directed);
                edge.setProperty(PropertyKey.TYPE, sif.type);

				edge.setProperty(PropertyKey.PUBMED,
					sif.pubmedIDs == null ? Collections.emptyList() : sif.pubmedIDs);

                edge.setProperty(PropertyKey.CITED, getCocitations(srcName, targetName));
                graph.getEdges().add(edge);
            }
        }
        catch (Exception e)
        {
            log.error("There was a problem loading the network: " + e.getMessage());
        }

        for (String nodeName : nodeNames)
        {
            CytoscapeJsNode node = new CytoscapeJsNode();
            node.setProperty(PropertyKey.ID, nodeName);
            node.setProperty(PropertyKey.CITED, getTotalCocitations(nodeName));
            node.setProperty(PropertyKey.ISVALID, !geneNameService.validate(nodeName).getMatches().isEmpty());
            node.setProperty(PropertyKey.ISSEED, genes.contains(nodeName));
            graph.getNodes().add(node);
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

}
