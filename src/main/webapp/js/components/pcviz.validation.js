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

var GeneValidation = Backbone.Model.extend({});

var GeneValidations = Backbone.Collection.extend({
    url: "validate/",
    model: GeneValidation,

    initialize: function(attributes) {
        this.url += attributes.genes;
    }
});

var GeneValidationsView = Backbone.View.extend({
    allValid: true,
    isAllValid: function() {
        return this.allValid
    },

    render: function() {
        var self = this;
        _.each(this.model.models, function(aValidation) {
            var inputEl = null;

            $("div.tagsinput span.tag span").each(function(index, tag) {
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
                    if(!_.contains(aValidation.get("matches"), aValidation.get("query"))) {
                        // multiple match -- bad
                        $(inputEl).addClass("error-tag");
                        self.allValid = false;
                    }
                }
            }
        });

        return this;
    }
});
