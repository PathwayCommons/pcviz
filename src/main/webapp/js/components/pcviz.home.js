var HomeView = Backbone.View.extend({
    render: function() {

        $("#tagsinput").tagsInput({
            defaultText: "...",
            onAddTag: function() {
	            (new NetworkView({ el: "#main-network-view" })).render();
            },
            onRemoveTag: function() {
	            (new NetworkView({ el: "#main-network-view" })).render();
            },
            autocomplete_url: 'autocomplete/',
            removeWithBackspace: false
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
