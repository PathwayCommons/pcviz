var pcVizStyleSheet = cytoscape.stylesheet()
        .selector("node")
        .css({
            "content": "data(id)",
            // "border-width": 3,
            "background-color": "mapData(altered, 0, 1, #888888, red)",
            // "border-color": "#555",
            "font-size": "15"
        })
		.selector("edge")
			.css({
				"curve-style": "haystack"
			})
        .selector("[shape]")
        .css({
          "shape": "data(shape)",
        })
        .selector("[?isseed]")
        .css({
            "border-width": 5,
            "color": "#1abc9c",
            "font-weight": "bold",
            "font-size": "17"
        })
        .selector("edge")
        .css({
            "width": "mapData(cited, 0, 100, 1, 1.22)",
            "line-color": "#444"
        })
        .selector("[?isdirected]")
        .css({
            "target-arrow-shape": "triangle"
        })
        .selector("[!isvalid]")
        .css({
            "color": "#e74c3c"
        })
        .selector("edge[type='catalysis-precedes']")
        .css({
            "line-color": "#9B59B6"
        })
        .selector("edge[type='controls-phosphorylation-of']")
        .css({
            "line-color": "#17ccd3"
        })
    	.selector("edge[type='controls-transport-of']")
    	.css({
        	"line-color": "#d3b777"
    	})
        .selector("edge[type='controls-expression-of']")
        .css({
            "line-color": "#0ccc0d" // emerald
        })
        .selector("edge[type='chemical-affects']")
        .css({
            "line-color": "#ffd81b"
        })
        .selector("edge[type='in-complex-with']")
        .css({
            "line-color": "#5e3e41"
        })
        .selector("edge[type='controls-state-change-of']")
        .css({
            "line-color": "#1450b9"
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
        }); // end of pcVizStyleSheet

var edgeTypes = [
    "catalysis-precedes",
    "controls-state-change-of",
    "controls-expression-of",
    "controls-phosphorylation-of",
    // "in-complex-with", //too many edges (query bug or life is?..)
    // "chemical-affects",
    "controls-transport-of"
];

function getPcVizLayoutOptions( data ){
	var numNodes = data.nodes.length;

	// forces layout
	var pcVizLayoutOptions = {
		name: 'cose',
		animate: true
		// put more options here if you want to config the layout...
		// http://js.cytoscape.org/#layouts/cose
	}; // end of pcVizLayoutOptions

	return pcVizLayoutOptions;
}


