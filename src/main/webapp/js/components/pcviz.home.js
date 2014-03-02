/*
 * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
 *
 * This file is part of PCViz.
 *
 * PCViz is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PCViz is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
 */

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

        var redirectForNewNetwork = function() {
            window.location.hash = $("#query-type").val() + "/" + $("input[name='tagsinput']").val();
        };

        var loadNetworkTimer = 0;
        var waitTime = 750;

        $("#tagsinput").tagsInput({
            defaultText: "...",
            onAddTag: function() {
                window.clearTimeout(loadNetworkTimer);
                loadNetworkTimer = window.setTimeout(redirectForNewNetwork, waitTime);
            },
            onRemoveTag: function() {
                window.clearTimeout(loadNetworkTimer);
                loadNetworkTimer = window.setTimeout(redirectForNewNetwork, waitTime);
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

            var pngContent = cy.png({ full: true });

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
