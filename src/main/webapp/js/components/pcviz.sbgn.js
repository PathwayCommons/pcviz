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
        .selector("node[sbgnclass='macromolecule']")
        .css({
            "shape": "macromolecule"
        })
        .selector("node[sbgnclass='source and sink']")
        .css({
            "shape": "source and sink"
        })
        .selector("node[sbgnclass='complex']")
        .css({
            "shape": "complex"
        })
        .selector("node[sbgnclass='compartment']")
        .css({
            "shape": "roundrectangle"
        })
        .selector("node[sbgnclass='unspecified entity']")
        .css({
            "shape": "ellipse",
            "content": "data(sbgnlabel)",
            "text-valign" : "center",
            "text-halign" : "center"
        })
        .selector("node[sbgnclass='simple chemical']")
        .css({
            "shape": "circle",
            "content": "data(sbgnlabel)",
            "text-valign" : "center",
            "text-halign" : "center"
        })
        .selector("node[sbgnclass='simple chemical']")
        .css({
            "shape": "circle",
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
            "line-color": "#444",
            "target-arrow-shape": "triangle"
        })
        .selector(":selected")
        .css({
            "background-color": "#ffffff",
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

var SBGNView = Backbone.View.extend({
    cyStyle: sbgnStyleSheet,
    template: _.template( $("#sbgn-container-template").html() ),
    el: "#sbgn-view-container",

    render: function() {
        var thatEl = this.$el;
        var thatTmpl = this.template;

        $("#show-sbgn-button").click(function(e) {
            e.preventDefault();

            var source = $(this).data("source-el");
            var target = $(this).data("target-el");

            // Empty contents and put the new one
            thatEl.html(thatTmpl());

            var genesStr = source + "," + target;

            $.getJSON("graph/detailed/pathsbetween/" + genesStr,
                function(data) {
                    var container = $("#sbgn-viewer");

                    //TODO : add position to data
 /*                  
                    for (var i = 0 ; i < data.nodes.length ; i++){
                        var xPos = data.nodes[i].data.sbgnbbox.x;
                        var yPos = data.nodes[i].data.sbgnbbox.y;
                        data.nodes[i].position = {'x':xPos, 'y':yPos};
                    }                  
*/

                    var cyOptions = {
                        elements: data,
                        style: sbgnStyleSheet,
                        //layout: { name: 'arbor' },
                        showOverlay: false,

                        ready: function()
                        {
                            var allNodes = this.nodes();

                            for (var i = 0 ; i < data.nodes.length ; i++){
                                var xPos = data.nodes[i].data.sbgnbbox.x;
                                var yPos = data.nodes[i].data.sbgnbbox.y;
                                allNodes[i]._private.position = {'x':xPos, 'y':yPos};
                            }

                            window.cy = this;
                             // we are gonna use 'tap' to handle events for multiple devices
                                // add click listener on nodes

                                cy.on('tap', 'node', function(evt){
                                    var node = this;
                                });
/*
                                cy.on('tap', 'edge', function(evt){
                                    var edge = this;
                                });


                                // add click listener to core (for background clicks)
                                cy.on('tap', function(evt) {
                                    
                                });

                                // When a node is dragged, saved its new location
                                cy.on('drag', 'node', function(evt) {

                                    //TODO : DRAG ALL SELECTED BOXES
                                    var nodes = evt.cy.nodes();
                                    var node = this;
                                    var zoom = evt.cy.zoom();
                                    var xDis = evt.originalEvent.mozMovementX/zoom;
                                    var yDis = evt.originalEvent.mozMovementY/zoom;
                                });
*/
                        }
                    };

                    container.html("");
                    container.cy(cyOptions);
                } // end of function(data)
            ); // end of $.getJSON

        });

        return this;
    } // end of render: function()
}); // end of NetworkView = Backbone.View.extend({


