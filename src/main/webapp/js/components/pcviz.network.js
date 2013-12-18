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

var pcVizStyleSheet = cytoscape.stylesheet()
        .selector("node")
        .css({
            "content": "data(id)",
            "shape": "data(shape)",
            "border-width": 3,
            "background-color": "mapData(altered, 0, 1, #DDDDDD, red)",
            "border-color": "#555",
            "font-size": "15"
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
            "width": "mapData(cited, 5, 50, 0.4, 0.5)",
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
        .selector("edge[type='consecutive-catalysis']")
        .css({
            "line-color": "#9B59B6"
        })
        .selector("edge[type='controls-degradation']")
        .css({
            "line-color": "#D35400"
        })
        .selector("edge[type='controls-expression']")
        .css({
            "line-color": "#2ECC71" // emerald
        })
        .selector("edge[type='interacts-with']")
        .css({
            "line-color": "#000000"
        })
        .selector("edge[type='in-same-complex']")
        .css({
            "line-color": "#34495E"
        })
        .selector("edge[type='controls-state-change']")
        .css({
            "line-color": "#2980B9"
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
var edgeLengthArray = new Array(); // a map from edgeID to number
var defaultEdgeLength = 10; // we will hop 0.15 of this amount each time, the larger the biger the radiuses
var pcVizLayoutOptions = {
    name: 'pcvizarbor',
    liveUpdate: true,
    nodeMass: function(e) { return e.isseed ? 2.5 : 0.2; },
    edgeLength: function(e) { 
	return edgeLengthArray[e.id];
    },
    repulsion: 1800,
    stiffness: 75,
    gravity: true,
    maxIterations: 75,
    displayStepSize: 5,
    stableEnergy: function(energy) {
        return (energy.max <= 2) || (energy.mean <= 0.5);
    },
    precision: 0
}; // end of pcVizLayoutOptions

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

				if(networkType == "pathsbetween" && names.split(",").length < 2) 
				{
				    (new NotyView({
				        template: "#noty-invalid-pathsbetween-template",
				        error: true,
				        model: {}
				    })).render();
				}

				window.setTimeout(function() 
				{
				    $(self.tooSlowMessage).slideDown();
				}, 5000);

				// TODO: change graph type dynamically! (nhood)
				$.getJSON("graph/" + networkType + "/" + geneValidations.getPrimaryNames(),
				    function(data) 
				    {
				        networkLoading.hide();
				        container.html("");
				        container.show();
				        $(self.detailsInfo).show();
				        controlsContainer.show();
				        $(self.tooSlowMessage).hide();

				        var windowSize = self.options.windowSize;
				        if(windowSize == undefined)
				            windowSize = {};

				        var cyOptions = {
				            elements: data,
				            style: self.cyStyle,
				            showOverlay: false,
				            layout: pcVizLayoutOptions,
				            minZoom: 0.125,
				            maxZoom: 16,

				            ready: function()
				            {
				                window.cy = this; // for debugging

				                // We don't need this, so better disable
				                cy.boxSelectionEnabled(false);

				                // add pan zoom control panel
				                container.cytoscapePanzoom();

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
						// update the edgeLengthArray according to citation distribution
						calcEdgeDistribution(data, numberOfNodes);
				                // make the canvas is size propotoinal to the square root of the number of nodes
				                // see extensions.cytoscape.layout.pcvix.arbor.js
				                // so the zoom level should change accordingly
				                var w = cy.container().clientWidth;
				                var width = Math.max(w , Math.ceil(Math.sqrt(numberOfNodes) * w/Math.sqrt(30)));
				                // 0.9 is multiplied to get rid of the overlap as before
				                var zoomLevel = 0.9 * (w / width);
				                cy.zoom(zoomLevel);

				                // Run the ranker on this graph
				                cy.rankNodes();

				                (new NumberOfNodesView({ model: { numberOfNodes: numberOfNodes }})).render();

				                var edgeTypes = [
				                    "consecutive-catalysis",
				                    "controls-degradation",
				                    "controls-state-change",
				                    "controls-expression",
				                    "in-same-complex",
				                    "interacts-with"
				                ];

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

						  container.cy(cyOptions);

				        (new NotyView({
			        		template: "#noty-network-loaded-template",
			        		model: 
						{
						        nodes: data.nodes.length,
						        edges: data.edges.length,
						        type: networkType.capitalize(),
						        timeout: 4000
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

        var geneValidations = new GeneValidations({ genes: names });
        geneValidations.fetch({
            success: function() {
                $.getJSON("graph/" + networkType + "/" + geneValidations.getPrimaryNames(),
                    function(data)
                    {
                        networkLoading.hide();
                        container.html("");
                        container.show();

                        var windowSize = self.options.windowSize;
                        if(windowSize == undefined)
                            windowSize = {};

                        var cyOptions = {
                            elements: data,
                            style: self.cyStyle,
                            showOverlay: false,
                            layout: pcVizLayoutOptions,
                            minZoom: 0.25,
                            maxZoom: 16,

                            ready: function()
                            {
                                window.cy = this; // for debugging

                                // We don't need this, so better disable
                                cy.boxSelectionEnabled(false);

                                // add pan zoom control panel
                                container.cytoscapePanzoom();

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
                                    createAndPostClickMessage("node", this.data());
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
                        var numberOfEdges = data.edges.length;

                        var message = {
                            type: "pcvizloaded",
                            content: {
                                numberOfEdges: numberOfEdges,
                                numberOfNodes: numberOfNodes
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

/**
 * distribution of citation of edges is calculated here
 * 
 * edges connected to seed nodes:
 * for each seed node
 * get the distribution of all edges connected to that seed node
 * place the 8 largest cited edges on the first radius (smallest edge length)
 * then the next 2^4 will go on the second radius, 
 * next 2^5 on the third... so on
 * 
 * for edges not connected to seed nodes
 * their length should be proportional to the radius size of the seed-edges
 * (edges connected to seed nodes)
 */
function calcEdgeDistribution(data, numberOfNodes) // TODO: Refactor this as a cytoscape.js core plugin
{
	// method for sorting numeric array
	var c = function compareNumbers(a, b)
	{
	    return (b - a);
	}
	var edges = data.edges; // all edges
	var nodes = data.nodes; // all nodes
	var hopAverage = new Array(); // average citation of each hop radius
	var hopCount = new Array(); // number of nodes on each hop radius
	var nonSeedEdges = new Array(); // a map of edge ID to boolean
	var citedDis; // distribution of citation for each seed node's edges
	// first set all edges to nonseed
	for (var j = 0 ; j < edges.length; j++)
	{
		nonSeedEdges[edges[j].data.id] = true;
	}
	// for each seed node
	for (var i = 0 ; i < nodes.length; i++)
	{
		if(nodes[i].data.isseed)
		{
			// calculate the citation distribution 
			citedDis = new Array();
			var nID = nodes[i].data.id;
			for (var j = 0 ; j < edges.length; j++)
			{
				if (edges[j].data.target == nID || 
				    edges[j].data.source == nID)
				{
					citedDis.push(parseInt(edges[j].data.cited, 10));
				}
			}
			// sort it 
			citedDis.sort(c);
			// now based on this distribution calculate the hops
			// hop: radius from the seed node
			for (var j = 0 ; j < edges.length; j++)
			{
				var e = edges[j].data;
				if (edges[j].data.target == nID || edges[j].data.source == nID)
				{
					var k = 8; // from the 8-th element
					var hop = 1;
					while(k < citedDis.length &&
					      e.cited < citedDis[k-1])
					{
						hop++;
						k = k + Math.pow(2, hop + 2); // skip 2^(previous number of nodes)
					}
					// length will be hop radius away from the seed
					var length = hop * 0.15 * defaultEdgeLength;
					edgeLengthArray[e.id] = length;
					// mark this edge as processed
					nonSeedEdges[e.id] = false;
					
					// here hop statistics are updated to later calculate non-seed edge length
					// accordingly, hopAverage holds sums, not average till here, I will update it later
					// if this hop level is new, define it
					if(typeof hopAverage[hop -1] === 'undefined')
					{
						hopAverage[hop - 1] = e.cited;
						hopCount[hop - 1] = 1;
					}
					// otherwise just add it up
					else
					{
						hopAverage[hop - 1] += e.cited; 
						hopCount[hop - 1] += 1; 
					}
					
				}
			}
		}
	}
	// hereon edge length of non-seed edges will be calculated
	// edges not connected to seed nodes
	// first normalize hopAverages
	for (var i = 0; i < hopCount.length; i++)
	{
		hopAverage[i] /= hopCount[i];
	}
	
	var maxHop = hopAverage.length;
	// so the edge length should be proportional to radiuses of seed nodes
	for (var i = 0; i < edges.length; i++)
	{
		if (nonSeedEdges[edges[i].data.id])
		{
			var e = edges[i].data;
			var hop = 0;
			// hop till average hop is reached
			while ( hop < maxHop && 
				e.cited < hopAverage[hop])
			{
				hop++;
			}
			// assign length of this edge
			var length = hop * 0.15 * defaultEdgeLength;
			edgeLengthArray[e.id] = length;
		}
	}
	// finished calculating edge lengths
}