var NetworkView = Backbone.View.extend({
	// div id for the initial display before the actual network loaded
	networkLoading: "#network-loading",
	// div id for the contents of the details tab
	detailsContent: "#graph-details-content",
	// div id for the initial info message of the details tab
	detailsInfo: "#graph-details-info",
	// content id for the gene input field
	tagsInputField: "input[name='tagsinput']",
	tooSlowMessage: "#too-slow-message",
	controlButtonsContainer: "#control-panels",
	// cytoscape web visual style object
	cyStyle: pcVizStyleSheet,

	render: function()
	{
		// reference to the NetworkView instance itself, this is required since
		// 'this' doesn't refer to the actual instance for callback functions
		var self = this;

		var container = $(self.el);
		var networkLoading = $(self.networkLoading);
		var controlsContainer = $(self.controlButtonsContainer);

		networkLoading.slideDown();
		container.hide();
		controlsContainer.hide();
		$(this.detailsInfo).hide();

		// get gene names from the input field
		var names = $(self.tagsInputField).val().toUpperCase();

		if(names.length < 1)
		{
		    networkLoading.hide();
		    container.html("");
		    container.show();
		    container.cy({
			 	showOverlay: false
		    });

		    (new NotyView({
		    	template: "#noty-empty-network-template",
		    	error: true,
		    	model: {}
		    })).render();

		    return this;
		} // end of if

		// This will run the validation on the side track
		var geneValidations = new GeneValidations({ genes: names });
		geneValidations.fetch({
			success: function()
			{
				var geneValidationsView = new GeneValidationsView({ model: geneValidations });
				geneValidationsView.render();
				if(!geneValidationsView.isAllValid())
				{
					(new NotyView({
						template: "#noty-invalid-symbols-template",
						error: true,
						model: {}
					})).render();
				}

				var networkType = $("#query-type").val();


				// although, 'pathsbetween' is ok to query with one or more genes,
				// let's auto-switch to 'neighborhood' in case it's just one gene ID
				// (it's ok because we pre-compute all gene nearest neighborhoods as parts of pcviz release);
                // on the other hand, let's also change graph type from neighb. to paths. if there are several genes.
                if (networkType == "neighborhood" && names.split(",").length > 1)
                {
                    // (new NotyView({
                    //     template: "#noty-invalid-neighborhood-template",
                    //     error: true,
                    //     model: {}
                    // })).render();

                    $("#query-type").val("pathsbetween");
                    window.location.hash = "pathsbetween/" + names;
                    return this;
                }
                else if (networkType != "neighborhood" && names.split(",").length == 1)
                {
                    // (new NotyView({
                    //     template: "#noty-invalid-graphtype-template",
                    //     error: true,
                    //     model: {}
                    // })).render();

                    // auto-switch to neighborhood
                    $("#query-type").val("neighborhood");
                    window.location.hash = "neighborhood/" + names;
                    return this;
                }

				window.setTimeout(function()
				{
				    $(self.tooSlowMessage).slideDown();
				}, 20000);


                // log this event on google analytics
                ga('send', 'event', 'main', networkType, geneValidations.getPrimaryNames());

				$.getJSON("graph/" + networkType + "/" + geneValidations.getPrimaryNames(),
				    function(data)
				    {
				        networkLoading.hide();
				        container.html("");
				        container.show();
				        $(self.detailsInfo).show();
				        controlsContainer.show();
				        $(self.tooSlowMessage).hide();

                        var layoutOptions = getPcVizLayoutOptions( data );

				        var cyOptions = {
							container: container,
				            elements: data,
				            style: self.cyStyle,
				            showOverlay: false,
                            layout: layoutOptions,
                            minZoom: 0.01,
				            maxZoom: 16,

				            ready: function()
				            {
				                window.cy = this; // for debugging

				                // We don't need this, so better disable
				                cy.boxSelectionEnabled(false);

				                // add pan zoom control panel
				                cy.panzoom({
									// icon class names
									sliderHandleIcon: 'icon-minus',
									zoomInIcon: 'icon-plus',
									zoomOutIcon: 'icon-minus',
									resetIcon: 'icon-resize-full'
								});

				                // we are gonna use 'tap' to handle events for multiple devices
				                // add click listener on nodes
				                cy.on('tap', 'node', function(evt){
				                    var node = this;
				                    self.updateNodeDetails(evt, node);
				                });

				                cy.on('tap', 'edge', function(evt){
				                    var edge = this;
				                    self.updateEdgeDetails(evt, edge);
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

				                // When a node is moved, saved its new location
				                cy.on('free', 'node', function(evt) {
				                    var node = this;
				                    var position = node.position();
				                    localStorage.setItem(node.id(), JSON.stringify(position));
				                });
				                var numberOfNodes = cy.nodes().length;

				                // Run the ranker on this graph
				                cy.rankNodes();

				                (new NumberOfNodesView({ model: { numberOfNodes: numberOfNodes }})).render();

				                _.each(edgeTypes, function(type)
						{
							var numOfEdges = cy.$("edge[type='" + type + "']").length;
							if(numOfEdges > 0)
							{
								$("#" + type + "-count").text(numOfEdges);
							}
							else
							{
								$("#row-" + type).hide();
							}
						});

						(new NodesSliderView({
							model:
							{
						                min: cy.nodes("[?isseed]").length,
						                max: numberOfNodes
							}
						})).render();
				            } // end of ready: function()
				        }; // end of cyOptions

						// var startTime = Date.now(); //for debugging

						cy = cytoscape(cyOptions);

						// also debug -
						// cy.ready(function(){
						// 	var endTime = Date.now();
						// 	console.log('Init took %s ms', endTime - startTime);
						// });
						// - end debug.

				        (new NotyView({
			        		template: "#noty-network-loaded-template",
			        		model:
						{
						        nodes: data.nodes.length,
						        edges: data.edges ? data.edges.length : 0,
						        type: networkType.capitalize(),
						        timeout: 5000
						 }
				        })).render();
				} // end of function(data)
			); // end of $.getJSON
		} // end of success: function()
        }); // end of geneValidations.fetch({

        return this;
    }, // end of render: function()
   /**
    * Updates details tab wrt the given node.
    *
    * @param evt
    * @param node
    */
    updateNodeDetails: function(evt, node)
    {
 	var self = this;
	var container = $(self.detailsContent);
	var info = $(self.detailsInfo);

	// remove previous content
	info.hide();
	container.empty();
	container.append(_.template($("#loading-biogene-template").html(), {}));
	container.show();

	// request json data from BioGene service
	$.getJSON("biogene/human/" + node.id(), function(queryResult)
	{
		container.empty();

		if (queryResult.returnCode != "SUCCESS")
		{
			container.append(
            		_.template($("#biogene-retrieve-error-template").html(),
				{
	                		returnCode: queryResult.returnCode
            			})
        		);
		}
		else
		{
			if (queryResult.count > 0)
			{
			    // generate the view by using backbone
			    var geneInfo = queryResult.geneInfo[0];
			    geneInfo["isseed"] = node.data("isseed");
			    geneInfo["altered"] = parseInt(node.data("altered") * 100);
                geneInfo["uniprot"] = node.data("uniprot");
				geneInfo["uniprotdesc"] = node.data("uniprotdesc");

				var biogeneView = new BioGeneView({
					el: self.detailsContent,
					model: geneInfo
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
	}); // end of JSON query result
    },

    /**
     * Updates details tab wrt the given edge.
     *
     * @param evt
     * @param edge
     */
    updateEdgeDetails: function(evt, edge) {
        var self = this;
        var container = $(self.detailsContent);
        $(self.detailsInfo).hide();

        container.empty();
        (new EdgeInfoView({
            model: edge.data(),
            el: "#graph-details-content"
        })).render();
        container.show();
    }
}); // end of NetworkView = Backbone.View.extend({


var EmbedNetworkView = Backbone.View.extend({
    // div id for the initial display before the actual network loaded
    networkLoading: "#network-embed-loading",
    // cytoscape web visual style object
    cyStyle: pcVizStyleSheet,

    render: function()
    {
        var self = this;

        var container = $(self.el);
        var networkLoading = $(self.networkLoading);

        networkLoading.slideDown();
        container.hide();

        // get gene names from the model
        var names = this.model.genes;
        var networkType = this.model.networkType;

        // log this event on google analytics
        ga('send', 'event', 'widget', networkType, names);

        var geneValidations = new GeneValidations({ genes: names });
        geneValidations.fetch({
            success: function() {
                $.getJSON("graph/" + networkType + "/" + geneValidations.getPrimaryNames(),
                    function(data)
                    {
                        networkLoading.hide();
                        container.html("");
                        container.show();

                        var layoutOptions = getPcVizLayoutOptions( data );

                        var cyOptions = {
                            elements: data,
                            style: self.cyStyle,
                            showOverlay: false,
                            layout: layoutOptions,
                            minZoom: 0.01,
                            maxZoom: 16,

                            ready: function()
                            {
                                window.cy = this; // for debugging

                                // We don't need this, so better disable
                                cy.boxSelectionEnabled(false);

                                // add pan zoom control panel
								cy.panzoom({
									// icon class names
									sliderHandleIcon: 'icon-minus',
									zoomInIcon: 'icon-plus',
									zoomOutIcon: 'icon-minus',
									resetIcon: 'icon-resize-full'
								});

                                var createAndPostClickMessage = function(where, info) {
                                    var message = {
                                        type: "pcvizclick",
                                        content: {
                                            info: info,
                                            where: where
                                        }
                                    };

                                    top.postMessage(JSON.stringify(message), "*");
                                };

                                // we are gonna use 'tap' to handle events for multiple devices
                                // add click listener on nodes
                                cy.on('tap', 'node', function(evt){
                                    // request json data from BioGene service
                                    var node = this;
                                    $.getJSON("biogene/human/" + node.id(), function(queryResult) {
                                        var geneInfo = queryResult.geneInfo[0];
                                        var nodeData = node.data();
                                        nodeData["annotation"] = geneInfo;
                                        createAndPostClickMessage("node", nodeData);
                                    }); // end of JSON query result
                                });

                                cy.on('tap', 'edge', function(evt){
                                    createAndPostClickMessage("edge", this.data());
                                });

                                // add click listener to core (for background clicks)
                                cy.on('tap', function(evt) {
                                    // if click on background, hide details
                                    if(evt.cyTarget === cy)
                                    {
                                        createAndPostClickMessage("background", null, "none");
                                    }
                                });

                                // This is to get rid of overlapping nodes and panControl
                                cy.zoom(0.90).center();

                                // Run the ranker on this graph
                                cy.rankNodes();
                            } // end of ready function
                        }; // end of cyOptions

                        container.cy(cyOptions);

                        // Post this message to the main web-page
                        var numberOfNodes = data.nodes.length;
                        var numberOfEdges = data.edges ? data.edges.length : 0;

                        var message = {
                            type: "pcvizloaded",
                            content: {
                                numberOfEdges: numberOfEdges,
                                numberOfNodes: numberOfNodes,
								metadata: window.metadata
                            }
                        };

                        top.postMessage(JSON.stringify(message), "*");
                        // end of message passing

                    } // end of success method: function(data)
                ); // end of JSON query
            }
        });


        return this;
    } // end of render function

}); // end of EmbedNetworkView = Backbone.View.extend
