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

package org.pathwaycommons.pcviz.model;

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
