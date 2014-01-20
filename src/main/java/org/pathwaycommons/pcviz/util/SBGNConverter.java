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

package org.pathwaycommons.pcviz.util;

import org.biopax.paxtools.model.Model;
import org.pathwaycommons.pcviz.model.CytoscapeJsEdge;
import org.pathwaycommons.pcviz.model.CytoscapeJsGraph;
import org.pathwaycommons.pcviz.model.CytoscapeJsNode;
import org.pathwaycommons.pcviz.model.PropertyKey;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;

public class SBGNConverter {
    /**
     * Takes a BioPAX model and a set of 'seed' genes as input;
     * first converts the graph into a SIF and then the SIF to cytospace.js native graph
     *
     * @param model BioPAX model to be converted to SIF
     * @param genes Seed genes (for secondary annotation)
     * @return JSONazible CytoscapeJSNetwork
     */
    public CytoscapeJsGraph toSBGNCompoundGraph(Model model, Collection<String> genes) {
        CytoscapeJsGraph graph = new CytoscapeJsGraph();

        /* TODO: This is demo code. Change it to proper conversion */

        Iterator<String> genesIterator = genes.iterator();
        String geneA = genesIterator.next();
        String geneA2 = geneA + "2";
        String geneB = genesIterator.next();
        String geneB2 = geneB + "2";
        String abCompound = geneA + "compound" + geneB;
        String abInteraction = geneA + "complex" + geneB;

        // These are example inputs
        CytoscapeJsNode nodeA1 = new CytoscapeJsNode();
        nodeA1.setProperty(PropertyKey.ID, geneA);
        CytoscapeJsNode nodeB1 = new CytoscapeJsNode();
        nodeB1.setProperty(PropertyKey.ID, geneB);

        // This is the reaction node
        CytoscapeJsNode reaction = new CytoscapeJsNode();
        reaction.setProperty(PropertyKey.ID, abInteraction);

        // These are the compounded nodes
        CytoscapeJsNode compoundNode = new CytoscapeJsNode();
        compoundNode.setProperty(PropertyKey.ID, abCompound);
        CytoscapeJsNode nodeA2 = new CytoscapeJsNode();
        nodeA2.setProperty(PropertyKey.ID, geneA2);
        nodeA2.setProperty(PropertyKey.PARENT, abCompound);
        CytoscapeJsNode nodeB2 = new CytoscapeJsNode();
        nodeB2.setProperty(PropertyKey.ID, geneB2);
        nodeB2.setProperty(PropertyKey.PARENT, abCompound);

        // Let's do the connections
        // A -> R, B -> R
        CytoscapeJsEdge eA1 = new CytoscapeJsEdge();
        eA1.setProperty(PropertyKey.SOURCE, geneA);
        eA1.setProperty(PropertyKey.TARGET, abInteraction);
        eA1.setProperty(PropertyKey.ID, abInteraction + "edge");
        CytoscapeJsEdge eB1 = new CytoscapeJsEdge();
        eB1.setProperty(PropertyKey.SOURCE, geneB);
        eB1.setProperty(PropertyKey.TARGET, abInteraction);
        eB1.setProperty(PropertyKey.ID, abInteraction + "edge2");

        // R -> C(A, B)
        CytoscapeJsEdge eAB2 = new CytoscapeJsEdge();
        eAB2.setProperty(PropertyKey.SOURCE, abInteraction);
        eAB2.setProperty(PropertyKey.TARGET, abCompound);

        // Add all of them
        List<CytoscapeJsNode> nodes = graph.getNodes();
        nodes.add(nodeA1);
        nodes.add(nodeB1);
        nodes.add(nodeA2);
        nodes.add(nodeB2);
        nodes.add(compoundNode);
        nodes.add(reaction);
        List<CytoscapeJsEdge> edges = graph.getEdges();
        edges.add(eA1);
        edges.add(eB1);
        edges.add(eAB2);

        // Done here
        return graph;
    }
}
