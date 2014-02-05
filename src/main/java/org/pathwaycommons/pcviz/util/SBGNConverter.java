package org.pathwaycommons.pcviz.util;

import java.util.Iterator;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import org.biopax.paxtools.io.sbgn.L3ToSBGNPDConverter;
import org.biopax.paxtools.model.Model;
import org.omg.CORBA.PolicyError;
import org.pathwaycommons.pcviz.model.CytoscapeJsEdge;
import org.pathwaycommons.pcviz.model.CytoscapeJsGraph;
import org.pathwaycommons.pcviz.model.CytoscapeJsNode;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.sbgn.bindings.Arc;
import org.sbgn.bindings.Glyph;
import org.sbgn.bindings.Port;
import org.sbgn.bindings.Sbgn;

public class SBGNConverter
{
    public void addGlyph(Glyph parent, Glyph glyph, ArrayList<Glyph> states,
        CytoscapeJsGraph graph, Collection<String> genes)
    {
        CytoscapeJsNode cNode = new CytoscapeJsNode();

        cNode.setProperty(PropertyKey.ID, glyph.getId());
        cNode.setProperty(PropertyKey.SBGNCLASS, glyph.getClazz());
        cNode.setProperty(PropertyKey.SBGNBBOX, glyph.getBbox());
        String lbl = (glyph.getLabel() == null) ? "unknown" : glyph.getLabel().getText();
        cNode.setProperty(PropertyKey.SBGNLABEL, lbl);
        cNode.setProperty(PropertyKey.SBGNSTATESANDINFOS, states);
        cNode.setProperty(PropertyKey.SBGNORIENTATION, glyph.getOrientation());
        String parentLabel = (parent == null) ? "" : parent.getId();
        cNode.setProperty(PropertyKey.PARENT, parentLabel);
        boolean isSeed = (genes.contains(lbl)) ? true : false;
        cNode.setProperty(PropertyKey.ISSEED, isSeed);

        graph.getNodes().add(cNode);
    }

    private void traverseAndAddGlyphs(Glyph parent, List<Glyph> nodes,
        CytoscapeJsGraph graph, java.util.Map<String, Glyph> portGlyphMap,
        Collection<String> genes)
    {
        for (int i = 0; i < nodes.size(); i++)
        {
            Glyph node = nodes.get(i);

            List<Glyph> glyphs = node.getGlyph();

            ArrayList states = new ArrayList();
            ArrayList childNodes = new ArrayList();

            for (Glyph glyph : glyphs)
            {
                if (glyph.getClazz().equals("unit of information") ||
                        glyph.getClazz().equals("state variable"))
                {
                    states.add(glyph);
                }
                else
                {
                    childNodes.add(glyph);
                }
            }

            for (Port p : node.getPort())
            {
                portGlyphMap.put(p.getId(), node);
            }

            addGlyph(parent, node, states, graph, genes);

            if (childNodes.size() > 0)
            {
                traverseAndAddGlyphs(node, childNodes, graph, portGlyphMap, genes);
            }
        }
    }

    private void traverseAndAddEdges(List<Arc> edges, CytoscapeJsGraph graph,
        java.util.Map<String, Glyph> portGlyphMap)
    {
        for (Arc arc : edges)
        {
            CytoscapeJsEdge edge = new CytoscapeJsEdge();

            String srcName = "", targetName = "";

            if(arc.getSource() instanceof Port)
            {
                srcName = ((Port)arc.getSource()).getId();
                targetName = ((Port)arc.getTarget()).getId();
            }
            else if(arc.getSource() instanceof Glyph)
            {
                srcName = ((Glyph)arc.getSource()).getId();
                targetName = ((Glyph)arc.getTarget()).getId();
            }


            if (portGlyphMap.get(srcName) != null) {
                srcName = ((Glyph)portGlyphMap.get(srcName)).getId();
            }

            if (portGlyphMap.get(targetName) != null) {
                targetName = ((Glyph)portGlyphMap.get(targetName)).getId();
            }

            edge.setProperty(PropertyKey.SOURCE, srcName);
            edge.setProperty(PropertyKey.TARGET, targetName);
            edge.setProperty(PropertyKey.ID, arc.getId());
            edge.setProperty(PropertyKey.SBGNCLASS, arc.getClazz());

            graph.getEdges().add(edge);
        }
    }

    public CytoscapeJsGraph toSBGNCompoundGraph(Model model, Collection<String> genes)
    {
        CytoscapeJsGraph graph = new CytoscapeJsGraph();


        L3ToSBGNPDConverter sbgnConverter = new L3ToSBGNPDConverter();
        Sbgn sbgn = sbgnConverter.createSBGN(model);

        List nodes = sbgn.getMap().getGlyph();
        List edges = sbgn.getMap().getArc();
        java.util.Map portGlyphMap = new HashMap();

        traverseAndAddGlyphs(null, nodes, graph, portGlyphMap, genes);
        traverseAndAddEdges(edges, graph, portGlyphMap);
/*

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
        edges.add(eAB28);
*/
        return graph;
    }
}