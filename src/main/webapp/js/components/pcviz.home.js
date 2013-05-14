var HomeView = Backbone.View.extend({
    render: function() {

        $("#tagsinput").tagsInput({
            defaultText: "...",
            onAddTag: function(value) {
                var notyView = new NotyView({
                    template: "#noty-newgene-template",
                    model: { gene: value.toUpperCase() }
                });
                notyView.render();

	            (new NetworkView({ el: "#main-network-view" })).render();
            },
            onRemoveTag: function(value) {
                var notyView = new NotyView({
                    template: "#noty-oldgene-template",
                    model: { gene: value.toUpperCase() }
                });
                notyView.render();

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
