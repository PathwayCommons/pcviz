var SettingsView = Backbone.View.extend({
    render: function() {
        $(".ui-slider").each(function() {
            var sliderVal = $(this).data("default-value");

            // TODO: Get all these dynamic range values from the Ranker itself
            $(this).slider({
                min: 0,
                max: 3,
                value: sliderVal,
                orientation: "horizontal",
                range: "min",
                change: function(event, ui) {
                    var val = 4 - ui.value;

                    // First stop all animations and clear the queue
                    cy.$("node").stop().clearQueue();

                    // Then hide the low importance ones
                    var eles = cy.$("node[importance<=" + val + "][!isseed]");
                    eles.animate(
                        {
                            css: {
                                'opacity': .0
                            }
                        }, {
                            duration: 700,
                            complete: function() {
                                eles.hide();
                            }
                        }
                    );

                    // Finally show high importance ones
                    var eles2 = cy.$("node[importance>" + val + "]");
                    eles2.show();
                    eles2.animate(
                        {
                            css: {
                                'opacity': 1.0
                            }
                        }, {
                            duration: 700
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
                    duration: 500,
                    complete: function() {
                        edges.hide();
                    }
                });

                (new NotyView({
                    template: "#noty-edges-hidden-template",
                    model: {
                        type: type,
                        numOfEdges: edges.length
                    }
                })).render();

            } else {
                edges.show().animate({
                    css: { 'opacity' : 1.0 }
                }, {
                    duration: 500
                });

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