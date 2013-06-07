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
            "width": "mapData(cited, 10, 100, 0.4, 0.5)",
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
        .selector("edge[type='transinhibit']")
        .css({
            "line-color": "#E74C3C" // alizarin
        })
        .selector("edge[type='state-change']")
        .css({
            "line-color": "#2980B9" // belize hole
        })
        .selector("edge[type='in-same-complex']")
        .css({
            "line-color": "#34495E" // wet asphalt
        })
        .selector("edge[type='transactivate']")
        .css({
            "line-color": "#16A085" // green see
        })
        .selector("edge[type='degrades']")
        .css({
            "line-color": "#D35400" // pumpkin
        })
        .selector("edge[type='blocks-degradation']")
        .css({
            "line-color": "#9B59B6" // amethyst
        })
        .selector("edge[type='consecutive-catalysis']")
        .css({
            "line-color": "#2ECC71" // emerald
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

        if(names.length < 1) {
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
        }

        // This will run the validation on the side track
        var geneValidations = new GeneValidations({ genes: names });
        geneValidations.fetch({
            success: function() {
                var geneValidationsView = new GeneValidationsView({ model: geneValidations });
                geneValidationsView.render();

                if(!geneValidationsView.isAllValid()) {
                    (new NotyView({
                        template: "#noty-invalid-symbols-template",
                        error: true,
                        model: {}
                    })).render();
                }

                var networkType = $("#query-type").val();

                if(networkType == "pathsbetween" && names.split(",").length < 2) {
                    (new NotyView({
                        template: "#noty-invalid-pathsbetween-template",
                        error: true,
                        model: {}
                    })).render();
                }

                // TODO: change graph type dynamically! (nhood)
                $.getJSON("graph/" + networkType + "/" + names,
                    function(data) {
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
                            layout: {
                                name: 'pcviz',
                                height: windowSize.height,
                                width: windowSize.width
                            },
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

                                // This is to get rid of overlapping nodes and panControl
                                cy.zoom(0.90).center();

                                // Run the ranker on this graph
                                cy.rankNodes();
                            }
                        };

                        container.cy(cyOptions);

                        (new NotyView({
                            template: "#noty-network-loaded-template",
                            model: {
                                nodes: data.nodes.length,
                                edges: data.edges.length,
                                type: networkType.capitalize(),
                                timeout: 4000
                            }
                        })).render();

                    });
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
});