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
                window.location.hash = "genes/" + $("input[name='tagsinput']").val();
            },
            onRemoveTag: function() {
                window.location.hash = "genes/" + $("input[name='tagsinput']").val();
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
