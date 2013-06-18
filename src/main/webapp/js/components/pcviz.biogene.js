/**
 * Backbone view for the BioGene information.
 */
var BioGeneView = Backbone.View.extend({
    render: function() {
        // pass variables in using Underscore.js template
        var variables = { geneSymbol: this.model.geneSymbol,
            geneDescription: this.model.geneDescription,
            geneAliases: this.parseDelimitedInfo(this.model.geneAliases, ":", ",", null),
            geneDesignations: this.parseDelimitedInfo(this.model.geneDesignations, ":", ",", null),
            geneLocation: this.model.geneLocation,
            geneMim: this.model.geneMim,
            geneId: this.model.geneId,
            geneUniprotId: this.extractFirstUniprotId(this.model.geneUniprotMapping),
            geneUniprotLinks: this.generateUniprotLinks(this.model.geneUniprotMapping),
            geneSummary: this.model.geneSummary,
            altered: this.model.altered
        };

        // compile the template using underscore
        var template = _.template( $("#biogene-template").html(), variables);

        // load the compiled HTML into the Backbone "el"
        this.$el.html(template);

        // format after loading
        this.format(this.model);

        (new BlinkDetailsTabView()).render();

        if(!this.model.isseed) {
            $(".add-gene-to-network")
                .click(function(event) {
                    $("#tagsinput").addTag($(this).data("gene"));
                })
                .tooltip({
                    placement: 'right'
                });
        } else {
            $(".add-gene-to-network").hide();
        }

        return this;
    },
    format: function()
    {
        // hide rows with undefined data
        if (this.model.geneSymbol == undefined)
            this.$el.find(".biogene-symbol").hide();

        if (this.model.geneDescription == undefined)
            this.$el.find(".biogene-description").hide();

        if (this.model.geneAliases == undefined)
            this.$el.find(".biogene-aliases").hide();

        if (this.model.geneDesignations == undefined)
            this.$el.find(".biogene-designations").hide();

        if (this.model.geneChromosome == undefined)
            this.$el.find(".biogene-chromosome").hide();

        if (this.model.geneLocation == undefined)
            this.$el.find(".biogene-location").hide();

        if (this.model.geneMim == undefined)
            this.$el.find(".biogene-mim").hide();

        if (this.model.geneId == undefined)
            this.$el.find(".biogene-id").hide();

        if (this.model.geneUniprotMapping == undefined)
            this.$el.find(".biogene-uniprot-links").hide();

        if (this.model.geneSummary == undefined)
            this.$el.find(".node-details-summary").hide();

        if($("#cancer-context-list li.todo-done").length == 0) {
            this.$el.find(".alteration-frequency-info").hide();
        }

        var expanderOpts = {slicePoint: 200,
            expandPrefix: ' ',
            expandText: ' (...)',
            userCollapseText: ' (show less)',
            moreClass: 'expander-read-more',
            lessClass: 'expander-read-less',
            detailClass: 'expander-details',
            // do not use default effects
            // (see https://github.com/kswedberg/jquery-expander/issues/46)
            expandEffect: 'fadeIn',
            collapseEffect: 'fadeOut'};

        $(".biogene-info .expandable").expander(expanderOpts);

        expanderOpts.slicePoint = 2; // show comma and the space
        expanderOpts.widow = 0; // hide everything else in any case
    },
    generateUniprotLinks: function(mapping) {
        var formatter = function(id){
            return _.template($("#uniprot-link-template").html(), { id: id });
        };

        if (mapping == undefined || mapping == null)
        {
            return "";
        }

        // remove first id (assuming it is already processed)
        if (mapping.indexOf(':') < 0)
        {
            return "";
        }
        else
        {
            mapping = mapping.substring(mapping.indexOf(':') + 1);
            return ', ' + this.parseDelimitedInfo(mapping, ':', ',', formatter);
        }
    },
    extractFirstUniprotId: function(mapping) {
        if (mapping == undefined || mapping == null)
        {
            return "";
        }

        var parts = mapping.split(":");

        if (parts.length > 0)
        {
            return parts[0];
        }

        return "";
    },
    parseDelimitedInfo: function(info, delimiter, separator, formatter) {
        // do not process undefined or null values
        if (info == undefined || info == null)
        {
            return info;
        }

        var text = "";
        var parts = info.split(delimiter);

        if (parts.length > 0)
        {
            if (formatter)
            {
                text = formatter(parts[0]);
            }
            else
            {
                text = parts[0];
            }
        }

        for (var i=1; i < parts.length; i++)
        {
            text += separator + " ";

            if (formatter)
            {
                text += formatter(parts[i]);
            }
            else
            {
                text += parts[i];
            }
        }

        return text;
    }
});