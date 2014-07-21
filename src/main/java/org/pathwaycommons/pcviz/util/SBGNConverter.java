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

import java.util.*;

import org.biopax.paxtools.io.sbgn.L3ToSBGNPDConverter;
import org.biopax.paxtools.io.sbgn.ListUbiqueDetector;
import org.biopax.paxtools.model.BioPAXElement;
import org.biopax.paxtools.model.Model;
import org.biopax.paxtools.model.level2.xref;
import org.biopax.paxtools.model.level3.*;
import org.pathwaycommons.pcviz.model.CytoscapeJsEdge;
import org.pathwaycommons.pcviz.model.CytoscapeJsGraph;
import org.pathwaycommons.pcviz.model.CytoscapeJsNode;
import org.pathwaycommons.pcviz.model.PropertyKey;
import org.pathwaycommons.pcviz.service.BlackListService;
import org.sbgn.bindings.Arc;
import org.sbgn.bindings.Glyph;
import org.sbgn.bindings.Port;
import org.sbgn.bindings.Sbgn;

/**
 * @author Mecit Sari
 */
public class SBGNConverter
{
    private static String UNKNOWN = "unknown";
    private static String NOT_SPECIFIED = "not specified";

    private BlackListService blackListService;

    public BlackListService getBlackListService() {
        return blackListService;
    }

    public void setBlackListService(BlackListService bls) {
        this.blackListService = bls;
    }

    public void setGlyphPositionAsCenter(Glyph glyph, ArrayList<Glyph> states){
        //sbgnml positions are set as the beginning of the shape,
        //cytoscape.js accept as center, conversion in server side
        //is better
        glyph.getBbox().setX(glyph.getBbox().getX() + glyph.getBbox().getW()/2);
        glyph.getBbox().setY(glyph.getBbox().getY() + glyph.getBbox().getH()/2);

        //states position are set according to the center of the glyph itself.
        //it prevents recalculating it again and again when user moves the glyph
        setStateAndInfoPos(glyph,states);
    }

    public void setStateAndInfoPos(Glyph glyph, ArrayList<Glyph> states){
        float xPos = glyph.getBbox().getX();
        float yPos = glyph.getBbox().getY();

        for(Glyph state : states)
        {
            state.getBbox().setX(state.getBbox().getX() +
                    state.getBbox().getW()/2 - xPos);
            state.getBbox().setY(state.getBbox().getY() +
                    state.getBbox().getH()/2 - yPos);
        }
    }

    public void addPort(CytoscapeJsNode cNode, Glyph glyph){
        List<Port> ports = glyph.getPort();

        //update positions to center
        for(int i = 0 ; i < ports.size() ; i++){
            ports.get(i).setX(ports.get(i).getX() - glyph.getBbox().getX());
            ports.get(i).setY(ports.get(i).getY() - glyph.getBbox().getY());
        }
        cNode.setProperty(PropertyKey.PORTS, ports);
    }

    public void addGlyph(Glyph parent, HashSet<BioPAXElement> bpElements, Glyph glyph, ArrayList<Glyph> states,
                         CytoscapeJsGraph graph, Collection<String> genes)
    {
        CytoscapeJsNode cNode = new CytoscapeJsNode();

        cNode.setProperty(PropertyKey.ID, glyph.getId());
        cNode.setProperty(PropertyKey.SBGNCLASS, glyph.getClazz());
        cNode.setProperty(PropertyKey.SBGNBBOX, glyph.getBbox());
        cNode.setProperty(PropertyKey.SBGNORIENTATION, glyph.getOrientation());
        cNode.setProperty(PropertyKey.SBGNCOMPARTMENTREF, glyph.getCompartmentRef());

        extractDataSource(cNode, bpElements);
        extractModifications(cNode, bpElements);

        String lbl = (glyph.getLabel() == null) ? NOT_SPECIFIED : glyph.getLabel().getText();
        cNode.setProperty(PropertyKey.SBGNLABEL, lbl);

        setGlyphPositionAsCenter(glyph, states);
        cNode.setProperty(PropertyKey.SBGNSTATESANDINFOS, states);

        String parentLabel = (parent == null) ? "" : parent.getId();
        Glyph compartment = ((Glyph)glyph.getCompartmentRef());
        String compartmentLabel = (compartment == null) ? "" : compartment.getId();
        String parentId = (!parentLabel.equals("")) ? parentLabel : compartmentLabel;
        cNode.setProperty(PropertyKey.PARENT, parentId);

        boolean isSeed = genes.contains(lbl);
        cNode.setProperty(PropertyKey.ISSEED, isSeed);

        cNode.setProperty(PropertyKey.SBGNCLONEMARKER, glyph.getClone());

        //add port
        addPort(cNode, glyph);

        graph.getNodes().add(cNode);
    }

