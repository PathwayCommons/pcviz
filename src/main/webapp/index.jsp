<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@page import="org.springframework.web.context.WebApplicationContext"%>
<%@page import="org.springframework.web.context.support.WebApplicationContextUtils"%>
<%
    WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(application);
    String pcURL = (String) context.getBean("pathwayCommonsURLStr");
%>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
  <head>
    <meta charset="utf-8">
    <title>Pathway Commmons Network Visualizer</title>
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
    <link href="css/font-awesome.css" rel="stylesheet">

      <!-- Loading PCViz; this should always be the last to call! -->
      <link href="css/pcviz.css" rel="stylesheet">

      <!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
    <!--[if lt IE 9]>
      <script src="js/html5shiv.js"></script>
    <![endif]-->
  </head>
  <body>
  <div class="palette-silver">
    <div class="container">
      <div class="pcviz-headline">
        <h1 class="pcviz-logo">
          PCViz
          <small>Pathway Commons Network Visualizer</small>
        </h1>
      </div>
    </div>
  </div>

    <div class="container" id="main-container">
        <!-- all the backbone magic will happen here -->
    </div>
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
              </div>
              <div id="network-container">
                  <div id="main-network-view"></div>
                  <div class="row" id="control-panels">
                      <div class="span6 offset2">
                          <div class="btn-toolbar">
                              <div class="btn-group network-controls">
                                  <a class="btn" id="download-network" href="#"><i class="icon-download-alt"></i> Download</a>
                                  <a class="btn" id="refresh-view" href="#"><i class="icon-refresh"></i> Refresh</a>
                                  <a class="btn" id="full-screen-link" href="#"><i class="icon-resize-full"></i> Full screen</a>
                              </div>
                          </div> <!-- /toolbar -->
                      </div>
                  </div>

                  <div class="row hide" id="extra-download-options">
                      <div class="span6 offset2">
                          <div class="share download-options">
                              <div class="network-controls">
                                  <a class="btn" id="download-png" href="#">Image (PNG)</a>
                                  <a class="btn" id="download-sif" data-pcurl="<%=pcURL%>" href="#">Network (SIF)</a>
                                  <a class="btn" id="download-biopax" data-pcurl="<%=pcURL%>" href="#">Network (BioPAX)</a>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="span4"> <!-- slider bars and everything -->
              <div id="rightMenuTabs" class="tab-content">
                  <div class="tab-pane fade active in" id="graph-details">
                      <div id="graph-details-info">
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
                              <tr>
                                  <td>
                                      <span class="itx-type-on-off label transinhibit" data-itx-type="transinhibit">transinhibit <span class="fui-cross-16"></span></span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label state-change" data-itx-type="state-change">state change <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                              <tr>
                                  <td>
                                      <span class="itx-type-on-off label transactivate" data-itx-type="transactivate">transactivate <span class="fui-cross-16"></span></span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label in-same-complex" data-itx-type="in-same-complex">in same complex <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                              <tr>
                                  <td>
                                      <span class="itx-type-on-off label degrades" data-itx-type="degrades">degrades <span class="fui-cross-16"></span></span>
                                  </td>
                                  <td>
                                      <span class="itx-type-on-off label blocks-degradation" data-itx-type="blocks-degradation">blocks degradation <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                              <tr>
                                  <td colspan="2">
                                      <span class="itx-type-on-off label consecutive-catalysis" data-itx-type="consecutive-catalysis">consecutive catalysis <span class="fui-cross-16"></span></span>
                                  </td>
                              </tr>
                          </table>
                      </div>

                      <h4 class="demo-panel-title">Number of genes <small>(<span id="number-of-genes-info"></span>)</pan></small></h4>
                      <div id="slider-nodes" class="ui-slider" data-default-value="3"></div>

                      <h4 class="demo-panel-title">Graph query type</h4>
                      <select value="0" class="span3" tabindex="1" id="query-type" name="herolist">
                          <option selected="selected" value="neighborhood">Neighborhood</option>
                          <option value="pathsbetween">Paths-between</option>
                      </select>



                  </div>
                  <div class="tab-pane fade" id="graph-help">
                      <div class="todo mrm">
                          <div class="tile">
                              <h3 class="tile-title">Cancer type of interest</h3>
                              <ul>
                                  <li>
                                      <div class="todo-icon fui-man-24"></div>
                                      <div class="todo-content">
                                          <h4 class="todo-name">
                                              Glioblastoma
                                          </h4>
                                          The Cancer Genome Atlas, Nature 2008
                                      </div>
                                  </li>

                                  <li class="todo-done">
                                      <div class="todo-icon fui-man-24"></div>
                                      <div class="todo-content">
                                          <h4 class="todo-name">
                                              Ovarian Cancer
                                          </h4>
                                          The Cancer Genome Atlas, Nature 2011
                                      </div>
                                  </li>
                              </ul>
                              <br>
                              <br>
                              <a class="btn btn-primary btn-large btn-block" href="#"><span class="fui-plus-24"></span> Add</a>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
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
      </div>
  </script>

  <script type="text/template" id="edgeinfo-template">
      <div class='edge-details-info'>
          <h3>
              {{source}} - {{target}}
          </h3>

          <table class="table table-condensed table-striped">
              <tr>
                  <td colspan="2" class="edge-summary">
                      {{summary}} <small class="badge">{{cited}} co-citations</small>
                  </td>
              </tr>
              <tr>
                  <th>Interaction Type</th>
                  <td><span class="{{type}} label noty-itx-type type-filter-help" title="You can filter interactions of any type using the 'Settings' tab above.">{{type}}</span></td>
              </tr>
              <tr>
                  <th>References</th>
                  <td>
                      {{pubmed.length}} publication(s)
                      <ul class="pubmed-list">
                      </ul>
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

  <script type="text/template" id="edge-state-change-template">
      <span class="gene source-gene">{{source}}</span> changes the state of <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-consecutive-catalysis-template">
      <span class="gene source-gene">{{source}}</span> consecutively catalyzes <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-degrades-template">
      <span class="gene source-gene">{{source}}</span> degrades <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-blocks-degradation-template">
      <span class="gene source-gene">{{source}}</span> blocks the degradation of <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-transactivate-template">
      <span class="gene source-gene">{{source}}</span> trans-activates <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-transinhibit-template">
      <span class="gene source-gene">{{source}}</span> trans-inhibits <span class="gene target-gene">{{target}}</span>.
  </script>

  <script type="text/template" id="edge-in-same-complex-template">
      <span class="gene source-gene">{{source}}</span> and <span class="gene target-gene">{{target}}</span>, together, form a complex.
  </script>

  <script type="text/template" id="loading-small-template">
      <img src="images/loading.gif" alt="loading..." height="17" width="50">
  </script>

  <script type="text/template" id="loading-text-template">
      <span class="loading">loading...</span>
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
  <script src="js/extensions/cytoscape.layout.pcviz.js"></script>
  <script src="js/extensions/cytoscape.core.rank.js"></script>

  </body>
</html>