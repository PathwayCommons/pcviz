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
        var options = $.extend(true, {}, defaults, options);

        var eles = cy.elements();
        var identity = function(x){ return x; }; //TODO: don't get it (is it to simply clone a collection?)
        var nodes = cy.nodes().map( identity );
        // var edges = cy.edges().map( identity );

        cy.startBatch();

        // compute "importance" values for all nodes, edges using BFS alg.
        eles.bfs("node[?isseed]", function(i, depth) {
                var node = this;
                node.data( options.attrName, Math.max(options.minScore, options.maxScore-depth) );
            },
            false
        );

        // sort nodes by "importance", taking into account "altered" and "cited" values, if needed, in order.
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
        //rank nodes
        for( var i = 0; i < nodes.length; i++ ) {
            nodes[i].data(options.attrName2, i);
        }

        // // TODO: sort edges (unsure whether this is needed/used anywhere; added just in case)
        // //edges do not have "importance" attribute, because eles.bfs sets it for nodes only (ok?)
        // //edges do not have "altered" as well (that's for genes - nodes only)
        // edges.sort(function(a, b) {
        //     return b.data("cited") - a.data("cited");
        // });
        // //rank edges
        // for( var i = 0; i < edges.length; i++ ) {
        //     edges[i].data(options.attrName2, i);
        // }

        cy.endBatch();

        return this;
    }

    $$("core", "rankNodes", RankNodes); //TODO: rename or split into two functions - for nodes and edges?
})( cytoscape );
