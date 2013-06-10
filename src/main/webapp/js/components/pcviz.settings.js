var SettingsView = Backbone.View.extend({
    render: function() {
        $(".ui-slider").each(function() {
            var sliderVal = $(this).data("default-value");
            var selfSlider = $(this);

            // TODO: Get all these dynamic range values from the Ranker itself
            $(this).slider({
                min: 0,
                max: 3,
                value: sliderVal,
                orientation: "horizontal",
                range: "min",
                change: function(event, ui) {
                    selfSlider.slider("disable");
                    (new FilteringNodesView()).render();

                    var val = 4 - ui.value;

                    // First stop all animations and clear the queue
                    cy.$("node").stop(true, true);

                    var allNodesLength = cy.nodes().length;

                    var processedNodes = 0;

                    // Then hide the low importance ones
                    var eles = cy.$("node[importance<=" + val + "][!isseed]");
                    var visibleNodesLength = allNodesLength - eles.length;
                    eles
                        .animate(
                        {
                            css: {
                                'opacity': .0
                            }
                        }, {
                            duration: 700,
                            complete: function() {
                                this.hide();
                                if(++processedNodes == allNodesLength) {
                                    (new NumberOfNodesView({ model: { numberOfNodes: visibleNodesLength }})).render();
                                    selfSlider.slider("enable");
                                }
                            }
                        }
                    );

                    // Finally show high importance ones
                    var eles2 = cy.$("node[importance>" + val + "]");
                    eles2
                        .show()
                        .animate(
                        {
                            css: {
                                'opacity': 1.0
                            }
                        }, {
                            duration: 700,
                            complete: function() {
                                if(++processedNodes == allNodesLength) {
                                    (new NumberOfNodesView({ model: { numberOfNodes: visibleNodesLength }})).render();
                                    selfSlider.slider("enable");
                                }
                            }
                        }
                    );
                }
            });
        });

        $('#rightMenuControls a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        if(this.model.networkType != undefined) {
            $("#query-type").val(this.model.networkType);
        }

        $("#query-type").dropkick({
            change: function(value, label) {
                var genes = $("input[name='tagsinput']").val();
                window.location.hash = value + "/" + genes;
            }
        });

        $(".itx-type-on-off").click(function(evt) {
            var type = $(this).data("itx-type");
            var edges = cy.$("edge[type='" + type + "']");

            if(!$(this).hasClass("itx-removed")) {
                edges.animate({
                    css: { 'opacity' : .0 }
                }, {
                    duration: 250,
                    complete: function() {
                        this.hide();
                    }
                });

                $(this).find("span")
                    .removeClass("fui-cross-16")
                    .addClass("fui-plus-16");

                (new NotyView({
                    template: "#noty-edges-hidden-template",
                    model: {
                        type: type,
                        numOfEdges: edges.length
                    }
                })).render();

            } else {
                edges
                    .show()
                    .animate({
                        css: { 'opacity' : 1.0 }
                    }, {
                        duration: 250
                    });

                $(this).find("span")
                    .removeClass("fui-plus-16")
                    .addClass("fui-cross-16");

                (new NotyView({
                    template: "#noty-edges-shown-template",
                    model: {
                        type: type,
                        numOfEdges: edges.length
                    }
                })).render();
            }

            $(this).toggleClass("itx-removed");
        });

        return this;
    }
});

var BlinkDetailsTabView = Backbone.View.extend({
    el: "#menu-graph-details",

    render: function() {
        // If the user is on a different tab, blink this one
        var detailsMenuItem = this.$el;
        if(!detailsMenuItem.hasClass("active")) {
            detailsMenuItem.fadeTo('slow', 0.2).fadeTo('slow', 1.0);
        }

        return this;
    }
});

var NumberOfNodesView = Backbone.View.extend({
    el: "#number-of-genes-info",
    render: function() {
        this.$el.html(this.model.numberOfNodes);
        return this;
    }
});

var FilteringNodesView = Backbone.View.extend({
    el: "#number-of-genes-info",
    template: _.template($("#loading-text-template").html()),
    render: function() {
        this.$el.html(this.template({}));
        return this;
    }
});