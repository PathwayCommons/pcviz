package org.mskcc.cbio.pcviz.controller;

import flexjson.JSONSerializer;
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

@Controller
@RequestMapping("/graph")
public class NetworkController {
    @RequestMapping(value="{type}/{genes}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getEntityInJson(@PathVariable String type, @PathVariable String genes) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");

        CytoscapeJsGraph graph = new CytoscapeJsGraph();
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

        return new ResponseEntity<String>(
                jsonSerializer.deepSerialize(graph),
                headers,
                HttpStatus.OK
        );
    }

}