    /**
     * Simply iterates over the BioPAX elements and extracts modifications for proteins.
     *
     * @param jsNode Cytoscape Node
     * @param bpElements BioPAX Elements
     */
    private void extractModifications(CytoscapeJsNode jsNode, HashSet<BioPAXElement> bpElements) {
        HashSet<String> modifications = new HashSet<String>();

        for (BioPAXElement bpElement : bpElements) {
            if(bpElement instanceof Protein) {
                Protein protein = (Protein) bpElement;

                for (EntityFeature entityFeature : protein.getFeature()) {
                    if(entityFeature instanceof ModificationFeature || entityFeature instanceof FragmentFeature) {
                        // TODO: Proper toString!
                        modifications.add(entityFeature.toString());
                    }
                }
            }
        }
        jsNode.setProperty(PropertyKey.SBGNMODIFICATIONS, modifications);
    }

    /**
     * Simply iterates over the BioPAX elements and extracts data sources
     * associated with the node.
     *
     * @param jsNode Cytoscape Node
     * @param bpElements BioPAX Elements
     */
    private void extractDataSource(CytoscapeJsNode jsNode, HashSet<BioPAXElement> bpElements) {
        HashSet<String> dataSources = new HashSet<String>();
        String displayName = null;
        HashSet<String> commentSet = new HashSet<String>();
        HashSet<String[]> xrefs = new HashSet<String[]>();
        HashSet<String[]> evidenceXrefs = new HashSet<String[]>();
        HashSet<String> evidenceTerms = new HashSet<String>();

        for (BioPAXElement bpElement : bpElements) {
            if(bpElement instanceof Entity) {
                Entity entity = (Entity) bpElement;

                for (Provenance provenance : entity.getDataSource()) {
                    dataSources.add(provenance.getStandardName());
                }

                displayName = entity.getDisplayName();

                for (String s : entity.getComment()) {
                    commentSet.add(s);
                }

                for (Xref xr : entity.getXref()) {
                    if(xr.getId() != null || xr.getDb() != null){
                        String[] xrefArray = {xr.getId(), xr.getDb()};
                        xrefs.add(xrefArray);
                    }
                }

                for(Evidence ev : entity.getEvidence()) {

                    //get evidence Xref
                    for(Xref xr : ev.getXref()) {
                        if(xr.getId() != null || xr.getDb() != null){
                            String[] xrefArray = {xr.getId(), xr.getDb()};
                            evidenceXrefs.add(xrefArray);
                        }
                    }

                    //get evidence terms
                    for(EvidenceCodeVocabulary ecv : ev.getEvidenceCode()) {
                        for(String term : ecv.getTerm()) {
                            evidenceTerms.add(term);
                        }
                    }


                }

            }
        }

        if(dataSources.isEmpty()) {
            jsNode.setProperty(PropertyKey.DATASOURCE, Collections.singleton(UNKNOWN));
        } else {
            jsNode.setProperty(PropertyKey.DATASOURCE, dataSources);
        }

        jsNode.setProperty(PropertyKey.SBGNDISPLAYNAME, displayName);
        jsNode.setProperty(PropertyKey.SBGNCOMMENT, commentSet);
        jsNode.setProperty(PropertyKey.SBGNXREF, xrefs);
        jsNode.setProperty(PropertyKey.SBGNEVIDENCECODE, evidenceTerms);
        jsNode.setProperty(PropertyKey.SBGNEVIDENCEXREF, evidenceXrefs);
    }

