$(document).ready(function() {
    $(".ui-slider").each(function() {
	    var sliderVal = Math.floor(Math.random()*5) + 1; 

	    $(this).slider({
        	min: 1,
        	max: 5,
       		value: sliderVal, 
        	orientation: "horizontal",
        	range: "min"
    	    });
    });

    $('#rightMenuControls a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $(".undo").tooltip({ title: "undo this step"});

    // TODO: Clear this mess up with Backbone.js
    $("#tagsinput").tagsInput({
        defaultText: "...",
        onAddTag: function(value) {
            $("#log").prepend("<li>Added a gene: " + value + " <span class='badge badge-info undo'>&times;</span></li>");
            $(".undo").tooltip({ title: "undo this step"});
            loadTheGraph();
        },
        onRemoveTag: function(value) {
            $("#log").prepend("<li>Removed a gene: " + value + " <span class='badge badge-info undo'>&times;</span></li>");
            $(".undo").tooltip({ title: "undo this step"});
            loadTheGraph();
        }
    });

    var loadTheGraph = function() {
        $("#network-loading").slideDown();
        $("#demo").hide();
        $('#demo').html("");

        var names = $("#tagsinput").val().toUpperCase();
        // TODO: change graph type dynamically! (nhood)
        $.getJSON("graph/nhood/" + names,
            function(data) {
	            var container = $('#demo');
	            $("#network-loading").hide();
	            container.show();

	            var cyOptions = {
//	                layout: {name: 'arbor',
//		                liveUpdate: true
//		                maxSimulationTime: 2000},
                    elements: data,
                    style: cytoscape.stylesheet()
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
                        })
                    ,

                    ready: function(){
                        window.cy = this; // for debugging
                        // TODO: Why the hell this does not work?
                        //cy.layout({ name: 'arbor'});

	                    // add pan zoom control panel
	                    container.cytoscapePanzoom();

	                    // add click listener on nodes
	                    cy.on('click', 'node', function(evt){
		                    var container = "#graph-details-content";
		                    var info = "#graph-details-info";
		                    var node = this;

		                    // remove previous content
		                    $(info).hide();
		                    $(container).empty();
		                    $(container).append(
			                    '<img src="images/loading.gif" alt="loading network...">');
		                    $(container).show();

		                    // update with new content (from BioGene)
		                    $.getJSON("biogene/human/" + node.id(), function(queryResult) {
			                    $(container).empty();

			                    if (queryResult.returnCode != "SUCCESS")
			                    {
				                    $(container).append(
					                    "Error retrieving data: " + queryResult.returnCode);
			                    }
			                    else
			                    {
				                    if (queryResult.count > 0)
				                    {
					                    // generate the view by using backbone
					                    var biogeneView = new BioGeneView(
						                    {el: container,
							                    data: queryResult.geneInfo[0]});
				                    }
				                    else
				                    {
					                    $(container).append(
						                    "No additional information available for the selected node.");
				                    }
			                    }
		                    });
	                    });

	                    // add click listener to core (for background clicks)
	                    cy.on('click', function(evt){
		                    // if click on background, hide details
		                    if( evt.cyTarget === cy ) {
		                        $("#graph-details-content").hide();
		                        $("#graph-details-info").show();
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
    };

    loadTheGraph();
});
