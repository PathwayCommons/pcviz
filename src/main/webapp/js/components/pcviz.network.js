var NetworkView = Backbone.View.extend({
	// div id for the initial display before the actual network loaded
	networkLoading: "#network-loading",
	// div id for the contents of the details tab
	detailsContent: "#graph-details-content",
	// div id for the initial info message of the details tab
	detailsInfo: "#graph-details-info",
	// content id for the gene input field
	tagsInputField: "input[name='tagsinput']",
	// cytoscape web visual style object
	cyStyle: cytoscape.stylesheet()
	    .selector("node")
	    .css({
	        "content": "data(id)",
	        "shape": "data(shape)",
	        "border-width": 3,
	        "background-color": "#DDD",
	        "border-color": "#555"
	    })
	    .selector("edge")
	    .css({
	        "width": "mapData(weight, 0, 100, 1, 4)",
	        "target-arrow-shape": "triangle",
	        "source-arrow-shape": "circle",
	        "line-color": "#444"
	    })
	    .selector(":selected")
	    .css({
	        "background-color": "#000",
	        "line-color": "#000",
	        "source-arrow-color": "#000",
	        "target-arrow-color": "#000"
	    })
	    .selector(".ui-cytoscape-edgehandles-source")
	    .css({
	        "border-color": "#5CC2ED",
	        "border-width": 3
	    })
	    .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
	    .css({
	        "background-color": "#5CC2ED"
	    })
	    .selector("edge.ui-cytoscape-edgehandles-preview")
	    .css({
	        "line-color": "#5CC2ED"
	    })
	    .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
	    .css({
	        "shape": "rectangle",
	        "width": 15,
	        "height": 15
	    }),
    render: function() {
	    // reference to the NetworkView instance itself, this is required since
	    // 'this' doesn't refer to the actual instance for callback functions
	    var self = this;

	    var container = $(self.el);
	    var networkLoading = $(self.networkLoading);

	    networkLoading.slideDown();
        container.hide();

	    // get gene names from the input field
        var names = $(self.tagsInputField).val().toUpperCase();

        // This will run the validation on the side track
        var geneValidations = new GeneValidations({ genes: names });
        geneValidations.fetch({
            success: function() {
                var geneValidationsView = new GeneValidationsView({ model: geneValidations });
                geneValidationsView.render();

                if(geneValidationsView.isAllValid()) {
                    // TODO: change graph type dynamically! (nhood)
                    $.getJSON("graph/nhood/" + names,
                        function(data) {
                            networkLoading.hide();
                            container.html("");
                            container.show();

                            var cyOptions = {
                                elements: data,
                                style: self.cyStyle,
                                ready: function() {
                                    window.cy = this; // for debugging

                                    // add pan zoom control panel
                                    container.cytoscapePanzoom();

                                    // we are gonna use 'tap' to handle events for multiple devices
                                    // add click listener on nodes
                                    cy.on('tap', 'node', function(evt){
                                        var node = this;
                                        self.updateNodeDetails(evt, node);
                                    });


                                    // add click listener to core (for background clicks)
                                    cy.on('tap', function(evt) {
                                        // if click on background, hide details
                                        if(evt.cyTarget === cy)
                                        {
                                            $(self.detailsContent).hide();
                                            $(self.detailsInfo).show();
                                        }
                                    });

                                    // This is to get rid of overlapping nodes and panControl
                                    cy.zoom(0.90).center()
                                }
                            };

                            container.cy(cyOptions)
                            ;

                            (new NotyView({
                                template: "#noty-network-loaded-template",
                                model: {
                                    nodes: data.nodes.length,
                                    edges: data.edges.length
                                }
                            })).render();
                        });
                } else {
                    (new NotyView({
                        template: "#noty-invalid-symbols-template",
                        error: true,
                        model: {}
                    })).render();

                    networkLoading.hide();
                    container.show();
                }
            }
        });

        return this;
    },
   /**
    * Updates details tab wrt the given node.
    *
    * @param evt
    * @param node
    */
	updateNodeDetails: function(evt, node) {
		var self = this;
		var container = $(self.detailsContent);
		var info = $(self.detailsInfo);

		// remove previous content
		info.hide();
		container.empty();
		container.append(_.template($("#loading-small-template").html(), {}));
		container.show();

		// request json data from BioGene service
		$.getJSON("biogene/human/" + node.id(), function(queryResult) {
			container.empty();

			if (queryResult.returnCode != "SUCCESS")
			{
				container.append(
                    _.template($("#biogene-retrieve-error-template").html(), {
                        returnCode: queryResult.returnCode
                    })
                );
			}
			else
			{
				if (queryResult.count > 0)
				{
					// generate the view by using backbone
					var biogeneView = new BioGeneView({
                        el: self.detailsContent,
                        model: queryResult.geneInfo[0]
                    });
                    biogeneView.render();
				}
				else
				{
					container.append(
                        _.template($("#biogene-noinfo-error-template").html(), {})
                    );
				}
			}
		});
	}
});