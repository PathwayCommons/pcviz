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
        $("#context-load-button").hide();

        var studies = new CancerStudies();
        studies.fetch({
            success: function() {
                _.each(studies.models, function(study) {
                    (new CancerStudySelectItemView({ model: study })).render();
                });

                $("#cancer-studies-box").dropkick({
                    change: function(value, label) {
                        if(value != "none") {

                            var selectedStudy;
                            _.each(studies.models, function(study) {
                                if(study.get("studyId") == value) selectedStudy = study;
                            });

                            selectedStudy.fetch({
                                success: function() {
                                    var model = selectedStudy.toJSON();

                                    if(!model.hasCNA)
                                        $("#label-cna").hide();
                                    else
                                        $("#label-cna").show();

                                    if(!model.hasMutation)
                                        $("#label-mutation").hide();
                                    else
                                        $("#label-mutation").show();

                                    if(!model.hasExpression)
                                        $("#label-exp").hide();
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
                                    $("#context-load-button").unbind("click").click(function(e) {
                                        if($(this).hasClass("disabled")) return;

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
                                                var tokens = studyLabel.split("(");
                                                var studyName = tokens[0].trim();
                                                var studyDesc = tokens[1].replace(")", "");

                                                cy.batchData(cancerContext.toJSON());

                                                (new CancerStudyContextItem({
                                                    model: {
                                                        studyName: studyName,
                                                        studyDesc: studyDesc,
                                                        studyId: studyId
                                                    }
                                                })).render();
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
            console.log("clicked me!")
        });

        $("#rightMenuTabs").scrollTo("#" + this.model.studyId, 750);

        return this;
    }
});

var CancerStudySelectItemView = Backbone.View.extend({
    el: "#cancer-studies-box",
    template:_.template($("#cancer-study-select-item-tmpl").html()),

    render: function() {
        this.$el.append(this.template(this.model.toJSON()));
        return this;
    }
});