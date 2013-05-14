var HomeView = Backbone.View.extend({
    render: function() {

        $("#tagsinput").tagsInput({
            defaultText: "...",
            onAddTag: function(value) {
                $("#log").prepend("<li>Added a gene: " + value + " <span class='badge badge-info undo'>&times;</span></li>");
                $(".undo").tooltip({ title: "undo this step"});
	            (new NetworkView({ el: "#main-network-view" })).render();
            },
            onRemoveTag: function(value) {
                $("#log").prepend("<li>Removed a gene: " + value + " <span class='badge badge-info undo'>&times;</span></li>");
                $(".undo").tooltip({ title: "undo this step"});
	            (new NetworkView({ el: "#main-network-view" })).render();
            }
        });

        $("#full-screen-link").click(function() {
            $.fancybox(
                _.template($("#fullscreen-network-tmpl").html(), {}),
                {
                    'autoDimensions' : false,
                    'width' : '100%',
                    'height' : '100%',
                    'transitionIn' : 'none',
                    'transitionOut' : 'none'
                }
            );

            (new NetworkView({ el: $("#fullscreen-network-view") })).render();
        });

        return this;
    }
});
