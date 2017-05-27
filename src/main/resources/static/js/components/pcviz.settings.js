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

        $(".itx-type-on-off").click(function(evt)
        {
            $(this).prop("disabled",true);
            $(this).toggleClass("itx-removed");

            var type = $(this).data("itx-type");
            var edges = cy.$("edge[type='" + type + "']");

            if($(this).hasClass("itx-removed")) //just been set to hide all the edges of given type
            {
                edges.hide();

                //also hide nodes that now seem to be disconnected (once/if all edges get hidden)
                // cy.nodes("[!isseed]").filter(function (i, node) {
                //     return !node.hidden() &&
                //         (node.connectedEdges().filter(function (i, edge) {return !edge.hidden();}).length == 0);
                // }).hide();

                //also hide shown nodes that have hidden edges only:
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
            }
            else
            {
                edges.show();

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

            //bother the slider with the same value - refresh?
            var sli = $("#slider-nodes");
            sli.slider("value", sli.slider("value"));

            $(this).prop("disabled",false);
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
        this.$el.each(function() {
            var selfSlider = $(this);
            var minVal = cy.nodes("[?isseed]").length;
            var maxVal = cy.nodes().length;

            var update = _.throttle( function(event, ui)
            {
                $("#slider-help-row").fadeOut();
                selfSlider.slider("disable");
                (new FilteringNodesView()).render();

                var val = ui.value;

                // Then hide the low importance ones
                var eles = cy.elements();
                var hideNodes = cy.$("node[rank>=" + val + "][!isseed]");
                var hideEdges = cy.edges().filter(function (i, edge)
                {
                    return $(".itx-type-on-off." + edge.data().type).hasClass("itx-removed");
                });

                eles.show();
                hideNodes.add(hideEdges).hide();

                //hide dangling nodes (those where all edges are currently hidden)
                var dangNodes = cy.nodes().not(hideNodes).filter(function (i, node)
                {
                    return node.connectedEdges().filter(function (i, edge) {return !edge.hidden();}).length == 0;
                });
                dangNodes.hide();

                (new NumberOfNodesView({ model: { numberOfNodes: val }})).render();
                selfSlider.slider("enable");
            }, 1000/30 );

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
                selfSlider.slider("option", "value", newVal);
            });

            $("#increase-button").click(function(e) {
                e.preventDefault();
                var oldVal = selfSlider.slider("option", "value");
                var newVal = Math.min(oldVal+1, maxVal);
                selfSlider.slider("option", "value", newVal);
            });

        });

        return this;
    }

});
