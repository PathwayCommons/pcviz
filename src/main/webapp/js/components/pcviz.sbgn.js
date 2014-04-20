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

var sbgnStyleSheet = cytoscape.stylesheet()
        .selector("node")
        .css({
            //"content": "data(sbgnlabel)",
            "border-width": 0.5,
            "shape": "circle",
            "border-color": "#0f0f0f",
            "background-color": "#ffffff",
            "font-size": 11,
        })
        .selector("node[sbgnclass!='complex'][sbgnclass!='compartment']")
        .css({
            "width": "data(sbgnbbox.w)",
            "height": "data(sbgnbbox.h)"
        })
        .selector("node[sbgnclass='macromolecule'],[sbgnclass='macromolecule multimer']")
        .css({
            "shape": "macromolecule",
            //"width": "50",
            //"height": "50"
        })
        .selector("node[sbgnclass='complex'],[sbgnclass='complex multimer']")
        .css({
            "shape": "complex",
            "background-opacity" : "1",
        })
        .selector("node[sbgnclass='nucleic acid feature'],[sbgnclass='nucleic acid feature multimer']")
        .css({
            "shape": "nucleic acid feature",
            //"content": "data(sbgnlabel)"
        })
        .selector("node[sbgnclass='simple chemical'],[sbgnclass='simple chemical multimer']")
        .css({
            "shape": "simple chemical",
            //"content": "data(sbgnlabel)",
            "text-valign" : "center",
            "text-halign" : "center"
        })
        .selector("node[sbgnclass='source and sink']")
        .css({
            "shape": "source and sink"
        })
        .selector("node[sbgnclass='compartment']")
        .css({
            "content": "data(sbgnlabel)",
            "shape": "roundrectangle",
            "text-valign" : "bottom",
            "text-halign" : "center"
        })
        .selector("node[sbgnclass='unspecified entity']")
        .css({
            "shape": "ellipse",
            "content": "data(sbgnlabel)",
            "text-valign" : "center",
            "text-halign" : "center"
        })
        .selector("node[sbgnclass='process']")
        .css({
            "shape": "square",
            "content": "",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='omitted process']")
        .css({
            "shape": "square",
            "content": "\\\\",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='uncertain process']")
        .css({
            "shape": "square",
            "content": "?",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='association']")
        .css({
            "shape": "circle",
            "background-color": "#000000"
        })
        .selector("node[sbgnclass='dissociation']")
        .css({
            "shape": "dissociation",
        })
        .selector("node[sbgnclass='phenotype']")
        .css({
            "shape": "phenotype",
        })
        .selector("node[sbgnclass='and operator']")
        .css({
            "shape": "circle",
            "content": "AND",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='or operator']")
        .css({
            "shape": "circle",
            "content": "OR",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("node[sbgnclass='not operator']")
        .css({
            "shape": "circle",
            "content": "NOT",
            "text-valign" : "center",
            "text-halign" : "center",
        })
        .selector("edge")
        .css({
            "line-color": "#0f0f0f",
            "target-arrow-fill": "hollow",
            "source-arrow-fill": "hollow",
            "target-arrow-color": "##919191",
            'background-opacity': 1,
            'width': 0.5
        })
        .selector("edge[sbgnclass='modulation']")
        .css({
            "target-arrow-shape": "diamond"
        })
        .selector("edge[sbgnclass='stimulation']")
        .css({
            "target-arrow-shape": "triangle",
        })
        .selector("edge[sbgnclass='catalysis']")
        .css({
            "target-arrow-shape": "circle"
        })
        .selector("edge[sbgnclass='inhibition']")
        .css({
            "target-arrow-color": "#919191",
            "target-arrow-fill": "filled",
            "target-arrow-shape": "tee"
        })
        .selector("edge[sbgnclass='logic arc'],[sbgnclass='equivalence arc']")
        .css({
            "target-arrow-shape": "none"
        })
        .selector("edge[sbgnclass='consumption']")
        .css({
            "source-arrow-shape": "consumption"
        })
        .selector("edge[sbgnclass='production']")
        .css({
            "target-arrow-color": "#919191",
            "target-arrow-fill": "filled",
            "target-arrow-shape": "production"
        })
        .selector("edge[sbgnclass='necessary stimulation']")
        .css({
            "target-arrow-shape": "necessary stimulation"
        })
        .selector(":selected")
        .css({
            "background-color": "#777777",
            "background-opacity" : "1",
            "color":"#000000",
            "line-color": "#000",
            "source-arrow-color": "#000",
            "target-arrow-color": "#000"
        })
        .selector(":active")
        .css({
            "background-color": "#aaaaaa",
            "background-opacity" : "1",
            "color":"#000000",
            "line-color": "#000",
            "source-arrow-color": "#000",
            "target-arrow-color": "#000"
        })
        .selector(":selected[sbgnclass='compartment']")
        .css({
            "background-opacity" : "0.7",
            "background-color": "#444444",
        })
        .selector(":active[sbgnclass='compartment']")
        .css({
            "background-opacity" : "0.5",
            "background-color": "#777777",
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
         }); // end of sbgnStyleSheet

var notHighlightNode = {'border-opacity': 0.3, 'text-opacity' : 0.3};
var notHighlightEdge = {'opacity':0.3, 'text-opacity' : 0.3, 'background-opacity': 0.3};

function highlightGraph(cy, nodes, edges){
    cy.nodes().css(notHighlightNode);
    cy.edges().css(notHighlightEdge);
    nodes.removeCss(notHighlightNode);
    edges.removeCss(notHighlightEdge);
}

function removeHighlights(nodes, edges){
    nodes.removeCss(notHighlightNode);
    edges.removeCss(notHighlightEdge);
}

function highlightNeighborsOfSelected(cy){
    var selectedEles = cy.elements(":selected");
    selectedEles = selectedEles.add(selectedEles.parents("node[sbgnclass='complex']"));
    selectedEles = selectedEles.add(selectedEles.descendants());
    var neighborhoodEles = selectedEles.neighborhood();
    var nodesToHighlight = selectedEles.add(neighborhoodEles);
    nodesToHighlight = nodesToHighlight.add(nodesToHighlight.descendants());
    highlightGraph(cy, nodesToHighlight.nodes(), nodesToHighlight.edges());
}

function expandNodes(nodesToShow){
    //add children
    nodesToShow = nodesToShow.add(nodesToShow.nodes().descendants());
    //add parents
    nodesToShow = nodesToShow.add(nodesToShow.parents());
    //add complex children
    nodesToShow = nodesToShow.add(nodesToShow.nodes("node[sbgnclass='complex']").descendants());

    var processes = nodesToShow.nodes("node[sbgnclass='process']");
    var nonProcesses = nodesToShow.nodes("node[sbgnclass!='process']");
    var neighborProcesses = nonProcesses.neighborhood("node[sbgnclass='process']");

    nodesToShow = nodesToShow.add(processes.neighborhood());
    nodesToShow = nodesToShow.add(neighborProcesses);
    nodesToShow = nodesToShow.add(neighborProcesses.neighborhood());

    //add parents
    nodesToShow = nodesToShow.add(nodesToShow.nodes().parents());
    //add children
    nodesToShow = nodesToShow.add(nodesToShow.nodes("node[sbgnclass='complex']").descendants());

    return nodesToShow;
}

function expandRemainingNodes(nodesToFilter, allNodes){
    nodesToFilter = expandNodes(nodesToFilter);
    var nodesToShow = allNodes.not(nodesToFilter);
    nodesToShow = expandNodes(nodesToShow);
    return nodesToShow;
}

function applyFilter(nodesToFilterOut){
    nodesToFilterOut = nodesToFilterOut.add(nodesToFilterOut.descendants());
    nodesToFilterOut.hide();
    nodesToFilterOut.data("manually-filtered", 'true');
}

function highlightProcessesOfSelected(cy){
    var selectedEles = cy.elements(":selected");
    selectedEles = expandNodes(selectedEles);
    highlightGraph(cy, selectedEles.nodes(), selectedEles.edges());
}

function filterSelectedNodes(cy){
    var allNodes = cy.nodes();
    var selectedNodes = cy.nodes(":selected");
    var nodesToShow = expandRemainingNodes(selectedNodes, allNodes);
    applyFilter(allNodes.not(nodesToShow));
}

function filterNonSelectedNodes(cy){
    var allNodes = cy.nodes();
    var selectedNodes = cy.nodes(":selected");
    var nodesToShow = expandNodes(selectedNodes);
    applyFilter(allNodes.not(nodesToShow));
}

function showAll(cy){
    cy.elements("node[manually-filtered='true']").show();
    cy.elements().removeData('manually-filtered');
}

var SBGNSettingsView = Backbone.View.extend({
    render: function() {
        $('#sbgnRightMenu a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        $("#neighbors-of-selected").live('click', function(e) {
            e.preventDefault();
            var cy = window.cy;
            highlightNeighborsOfSelected(cy);
        });

        $("#processes-of-selected").live('click', function(e) {
            e.preventDefault();
            var cy = window.cy;
            highlightProcessesOfSelected(cy);
        });

        $("#remove-highlights").live('click', function(e) {
            e.preventDefault();
            var cy = window.cy;
            removeHighlights(cy.nodes(), cy.edges());
        });

        $('#filter-selected').live('click', function(e){
            e.preventDefault();
            var cy = window.cy;
            filterSelectedNodes(cy);
            cy.elements(":selected").unselect();
        });

        $("#filter-unselected").live('click',function(e) {
            e.preventDefault();
            var cy = window.cy;
            filterNonSelectedNodes(cy);
            cy.elements(":selected").unselect();
        });

        $("#show-all").live('click', function(e) {
            e.preventDefault();
            var cy = window.cy;
            showAll(cy);
            cy.elements(":selected").unselect();
        });

        return this;
    }
});


var SBGNView = Backbone.View.extend({
    cyStyle: sbgnStyleSheet,
    sbgnNetworkLoading: "#sbgn-network-loading",
    sbgnTooSlowMessage: "#sbgn-too-slow-message",
    detailsContent: '#sbgn-graph-details-content',
    detailsInfo: '#sbgn-graph-details-info',

    render: function() {

        (new SBGNSettingsView()).render();

        var self = this;

        var source = this.model.source;
        var target = this.model.target;

        var container = $(self.el);
        var sbgnNetworkLoading = $(self.sbgnNetworkLoading);
        var genesStr = source + "," + target;

        sbgnNetworkLoading.slideDown();
        container.hide();

        window.setTimeout(function() 
        {
            $(self.sbgnTooSlowMessage).slideDown();
        }, 5000);

        $.getJSON("graph/detailed/pathsbetween/" + genesStr,
            function(data) {
                sbgnNetworkLoading.hide();
                container.html("");
                container.show();
                $(self.sbgnTooSlowMessage).hide();

                var positionMap = new Object();

                //add position information to data
                for (var i = 0 ; i < data.nodes.length ; i++){
                    var xPos = data.nodes[i].data.sbgnbbox.x;
                    var yPos = data.nodes[i].data.sbgnbbox.y;
                    positionMap[data.nodes[i].data.id] = {'x':xPos, 'y':yPos};
                }                  

                var cyOptions = {
                    elements: data,
                    style: self.cyStyle,
                    layout: { 
                        name: 'preset',
                        positions: positionMap
                    },
                    showOverlay: false,
                    minZoom: 0.125,
                    maxZoom: 16,

                    ready: function()
                    {
                        window.cy = this;
                        //cy.boxSelectionEnabled(false);   
                        container.cytoscapePanzoom();

                        cy.on('tap', function(evt){
                            if(!evt.cyTarget.data() || evt.cyTarget.edges()){
                                self.putDetailsHelp();
                            }
                        });

                        cy.on('tap', 'node', function(evt){
                            var node = this;
                            self.updateSBGNDetails(evt, node);
                        });

                    }

                };
                container.cy(cyOptions);
            } // end of function(data)
        ); // end of $.getJSON

        return this;
    }, // end of render: function()

    putDetailsHelp: function(){
        var container = $(this.detailsContent);
        var info = $(this.detailsInfo);

        container.hide();
        info.show();
    },

    updateSBGNDetails: function(evt, node)
    {
        var processTypes = ["process", "omitted process", "uncertain process", "association", "dissociation", "phenotype"];
        var biogeneTypes = ["unspecified entity", "macromolecule", "nucleic acid feature", "simple chemical", "perturbing agent"];

        var type = node.data("sbgnclass");
        var name = node.data("sbgnlabel");

        if(type == "complex"){
            this.updateComplexDetails(evt, node);
        }
        else if(biogeneTypes.indexOf(type) != -1){
            this.updateNodeDetails(evt, node);
        }
        else if(processTypes.indexOf(type) != -1){
            this.updateEntityDetails("Process", type);
        }
        else if(type == "compartment"){
            this.updateEntityDetails(name, type);
        }
        else if(type == "source and sink"){
            this.updateEntityDetails("--", type);
        }
        else{
            this.updateEntityDetails(name, type);
        }    
    },

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
        $.getJSON("biogene/human/" + node.data("sbgnlabel"), function(queryResult) 
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

    updateEntityDetails : function(name, type)
    {
        var self = this;
        var container = $(self.detailsContent);
        var info = $(self.detailsInfo);

        info.hide();
        container.empty();
        container.append(_.template($("#sbgn-entity-details").html(), {'name' : name, 'type' : type}));
        container.show();
    },

    updateComplexDetails: function(evt, node) 
    {
        var self = this;
        var container = $(self.detailsContent);
        var info = $(self.detailsInfo);

        // remove previous content
        info.hide();
        container.empty();

        function handleEachBiogeneInfo(node){
            var divId = '#' + node.data("sbgnlabel");
            var subContainer = $(divId);

            self.nodeBiogeneInfo(node, subContainer, divId);
            
        }

        var childNodes = node.descendants("node[sbgnclass!='complex']");

        container.append("<h4>Complex's Components</h4><hr>");

        for(var i = 0 ; i < childNodes.length ; i++){
            container.append("<button type='button' class='btn btn-primary label controls-state-change-of' data-toggle='collapse' data-target='#" + 
                childNodes[i].data("sbgnlabel") + "'>" + 
                childNodes[i].data("sbgnlabel") + 
                "</button><div id='" + childNodes[i].data("sbgnlabel") + "' class='collapse out'>" + _.template($("#loading-biogene-template").html(), {}) + "</div><hr class='listView'>"); 

            handleEachBiogeneInfo(childNodes[i]);
        }
        container.show();
    },

    nodeBiogeneInfo : function(node, container, content){
        $(content).on("shown",function(e){
            e.preventDefault();
                
            // request json data from BioGene service
            $.getJSON("biogene/human/" + node.data("sbgnlabel"), function(queryResult) 
            {
                container.empty();

                if (queryResult.returnCode != "SUCCESS")
                {
                    container.append(
                        _.template($("#biogene-retrieve-error-template").html(), 
                        {
                            returnCode: queryResult.returnCode
                        }));
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
                        el: content,
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

        });
    }

}); // end of SbgnView = Backbone.View.extend({








