var PCVizRanker = function(cy) {
    cy.$("node[?isseed]").bfs(function(i, depth) {
            var node = this;
            node.data("importance", 4-depth);
        }
    );
};