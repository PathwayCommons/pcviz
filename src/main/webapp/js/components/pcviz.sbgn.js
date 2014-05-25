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
            "border-width": 1,
            "border-color": "#0f0f0f",
            "background-color": "#ffffff",
            "font-size": 11,
            "shape": "data(sbgnclass)",
            'background-opacity': 1
        })
        .selector("node[sbgnclass!='complex'][sbgnclass!='compartment']")
        .css({
            "width": "data(sbgnbbox.w)",
            "height": "data(sbgnbbox.h)"
        })
        .selector("node[sbgnclass='compartment']")
        .css({
            "content": "data(sbgnlabel)",
            "text-valign" : "bottom",
            "text-halign" : "center"
        })
        .selector("edge")
        .css({
            "line-color": "#0f0f0f",
            "target-arrow-fill": "hollow",
            "source-arrow-fill": "hollow",
            "target-arrow-color": "#919191",
            'background-opacity': 1,
            'width': 1.5,
            "target-arrow-shape": "data(sbgnclass)"
        })
        .selector("edge[sbgnclass='inhibition']")
        .css({
            "target-arrow-fill": "filled"
        })
        .selector("edge[sbgnclass='consumption']")
        .css({
            "target-arrow-shape": "none",
            "source-arrow-shape": "data(sbgnclass)",
            "line-style" : "consumption"
        })
        .selector("edge[sbgnclass='production']")
        .css({
            "target-arrow-fill": "filled",
            "line-style" : "production"
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
        .selector("edge:selected")
        .css({
            "line-color": "magenta",
            "source-arrow-color": "magenta",
            "target-arrow-color": "magenta"
        })
        .selector("node:selected")
        .css({
            'border-color': 'magenta',
            'target-arrow-color': '#000',
            'text-outline-color': '#000'
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
            "background-color": "#444444"
        })
        .selector(":active[sbgnclass='compartment']")
        .css({
            "background-opacity" : "0.5",
            "background-color": "#777777"
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
         ; // end of sbgnStyleSheet

var SBGNLayoutView = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cose',
        nodeRepulsion: 10000,
        nodeOverlap: 10,
        idealEdgeLength: 10,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 250,
        numIter: 100
    },
    currentLayoutProperties: null,
    el: '#sbgn-layout-table',

    initialize: function() {
        var self = this;
        self.copyProperties();
        self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
    },

    copyProperties: function(){
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },

    render: function(){
        var self = this;
        self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();        

        $("#save-layout").die("click").live("click", function(evt){
            self.currentLayoutProperties.nodeRepulsion = document.getElementById("node-repulsion").value;
            self.currentLayoutProperties.nodeOverlap = document.getElementById("node-overlap").value;
            self.currentLayoutProperties.idealEdgeLength = document.getElementById("ideal-edge-length").value;
            self.currentLayoutProperties.edgeElasticity = document.getElementById("edge-elasticity").value;
            self.currentLayoutProperties.nestingFactor = document.getElementById("nesting-factor").value;
            self.currentLayoutProperties.gravity = document.getElementById("gravity").value;
            self.currentLayoutProperties.numIter = document.getElementById("num-iter").value;

            $(self.el).dialog('close');
        });

        $("#default-layout").die("click").live("click", function(evt){
            self.copyProperties();
            self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});

var SBGNSettingsView = Backbone.View.extend({
    el: '#sbgn-settings',
    template:  _.template($('#sbgn-settings-template'). html()),
    notHighlightNode: {'border-opacity': 0.3, 'text-opacity' : 0.3},
    notHighlightEdge: {'opacity':0.3, 'text-opacity' : 0.3, 'background-opacity': 0.3},
    processSourceMap: null,
    processSourceContent: "#source-table",
    processTypes: ["process", "omitted process", "uncertain process", "association", "dissociation", "phenotype"],
    filterTypes: null,
    layoutSettingsView: null,

    render: function(){
        var self = this;
        $(self.el).append(self.template);
        $(self.processSourceContent).append(_.template($("#loading-source-template").html()));
        self.layoutSettingsView = (new SBGNLayoutView());

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
        'click #layout-settings': 'changeLayoutSettings',
        'click #sbgnRightMenu a': 'showTab'
    },

    changeLayoutSettings: function(){
        this.layoutSettingsView.render();
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
        var sourceMap = {};

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
        this.filterTypes = [];
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
            container.append(
                _.template($("#sbgn-source-template").html(),
                    {
                        'source': source,
                        'type': self.safeProperty(source)
                    })
            );
        }
        container.append("</table>");
    },

    applyLayout: function(){
        var options = this.layoutSettingsView.currentLayoutProperties;
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
    }

});

var SBGNEpnDetailsView = Backbone.View.extend({
    render: function(){
        this.$el.empty();
        this.updateNodeDetails(this.model);
    },

    updateNodeDetails: function(node) 
    {
        var self = this;
        var container = $(self.el);
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
                    geneInfo["altered"] = parseInt(node.data("altered") * 100);
                    geneInfo["isseed"] = node.data("isseed")
                    geneInfo["hideContext"] = true;
                    geneInfo["modifications"] = node.data("sbgnmodifications");

                    var biogeneView = new BioGeneView({
                        el: container,
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
    }
});

var SBGNComplexDetailsView = Backbone.View.extend({
    render: function(){
        this.$el.empty();
        this.updateComplexDetails(this.model);
    },

    updateComplexDetails: function(node) 
    {
        var self = this;
        var container = $(self.el);

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
                        geneInfo["altered"] = parseInt(node.data("altered") * 100);
                        geneInfo["isseed"] = node.data("isseed");

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

var SBGNProcessDetailsView = Backbone.View.extend({
    template:  _.template($('#sbgn-process-details-template'). html()),
    expanderOpts: {
        slicePoint: 50,
        expandPrefix: ' ',
        expandText: ' (...)',
        userCollapseText: ' (show less)',
        moreClass: 'expander-read-more',
        lessClass: 'expander-read-less',
        detailClass: 'expander-details',
        expandEffect: 'fadeIn',
        collapseEffect: 'fadeOut'
    },

    render: function(){
        var model = this.model;
        this.$el.empty();
        this.$el.append(this.template(model));

        var commentCont = this.$el.find(".comment-list");
        _.each(model.sbgncomment, function(comment) {
            commentCont.append(comment);
        });
        commentCont.expander(this.expanderOpts);

        var xrefCont = this.$el.find("ul.publication-list");

        _.each(model.sbgnxref, function(xref) {
            (new SBGNXrefView({
                el: xrefCont,
                model: { dbname : xref[1], dbid : xref[0] }
            })).render();
        });

        var evidenceTermCont = this.$el.find("ul.evidence-term-list");

        _.each(model.sbgnevidencecode, function(evidence) {
            (new SBGNListView({
                el: evidenceTermCont,
                model: { comment : evidence }
            })).render();
        });

        var evidenceXrefCont = this.$el.find("ul.evidence-xref-list");

        _.each(model.sbgnevidencexref, function(xref) {
            (new SBGNXrefView({
                el: evidenceXrefCont,
                model: { dbname : xref[0], dbid : xref[1] }
            })).render();
        });

        this.format();

        return this;
    },

    format: function() {
        if(this.model.sbgndisplayname == undefined)
            this.$el.find(".sbgn-display-name").hide();
        
        if(this.model.datasource == undefined)
            this.$el.find(".sbgn-data-source").hide();

        if(this.model.sbgncomment.length <= 0)
            this.$el.find(".sbgn-comment-list").hide();

        if(this.model.sbgnxref.length <= 0)
            this.$el.find(".sbgn-xref-list").hide();

        if(this.model.sbgnevidencecode.length <= 0)
            this.$el.find(".sbgn-evidence-term-list").hide();

        if(this.model.sbgnevidencexref.length <= 0)
            this.$el.find(".sbgn-evidence-xref-list").hide();

    }
});

var SBGNSimpleDetailsView = Backbone.View.extend({
    template:  _.template($('#sbgn-simple-details'). html()),

    render: function(){
        this.$el.empty();
        this.$el.append(this.template(this.model));
    }
});

var SBGNListView = Backbone.View.extend({
    template: _.template($("#sbgn-list-template").html()),

    render: function() {
        this.$el.append(this.template(this.model));
    }
});

var SBGNXrefView = Backbone.View.extend({
    template: _.template($("#sbgn-xref-template").html()),

    render: function() {
        this.$el.append(this.template(this.model));
    }
});


var SBGNHelpView = Backbone.View.extend({
    template:  _.template($('#sbgn-help-template').html()),

    render: function(){
        this.$el.empty();
        this.$el.append(this.template());
    }
});

var SBGNView = Backbone.View.extend({
    cyStyle: sbgnStyleSheet,
    sbgnNetworkLoading: "#sbgn-network-loading",
    sbgnTooSlowMessage: "#sbgn-too-slow-message",
    processTypes : ["process", "omitted process", "uncertain process", "association", "dissociation", "phenotype"],
    epnTypes : ["unspecified entity", "macromolecule", "nucleic acid feature", "simple chemical", "perturbing agent"],

    render: function() {
        var settingsView = new SBGNSettingsView();
        settingsView.render();
        (new SBGNHelpView({
            el : "#sbgn-details-container"
        })).render();        

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

                var positionMap = {};

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
                                (new SBGNHelpView({
                                    el : "#sbgn-details-container"
                                })).render();
                            }
                        });

                        cy.on('tap', 'node', function(evt){
                            var node = this;

                            if(self.processTypes.indexOf(node.data("sbgnclass")) > -1){
                                (new SBGNProcessDetailsView({
                                    model : node.data(),
                                    el : "#sbgn-details-container"
                                })).render();
                            }
                            else if(self.epnTypes.indexOf(node.data("sbgnclass")) > -1){
                                (new SBGNEpnDetailsView({
                                    model : node,
                                    el : "#sbgn-details-container"
                                })).render();
                            }
                            else if(node.data("sbgnclass") == "complex"){
                                (new SBGNComplexDetailsView({
                                    model : node,
                                    el : "#sbgn-details-container"
                                })).render();
                            }
                            else{
                                (new SBGNSimpleDetailsView({
                                    model : node.data(),
                                    el : "#sbgn-details-container"
                                })).render();
                            }
                        });

                    }

                };
                container.cy(cyOptions);
            } // end of function(data)
        ); // end of $.getJSON

        return this;
    } // end of render: function()

}); // end of SbgnView = Backbone.View.extend({








