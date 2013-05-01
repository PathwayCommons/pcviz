package org.pathwaycommons.pcviz.util;

import java.util.ArrayList;
import java.util.List;

public class CytoscapeJsGraph {
    private List<CytoscapeJsNode> nodes = new ArrayList<CytoscapeJsNode>();
    private List<CytoscapeJsEdge> edges = new ArrayList<CytoscapeJsEdge>();

    public List<CytoscapeJsNode> getNodes() {
        return nodes;
    }

    public void setNodes(List<CytoscapeJsNode> nodes) {
        this.nodes = nodes;
    }

    public List<CytoscapeJsEdge> getEdges() {
        return edges;
    }

    public void setEdges(List<CytoscapeJsEdge> edges) {
        this.edges = edges;
    }
}
