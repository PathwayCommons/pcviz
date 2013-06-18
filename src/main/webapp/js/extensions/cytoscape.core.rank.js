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
        options = $$.util.extend(true, {}, defaults, options);

        // We will pool everything for performance issues
        var pooledData = {};

        // First set defaults
        cy.$("node").each(function(i, ele) {
            var nodeData = {};
            nodeData[options.attrName] = options.defaultScore;
            pooledData[ele.id()] = nodeData;
        });

        // Then update the visited nodes
        cy.$("node[?isseed]").bfs(function(i, depth) {
                var nodeData = {};
                nodeData[options.attrName] = Math.max(options.minScore, options.maxScore-depth);
                pooledData[this.id()] = nodeData;
            }
        );

        var nodes = [];
        cy.nodes().each(function(i, ele) {
            nodes.push(ele.id());
        });

        nodes.sort(function(a, b) {
            return pooledData[b][options.attrName] - pooledData[a][options.attrName];
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