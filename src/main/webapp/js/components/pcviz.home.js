var HomeView = Backbone.View.extend({
    render: function() {


        $("#tagsinput").tagsInput({
            defaultText: "...",
            onAddTag: function(value) {
                $("#log").prepend("<li>Added a gene: " + value + " <span class='badge badge-info undo'>&times;</span></li>");
                $(".undo").tooltip({ title: "undo this step"});
                loadTheGraph();
            },
            onRemoveTag: function(value) {
                $("#log").prepend("<li>Removed a gene: " + value + " <span class='badge badge-info undo'>&times;</span></li>");
                $(".undo").tooltip({ title: "undo this step"});
                loadTheGraph();
            }
        });

        return this;
    }
});
