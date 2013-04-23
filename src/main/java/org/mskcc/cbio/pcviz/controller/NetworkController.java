package org.mskcc.cbio.pcviz.controller;

import flexjson.JSONSerializer;
import org.biopax.paxtools.io.SimpleIOHandler;
import org.biopax.paxtools.io.sif.BinaryInteractionType;
import org.biopax.paxtools.io.sif.InteractionRule;
import org.biopax.paxtools.io.sif.SimpleInteraction;
import org.biopax.paxtools.io.sif.SimpleInteractionConverter;
import org.biopax.paxtools.io.sif.level3.Group;
import org.biopax.paxtools.model.BioPAXElement;
import org.biopax.paxtools.model.BioPAXLevel;
import org.biopax.paxtools.model.Model;
import org.biopax.paxtools.model.level3.SmallMolecule;
import org.biopax.paxtools.model.level3.XReferrable;
import org.biopax.paxtools.model.level3.Xref;
import org.mskcc.cbio.pcviz.util.CytoscapeJsEdge;
import org.mskcc.cbio.pcviz.util.CytoscapeJsGraph;
import org.mskcc.cbio.pcviz.util.CytoscapeJsNode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;

@Controller
@RequestMapping("/graph")
public class NetworkController {
    // This should be put in the application context, this is for testing purposes
    private static String PC2URL = "http://webservice.baderlab.org:48080/graph?";


    @RequestMapping(value="{type}/{genes}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getEntityInJson(@PathVariable String type, @PathVariable String genes) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
        CytoscapeJsGraph graph = new CytoscapeJsGraph();

        // TODO: Use cpath2 client for this
        String biopaxUrl = PC2URL;
        for (String gene : genes.split(",")) {
            biopaxUrl += "source=" + gene + "&";
        }
        biopaxUrl += "kind=neighborhood";

        HashSet<String> nodeNames = new HashSet<String>();

        SimpleIOHandler ioHandler = new SimpleIOHandler();
        try {
            URL url = new URL(biopaxUrl);
            URLConnection urlConnection = url.openConnection();
            Model model = ioHandler.convertFromOWL(urlConnection.getInputStream());
            SimpleInteractionConverter sic = new SimpleInteractionConverter(
                    new HashMap(),
                    new HashSet<String>(),
                    SimpleInteractionConverter.getRules(BioPAXLevel.L3).toArray(new InteractionRule[]{})
            );

            for (SimpleInteraction simpleInteraction : sic.inferInteractions(model)) {
                BioPAXElement source = simpleInteraction.getSource();
                BioPAXElement target = simpleInteraction.getTarget();

                if(source instanceof SmallMolecule
                        || target instanceof SmallMolecule
                        || simpleInteraction.getType() == BinaryInteractionType.GENERIC_OF
                        || simpleInteraction.getType() == BinaryInteractionType.COMPONENT_OF)
                    continue;

                if(source instanceof XReferrable && target instanceof XReferrable) {
                    String srcName = extractName((XReferrable) source);
                    String targetName = extractName((XReferrable) target);

                    if(srcName == null || targetName == null)
                        continue;

                    nodeNames.add(srcName);
                    nodeNames.add(targetName);

                    CytoscapeJsEdge edge = new CytoscapeJsEdge();
                    edge.getData().put("id", srcName + targetName);
                    edge.getData().put("source", srcName);
                    edge.getData().put("target", targetName);
                    edge.getData().put("weight", 1.0D);
                    graph.getEdges().add(edge);
                }
            }

            for (String nodeName : nodeNames) {
                CytoscapeJsNode node = new CytoscapeJsNode();
                node.getData().put("id", nodeName);
                node.getData().put("weight", Math.round(Math.random()*100));
                graph.getNodes().add(node);
            }

        } catch (Exception e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }

        /*
        for (String gene : genes.split(",")) {
            CytoscapeJsNode node = new CytoscapeJsNode();
            node.getData().put("id", gene);
            node.getData().put("weight", Math.round(Math.random()*100));
            graph.getNodes().add(node);
        }

        int nodeCount = graph.getNodes().size();
        for(int i=0; i < nodeCount; i++) {
            CytoscapeJsEdge edge = new CytoscapeJsEdge();
            edge.getData().put("id", "e" + (i*2));
            edge.getData().put("source",
                    (i+1 >= nodeCount)
                            ? graph.getNodes().get(i+1-nodeCount).getData().get("id")
                            : graph.getNodes().get(i+1).getData().get("id")
            );
            edge.getData().put("target", graph.getNodes().get(i).getData().get("id"));
            edge.getData().put("weight", 30.0D);
            graph.getEdges().add(edge);
        }

        */

        return new ResponseEntity<String>(
                jsonSerializer.deepSerialize(graph),
                headers,
                HttpStatus.OK
        );
    }

    private String extractName(XReferrable referrable) {
        for (Xref xref : referrable.getXref()) {
            if(xref.getDb().equalsIgnoreCase("HGNC Symbol")) {
                return xref.getId();
            }
        }

        return null;
    }

}
