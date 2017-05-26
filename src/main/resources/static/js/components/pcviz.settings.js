var SettingsView = Backbone.View.extend({
    render: function() {
        $('#rightMenuControls a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        if(this.model.networkType != undefined) {
            $("#query-type").val(this.model.networkType);
        }

        // $("#query-type").dropkick({
        //     change: function(value, label) {
        //         var genes = $("input[name='tagsinput']").val();
        //         window.location.hash = value + "/" + genes;
        //     }
        // });

        $(".itx-type-on-off").click(function(evt) {
            var type = $(this).data("itx-type");
            var edges = cy.$("edge[type='" + type + "']");

            if(!$(this).hasClass("itx-removed")) {
                edges.hide();

                //also hide shown nodes that have hidden edges only:
                var hiddenEdges = cy.edges().filter(function (i, e) {return e.hidden();});
                var nodesToHide = cy.nodes().filter(function (i, n) {return !n.hidden();})
                    .filter(function (i, n) {return n.connectedEdges().not(hiddenEdges).length == 0;});
                nodesToHide.hide();

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
                edges.show();

                //also show hidden nodes that now have shown edges:
                var hiddenEdges = cy.edges().filter(function (i, e) {return e.hidden();});
                var nodesToShow = cy.nodes().filter(function (i, n) {return n.hidden();})
                    .filter(function (i, n) {return n.connectedEdges().not(hiddenEdges).length > 0;});
                nodesToShow.show();

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

            $("#increase-button").click(); //refreshing is required
        });


        $("#add-cancer-study").click(function(e) {
            e.preventDefault();
            $("#cancer-context-hint").hide();
            (new CancerContextDialogView()).render();
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
            this.$el.find("a").tab('show');
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

var NodesSliderView = Backbone.View.extend({
    el: ".ui-slider",
    render: function() {
        var model = this.model;

        this.$el.each(function() {
            var selfSlider = $(this);
            var minVal = model.min;
            var maxVal = model.max;

            var update = _.throttle( function(event, ui) {
                $("#slider-help-row").fadeOut();

                selfSlider.slider("disable");
                (new FilteringNodesView()).render();

                var val = ui.value;

                // Then hide the low importance ones
                var eles = cy.elements();
                var hiddenNodes = cy.$("node[rank>=" + val + "][!isseed]");
                var shownNodes = cy.nodes().not( hiddenNodes );
                var shownEdges = shownNodes.connectedEdges();

                //exclude edges of currently not-shown interaction types
                _.each($("#graph-settings .itx-type-on-off"), function(btn) {
                    var type = $(btn).data("itx-type");
                    var edges = cy.$("edge[type='" + type + "']");
                    if ($(btn).hasClass("itx-removed")) {
                        shownEdges = shownEdges.not(edges);
                    }
                });

                //further filter out nodes having all their edges hidden
                shownNodes = shownNodes.filter(function (i, node) {
                    return node.connectedEdges().intersection(shownEdges).length > 0;
                });

                var shown = shownNodes.add( shownEdges );
                var hidden = eles.not( shown );

                eles.show();
                hidden.hide();

                (new NumberOfNodesView({ model: { numberOfNodes: val }})).render();
                selfSlider.slider("enable");
            }, 1000/30 );

            // TODO: Get all these dynamic range values from the Ranker itself
            $(this).slider({
                min: minVal,
                max: maxVal,
                value: maxVal,
                orientation: "horizontal",
                range: "min",
                slide: update,
                change: update
            });

            $("#decrease-button").click(function(e) {
                e.preventDefault();
                var oldVal = selfSlider.slider("option", "value");
                var newVal = Math.max(oldVal-1, minVal);
                selfSlider.slider({value: newVal});
            });

            $("#increase-button").click(function(e) {
                e.preventDefault();
                var oldVal = selfSlider.slider("option", "value");
                var newVal = Math.min(oldVal+1, maxVal);
                selfSlider.slider({value: newVal});
            });

        });

        return this;
    }
});