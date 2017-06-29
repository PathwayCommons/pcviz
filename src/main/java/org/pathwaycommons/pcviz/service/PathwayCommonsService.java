package org.pathwaycommons.pcviz.service;

import cpath.client.CPathClient;
import cpath.client.util.CPathException;
import cpath.query.CPathGraphQuery;
import cpath.service.GraphType;
import cpath.service.OutputFormat;
import flexjson.JSONSerializer;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.biopax.paxtools.controller.ModelUtils;
import org.biopax.paxtools.pattern.miner.SIFEnum;
import org.biopax.paxtools.pattern.miner.SIFType;
import org.pathwaycommons.pcviz.model.CytoscapeJsEdge;
import org.pathwaycommons.pcviz.model.CytoscapeJsGraph;
import org.pathwaycommons.pcviz.model.CytoscapeJsNode;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class PathwayCommonsService {
    private static final Log log = LogFactory.getLog(PathwayCommonsService.class);

    // Pathway Commons client
    private CPathClient client;
    private CPathGraphQuery graphQuery;

    private GeneNameService geneNameService;
    private CocitationManager cocitMan;

    @Value("${cocitation.min.edge:0}")
    private Integer minNumberOfCoCitationsForEdges;

    @Value("${cocitation.min.node:0}")
    private Integer minNumberOfCoCitationsForNodes;

    @Value("${pathwaycommons.url}")
    private volatile String pathwayCommonsUrl;

    @Value("${cache.folder}")
    private String cacheDir;

    // Cache for co-citations.
    private final Map<String, Map<String, Integer>> cocitationMap;

    @Autowired
    public void setGeneNameService(GeneNameService geneNameService) {
        this.geneNameService = geneNameService;
    }

    @Autowired
    public void setCocitMan(CocitationManager cocitMan) {
        this.cocitMan = cocitMan;
    }


    public PathwayCommonsService() {
        cocitationMap = new HashMap<String, Map<String, Integer>>();
    }

    @PostConstruct
    void init() throws IOException
    {
        client = CPathClient.newInstance(pathwayCommonsUrl);
        client.setName("PCViz-PC9");
        graphQuery = client.createGraphQuery().patterns(
                new String[]{
                        "CONTROLS_STATE_CHANGE_OF",
                        "CONTROLS_EXPRESSION_OF",
                        "CATALYSIS_PRECEDES",
                        "CONTROLS_TRANSPORT_OF",
                        "CONTROLS_PHOSPHORYLATION_OF",
                        "IN_COMPLEX_WITH",
//                        "CHEMICAL_AFFECTS"
                }
        );

        Path dir = Paths.get(cacheDir, "networks");
        if(!Files.exists(dir))
            Files.createDirectories(dir);
    }

    @Cacheable("metadataCache")
    public String getMetadataDatasources() {
        String relUrl = "metadata/datasources.json";
        try {
            return client.get(relUrl, null, String.class);
        } catch (CPathException e) {
            log.error("Failed fetching " + relUrl, e);
            return null;
        }
    }

    @Cacheable("networkCache")
    public String createNetwork(GraphType type, Collection<String> genes) throws IOException
    {
        /* Short-cut start */
        Set<String> sortedIds = new TreeSet<>();
        for(String gene : genes) {
            String uniprotId = geneNameService.getUniprotId(gene);
            sortedIds.add((uniprotId!=null)?uniprotId:gene);
        }
        final String cachedNetwork = ModelUtils.md5hex(
               StringUtils.join(sortedIds.iterator(),null)
            ).replaceAll("/|\\\\","_") + "." + type.toString().toLowerCase() + ".json";

        final Path file = Paths.get(cacheDir, "networks", cachedNetwork);

        if(Files.exists(file)) { //return cached data
            log.debug("Found cached network: " + file.toString());
            return new String(Files.readAllBytes(file));
        }
        /* Short-cut end */

        final CytoscapeJsGraph graph = new CytoscapeJsGraph();
        final HashSet<String> nodeNames = new HashSet<String>();
        try
        {
            String txt = graphQuery.kind(type).sources(genes)
                    .stringResult(OutputFormat.EXTENDED_BINARY_SIF);
            if (txt != null && !txt.trim().isEmpty()) {
                Scanner scanner = new Scanner(txt);
                String line = scanner.nextLine(); // skip title
                while (scanner.hasNextLine())
                {
                    line = scanner.nextLine();

                    if(line.trim().isEmpty())
                        break; // done - skip the next section (nodes descr.) of PC extended SIF format

                    //split; empty tokens that result from '\t\t' and after the last tab are also included:
                    String[] sif = line.split("\t",-1);

                    String srcName = sif[0];
                    String targetName = sif[2];

                    int edgeCo = getCocitations(srcName, targetName);
                    int srcCo = getTotalCocitations(srcName);
                    int targetCo = getTotalCocitations(targetName);
                    if (
//                            type == GraphType.NEIGHBORHOOD && // apply co-citations filter only for n-hood queries
                            (edgeCo < minNumberOfCoCitationsForEdges
                            || srcCo < minNumberOfCoCitationsForNodes
                            || targetCo < minNumberOfCoCitationsForNodes)
                    ){
                        continue;
                    }

                    SIFType sifType = SIFEnum.typeOf(sif[1]);
                    String[] datasources = sif[3].split(";");
                    String[] publications = sif[4].split(";");

                    if(nodeNames.add(srcName))
                        createNode(graph, srcName, srcCo, genes);
                    if(nodeNames.add(targetName))
                        createNode(graph, targetName, targetCo, genes);;

                    createEdge(graph, srcName, targetName, sifType, edgeCo, datasources, publications);
                }
            }
        } catch (CPathException e) {
            log.warn("PC query error or no data; " + type.toString().toLowerCase() + ", source: " + genes + "; " + e);
        }

        if(nodeNames.isEmpty()) {
            // add the query genes (to be displayed as disconnected nodes)
            for (String gene : genes) {
                createNode(graph, gene, getTotalCocitations(gene), genes);
            }
        }

        String network =  (new JSONSerializer()).exclude("*.class").deepSerialize(graph);

        //cache it forever (until the folder is removed or cleaned)
        Files.write(file, network.getBytes());

        return network;
    }

    private void createNode(CytoscapeJsGraph graph, String nodeName, int totalCocitations, Collection<String> genes)
    {
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
        graph.getNodes().add(node);
    }

    private void createEdge(CytoscapeJsGraph graph, String srcName, String targetName, SIFType sifType,
                            int edgeCo, String[] dataSources, String[] publicationIds)
    {
        CytoscapeJsEdge edge = new CytoscapeJsEdge();
        edge.setProperty(PropertyKey.ID, srcName + "-" + sifType.getTag() + "-" + targetName);
        edge.setProperty(PropertyKey.SOURCE, srcName);
        edge.setProperty(PropertyKey.TARGET, targetName);
        edge.setProperty(PropertyKey.ISDIRECTED, sifType.isDirected());
        edge.setProperty(PropertyKey.TYPE, sifType.getTag());
        edge.setProperty(PropertyKey.DATASOURCE, (dataSources==null)?Collections.emptyList():dataSources);
        edge.setProperty(PropertyKey.PUBMED, (publicationIds==null)?Collections.emptyList():publicationIds);
        edge.setProperty(PropertyKey.CITED, edgeCo);
        graph.getEdges().add(edge);
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
