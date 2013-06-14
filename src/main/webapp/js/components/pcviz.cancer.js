var CancerStudy = Backbone.Model.extend({
    urlRoot: "cancer/study/",
    idAttribute: "studyId"
});

var CancerStudies = Backbone.Collection.extend({
    model: CancerStudy,
    url: "cancer/list"
});

var CancerContextDialogView = Backbone.View.extend({
    el: "#cancer-context-dialog",
    template: _.template($("#cancer-context-dialog-tmpl").html()),

    render: function() {
        var selfEl = this.$el;
        selfEl.show();
        selfEl.html(this.template({}));

        $("#context-load-button").hide().click(function(e) {
            if($(this).hasClass("disabled")) return;

            var studyId = $("#cancer-studies-box").val();
            var studyLabel = $("option[value='" + studyId + "']").text();
            var tokens = studyLabel.split("(");
            var studyName = tokens[0].trim();
            var studyDesc = tokens[1].replace(")", "");

            (new CancerStudyContextItem({
                model: {
                    studyName: studyName,
                    studyDesc: studyDesc,
                    studyId: studyId
                }
            })).render();
            selfEl.fadeOut().html("").show();
        });

        var studies = new CancerStudies();
        studies.fetch({
            success: function() {
                _.each(studies.models, function(study) {
                    (new CancerStudySelectItemView({ model: study })).render();
                });

                $("#cancer-studies-box").dropkick({
                    change: function(value, label) {
                        if(value != "none") {
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

    }
});

var CancerStudySelectItemView = Backbone.View.extend({
    el: "#cancer-studies-box",
    template:_.template($("#cancer-study-select-item-tmpl").html()),

    render: function() {
        this.$el.append(this.template(this.model.toJSON()));
        $(".todo li").click(function() {
            $(this).toggleClass("todo-done");
        });
        return this;
    }
});