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
        var eles = cy.elements();
        var identity = function(x){ return x; };
        var nodes = eles.map( identity );

        cy.startBatch();

        eles.bfs("node[?isseed]", function(i, depth) {
                var node = this;

                node.data( options.attrName, Math.max(options.minScore, options.maxScore-depth) );
            },
            false
        );

        nodes.sort(function(a, b) {
            var diff = b.data(options.attrName) - b.data(options.attrName);

            if(diff == 0) {
                diff = b.data("altered") - a.data("altered");

                if(diff == 0) {
                    diff = b.data("cited") - a.data("cited");
                }
            }
            return diff;
        });

        for( var i = 0; i < nodes.length; i++ ) {
            nodes[i].data(options.attrName2, i);
        }


        cy.endBatch();

        return this;
    }

    $$("core", "rankNodes", RankNodes);
})( cytoscape );
