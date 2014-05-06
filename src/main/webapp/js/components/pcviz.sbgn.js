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
            "border-width": 1,
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
            'width': 1.5
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

var SBGNSettingsView = Backbone.View.extend({
	el: '#sbgn-settings',
	template:  _.template($('#sbgn-settings-template'). html()),
	notHighlightNode: {'border-opacity': 0.3, 'text-opacity' : 0.3},
	notHighlightEdge: {'opacity':0.3, 'text-opacity' : 0.3, 'background-opacity': 0.3},
    processSourceMap: null,
    processSourceContent: "#source-table",
    processTypes: ["process", "omitted process", "uncertain process", "association", "dissociation", "phenotype"],
    filterTypes: null,
    render: function(){
    	var self = this;
    	$(self.el).append(self.template);
        $(self.processSourceContent).append(_.template($("#loading-source-template").html()));

        $(".process-source").die("click").live("click", function(evt){
            var sourceName = ($(this).data("itx-type"));
            if(!$(this).hasClass("itx-removed")) {
                $(this).find("span")
                    .removeClass("fui-cross-16")
                    .addClass("fui-plus-16");

                self.hideProcessSource(sourceName);
            }
            else{
                $(this).find("span")
                    .removeClass("fui-plus-16")
                    .addClass("fui-cross-16");

                self.showProcessSource(sourceName);
            }
            $(this).toggleClass("itx-removed");
        });

        return this;
    },

    events: {
    	'click #neighbors-of-selected': 'highlightNeighborsofSelected',
    	'click #processes-of-selected': 'highlightProcessesOfSelected',
    	'click #remove-highlights': 'removeHighlights',
    	'click #filter-selected': 'hideSelected',
    	'click #filter-unselected': 'showSelected',
    	'click #show-all': 'showAll',
    	'click #apply-layout': 'applyLayout',
    	'click #sbgnRightMenu a': 'showTab',
	},

    safeProperty: function(str){
        var safeProperty = str.toUpperCase();

        safeProperty = safeProperty.replace(/ /gi,'-');
        safeProperty = safeProperty.replace(/\//gi,'-');
        safeProperty = safeProperty.replace(/\\/gi,'-');
        safeProperty = safeProperty.replace(/#/gi,'-');
        safeProperty = safeProperty.replace(/\./gi,'-');
        safeProperty = safeProperty.replace(/:/gi,'-');
        safeProperty = safeProperty.replace(/;/gi,'-');
        safeProperty = safeProperty.replace(/"/gi,'-');
        safeProperty = safeProperty.replace(/'/gi,'-');

        return safeProperty;
    },

    hideProcessSource: function(sourceName){
        var self = this;
        var allNodes = cy.elements();

        var nodesToHide = cy.filter(function(i, ele){
            if(ele.isNode() && self.processTypes.indexOf(ele.data("sbgnclass")) != -1){
                var sources = ele.data("datasource");
                for(var i = 0 ; i < sources.length ; i++){
                    if(self.safeProperty(sources[i]) == sourceName)
                        return true;
                }
            }
            return false;
        });

        nodesToHide = self.expandRemainingNodes(nodesToHide, allNodes);
        
        self.applyFilter(allNodes.not(nodesToHide), sourceName);

    },

    showProcessSource: function(filterType){
        this.removeFilter(filterType);        
    },

    initProcessSources: function(nodes){
        var sourceMap = new Object();

        for (var i = 0 ; i < nodes.length ; i++){
            if(nodes[i].data.sbgnclass == "process"){
                for(var j = 0 ; j < nodes[i].data.datasource.length ; j++)
                    sourceMap[this.safeProperty(nodes[i].data.datasource[j])] = true;
            }
        }

        this.processSourceMap = sourceMap;
        this.updateSourceTable();
        this.initFilterTypes();
    },

    initFilterTypes: function(){
        this.filterTypes = new Array();
        this.filterTypes.push("manually-filtered");

        for(var source in this.processSourceMap)
            this.filterTypes.push(source);
    },

    updateSourceTable: function(){
        var self = this;
        var container = $(self.processSourceContent);
        container.empty();
        container.append("<table class='table table-condensed'>");

        for(var source in self.processSourceMap){
            container.append(_.template($("#sbgn-source-template").html(), {'source':source, 'type':self.safeProperty(source)}));
        }
        container.append("</table>");

    },

	applyLayout: function(){
		var options = {
    		name: 'cose',
			refresh: 0,
		    fit : true, 
		    padding : 10, 
		    randomize : true,
			nodeRepulsion : 100,
		    nodeOverlap : 10,
		    idealEdgeLength : 10,
		    edgeElasticity : 10,
		    nestingFactor : 5, 
		    gravity : -50, 
		    numIter : 100,
		    initialTemp : 200,
		    coolingFactor : 0.95, 
		    minTemp : 1
		};

		cy.layout( options );
	},

	showTab: function(){
		$(this).tab('show');
	},

	hideSelected: function(){
		var allNodes = cy.nodes();
    	var selectedNodes = cy.nodes(":selected");
    	var nodesToShow = this.expandRemainingNodes(selectedNodes, allNodes);
    	this.applyFilter(allNodes.not(nodesToShow), "manually-filtered");

        cy.elements(":selected").unselect();
	},

	showSelected: function(){    	
    	var allNodes = cy.nodes();
    	var selectedNodes = cy.nodes(":selected");
    	var nodesToShow = this.expandNodes(selectedNodes);
    	this.applyFilter(allNodes.not(nodesToShow), "manually-filtered");

    	cy.elements(":selected").unselect();
	},

	showAll: function(){
        this.removeFilter("manually-filtered");		
	},

	highlightNeighborsofSelected: function(){
	    var selectedEles = cy.elements(":selected");
	    selectedEles = selectedEles.add(selectedEles.parents("node[sbgnclass='complex']"));
	    selectedEles = selectedEles.add(selectedEles.descendants());
	    var neighborhoodEles = selectedEles.neighborhood();
	    var nodesToHighlight = selectedEles.add(neighborhoodEles);
	    nodesToHighlight = nodesToHighlight.add(nodesToHighlight.descendants());
	    this.highlightGraph(nodesToHighlight.nodes(), nodesToHighlight.edges());
	},

	highlightProcessesOfSelected: function(){
    	var selectedEles = cy.elements(":selected");
    	selectedEles = this.expandNodes(selectedEles);
   		this.highlightGraph(selectedEles.nodes(), selectedEles.edges());
	},

	removeHighlights: function(){
       	cy.nodes().removeCss(this.notHighlightNode);
   		cy.edges().removeCss(this.notHighlightEdge);
	},

	highlightGraph: function(nodes, edges){
	    cy.nodes().css(this.notHighlightNode);
	    cy.edges().css(this.notHighlightEdge);
	    nodes.removeCss(this.notHighlightNode);
	    edges.removeCss(this.notHighlightEdge);
	},

	expandNodes: function(nodesToShow){
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
	},

	expandRemainingNodes: function(nodesToFilter, allNodes){
	    nodesToFilter = this.expandNodes(nodesToFilter);
	    var nodesToShow = allNodes.not(nodesToFilter);
	    nodesToShow = this.expandNodes(nodesToShow);
	    return nodesToShow;
	},

	applyFilter: function(nodesToFilterOut, filterType){
	    //nodesToFilterOut = nodesToFilterOut.add(nodesToFilterOut.descendants());
	    nodesToFilterOut.hide();
	    nodesToFilterOut.data(filterType, true);
	},

    removeFilter: function(filterType){
        var self = this;
        cy.elements().removeData(filterType);

        var nodesToRemoveFilter = cy.filter(function(i, ele){
            for(var i = 0 ; i < self.filterTypes.length ; i++){
                if(self.filterTypes[i] != filterType){
                    if(ele.data(self.filterTypes[i]) == true)
                        return false;
                }
            }
            return true;
        });

        nodesToRemoveFilter.show();
        nodesToRemoveFilter.removeData(filterType);
    },

});

var SBGNDetailsView = Backbone.View.extend({
    el: '#sbgn-details',
    template:  _.template($('#sbgn-details-template'). html()),
    detailsContent: '#sbgn-graph-details-content',
    detailsInfo: '#sbgn-graph-details-info',

    render: function(){
        var self = this;
        $(self.el).append(self.template);
        return this;
    },

    putDetailsHelp: function(){
        var container = $(this.detailsContent);
        var info = $(this.detailsInfo);

        container.hide();
        info.show();
    },

    updateSBGNDetails: function()
    {
        var processTypes = ["process", "omitted process", "uncertain process", "association", "dissociation", "phenotype"];
        var biogeneTypes = ["unspecified entity", "macromolecule", "nucleic acid feature", "simple chemical", "perturbing agent"];
        var node = this.model;
        var type = node.data("sbgnclass");
        var name = node.data("sbgnlabel");

        if(type == "complex"){
            this.updateComplexDetails(node);
        }
        else if(biogeneTypes.indexOf(type) != -1){
            this.updateNodeDetails(node);
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

    updateNodeDetails: function(node) 
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

    updateComplexDetails: function(node) 
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

        container.append("<h4>" + node.data("sbgnlabel") +"</h4><hr>");

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

});

var SBGNView = Backbone.View.extend({
    cyStyle: sbgnStyleSheet,
    sbgnNetworkLoading: "#sbgn-network-loading",
    sbgnTooSlowMessage: "#sbgn-too-slow-message",

    render: function() {
        var settingsView = new SBGNSettingsView();
        settingsView.render();
        (new SBGNDetailsView()).render();
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

                settingsView.initProcessSources(data.nodes);

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
                                //self.putDetailsHelp();
                                (new SBGNDetailsView({
                                    })).putDetailsHelp();
                            }
                        });

                        cy.on('tap', 'node', function(evt){
                            var node = this;
                            //self.updateSBGNDetails(evt, node);
                            (new SBGNDetailsView({
                                model: node,
                            })).updateSBGNDetails();
                        });

                    }

                };
                container.cy(cyOptions);
            } // end of function(data)
        ); // end of $.getJSON

        return this;
    } // end of render: function()

}); // end of SbgnView = Backbone.View.extend({








