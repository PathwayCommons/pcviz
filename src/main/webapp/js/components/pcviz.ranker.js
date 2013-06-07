var PCVizRanker = function(cy) {
    cy.$("node").data("importance", 2);
    cy.$("node[?isseed]").bfs(function(i, depth) {
            var node = this;
            node.data("importance", 4-depth);
        }
    );
};