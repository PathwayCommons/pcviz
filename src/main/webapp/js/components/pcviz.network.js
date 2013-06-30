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
        });


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

    render: function() {
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

                window.setTimeout(function() {
                    $(self.tooSlowMessage).slideDown();
                }, 5000);

                // TODO: change graph type dynamically! (nhood)
                $.getJSON("graph/" + networkType + "/" + names,
                    function(data) {
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
                            layout: {
                                name: 'arbor',
                                liveUpdate: true,
                                edgeLength: function(e) { return 10/(e.cited+1); },
                                nodeMass: function(e) { return e.isseed ? 10 : 0.1; },
                                repulsion: 1000,
                                stiffness: 100,
                                gravity: true,
                                maxSimulationTime: 2000,
                                stop: function() { console.log("finished."); }
                                /*                                height: windowSize.height,
                               width: windowSize.width*/
                            },
                            minZoom: 0.25,
                            maxZoom: 16,

                            ready: function() {
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

                                // This is to get rid of overlapping nodes and panControl
                                cy.zoom(0.90).center();

                                // Run the ranker on this graph
                                cy.rankNodes();

                                var numberOfNodes = cy.nodes().length;
                                (new NumberOfNodesView({ model: { numberOfNodes: numberOfNodes }})).render();

                                var edgeTypes = [
                                    "consecutive-catalysis",
                                    "controls-degradation",
                                    "controls-state-change",
                                    "controls-expression",
                                    "in-same-complex",
                                    "interacts-with"
                                ];

                                _.each(edgeTypes, function(type) {
                                    var numOfEdges = cy.$("edge[type='" + type + "']").length;
                                    if(numOfEdges > 0) {
                                        $("#" + type + "-count").text(numOfEdges);
                                    } else {
                                        $("#row-" + type).hide();
                                    }
                                });

                                (new NodesSliderView({
                                    model: {
                                        min: cy.nodes("[?isseed]").length,
                                        max: numberOfNodes
                                    }
                                })).render();
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
		container.append(_.template($("#loading-biogene-template").html(), {}));
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


var EmbedNetworkView = Backbone.View.extend({
    // div id for the initial display before the actual network loaded
    networkLoading: "#network-embed-loading",
    // cytoscape web visual style object
    cyStyle: pcVizStyleSheet,

    render: function() {
        var self = this;

        var container = $(self.el);
        var networkLoading = $(self.networkLoading);

        networkLoading.slideDown();
        container.hide();

        // get gene names from the model
        var names = this.model.genes;
        var networkType = this.model.networkType;

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
                    minZoom: 0.25,
                    maxZoom: 16,

                    ready: function() {
                        window.cy = this; // for debugging

                        // We don't need this, so better disable
                        cy.boxSelectionEnabled(false);

                        // add pan zoom control panel
                        container.cytoscapePanzoom();

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
            });

        return this;
    }

});