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
            "border-width": 3,
            "shape": "circle",
            "border-color": "#555",
            "font-size": "15"
        })
        .selector("edge")
        .css({
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
         })
    ; // end of pcVizStyleSheet

var SBGNView = Backbone.View.extend({
	cyStyle: pcVizStyleSheet,
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

                    var cyOptions = {
                        elements: data,
                        style: pcVizStyleSheet,
                        layout: { name: 'arbor' },
                        showOverlay: false
                    };

                    container.html("");
                    container.cy(cyOptions);

                } // end of function(data)
            ); // end of $.getJSON

        });

        return this;
    } // end of render: function()
}); // end of NetworkView = Backbone.View.extend({


