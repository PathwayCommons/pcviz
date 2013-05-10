var NetworkView = Backbone.View.extend({
	// html component for the animated image content
	loadingImage: '<img src="images/loading.gif" alt="loading network...">',
	// container id for the cytoscape.js instance (canvas)
	cyContainer: "#demo",
	// div id for the initial display before the actual network loaded
	networkLoading: "#network-loading",
	// div id for the contents of the details tab
	detailsContent: "#graph-details-content",
	// div id for the initial info message of the details tab
	detailsInfo: "#graph-details-info",
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

	    var container = $(self.cyContainer);
	    var networkLoading = $(self.networkLoading);

	    networkLoading.slideDown();
        container.hide();
        container.html("");

        var names = $("#tagsinput").val().toUpperCase();
        // TODO: change graph type dynamically! (nhood)
        $.getJSON("graph/nhood/" + names,
            function(data) {
	            networkLoading.hide();
                container.show();

                var cyOptions = {
	                // TODO find a better spring layout than arbor
//	                layout: {name: 'arbor',
//		                liveUpdate: true
//		                maxSimulationTime: 2000},
                    elements: data,
                    style: self.cyStyle,
                    ready: function() {
                        window.cy = this; // for debugging

                        // add pan zoom control panel
                        container.cytoscapePanzoom();

                        // add click listener on nodes
                        cy.on('click', 'node', function(evt){
	                        var node = this;
	                        self.updateNodeDetails(evt, node);
                        });

                        // add click listener to core (for background clicks)
                        cy.on('click', function(evt) {
                            // if click on background, hide details
                            if(evt.cyTarget === cy)
                            {
                                $(self.detailsContent).hide();
                                $(self.detailsInfo).show();
                            }
                        });

                        /*
                         var nodeCount = cy.nodes().length;
                         for (var i = 0; i < nodeCount; i++) {

                         var center = [cy.container().clientWidth / 2, cy.container().clientHeight / 2];

                         var angle = i / nodeCount * Math.PI * 2;
                         var radius =
                         Math.min(cy.container().clientWidth, cy.container().clientHeight) / 2 * 0.6;

                         var nodePos = [Math.cos(angle) * radius + center[0], Math.sin(angle) * radius + center[1]]
                         cy.nodes()[i].position({x: nodePos[0], y : nodePos[1]});
                         }
                         */
                    }
                };

                container.cy(cyOptions);
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
		container.append(this.loadingImage);
		container.show();

		// request json data from BioGene service
		$.getJSON("biogene/human/" + node.id(), function(queryResult) {
			container.empty();

			if (queryResult.returnCode != "SUCCESS")
			{
				container.append(
					"Error retrieving data: " + queryResult.returnCode);
			}
			else
			{
				if (queryResult.count > 0)
				{
					// generate the view by using backbone
					var biogeneView = new BioGeneView(
						{el: self.detailsContent,
							data: queryResult.geneInfo[0]});
				}
				else
				{
					container.append(
						"No additional information available for the selected node.");
				}
			}
		});
	}
});