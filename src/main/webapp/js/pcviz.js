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
        $('#demo').html("");
        var names = $("#tagsinput").val().toUpperCase().split(",");
        var nodeCount = names.length;

        var demoNodes = [];
        var demoEdges = [];

        for (var i = 0; i < nodeCount; i++) {
            demoNodes.push({
                data: {
                    id: names[i],
                    weight: Math.round( Math.random() * 100 )
                }
            });
        }

        for (var i = 0; i < nodeCount; i++) {
            demoEdges.push({
                data: {
                    id: "e" + (i * 2),
                    source: ((i + 1) >= nodeCount ? names[i + 1 - nodeCount] : names[i + 1]),
                    target: names[i],
                    weight: 30
                }
            });

            if (i % 3 == 0) {
                demoEdges.push({
                    data: {
                        id: "e" + (i * 2 + 1),
                        target: names[i],
                        source: ((i + 3) >= nodeCount ? names[i + 3 - nodeCount] : names[i + 3]),
                        weight: 21
                    }
                });
            }
        }

        $('#demo').cytoscape({
            elements: { // TODO specify some elements like http://cytoscapeweb.cytoscape.org/demos/simple
                nodes: demoNodes,
                edges: demoEdges
            },

            // TODO specify a nice style like http://cytoscapeweb.cytoscape.org/demos/simple
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

                var nodeCount = cy.nodes().length;
                for (var i = 0; i < nodeCount; i++) {

                    var center = [cy.container().clientWidth / 2, cy.container().clientHeight / 2];

                    var angle = i / nodeCount * Math.PI * 2;
//      	console.log(angle);
                    var radius =
                        Math.min(cy.container().clientWidth, cy.container().clientHeight) / 2 * 0.6;
//      	console.log(radius);

                    var nodePos = [Math.cos(angle) * radius + center[0], Math.sin(angle) * radius + center[1]]
//  		console.log(nodePos);
                    cy.nodes()[i].position({x: nodePos[0], y : nodePos[1]});
                }
            }

        });
    };

    loadTheGraph();
});
