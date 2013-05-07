	// This is for the moustache-like templates
	// prevents collisions with JSP tags
	_.templateSettings = {
		interpolate : /\{\{(.+?)\}\}/g
	};

	/**
	 * Backbone view for the BioGene information.
	 *
	 * Expected fields for the options object:
	 * options.el   target html selector for the content
	 * options.data data associated with a single gene
	 */
	var BioGeneView = Backbone.View.extend({
		initialize: function(options){
			this.render(options);
		},
		render: function(options){
			// pass variables in using Underscore.js template
			var variables = { geneSymbol: options.data.geneSymbol,
				geneDescription: options.data.geneDescription,
				geneAliases: this.parseDelimitedInfo(options.data.geneAliases, ":", ",", null),
				geneDesignations: this.parseDelimitedInfo(options.data.geneDesignations, ":", ",", null),
				geneLocation: options.data.geneLocation,
				geneMim: options.data.geneMim,
				geneId: options.data.geneId,
				geneUniprotId: this.extractFirstUniprotId(options.data.geneUniprotMapping),
				geneUniprotLinks: this.generateUniprotLinks(options.data.geneUniprotMapping),
				geneSummary: options.data.geneSummary};

			// compile the template using underscore
			var template = _.template( $("#biogene_template").html(), variables);

			// load the compiled HTML into the Backbone "el"
			this.$el.html(template);

			// format after loading
			this.format(options, variables);
		},
		format: function(options, variables)
		{
			// hide rows with undefined data

			if (options.data.geneSymbol == undefined)
				$(options.el + " .biogene-symbol").hide();

			if (options.data.geneDescription == undefined)
				$(options.el + " .biogene-description").hide();

			if (options.data.geneAliases == undefined)
				$(options.el + " .biogene-aliases").hide();

			if (options.data.geneDesignations == undefined)
				$(options.el + " .biogene-designations").hide();

			if (options.data.geneChromosome == undefined)
				$(options.el + " .biogene-chromosome").hide();

			if (options.data.geneLocation == undefined)
				$(options.el + " .biogene-location").hide();

			if (options.data.geneMim == undefined)
				$(options.el + " .biogene-mim").hide();

			if (options.data.geneId == undefined)
				$(options.el + " .biogene-id").hide();

			if (options.data.geneUniprotMapping == undefined)
				$(options.el + " .biogene-uniprot-links").hide();

			if (options.data.geneSummary == undefined)
				$(options.el + " .node-details-summary").hide();

			var expanderOpts = {slicePoint: 200, // default is 100
				expandPrefix: ' ',
				expandText: '[...]',
				//collapseTimer: 5000, // default is 0, so no re-collapsing
				userCollapseText: '[^]',
				moreClass: 'expander-read-more',
				lessClass: 'expander-read-less',
				detailClass: 'expander-details',
				// do not use default effects
				// (see https://github.com/kswedberg/jquery-expander/issues/46)
				expandEffect: 'fadeIn',
				collapseEffect: 'fadeOut'};

			// TODO add expander library to have this feature
			// make long texts expandable
//			$(options.el + " .biogene-description").expander(expanderOpts);
//			$(options.el + " .biogene-aliases").expander(expanderOpts);
//			$(options.el + " .biogene-designations").expander(expanderOpts);
//			$(options.el + " .node-details-summary").expander(expanderOpts);

			// note: the first uniprot link has a separate section in the template,
			// therefore it is not included here. since the expander plugin
			// has problems with cutting hyperlink elements, there is another
			// section (span) for all other remaining uniprot links.

			// display only comma (the comma after the first link)
			// (assuming the first 2 chars of this section is ", ")
			expanderOpts.slicePoint = 2; // show comma and the space
			expanderOpts.widow = 0; // hide everything else in any case

//			$(options.el + " .biogene-uniprot-links-extra").expander(expanderOpts);
		},
		generateUniprotLinks: function(mapping) {
			var formatter = function(id){
				return '<a href="http://www.uniprot.org/uniprot/' + id + '" target="_blank">' + id + '</a>';
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