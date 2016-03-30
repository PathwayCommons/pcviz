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

;(function($$){

    var defaults = {
        maxScore: 4,
        minScore: 0,
        defaultScore: 2,
        attrName: 'importance',
        attrName2: 'rank'
    };

    function RankNodes(options) {
        var cy = this;
        options = $.extend(true, {}, defaults, options);

        // We will pool everything for performance issues
        var pooledData = {};

        // First set defaults
        cy.$("node").each(function(i, ele) {
            var nodeData = {};
            nodeData[options.attrName] = options.defaultScore;
            pooledData[ele.id()] = nodeData;
        });

        // Then update the visited nodes
        cy.elements().bfs("node[?isseed]", function(i, depth) {
                var nodeData = {};
                nodeData[options.attrName] = Math.max(options.minScore, options.maxScore-depth);
                pooledData[this.id()] = nodeData;
            },
            false
        );

        var nodes = [];
        cy.nodes().each(function(i, ele) {
            nodes.push(ele.id());
        });

        nodes.sort(function(a, b) {
            var diff = pooledData[b][options.attrName] - pooledData[a][options.attrName]

            if(diff == 0) {
                diff = cy.$("#" + b).data("altered") - cy.$("#" + a).data("altered");

                if(diff == 0) {
                    diff = cy.$("#" + b).data("cited") - cy.$("#" + a).data("cited");
                }
            }
            return diff;
        });

        for(var i=0; i < nodes.length; i++) {
            pooledData[nodes[i]][options.attrName2] = i;
        }

        // update'em all
        cy.batchData(pooledData);

        return this;
    }

    $$("core", "rankNodes", RankNodes);
})( cytoscape );
