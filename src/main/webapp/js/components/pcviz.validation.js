var GeneValidation = Backbone.Model.extend({});

var GeneValidations = Backbone.Collection.extend({
    url: "validate/",
    model: GeneValidation,

    initialize: function(attributes) {
        this.url += attributes.genes;
    }
});

var GeneValidationsView = Backbone.View.extend({
    el: "#tagsinput",
    allValid: true,
    isAllValid: function() {
        return this.allValid
    },

    render: function() {
        var self = this;
        _.each(this.model.models, function(aValidation) {
            var inputEl = null;

            $("#tagsinput_tagsinput span.tag span").each(function(index, tag) {
                var value = $(tag).html().toUpperCase();
                if(value.indexOf(aValidation.get("query")) == 0) {
                    inputEl = $(tag).parent();
                }
            });

            if(inputEl != null) {
                var numOfMatches = aValidation.get("matches").length;
                if(numOfMatches == 0) {
                    $(inputEl).addClass("error-tag");
                    self.allValid = false;
                } else if(numOfMatches == 1) {
                    // good
                    var match = aValidation.get("matches")[0].toUpperCase();
                    var query = aValidation.get("query").toUpperCase();
                    if(match != query) {
                        $(inputEl).addClass("warn-tag");
                        (new NotyView({
                            template: "#noty-semivalid-symbols-template",
                            warning: true,
                            model: {
                                query: query,
                                synonym: match
                            }
                        })).render();
                    }
                } else {
                    // multiple match -- bad
                    $(inputEl).addClass("error-tag");
                    self.allValid = false;
                }
            }
        });

        return this;
    }
});
