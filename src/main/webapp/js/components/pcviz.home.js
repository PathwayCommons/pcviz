var ContainerView = Backbone.View.extend({
    el: "#dynamic-container",
    template: _.template($("#main-container-template").html()),

    render: function() {
        this.$el.html(this.template({ isContainer: this.model }));

        return this;
    }
});

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

            if($("#embed-network").hasClass("active")) {
                $("#embed-network").trigger('click');
            }

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

        var embedCodeView = new EmbedCodeView({
            model: {
                genes: terms,
                networkType: kind
            }
        }).render();

        $("#embed-network").click(function(e) {
            e.preventDefault();

            if($("#download-network").hasClass("active")) {
                $("#download-network").trigger('click');
            }

            $(this).toggleClass("active");
            $("#extra-embed-options").toggle("slideDown");
            embedCodeView.render();
        });

        $(".embed-size-input").keyup(function() {
            embedCodeView.render();
        });

        $("#embed-close-button").click(function(e) {
            e.preventDefault();
            $("#embed-network").trigger('click');
        });

        $("#embed-preview-button").click(function(e) {
            e.preventDefault();

            var size = embedCodeView.getSize();

            $.fancybox(
                embedCodeView.getHtml(),
                {
                    'autoDimensions' : false,
                    'width' : size.width + "px",
                    'height' : size.width + "px",
                    'transitionIn' : 'none',
                    'transitionOut' : 'none'
                }
            );

        });

        return this;
    }
});

var EmbedCodeView = Backbone.View.extend({
    el: "#embed-form-html",
    getHtml: function() {
        var model = _.extend(this.model, this.getSize());
        return this.template(model);
    },

    getSize: function() {
        var width = $("#embed-form-width").val();
        var height = $("#embed-form-height").val();

        return {width: width, height: height};
    },

    template: _.template($("#embed-code-template").html()),    render: function() {
        this.$el.html(this.getHtml());

        return this;
    }
});

var HeaderView = Backbone.View.extend({
    template: _.template($("#pcviz-header-template").html()),
    el: "#pcviz-header",

    render: function() {
        this.$el.html(this.template({}));
    }
});

var FooterView = Backbone.View.extend({
    template: _.template($("#pcviz-footer-template").html()),
    el: "#pcviz-footer",

    render: function() {
        this.$el.html(this.template({}));
    }
});

var EmbedHeaderView = Backbone.View.extend({
    template: _.template($("#embed-header-template").html()),
    el: "#pcviz-header",

    render: function() {
        this.$el.html(this.template({}));
    }
});

var EmbedFooterView = Backbone.View.extend({
    template: _.template($("#embed-footer-template").html()),
    el: "#pcviz-footer",

    render: function() {
        this.$el.html(this.template(this.model));
    }
});

var EmbedHomeView = Backbone.View.extend({
    el: "#main-container",
    template:_.template($("#main-embed-template").html()),

    render: function() {
        this.$el.html(this.template(this.model));

        $(".pcviz-embed-logo").click(function(e) {
            window.open($(this).data("url"), "_blank");
        });

        return this;
    }

});
