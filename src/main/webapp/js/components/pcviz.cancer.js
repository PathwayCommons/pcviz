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

var CancerStudy = Backbone.Model.extend({
    urlRoot: "cancer/get/",
    idAttribute: "studyId"
});

var CancerStudies = Backbone.Collection.extend({
    model: CancerStudy,
    url: "cancer/list"
});

var CancerContext = Backbone.Model.extend({
    url: function() {
        return "cancer/context/"
            + this.get("studyId") + "/"
            + this.get("profiles") + "/"
            + this.get("genes");
    }
});

var CancerContextDialogView = Backbone.View.extend({
    el: "#cancer-context-dialog",
    template: _.template($("#cancer-context-dialog-tmpl").html()),

    render: function() {
        var selfEl = this.$el;
        selfEl.show();
        selfEl.html(this.template({}));

        $("#rightMenuTabs").scrollTo("#step1", 750);
        $("#step-loading").show();
        $("#context-load-button").hide();
        $("#srmatlas-all").hide();

        var studies = new CancerStudies();
        studies.fetch({
            success: function() {
                _.each(studies.models, function(study) {
                    (new CancerStudySelectItemView({ model: study })).render();
                });

                $("#step-loading").fadeOut();

                $("#cancer-studies-box").dropkick({
                    change: function(value, label) {
                        if(value != "none") {
                            $("#step-loading").show();
                            $("#rightMenuTabs").scrollTo("#step1", 750);

                            var selectedStudy;
                            _.each(studies.models, function(study) {
                                if(study.get("studyId") == value) selectedStudy = study;
                            });

                            selectedStudy.fetch({
                                success: function() {
                                    $("#step-loading").fadeOut();
                                    var contextLoadButton = $("#context-load-button");

                                    if(contextLoadButton.hasClass("disabled")) {
                                        contextLoadButton.fadeOut();
                                    } else {
                                        contextLoadButton.show()
                                    }

                                    var model = selectedStudy.toJSON();

                                    if(!model.hasCNA)
                                        $("#label-cna").hide().find("input").attr("checked", false);
                                    else
                                        $("#label-cna").show();

                                    if(!model.hasMutation)
                                        $("#label-mutation").hide().find("input").attr("checked", false);
                                    else
                                        $("#label-mutation").show();

                                    if(!model.hasExpression)
                                        $("#label-exp").hide().find("input").attr("checked", false);
                                    else
                                        $("#label-exp").show();

                                    $("#step2").slideDown();
                                    // First let's prepend icons (needed for effects)
                                    $("#step2 .checkbox")
                                        .prepend("<span class='icon'></span><span class='icon-to-fade'></span>");

                                    $("#step2 .checkbox").click(function(){
                                        setupLabel();

                                        var enabled = false;
                                        _.each($("#step2 .data-type"), function(option) {
                                            if($(option).attr("checked")) enabled = true;
                                        });

                                        if(enabled) {
                                            $("#context-load-button").removeClass('disabled').fadeIn();
                                        } else {
                                            $("#context-load-button").addClass('disabled').fadeOut();
                                        }
                                    });
                                    setupLabel();

                                    // Now bind the event to the add button
                                    contextLoadButton.unbind("click").click(function(e) {
                                        if($(this).hasClass("disabled")) return;

                                        $("#step-loading").show();
                                        $(this).addClass("disabled");

                                        var profiles = "";
                                        _.each($("#step2 label.checked"), function(label) {
                                            profiles += $(label).attr("for") + ",";
                                        });
                                        profiles = profiles.substring(0, profiles.length-1);

                                        // Extract gene names
                                        var genes = "";
                                        _.each(cy.nodes(), function(node) {
                                            genes += node.id() + ",";
                                        });
                                        genes = genes.substring(0, genes.length-1);

                                        // Try to load the context
                                        var cancerContext = new CancerContext({
                                            studyId: model.cancerStudy.studyId,
                                            genes: genes,
                                            profiles: profiles
                                        });

                                        cancerContext.fetch({
                                            success: function() {
                                                var studyId = selectedStudy.get("cancerStudy").studyId;
                                                var studyLabel = selectedStudy.get("cancerStudy").name ;
                                                var numberOfCases = selectedStudy.get("numberOfCases");
                                                var tokens = studyLabel.split("(");
                                                var studyName = tokens[0].trim();
                                                var studyDesc = tokens[1].replace(")", "");

                                                // save this data
                                                store.set(studyId, cancerContext);

                                                (new CancerStudyContextItem({
                                                    model: {
                                                        studyName: studyName,
                                                        studyDesc: studyDesc,
                                                        studyId: studyId,
                                                        numberOfCases: numberOfCases
                                                    }
                                                })).render();

                                                $("#step-loading").hide();
                                                $(this).removeClass("disabled");
                                                $("#srmatlas-all").show();

                                                (new ContextAwareNetworkView()).render();
                                                selfEl.fadeOut().html("");

                                            }
                                        });
                                    });
                                }
                            });

                        } else {
                            $("#step2").fadeOut();
                        }
                    }
                });
            }
        });


        return this;
    }
});

var CancerStudyContextItem = Backbone.View.extend({
    template:_.template($("#cancer-study-added-tmpl").html()),
    el: "#cancer-context-list",

    render: function() {
        this.$el.append(this.template(this.model));
        $(".todo li").last().click(function() {
            $(this).toggleClass("todo-done");
            (new ContextAwareNetworkView()).render();
        });

        $("#rightMenuTabs").scrollTo("#" + this.model.studyId, 750);

        (new NotyView({
            template: "#noty-new-study-loaded-template",
            model: this.model
        })).render();

        return this;
    }
});

var CancerStudySelectItemView = Backbone.View.extend({
    el: "#cancer-studies-box",
    template:_.template($("#cancer-study-select-item-tmpl").html()),

    render: function() {
        var modelJSON = this.model.toJSON();
        this.$el.append(this.template(modelJSON));

        return this;
    }
});

var ContextAwareNetworkView = Backbone.View.extend({
    render: function() {
        var totalCases = 0;
        var totalStudies = 0;
        var avgData = {};
        var allNames = [];
        cy.nodes().each(function(i, ele) {
            var id = ele.id();

            allNames.push(id);
            avgData[id] = { altered: 0 };
        });


        $("#cancer-context-list li.todo-done").each(function(i, ele) {
            totalStudies++;
            var data = store.get($(ele).data("cancer-id"));
            var numOfCases = $(ele).data("case-size");
            totalCases += numOfCases;

            for(var j=0; j < allNames.length; j++) {
                var name = allNames[j];
                avgData[name].altered += data[name].altered * numOfCases;
            }
        });

        for(var i=0; i < allNames.length; i++) {
            avgData[allNames[i]].altered /= totalCases;
        }

        if(totalStudies == 1) {
            (new NotyView({
                template: "#noty-context-loaded-one-template",
                model: {
                    numberOfStudies: totalStudies,
                    numberOfCases: totalCases
                }
            })).render();
        } else if(totalStudies > 1) {
            (new NotyView({
                template: "#noty-context-loaded-template",
                model: {
                    numberOfStudies: totalStudies,
                    numberOfCases: totalCases
                }
            })).render();
        } else {
            (new NotyView({
                template: "#noty-no-context-template",
                model: {}
            })).render();
        }

        cy.batchData(avgData);
        // Now that we have new data, we have to run the ranker again
        cy.rankNodes();

        return this;
    }
});