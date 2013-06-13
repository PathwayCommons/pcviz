var HomeView = Backbone.View.extend({
    el: "#main-container",
    template:_.template($("#main-template").html()),

    render: function() {
        var terms = this.model.terms.replace("<", "").replace(">", "").toUpperCase();
        this.model.terms = terms;
        var kind = this.model.networkType;

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

        $("#refresh-view").click(function(e) {
            e.preventDefault();
            store.clear();
            (new NotyView({
                template: "#noty-network-refresh-template",
                model: {}
            })).render();

            (new NetworkView({ el: "#main-network-view" })).render();
        });

        $("#download-network").click(function(e) {
            e.preventDefault();
            $("#download-network").toggleClass("active");
            $("#extra-download-options").toggle("slideDown");
        });

        $("#download-png").click(function(e) {
            e.preventDefault();
            $("#download-network").trigger('click');

            var pngContent = cy.png();

            _.each($("#main-network-view canvas"), function(canvas) {
                if($(canvas).data("id").indexOf("buffer") == 0) {
                    $(canvas).remove();
                }
            });

            window.open(pngContent, "_blank");
        });

        $("#download-sif").click(function(e) {
            e.preventDefault();
            $("#download-network").trigger('click');

            var url = $(this).data("pcurl") + "/graph?source=" + terms
                + "&kind=" + kind
                + "&format=BINARY_SIF";
            window.open(url, "_blank");
        });

        $("#download-biopax").click(function(e) {
            e.preventDefault();
            $("#download-network").trigger('click');

            var url = $(this).data("pcurl") + "/graph?source=" + terms
                + "&kind=" + kind
                + "&format=BIOPAX";
            window.open(url, "_blank");
        });

        $("#pcviz-headline").click(function(e) {
            window.location.hash = "";
        });

        return this;
    }
});
