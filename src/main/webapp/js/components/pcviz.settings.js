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

var SettingsView = Backbone.View.extend({
    render: function() {
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
                edges.hide();

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
                var shown = shownNodes.add( shownNodes.connectedEdges() );
                var hidden = cy.elements().not( shown );

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

                // slide: function(event, ui) {
                //     (new NumberOfNodesView({ model: { numberOfNodes: ui.value }})).render();
                // },
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