var HomeView = Backbone.View.extend({
    el: "#main-container",
    template:_.template($("#main-template").html()),

    render: function() {
        var terms = this.model.terms.replace("<", "").replace(">", "").toUpperCase();
        this.model.terms = terms;

        $(this.el).html("");
        $(this.el).html(this.template(this.model));

        $("#tagsinput").tagsInput({
            defaultText: "...",
            onAddTag: function() {
                window.location.hash = $("#query-type").val() + "/" + $("input[name='tagsinput']").val();
            },
            onRemoveTag: function() {
                window.location.hash = $("#query-type").val() + "/" + $("input[name='tagsinput']").val();
            },
            autocomplete_url: 'autocomplete/',
            removeWithBackspace: false
        }).importTags(terms);

        $("#full-screen-link").click(function(e) {
            e.preventDefault();

            $.fancybox(
                _.template($("#fullscreen-network-tmpl").html(), {}),
                {
                    'autoDimensions' : false,
                    'width' : '100%',
                    'height' : '100%',
                    'transitionIn' : 'none',
                    'transitionOut' : 'none',
                    'onClosed': function() {
                        (new NetworkView({ el: "#main-network-view" })).render();
                    }
                }
            );

            (new NetworkView({
                el: $("#fullscreen-network-view"),
                windowSize: {
                    height: 550,
                    width: 600
                }
            })).render();
        });

        return this;
    }
});
