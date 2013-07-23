<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@page import="org.springframework.web.context.WebApplicationContext"%>
<%@page import="org.springframework.web.context.support.WebApplicationContextUtils"%>
<%
    WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(application);
    String pcURL = (String) context.getBean("pathwayCommonsURLStr");
    String pcVizURL = (String) context.getBean("pcVizURLStr");
%>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
  <head>
    <meta charset="utf-8">
    <title>PCViz: Pathway Commmons Network Visualizer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- jQuery UI -->
    <link href="css/jquery-ui-1.10.3.custom.css" rel="stylesheet">

      <!-- Loading Bootstrap -->
    <link href="css/bootstrap.css" rel="stylesheet">

    <!-- Loading Flat UI -->
    <link href="css/flat-ui.css" rel="stylesheet">
    <link rel="shortcut icon" href="images/favicon.ico">

    <link href="css/jquery.fancybox-1.3.4.css" rel="stylesheet">


    <!-- Loading cytoscape.js plugins -->
    <link href="css/jquery.cytoscape-panzoom.css" rel="stylesheet">
    <link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet">

      <!-- Loading PCViz; this should always be the last to call! -->
      <link href="css/pcviz.css" rel="stylesheet">

      <!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
    <!--[if lt IE 9]>
      <script src="js/html5shiv.js"></script>
    <![endif]-->
  </head>
  <body>
  <div id="pcviz-header">
  </div>

  <div id="dynamic-container">
      <!-- all the backbone magic will happen here -->
  </div>

  <div id="pcviz-footer">
  </div>

  <script type="text/template" id="main-container-template">
      <div class="{{isContainer ? 'container' : ''}}" id="main-container">
      </div>
  </script>

  <script type="text/template" id="pcviz-header-template">
      <div class="palette-silver">
          <div class="container">
              <div id="pcviz-headline" class="pcviz-headline">
                  <h1 class="pcviz-logo">
                      PCViz
                      <small>Pathway Commons Network Visualizer</small>
                  </h1>
              </div>
          </div>
      </div>
  </script>

  <script type="text/template" id="pcviz-footer-template">
      <footer>
          <div class="container">
              <div class="row">
                  <div class="span8">
                      <h3 class="footer-title">Contact</h3>
                      <p>PCViz is built and maintained by
                          <a href="http://cbio.mskcc.org">Memorial Sloan-Kettering Cancer Center</a> and
                          the <a href="http://baderlab.org">University of Toronto</a>.
                      </p>

                      <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          Aenean a sapien leo. Nunc ornare rutrum ante eget rhoncus.
                          Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
                          Curabitur suscipit, ligula a sollicitudin viverra, eros elit ornare mauris, sed fringilla ipsum erat vitae nibh.
                          Mauris vulputate enim non dui mattis facilisis.
                          Ut non lacus augue, id egestas enim.
                          Etiam pellentesque ante eget arcu pretium semper.
                          Sed imperdiet venenatis mi, id aliquet lectus feugiat cursus.
                          Suspendisse potenti. In eget sodales augue.
                          Fusce massa leo, volutpat a faucibus nec, tristique sit amet velit.
                          Proin et augue lacus, sit amet accumsan nibh.
                          Maecenas tincidunt posuere sagittis.
                      </p>
                  </div>

                  <div class="span4">
                      <div class="footer-banner">
                          <h3 class="footer-title">PCViz: More</h3>
                          <ul>
                              <li>Help</li>
                              <li>Tutorials</li>
                              <li>Code</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      </footer>
  </script>

  <script type="text/template" id="main-template">
      <div class="row topcontrols">
          <div class="span8">
              <h3 class="demo-panel-title">Genes of interest</h3>
          </div>
      </div>
      <div class="row topcontrols">
          <div class="span8"> <!-- genes of interest -->
              <input name="tagsinput" id="tagsinput" class="tagsinput" value="" />
          </div>
          <div class="span4">
              <ul class="nav nav-tabs" id="rightMenuControls">
                  <li class="active" id="menu-graph-details"><a href="#graph-details" data-toggle="tab"><span class="fui-menu-16"></span> Details</a></li>
                  <li><a href="#graph-settings" id="menu-graph-settings" data-toggle="tab"><span class="fui-settings-16"></span> Settings</a></li>
                  <li><a href="#graph-help" id="menu-graph-help" data-toggle="tab"><span class="fui-bubble-16"></span> Context</a></li>
              </ul>
          </div>
      </div>
      <div class="row mainview">
          <div class="span8">  <!-- cytoscape view -->
              <div id="network-loading">
                  <h4>Loading network...</h4>
                  <img src="images/loading.gif" alt="loading network...">

                  <div class="help-text palette palette-silver hide" id="too-slow-message">
                      <h5>Taking too long?</h5><br>
                      Sorry about this!
                      Based on the genes you enter, we try to contact
                      <a href="http://pathwaycommons.org" target="_blank">Pathway Commons</a>
                      to build a network of interest for you;
                      but some of the querying methods we use can take some time to complete
                      and we do this dynamically in order to give you the most up-to-date interactions.
                      Therefore, it sometimes takes too long to create the network,
                      but we are constantly working to reduce the waiting time.
                      <br>
                      <br>
                  </div>
              </div>
              <div id="network-container">
                  <div id="main-network-view"></div>
                  <div class="row" id="control-panels">
                      <div class="span6 offset1">
                          <div class="btn-toolbar">
                              <div class="btn-group network-controls">
                                  <a class="btn" id="download-network" href="#"><i class="icon-download-alt"></i> Download</a>
                                  <a class="btn" id="embed-network" href="#"><i class="icon-code"></i> Embed</a>
                                  <a class="btn" id="refresh-view" href="#"><i class="icon-refresh"></i> Refresh</a>
                                  <a class="btn" id="full-screen-link" href="#"><i class="icon-resize-full"></i> Full screen</a>
                              </div>
                          </div> <!-- /toolbar -->
                      </div>
                  </div>

                  <div class="row hide" id="extra-download-options">
                      <div class="span6 offset1">
                          <div class="share download-options">
                              <div class="network-controls">
                                  <a class="btn" id="download-png" href="#">Image (PNG)</a>
                                  <a class="btn" id="download-sif" data-pcurl="<%=pcURL%>" href="#">Network (SIF)</a>
                                  <a class="btn" id="download-biopax" data-pcurl="<%=pcURL%>" href="#">Network (BioPAX)</a>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div class="row hide" id="extra-embed-options">
                      <div class="span5 offset3">
                          <div class="embed-options share">
                                  <table>
                                      <tr>
                                          <td class="span1"></td>
                                          <th class="span1">Height</th>
                                          <td class="span1"><input placeholder="Height" class="input-mini embed-size-input" type="text" id="embed-form-height" value="500"></td>
                                          <th class="span1">Width</th>
                                          <td class="span1"><input placeholder="Width" class="input-mini embed-size-input" type="text" id="embed-form-width" value="500"></td>
                                      </tr>
                                      <tr>
                                          <th colspan="2">HTML Code:</th>
                                          <td colspan="3">
                                              <textarea id="embed-form-html" rows=3 class="span3"></textarea>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td colspan="2"></td>
                                          <td colspan="3" class="embed-preview">
                                              <a href="#" class="btn" id="embed-preview-button"><i class="icon-eye-open"></i> Preview</a>
                                              <a href="#" class="btn btn-danger" id="embed-close-button"><i class="icon-remove"></i> Cancel</a>
                                          </td>
                                      </tr>

                                  </table>
                              </div>
                      </div>
                  </div>

              </div>
          </div>
          <div class="span4"> <!-- slider bars and everything -->
              <div id="rightMenuTabs" class="tab-content">
                  <div class="tab-pane fade active in" id="graph-details">
                      <div id="graph-details-info" class="hide">
                          <p class="help-text palette palette-silver">
                              Click on one of the interactions or genes in the network to see more details...
                          </p>
                          <img src="images/help-left-arrow.png" width="75">
                      </div>
                      <div id="graph-details-content">
                          <!-- reserved for backbone view -->
                      </div>

                  </div>
                  <div class="tab-pane fade" id="graph-settings">
                      <div class="share mrl edge-types">
                          <h4 class="demo-panel-title edge-types-title">Interaction types</h4>
                          <table class="table table-condensed">
                              <tr id="row-controls-state-change">
                                  <td>
                                      <span id="controls-state-change-count">0</span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label controls-state-change" data-itx-type="controls-state-change">controls state change <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                              <tr id="row-controls-expression">
                                  <td>
                                      <span id="controls-expression-count">0</span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label controls-expression" data-itx-type="controls-expression">controls expression <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                              <tr id="row-controls-degradation">
                                  <td>
                                      <span id="controls-degradation-count">0</span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label controls-degradation" data-itx-type="controls-degradation">controls degradation <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                              <tr id="row-consecutive-catalysis">
                                  <td>
                                      <span id="consecutive-catalysis-count">0</span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label consecutive-catalysis" data-itx-type="consecutive-catalysis">consecutive catalysis <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                              <tr id="row-in-same-complex">
                                  <td>
                                      <span id="in-same-complex-count">0</span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label in-same-complex" data-itx-type="in-same-complex">in same complex <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                              <tr id="row-interacts-with">
                                  <td>
                                      <span id="interacts-with-count">0</span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label interacts-with" data-itx-type="in-same-complex">interacts with <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>

                          </table>
                      </div>

                      <h4 class="demo-panel-title">Number of genes <small>(<span id="number-of-genes-info"></span>)</small></h4>
                      <table>
                          <tr>
                              <td class="minus-sign-container">
                                  <a href="#" id="decrease-button" class="slider-control"><i class="icon-minus"></i></a>
                              </td>
                              <td colspan='2' class="nodes-slider-container">
                                  <div id="slider-nodes" class="ui-slider"></div>
                              </td>
                              <td>
                                  <a href="#" id="increase-button" class="slider-control"><i class="icon-plus"></i></a>
                              </td>
                          </tr>
                          <tr id="slider-help-row">
                              <td></td>
                              <td>
                                  <p class="help-slider-text palette palette-silver">
                                      Slide left to decrease the number of genes
                                  </p>
                              </td>
                              <td>
                                  <img src="images/help-up-arrow.png" width="90">
                              </td>
                              <td></td>
                          </tr>
                      </table>

                      <h4 class="demo-panel-title">Query type</h4>
                      <select value="0" class="span3" tabindex="1" id="query-type" name="herolist">
                          <option selected="selected" value="neighborhood">Neighborhood</option>
                          <option value="pathsbetween">Paths-between</option>
                      </select>

                  </div>
                  <div class="tab-pane fade" id="graph-help">
                      <div class="todo mrm">
                          <div class="tile">
                              <h3 class="tile-title">Cancer type of interest</h3>
                              <ul id="cancer-context-list">

                                  <!-- Cancer Studies -->
                              </ul>
                              <br>
                              <br>
                              <a class="btn btn-primary btn-large btn-block" href="#" id="add-cancer-study">
                                  <span class="fui-plus-24"></span> Add
                              </a>
                          </div>
                      </div>
                      <div id="cancer-context-dialog" class="mdm tile hide"></div>
                      <div id="step-loading" class="hide">
                          <p>loading...</p>
                          <img src="images/loading.gif" alt="loading..." height="17" width="50">
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </script>

  <script type="text/template" id="embed-code-template"><iframe width="{{width}}" height="{{height}}" src="<%=pcVizURL%>/#embed/{{networkType}}/{{genes}}" scrolling="no" frameborder="0" seamless="seamless"></iframe></script>

  <script type="text/template" id="main-embed-template">
      <div class="mainview">
          <div>  <!-- cytoscape view -->
              <div id="network-embed-loading">
                  <h4>Loading network...</h4>
                  <img src="images/loading.gif" alt="loading network...">
              </div>
              <div id="network-embed-container">
                  <div id="embed-network-view"></div>
              </div>
          </div>
      </div>
  </script>

  <script type="text/template" id="embed-footer-template">
      <div class="palette-silver" id="embed-footer">
          <div id="pcviz-footerline">
              <p class="pull-right">
                  <a class="btn" id="embed-explore-button" target="_blank" href="<%=pcVizURL%>/#{{networkType}}/{{genes}}" title="explore this network in PCViz"><i class="icon-share"></i></a>
              </p>
              <h4 class="pcviz-embed-logo" data-url="<%=pcVizURL%>">
                  PCViz
                  <small>Pathway Commons Network Visualizer</small>
              </h4>
          </div>
      </div>
  </script>

  <script type="text/template" id="embed-header-template">
  </script>

  <!-- BioGeneView template for backbone.js -->
  <script type="text/template" id="biogene-template">
      <div class='node-details-info'>
          <h3>
              {{geneSymbol}}
              <sup class="tagsinput-add fui-plus-16 add-gene-to-network" title="add this gene to the genes of interest" data-gene="{{geneSymbol}}"></sup>
          </h3>

          <table class="table table-condensed table-striped">
              <tr class="biogene-info biogene-description node-details-summary">
                  <td colspan="2" class="expandable">
                      {{geneSummary}}
                  </td>
              </tr>
              <tr class="biogene-info biogene-aliases">
                  <th>Aliases</th>
                  <td>{{geneAliases}}</td>
              </tr>
              <tr class="biogene-info biogene-description">
                  <th>Description</th>
                  <td class="expandable">{{geneDescription}}</td>
              </tr>
              <tr class="biogene-info biogene-location">
                  <th>Chromosome Location</th>
                  <td>{{geneLocation}}</td>
              </tr>
              <tr class="biogene-info biogene-uniprot-links">
                  <th>UniProt ID:</th>
                  <td>
                      <a href='http://www.uniprot.org/uniprot/{{geneUniprotId}}' target='blank'>
                          {{geneUniprotId}}
                      </a>
                      <span class='biogene-uniprot-links-extra'>
                          {{geneUniprotLinks}}
                      </span>
                  </td>
              </tr>
              <tr class="biogene-info biogene-id">
                  <th>Gene ID:</th>
                  <td>
                      <a href='http://www.ncbi.nlm.nih.gov/gene?term={{geneId}}' target='blank'>{{geneId}}</a>
                  </td>
              </tr>
          </table>

          <div class="alteration-frequency-info">
              <hr>
              <h3>Cancer Context</h3>
              <h4>Alteration Frequency <small>({{altered}}%)</small></h4>
              <div class="progress">
                  <div class="bar bar-danger" style="width: {{altered}}%;"></div>
              </div>

              <a href="http://www.cbioportal.org/public-portal/cross_cancer.do?tab_index=tab_visualize&clinical_param_selection=null&cancer_study_id=all&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=gbm_tcga_mutations&genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION=gbm_tcga_gistic&Z_SCORE_THRESHOLD=2.0&RPPA_SCORE_THRESHOLD=1.0&case_set_id=gbm_tcga_cnaseq&case_ids=&gene_list={{geneSymbol}}&gene_set_choice=user-defined-list&Action=Submit" target="_blank" class="btn btn-inverse btn-block cbioportal">
                  <i class="icon-share"></i> Run cross-cancer analysis in cBioPortal
              </a>
          </div>
      </div>
  </script>

  <script type="text/template" id="edge-type-text-controls-state-change-template">
      controls state change
  </script>

  <script type="text/template" id="edge-type-text-controls-expression-template">
      controls expression
  </script>

  <script type="text/template" id="edge-type-text-in-same-complex-template">
      in same complex
  </script>

  <script type="text/template" id="edge-type-text-interacts-with-template">
      interacts
  </script>

  <script type="text/template" id="edge-type-text-controls-degradation-template">
      controls degradation
  </script>

  <script type="text/template" id="edge-type-text-consecutive-catalysis-template">
      consecutive catalysis
  </script>

  <script type="text/template" id="edge-type-example-template">
      <h5>Example Interaction</h5>
      <img src="images/types/{{type}}.png"><br>
      <p>You can filter interactions of any type using the <b>Settings</b> tab above.</p>
  </script>

  <script type="text/template" id="edgeinfo-template">
      <div class='edge-details-info'>
          <h3>
              {{source}} - {{target}}
          </h3>

          <table class="table table-condensed table-striped">
              <tr>
                  <td colspan="2" class="edge-summary">
                      {{summary}}
                  </td>
              </tr>
              <tr>
                  <th>Co-citations</th>
                  <td>
                      <span class="badge">{{cited}}</span>
                  </td>
              </tr>
              <tr>
                  <th>Interaction Type</th>
                  <td class="type-image">
                      <span class="label {{type}} type-filter-help" data-edge-type="{{type}}">
                          <span class="type-actual-text">{{type}}</span>
                          <i class="icon-question-sign edge-type-help"></i>
                      </span>

                  </td>
              </tr>
              <tr>
                  <th>References</th>
                  <td>
                      {{pubmed.length}} publication(s)
                      <ul class="pubmed-list">
                      </ul>
                  </td>
              </tr>
              <tr>
                  <td colspan="2">
                      <a class="btn btn-primary btn-block download-detailed {{type}}" target="_blank" href="<%=pcURL%>/graph?source={{source}}&target={{target}}&kind=PATHSFROMTO&format=BIOPAX">
                          <i class="icon-download-alt"></i>
                          Download detailed process (BioPAX)
                      </a>

                  </td>
              </tr>
          </table>
      </div>
  </script>

  <script type="text/template" id="pubmed-id-template">
    <li>
        <a class="pubmed-link" target="_blank" href="http://www.ncbi.nlm.nih.gov/pubmed/{{pmid}}">Pubmed: {{pmid}}</a>
    </li>
  </script>

  <script type="text/template" id="edge-controls-state-change-template">
      <span class="gene source-gene">{{source}}</span> changes the state of <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-consecutive-catalysis-template">
      <span class="gene source-gene">{{source}}</span> and <span class="gene target-gene">{{target}}</span>
      catalyze two conversions connected via a common molecule,
      <i>e.g.</i> the first entity produces a substrate that is consumed by the second entity.
  </script>

  <script type="text/template" id="edge-controls-degradation-template">
      <span class="gene source-gene">{{source}}</span>
      controls the degradation of
      <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-controls-expression-template">
      <span class="gene source-gene">{{source}}</span>
      controls the expression of
      <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-interacts-with-template">
      <span class="gene source-gene">{{source}}</span>
      interacts with
      <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-in-same-complex-template">
      <span class="gene source-gene">{{source}}</span> and <span class="gene target-gene">{{target}}</span>
      are members of the  same complex.
  </script>

  <script type="text/template" id="loading-small-template">
      <img src="images/loading.gif" alt="loading..." height="17" width="50">
  </script>

  <script type="text/template" id="loading-text-template">
      <span class="loading">loading...</span>
  </script>

  <script type="text/template" id="loading-biogene-template">
      loading gene information...<br>
      <img src="images/loading.gif" alt="loading..." height="17" width="50">
  </script>

  <script type="text/template" id="loading-large-template">
      <img src="images/loading.gif" alt="loading..." height="34" width="100">
  </script>

  <script type="text/template" id="uniprot-link-template">
      <a href="http://www.uniprot.org/uniprot/{{id}}" target="_blank">{{id}}</a>
  </script>

  <script type="text/template" id="biogene-retrieve-error-template">
      Error retrieving data: {{returnCode}}.
  </script>

  <script type="text/template" id="biogene-noinfo-error-template">
      No additional information available for the selected node.
  </script>

  <script type="text/template" id="noty-newgene-template">
      Added a new gene: <b><small>{{gene}}</small></b>
  </script>

  <script type="text/template" id="noty-oldgene-template">
      Removed gene: <b><small>{{gene}}</small></b>
  </script>

  <script type="text/template" id="noty-network-loaded-template">
      {{type}} network loaded: {{nodes}} genes and {{edges}} interactions
  </script>

  <script type="text/template" id="noty-invalid-symbols-template">
      Sorry! One or more gene symbols you have entered were not valid.
  </script>

  <script type="text/template" id="noty-invalid-pathsbetween-template">
      A Paths-between query cannot be run for a single gene. Maybe you want to try <b>neighborhood</b> instead?
  </script>

  <script type="text/template" id="noty-semivalid-symbols-template">
      <b><small>{{query}}</small></b> is a synonym for <b><small>{{synonym}}</small></b>
  </script>

  <script type="text/template" id="noty-empty-network-template">
      We couldn't find any genes symbols to query for a network. Please provide a gene symbol.
  </script>

  <script type="text/template" id="noty-edges-shown-template">
      <b>{{numOfEdges}}</b> interactions of type <b class="noty-itx-type {{type}}">{{type}}</b> are added back to the network.
  </script>

  <script type="text/template" id="noty-edges-hidden-template">
      <b>{{numOfEdges}}</b> interactions of type <b class="noty-itx-type {{type}}">{{type}}</b> are now hidden.
  </script>

  <script type="text/template" id="noty-network-refresh-template">
      Success! Gene location history is all cleared now.
  </script>

  <!-- Fullscreen Cytoscape.js template -->
  <script type="text/template" id="fullscreen-network-tmpl">
      <div id="fullscreen-network-view">

      </div>
  </script>

  <script type="text/template" id="cancer-study-added-tmpl">
      <li class="todo-done" data-cancer-id="{{studyId}}" data-case-size="{{numberOfCases}}">
          <div class="todo-icon fui-man-24"></div>
          <div class="todo-content">
              <h4 class="todo-name">
                  {{studyName}}
              </h4>
              ({{studyDesc}})
          </div>
      </li>
  </script>

  <script type="text/template" id="cancer-context-dialog-tmpl">
      <div class="context-dialog" id="step1">
          <h4>1) Add new context</h4>
          <select id="cancer-studies-box">
              <option value="none">Select a cancer study</option>
          </select>
      </div>
      <div class="context-dialog hide" id="step2">
          <h4>2) Data types</h4>
          <label class="checkbox" for="mutation" id="label-mutation">
            <input type="checkbox" class="data-type" value="mutation" id="mutation" data-toggle="checkbox" checked="checked">
              Mutation
          </label>
          <label class="checkbox" for="cna" id="label-cna">
              <input type="checkbox" class="data-type" value="cna" id="cna" data-toggle="checkbox" checked="checked">
              Copy Number Alteration
          </label>
          <label class="checkbox" for="exp" id="label-exp">
              <input type="checkbox" class="data-type" value="exp" id="exp" data-toggle="checkbox" checked="checked">
              Gene Expression
          </label>
      </div>
      <div class="load-context">
          <a class="btn btn-inverse btn-block" id="context-load-button">
              <i class="icon-circle-arrow-down"></i>
              Load context
          </a>
      </div>
  </script>

  <script type="text/template" id="cancer-study-select-item-tmpl">
      <option value="{{studyId}}">{{name}}</option>
  </script>

  <script type="text/template" id="noty-context-loaded-template">
      Cancer context was loaded successfully from {{numberOfStudies}} studies ({{numberOfCases}} cases total).
  </script>

  <script type="text/template" id="noty-context-loaded-one-template">
      Cancer context was loaded successfully from {{numberOfStudies}} study ({{numberOfCases}} cases total).
  </script>

  <script type="text/template" id="noty-no-context-template">
      There are no active cancer studies left. Cleared cancer context.
  </script>

  <script type="text/template" id="noty-new-study-loaded-template">
      Cancer context from <b>{{name}}</b> was loaded successfully ({{numberOfCases}} cases).
      You can deactivate the context by clicking on the cancer study name on the list.
  </script>

  <!-- JS libraries -->
  <script src="js/jquery-1.8.2.min.js"></script>
  <script src="js/jquery-ui-1.10.3.custom.min.js"></script>
  <script src="js/jquery.dropkick-1.0.0.js"></script>
  <script src="js/custom_checkbox_and_radio.js"></script>
  <script src="js/custom_radio.js"></script>
  <script src="js/jquery.tagsinput.js"></script>
  <script src="js/jquery.ui.touch-punch.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/jquery.placeholder.js"></script>
  <script src="js/arbor.js"></script>
  <script src="js/cytoscape.min.js"></script>
  <script src="js/jquery.cytoscape-panzoom.min.js"></script>
  <script src="js/application.js"></script>
  <script src="js/underscore.js"></script>
  <script src="js/backbone-min.js"></script>
  <script src="js/jquery.fancybox-1.3.4.pack.js"></script>
  <script src="js/jquery.easing-1.3.pack.js"></script>
  <script src="js/jquery.expander.min.js"></script>
  <script src="js/noty/jquery.noty.js"></script>
  <script src="js/noty/layouts/bottomRight.js"></script>
  <script src="js/noty/themes/noty.pcviz.theme.js"></script>
  <script src="js/store.js"></script>
  <script src="js/jquery.scrollTo-1.4.3.1-min.js"></script>

  <!--[if lt IE 8]>
  <script src="js/icon-font-ie7.js"></script>
  <![endif]-->

  <!-- PCViz and its components -->
  <script src="js/pcviz.main.js"></script>
  <script src="js/components/pcviz.notification.js"></script>
  <script src="js/components/pcviz.home.js"></script>
  <script src="js/components/pcviz.validation.js"></script>
  <script src="js/components/pcviz.settings.js"></script>
  <script src="js/components/pcviz.network.js"></script>
  <script src="js/components/pcviz.biogene.js"></script>
  <script src="js/components/pcviz.edgeinfo.js"></script>
  <script src="js/components/pcviz.cancer.js"></script>
  <script src="js/extensions/cytoscape.layout.pcviz.js"></script>
  <script src="js/extensions/cytoscape.layout.pcviz.arbor.js"></script>
  <script src="js/extensions/cytoscape.core.rank.js"></script>


  </body>
</html>
