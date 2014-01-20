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

var pcVizStyleSheet = cytoscape.stylesheet()
        .selector("node")
        .css({
            "content": "data(id)",
            "shape": "data(shape)",
            "border-width": 3,
            "border-color": "#555",
            "font-size": "15"
        })
        .selector("edge")
        .css({
            "width": "mapData(cited, 5, 50, 0.4, 0.5)",
            "line-color": "#444",
            "target-arrow-shape": "triangle"

        })
        .selector(":selected")
        .css({
            "background-color": "#000",
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
        }); // end of pcVizStyleSheet
var edgeLengthArray = new Array(); // a map from edgeID to number
var pcVizLayoutOptions = {
    name: 'pcvizarbor',
    liveUpdate: true,
    nodeMass: function(e) { return e.isseed ? 2.5 : 0.2; },
    edgeLength: function(e) { 
	return edgeLengthArray[e.id];
    },
    repulsion: 1800,
    stiffness: 75,
    gravity: true,
    maxIterations: 75,
    displayStepSize: 5,
    stableEnergy: function(energy) {
        return (energy.max <= 2) || (energy.mean <= 0.5);
    },
    precision: 0
}; // end of pcVizLayoutOptions

var SBGNView = Backbone.View.extend({
	cyStyle: pcVizStyleSheet,
    template: _.template( $("#sbgn-container-template").html() ),
    el: $("#sbgn-view-container"),

	render: function() {
        var thatEl = this.$el;
        var thatTmpl = this.template;

        $("#show-sbgn-button").click(function(e) {
            e.preventDefault();

            var source = $(this).data("source-el");
            var target = $(this).data("target-el");

            // Empty contents and put the new one
            thatEl.html(thatTmpl());

            var genesStr = this.model.source + "," + this.model.target;

            $.getJSON("graph/detailed/" + networkType + "/" + genesStr,
                function(data) {
                    var container = $("#fullscreen-network-view");

                    var cyOptions = {
                        elements: data,
                        style: self.cyStyle,
                        showOverlay: false,
                        layout: pcVizLayoutOptions,
                        minZoom: 0.125,
                        maxZoom: 16,

                        ready: function() {
                            var width = Math.max(w , Math.ceil(Math.sqrt(numberOfNodes) * w/Math.sqrt(30)));
                            // 0.9 is multiplied to get rid of the overlap as before
                            var zoomLevel = 0.9 * (w / width);
                            cy.zoom(zoomLevel);
                        }
                    };

                    container.cy(cyOptions);

                } // end of function(data)
            ); // end of $.getJSON

        });

        return this;
    } // end of render: function()
}); // end of NetworkView = Backbone.View.extend({


