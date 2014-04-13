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

var sbgnStyleSheet = cytoscape.stylesheet()
        .selector("node")
        .css({
            //"content": "data(sbgnlabel)",
            "border-width": 1,
            "shape": "circle",
            "border-color": "#555",
            "background-color": "#ffffff",
            "font-size": 11,
        })
        .selector("node[sbgnclass!='complex'][sbgnclass!='compartment']")
        .css({
            "width": "data(sbgnbbox.w)",
            "height": "data(sbgnbbox.h)"
        })
        .selector("node[sbgnclass='macromolecule'],[sbgnclass='macromolecule multimer']")
        .css({
            "shape": "macromolecule",
            //"width": "50",
            //"height": "50"
        })
        .selector("node[sbgnclass='complex'],[sbgnclass='complex multimer']")
        .css({
            "shape": "complex",
            "background-opacity" : "1",
        })
        .selector("node[sbgnclass='nucleic acid feature'],[sbgnclass='nucleic acid feature multimer']")
        .css({
            "shape": "nucleic acid feature",
            //"content": "data(sbgnlabel)"
        })
        .selector("node[sbgnclass='simple chemical'],[sbgnclass='simple chemical multimer']")
        .css({
            "shape": "simple chemical",
            //"content": "data(sbgnlabel)",
            "text-valign" : "center",
            "text-halign" : "center"
        })
        .selector("node[sbgnclass='source and sink']")
        .css({
            "shape": "source and sink"
        })
        .selector("node[sbgnclass='compartment']")
        .css({
            "content": "data(sbgnlabel)",
            "shape": "roundrectangle",
            "text-valign" : "bottom",
            "text-halign" : "center"
        })
        .selector("node[sbgnclass='unspecified entity']")
        .css({
            "shape": "ellipse",
            "content": "data(sbgnlabel)",
            "text-valign" : "center",
            "text-halign" : "center"
        })
        .selector("node[sbgnclass='process']")
        .css({
            "shape": "square",
            "content": "",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='omitted process']")
        .css({
            "shape": "square",
            "content": "\\\\",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='uncertain process']")
        .css({
            "shape": "square",
            "content": "?",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='association']")
        .css({
            "shape": "circle",
            "background-color": "#000000"
        })
        .selector("node[sbgnclass='dissociation']")
        .css({
            "shape": "dissociation",
        })
        .selector("node[sbgnclass='phenotype']")
        .css({
            "shape": "phenotype",
        })
        .selector("node[sbgnclass='and operator']")
        .css({
            "shape": "circle",
            "content": "AND",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='or operator']")
        .css({
            "shape": "circle",
            "content": "OR",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='not operator']")
        .css({
            "shape": "circle",
            "content": "NOT",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("edge")
        .css({
            "line-color": "#000",
            "target-arrow-fill": "hollow",
            "source-arrow-fill": "hollow",
            "target-arrow-color": "#fff",
            'background-opacity': 1
        })
        .selector("edge[sbgnclass='modulation']")
        .css({
            "target-arrow-shape": "diamond"
        })
        .selector("edge[sbgnclass='stimulation']")
        .css({
            "target-arrow-shape": "triangle",
        })
        .selector("edge[sbgnclass='catalysis']")
        .css({
            "target-arrow-shape": "circle"
        })
        .selector("edge[sbgnclass='inhibition']")
        .css({
            "target-arrow-color": "#000",
            "target-arrow-fill": "filled",
            "target-arrow-shape": "tee"
        })
        .selector("edge[sbgnclass='logic arc'],[sbgnclass='equivalence arc']")
        .css({
            "target-arrow-shape": "none"
        })
        .selector("edge[sbgnclass='consumption']")
        .css({
            "source-arrow-shape": "consumption"
        })
        .selector("edge[sbgnclass='production']")
        .css({
            "target-arrow-color": "#000",
            "target-arrow-fill": "filled",
            "target-arrow-shape": "production"
        })
        .selector("edge[sbgnclass='necessary stimulation']")
        .css({
            "target-arrow-shape": "necessary stimulation"
        })
        .selector(":selected")
        .css({
            "background-color": "#939393",
            "background-opacity" : "1",
            "color":"#000000",
            "line-color": "#000",
            "source-arrow-color": "#000",
            "target-arrow-color": "#000"
        })
        .selector(":active")
        .css({
            "background-color": "#d3d3d3",
            "background-opacity" : "1",
            "color":"#000000",
            "line-color": "#000",
            "source-arrow-color": "#000",
            "target-arrow-color": "#000"
        })
        .selector(".ui-cytoscape-edgehandles-source")
        .css({
            "border-color": "#5CC2ED",
            "border-width": 3
        })
        .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
        .css({
            "background-color": "#5CC2ED"
        })
        .selector("edge.ui-cytoscape-edgehandles-preview")
        .css({
            "line-color": "#5CC2ED"
        })
        .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
        .css({
            "shape": "rectangle",
            "width": 15,
            "height": 15
         }); // end of sbgnStyleSheet

var notHighlightNode = {'border-opacity': 0.3, 'text-opacity' : 0.3};
var notHighlightEdge = {'opacity':0.3, 'text-opacity' : 0.3, 'background-opacity': 0.3};

function highlightGraph(cy, nodes, edges){
    cy.nodes().css(notHighlightNode);
    cy.edges().css(notHighlightEdge);
    nodes.removeCss(notHighlightNode);
    edges.removeCss(notHighlightEdge);
}

function removeHighlights(nodes, edges){
    nodes.removeCss(notHighlightNode);
    edges.removeCss(notHighlightEdge);
}

function highlightNeighborsOfSelected(cy){
    var selectedEles = cy.elements(":selected");
    selectedEles = selectedEles.add(selectedEles.parents("node[sbgnclass='complex']"));
    selectedEles = selectedEles.add(selectedEles.descendants());
    var neighborhoodEles = selectedEles.neighborhood();
    var nodesToHighlight = selectedEles.add(neighborhoodEles);
    nodesToHighlight = nodesToHighlight.add(nodesToHighlight.descendants());
    highlightGraph(cy, nodesToHighlight.nodes(), nodesToHighlight.edges());
}

function expandNodes(nodesToShow){
    //add complex parents
    nodesToShow = nodesToShow.add(nodesToShow.parents("node[sbgnclass='complex']"));
    //add children
    nodesToShow = nodesToShow.add(nodesToShow.nodes().descendants());

    var processes = nodesToShow.nodes("node[sbgnclass='process']");
    var nonProcesses = nodesToShow.nodes("node[sbgnclass!='process']");
    var neighborProcesses = nonProcesses.neighborhood("node[sbgnclass='process']");

    nodesToShow = nodesToShow.add(processes.neighborhood());
    nodesToShow = nodesToShow.add(neighborProcesses);
    nodesToShow = nodesToShow.add(neighborProcesses.neighborhood());

    //add parents
    nodesToShow = nodesToShow.add(nodesToShow.nodes().parents("node[sbgnclass='complex']"));
    //add children
    nodesToShow = nodesToShow.add(nodesToShow.nodes().descendants());

    return nodesToShow;
}

function expandRemainingNodes(nodesToFilter, allNodes){
    nodesToFilter = expandNodes(nodesToFilter);
    var nodesToShow = allNodes.not(nodesToFilter);
    nodesToShow = expandNodes(nodesToShow);
    return nodesToShow;
}

function applyFilter(nodesToFilterOut){
    nodesToFilterOut = nodesToFilterOut.add(nodesToFilterOut.descendants());
    nodesToFilterOut.hide();
    nodesToFilterOut.data("manually-filtered", 'true');
}

function highlightProcessesOfSelected(cy){
    var selectedEles = cy.elements(":selected");
    selectedEles = expandNodes(selectedEles);
    highlightGraph(cy, selectedEles.nodes(), selectedEles.edges());
}

function filterSelectedNodes(cy){
    var allNodes = cy.nodes("node[sbgnclass!='compartment']");
    var selectedNodes = cy.nodes(":selected");
    var nodesToShow = expandRemainingNodes(selectedNodes, allNodes);
    applyFilter(allNodes.not(nodesToShow));
}

function filterNonSelectedNodes(cy){
    var allNodes = cy.nodes("node[sbgnclass!='compartment']");
    var selectedNodes = cy.nodes(":selected");
    var nodesToShow = expandNodes(selectedNodes);
    applyFilter(allNodes.not(nodesToShow));
}

function showAll(cy){
    cy.elements("node[manually-filtered='true']").show();
    cy.elements().removeData('manually-filtered');
}

var SBGNView = Backbone.View.extend({
    cyStyle: sbgnStyleSheet,
    template: _.template( $("#sbgn-container-template").html() ),
    el: "#sbgn-view-container",

    render: function() {
        var self = this;
        var thatEl = this.$el;
        //var thatTmpl = this.template;
        var source = this.model.source;
        var target = this.model.target;

        var genesStr = source + "," + target;

        $("#highlight-neighbors-button").live('click', function(e) {
            e.preventDefault();
            var cy = window.cy;
            highlightNeighborsOfSelected(cy);
        });

        $("#highlight-processes-button").live('click', function(e) {
            e.preventDefault();
            var cy = window.cy;
            highlightProcessesOfSelected(cy);
        });

        $("#remove-highlights-button").live('click', function(e) {
            e.preventDefault();
            var cy = window.cy;
            removeHighlights(cy.nodes(), cy.edges());
        });

        $('#filter-selected-button').live('click', function(e){
            e.preventDefault();
            var cy = window.cy;
            filterSelectedNodes(cy);
        });

        $("#filter-unselected-button").live('click',function(e) {
            e.preventDefault();
            var cy = window.cy;
            filterNonSelectedNodes(cy);
        });

        $("#show-all-button").live('click', function(e) {
            e.preventDefault();
            var cy = window.cy;
            showAll(cy);
        });

        $.getJSON("graph/detailed/pathsbetween/" + genesStr,
            function(data) {
                var container = $("#sbgn-cy");
                var positionMap = new Object();

                //add position information to data
                for (var i = 0 ; i < data.nodes.length ; i++){
                    var xPos = data.nodes[i].data.sbgnbbox.x;
                    var yPos = data.nodes[i].data.sbgnbbox.y;
                    positionMap[data.nodes[i].data.id] = {'x':xPos, 'y':yPos};
                }                  

                var cyOptions = {
                    elements: data,
                    style: self.cyStyle,
                    layout: { 
                        name: 'preset',
                        positions: positionMap
                    },
                    showOverlay: false,

                    ready: function()
                    {
                        var allNodes = this.nodes();
                        window.cy = this;
                            
                        container.cytoscapePanzoom();

                        cy.on('tap', 'node', function(evt){
                                var node = this;
                        });
/*
                        cy.on('tap', 'edge', function(evt){
                           var edge = this;
                        });

                        cy.on('tap', function(evt) {
                                    
                        });

                        // When a node is dragged, saved its new location
                        cy.on('drag', 'node', function(evt) {

                        });
*/
                    }

                };

                container.html("");
                container.cy(cyOptions);
            } // end of function(data)
        ); // end of $.getJSON

        return this;
    } // end of render: function()

}); // end of NetworkView = Backbone.View.extend({