    private void traverseAndAddGlyphs(Glyph parent, List<Glyph> nodes,
                                      CytoscapeJsGraph graph, Map<String, Glyph> portGlyphMap,
                                      Collection<String> genes, Model model, Map<String, Set<String>> sbgn2BPMap) {
        for (Glyph node : nodes) {
            List<Glyph> glyphs = node.getGlyph();

            ArrayList<Glyph> states = new ArrayList<Glyph>();
            ArrayList<Glyph> childNodes = new ArrayList<Glyph>();

            for (Glyph glyph : glyphs)
            {
                if(glyph.getId().equals(node.getId()))
                    continue;
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

            // Extract the BP objects that correspond to this node
            HashSet<BioPAXElement> bpes = new HashSet<BioPAXElement>();
            Set<String> bpIds = sbgn2BPMap.get(node.getId());

            if(bpIds != null){
                for (String bpId : bpIds) {
                    bpes.add(model.getByID(bpId));
                }
            }

            addGlyph(parent, bpes, node, states, graph, genes);

            if (childNodes.size() > 0)
            {
                traverseAndAddGlyphs(node, childNodes, graph, portGlyphMap, genes, model, sbgn2BPMap);
            }
        }
    }

    private void traverseAndAddEdges(List<Arc> edges, CytoscapeJsGraph graph,
                                     Map<String, Glyph> portGlyphMap,Model model)
    {
        for (Arc arc : edges)
        {
            CytoscapeJsEdge edge = new CytoscapeJsEdge();

            String srcName = "", tgtName = "", srcPort = "", tgtPort = "";


            if(arc.getSource() instanceof Port)
            {
                srcPort = ((Port)arc.getSource()).getId();
                srcName = portGlyphMap.get(srcPort).getId();
            }
            else if(arc.getSource() instanceof Glyph)
            {
                srcName = ((Glyph)arc.getSource()).getId();
                srcPort = srcName;
            }
            if(arc.getTarget() instanceof Port)
            {
                tgtPort = ((Port)arc.getTarget()).getId();
                tgtName = portGlyphMap.get(tgtPort).getId();
            }
            else if(arc.getTarget() instanceof Glyph)
            {
                tgtName = ((Glyph)arc.getTarget()).getId();
                tgtPort = tgtName;
            }
/*
            if (portGlyphMap.get(srcName) != null) {
                srcName = portGlyphMap.get(srcName).getId();
            }

            if (portGlyphMap.get(tgtName) != null) {
                tgtName = portGlyphMap.get(tgtName).getId();
            }
*/
            String cardinality = "0";

            for(Glyph glyph : arc.getGlyph()){
                if(glyph.getClazz().equals("cardinality")){
                    cardinality = glyph.getLabel().getText();
                    break;
                }
            }
            edge.setProperty(PropertyKey.SOURCE, srcName);
            edge.setProperty(PropertyKey.TARGET, tgtName);

            edge.setProperty(PropertyKey.PORTSOURCE, srcPort);
            edge.setProperty(PropertyKey.PORTTARGET, tgtPort);

            edge.setProperty(PropertyKey.ID, arc.getId());
            edge.setProperty(PropertyKey.SBGNCLASS, arc.getClazz());
            edge.setProperty(PropertyKey.SBGNCARDINALITY, cardinality);

            graph.getEdges().add(edge);
        }
    }

    public CytoscapeJsGraph toSBGNCompoundGraph(Model model, Collection<String> genes)
    {
        CytoscapeJsGraph graph = new CytoscapeJsGraph();

        Set<String> blacklist = getBlackListService().getBlackListSet();

        L3ToSBGNPDConverter sbgnConverter
                = new L3ToSBGNPDConverter(new ListUbiqueDetector(blacklist), null, true);

        Sbgn sbgn = sbgnConverter.createSBGN(model);

        // For each SBGN object there might be multiple BioPAX Elements associated with it
        // This map contains this information
        Map<String, Set<String>> sbgn2BPMap = sbgnConverter.getSbgn2BPMap();

        List<Glyph> nodes = sbgn.getMap().getGlyph();
        List<Arc> edges = sbgn.getMap().getArc();

        Map<String, Glyph> portGlyphMap = new HashMap<String, Glyph>();

        traverseAndAddGlyphs(null, nodes, graph, portGlyphMap, genes, model, sbgn2BPMap);
        traverseAndAddEdges(edges, graph, portGlyphMap, model);

        return graph;
    }
}