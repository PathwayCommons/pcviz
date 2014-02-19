/*
 * Copyright 2014 Memorial-Sloan Kettering Cancer Center.
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



;(function($$){"use strict";

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;

	nodeShape.push("macromolecule");
	nodeShape.push("process");
	nodeShape.push("complex");
	nodeShape.push("compartment");

	var nodeShapes = CanvasRenderer.nodeShapes;
	
	var sbgnShapes = new Object();
	sbgnShapes["macromolecule"] = true;
	sbgnShapes["process"] = true;
	sbgnShapes["complex"] = true;
	sbgnShapes["compartment"] = true;

	// TODO access CanvasRenderer.nodeShapes object and
	// define additional custom shapes when necessary.
	// see the file extensions/renderer.canvas.node-shapes.js
	// under the main cytoscape.js repo for default shape implementations.

	//console.log(CanvasRenderer.nodeShapes);


	function drawSelection(render,context, node){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			CanvasRenderer.nodeShapes[render.getNodeShape(node)].draw(
					context,
					node); //node._private.data.weight / 5.0
		}
		else{
			CanvasRenderer.nodeShapes[render.getNodeShape(node)].draw(
					context,
					node._private.position.x,
					node._private.position.y,
					render.getNodeWidth(node),
					render.getNodeHeight(node)); //node._private.data.weight / 5.0
		}
	}

	function drawPathSelection(render,context, node){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			CanvasRenderer.nodeShapes[render.getNodeShape(node)].drawPath(
					context,
					node); //node._private.data.weight / 5.0
		}
		else{
			CanvasRenderer.nodeShapes[render.getNodeShape(node)].drawPath(
					context,
					node._private.position.x,
					node._private.position.y,
					render.getNodeWidth(node),
					render.getNodeHeight(node)); //node._private.data.weight / 5.0
		}
	}

	function intersectLineSelection(render, node, cp){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectLine(
				node,
				cp[0], //halfPointX,
				cp[1] //halfPointY
			);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectLine(
				node._private.position.x,
				node._private.position.y,
				render.getNodeWidth(node),
				render.getNodeHeight(node),
				cp[0], //halfPointX,
				cp[1], //halfPointY
				node._private.style["border-width"].value / 2
			);
		}
	}

	function straightIntersectLineSelection(render,sourceNode, targetNode){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(sourceNode)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(sourceNode)].intersectLine(
				sourceNode,
				targetNode.position.x,
				targetNode.position.y
			);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(sourceNode)].intersectLine(
				sourceNode._private.position.x,
				sourceNode._private.position.y,
				render.getNodeWidth(sourceNode),
				render.getNodeHeight(sourceNode),
				targetNode.position().x,
				targetNode.position().y,
				sourceNode._private.style["border-width"].value / 2
			);
		}
	}

	function checkPointRoughSelection(render, node, x, y, nodeThreshold){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].checkPointRough(x, y,
				node,
				nodeThreshold);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].checkPointRough(x, y,
				node._private.style["border-width"].value / 2,
				render.getNodeWidth(node) + nodeThreshold, 
				render.getNodeHeight(node) + nodeThreshold,
				node._private.position.x,
				node._private.position.y);
		}
	}

	function checkPointSelection(render, node, x, y, nodeThreshold){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].checkPoint(x, y,
				node,
				nodeThreshold);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].checkPoint(x, y,
				node._private.style["border-width"].value / 2,
				render.getNodeWidth(node) + nodeThreshold, 
				render.getNodeHeight(node) + nodeThreshold,
				node._private.position.x, 
				node._private.position.y);
		}
	}

	function intersectBoxSelection(render, x1, y1, x2, y2, node){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectBox(x1, y1, x2, y2, node);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectBox(x1, y1, x2, y2,
				render.getNodeWidth(node), 
				render.getNodeHeight(node),
				node._private.position.x, 
				node._private.position.y, 
				node._private.style["border-width"].value / 2);
		}
	}

	CanvasRenderer.prototype.drawPie = function(context, node){
		node = node[0]; // ensure ele ref

		if( !this.hasPie(node) ){ return; } // exit early if not needed

		var nodeW = this.getNodeWidth( node );
		var nodeH = this.getNodeHeight( node );
		var x = node._private.position.x;
		var y = node._private.position.y;
		var radius = Math.min( nodeW, nodeH ) / 2; // must fit in node
		var lastPercent = 0; // what % to continue drawing pie slices from on [0, 1]

		context.save();

		// clip to the node shape
		drawPathSelection(this, context, node);

		context.clip();

		for( var i = 1; i <= $$.style.pieBackgroundN; i++ ){ // 1..N
			var size = node._private.style['pie-' + i + '-background-size'].value;
			var color = node._private.style['pie-' + i + '-background-color'];
			var percent = size / 100; // map integer range [0, 100] to [0, 1]
			var angleStart = 1.5 * Math.PI + 2 * Math.PI * lastPercent; // start at 12 o'clock and go clockwise
			var angleDelta = 2 * Math.PI * percent;
			var angleEnd = angleStart + angleDelta;

			// slice start and end points
			var sx1 = x + radius * Math.cos( angleStart );
			var sy1 = y + radius * Math.sin( angleStart );

			// ignore if
			// - zero size
			// - we're already beyond the full circle
			// - adding the current slice would go beyond the full circle
			if( size === 0 || lastPercent >= 1 || lastPercent + percent > 1 ){
				continue;
			}

			context.beginPath();
			context.moveTo(x, y);
			context.arc( x, y, radius, angleStart, angleEnd );
			context.closePath();

			context.fillStyle = 'rgb(' 
				+ color.value[0] + ','
				+ color.value[1] + ','
				+ color.value[2] + ')'
			;

			context.fill();

			lastPercent += percent;
		}

		context.restore();
	};


	CanvasRenderer.prototype.drawInscribedImage = function(context, img, node) {
		var r = this;
//		console.log(this.data);
		var zoom = this.data.cy._private.zoom;
		
		var nodeX = node._private.position.x;
		var nodeY = node._private.position.y;

		//var nodeWidth = node._private.style["width"].value;
		//var nodeHeight = node._private.style["height"].value;
		var nodeWidth = this.getNodeWidth(node);
		var nodeHeight = this.getNodeHeight(node);
		
		context.save();
		
		drawPathSelection(this, context, node);
		
		context.clip();
		
//		context.setTransform(1, 0, 0, 1, 0, 0);
		
		var imgDim = [img.width, img.height];
		context.drawImage(img, 
				nodeX - imgDim[0] / 2,
				nodeY - imgDim[1] / 2,
				imgDim[0],
				imgDim[1]);
		
		context.restore();
		
		if (node._private.style["border-width"].value > 0) {
			context.stroke();
		}
		
	};

	CanvasRenderer.prototype.getAllInBox = function(x1, y1, x2, y2) {
		var data = this.data; var nodes = this.getCachedNodes(); var edges = this.getCachedEdges(); var box = [];
		
		var x1c = Math.min(x1, x2); var x2c = Math.max(x1, x2); var y1c = Math.min(y1, y2); var y2c = Math.max(y1, y2); x1 = x1c; x2 = x2c; y1 = y1c; y2 = y2c; var heur;
		
		for (var i=0;i<nodes.length;i++) {
			if (intersectBoxSelection(this, x1, y1, x2, y2, nodes[i])){ 
				box.push(nodes[i]); 
			}
		}
		
		for (var i=0;i<edges.length;i++) {
			if (edges[i]._private.rscratch.edgeType == "self") {
				if ((heur = $$.math.boxInBezierVicinity(x1, y1, x2, y2,
						edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
						edges[i]._private.rscratch.cp2ax, edges[i]._private.rscratch.cp2ay,
						edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style["width"].value))
							&&
						(heur == 2 || (heur == 1 && $$.math.checkBezierInBox(x1, y1, x2, y2,
							edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
							edges[i]._private.rscratch.cp2ax, edges[i]._private.rscratch.cp2ay,
							edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style["width"].value)))
								||
					(heur = $$.math.boxInBezierVicinity(x1, y1, x2, y2,
						edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
						edges[i]._private.rscratch.cp2cx, edges[i]._private.rscratch.cp2cy,
						edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style["width"].value))
							&&
						(heur == 2 || (heur == 1 && $$.math.checkBezierInBox(x1, y1, x2, y2,
							edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
							edges[i]._private.rscratch.cp2cx, edges[i]._private.rscratch.cp2cy,
							edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style["width"].value)))
					)
				{ box.push(edges[i]); }
			}
			
			if (edges[i]._private.rscratch.edgeType == "bezier" &&
				(heur = $$.math.boxInBezierVicinity(x1, y1, x2, y2,
						edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
						edges[i]._private.rscratch.cp2x, edges[i]._private.rscratch.cp2y,
						edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style["width"].value))
							&&
						(heur == 2 || (heur == 1 && $$.math.checkBezierInBox(x1, y1, x2, y2,
							edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
							edges[i]._private.rscratch.cp2x, edges[i]._private.rscratch.cp2y,
							edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style["width"].value))))
				{ box.push(edges[i]); }
		
			if (edges[i]._private.rscratch.edgeType == "straight" &&
				(heur = $$.math.boxInBezierVicinity(x1, y1, x2, y2,
						edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
						edges[i]._private.rscratch.startX * 0.5 + edges[i]._private.rscratch.endX * 0.5, 
						edges[i]._private.rscratch.startY * 0.5 + edges[i]._private.rscratch.endY * 0.5, 
						edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style["width"].value))
							&& 
						(heur == 2 || (heur == 1 && $$.math.checkStraightEdgeInBox(x1, y1, x2, y2,
							edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
							edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style["width"].value))))
				{ box.push(edges[i]); }
			
		}
		
		return box;
	}


	//For some shapes, style changes are not enough.
	//Some of the core files must be changed.
	//drawText and drawNode functions are overrided

	// Find nearest element
	CanvasRenderer.prototype.findNearestElement = function(x, y, visibleElementsOnly) {
		var data = this.data; var nodes = this.getCachedNodes(); var edges = this.getCachedEdges(); var near = [];
		var isTouch = CanvasRenderer.isTouch;
		
		var zoom = this.data.cy.zoom();
		var edgeThreshold = (isTouch ? 256 : 32) / zoom;
		var nodeThreshold = (isTouch ? 16 : 0) /  zoom;
		
		// Check nodes
		for (var i = 0; i < nodes.length; i++) {
			
			if (checkPointRoughSelection(this, nodes[i], x, y, nodeThreshold) &&
				checkPointSelection(this, nodes[i], x, y, nodeThreshold)) {
				
				if (visibleElementsOnly) {
					if (nodes[i]._private.style["opacity"].value != 0
						&& nodes[i]._private.style["visibility"].value == "visible"
						&& nodes[i]._private.style["display"].value == "element") {
						
						near.push(nodes[i]);	
					}
				} else {
					near.push(nodes[i]);
				}
			}
		}
		
		// Check edges
		var addCurrentEdge;
		for (var i = 0; i < edges.length; i++) {
			var edge = edges[i];
			var rs = edge._private.rscratch;

			addCurrentEdge = false;

			if (rs.edgeType == "self") {
				if (($$.math.inBezierVicinity(x, y,
						rs.startX,
						rs.startY,
						rs.cp2ax,
						rs.cp2ay,
						rs.selfEdgeMidX,
						rs.selfEdgeMidY,
						Math.pow(edge._private.style["width"].value/2, 2))
							&&
					(Math.pow(edges[i]._private.style["width"].value/2, 2) + edgeThreshold > 
						$$.math.sqDistanceToQuadraticBezier(x, y,
							rs.startX,
							rs.startY,
							rs.cp2ax,
							rs.cp2ay,
							rs.selfEdgeMidX,
							rs.selfEdgeMidY)))
					||
					($$.math.inBezierVicinity(x, y,
						rs.selfEdgeMidX,
						rs.selfEdgeMidY,
						rs.cp2cx,
						rs.cp2cy,
						rs.endX,
						rs.endY,
						Math.pow(edges[i]._private.style["width"].value/2, 2))
							&&
					(Math.pow(edges[i]._private.style["width"].value/2, 2) + edgeThreshold > 
						$$.math.sqDistanceToQuadraticBezier(x, y,
							rs.selfEdgeMidX,
							rs.selfEdgeMidY,
							rs.cp2cx,
							rs.cp2cy,
							rs.endX,
							rs.endY))))
					 { addCurrentEdge = true; }
			
			} else if (rs.edgeType == "straight") {
				if ($$.math.inLineVicinity(x, y, rs.startX, rs.startY, rs.endX, rs.endY, edges[i]._private.style["width"].value * 2)
						&&
					Math.pow(edges[i]._private.style["width"].value / 2, 2) + edgeThreshold >
					$$.math.sqDistanceToFiniteLine(x, y,
						rs.startX,
						rs.startY,
						rs.endX,
						rs.endY))
					{ addCurrentEdge = true; }
			
			} else if (rs.edgeType == "bezier") {
				if ($$.math.inBezierVicinity(x, y,
					rs.startX,
					rs.startY,
					rs.cp2x,
					rs.cp2y,
					rs.endX,
					rs.endY,
					Math.pow(edges[i]._private.style["width"].value / 2, 2))
						&&
					(Math.pow(edges[i]._private.style["width"].value / 2 , 2) + edgeThreshold >
						$$.math.sqDistanceToQuadraticBezier(x, y,
							rs.startX,
							rs.startY,
							rs.cp2x,
							rs.cp2y,
							rs.endX,
							rs.endY)))
					{ addCurrentEdge = true; }
			}
			
			if (!near.length || near[near.length - 1] != edges[i]) {
				if ((CanvasRenderer.arrowShapes[edges[i]._private.style["source-arrow-shape"].value].roughCollide(x, y,
						edges[i]._private.rscratch.arrowStartX, edges[i]._private.rscratch.arrowStartY,
						this.getArrowWidth(edges[i]._private.style["width"].value),
						this.getArrowHeight(edges[i]._private.style["width"].value),
						[edges[i]._private.rscratch.arrowStartX - edges[i].source()[0]._private.position.x,
							edges[i]._private.rscratch.arrowStartY - edges[i].source()[0]._private.position.y], 0)
						&&
					CanvasRenderer.arrowShapes[edges[i]._private.style["source-arrow-shape"].value].collide(x, y,
						edges[i]._private.rscratch.arrowStartX, edges[i]._private.rscratch.arrowStartY,
						this.getArrowWidth(edges[i]._private.style["width"].value),
						this.getArrowHeight(edges[i]._private.style["width"].value),
						[edges[i]._private.rscratch.arrowStartX - edges[i].source()[0]._private.position.x,
							edges[i]._private.rscratch.arrowStartY - edges[i].source()[0]._private.position.y], 0))
					||
					(CanvasRenderer.arrowShapes[edges[i]._private.style["target-arrow-shape"].value].roughCollide(x, y,
						edges[i]._private.rscratch.arrowEndX, edges[i]._private.rscratch.arrowEndY,
						this.getArrowWidth(edges[i]._private.style["width"].value),
						this.getArrowHeight(edges[i]._private.style["width"].value),
						[edges[i]._private.rscratch.arrowEndX - edges[i].target()[0]._private.position.x,
							edges[i]._private.rscratch.arrowEndY - edges[i].target()[0]._private.position.y], 0)
						&&
					CanvasRenderer.arrowShapes[edges[i]._private.style["target-arrow-shape"].value].collide(x, y,
						edges[i]._private.rscratch.arrowEndX, edges[i]._private.rscratch.arrowEndY,
						this.getArrowWidth(edges[i]._private.style["width"].value),
						this.getArrowHeight(edges[i]._private.style["width"].value),
						[edges[i]._private.rscratch.arrowEndX - edges[i].target()[0]._private.position.x,
							edges[i]._private.rscratch.arrowEndY - edges[i].target()[0]._private.position.y], 0)))
					{ addCurrentEdge = true; }
			}
			
			if (addCurrentEdge) {
				if (visibleElementsOnly) {
					// For edges, make sure the edge is visible/has nonzero opacity,
					// then also make sure both source and target nodes are visible/have
					// nonzero opacity
					var source = data.cy.getElementById(edges[i]._private.data.source)
					var target = data.cy.getElementById(edges[i]._private.data.target)
					
					if (edges[i]._private.style["opacity"].value != 0
						&& edges[i]._private.style["visibility"].value == "visible"
						&& edges[i]._private.style["display"].value == "element"
						&& source._private.style["opacity"].value != 0
						&& source._private.style["visibility"].value == "visible"
						&& source._private.style["display"].value == "element"
						&& target._private.style["opacity"].value != 0
						&& target._private.style["visibility"].value == "visible"
						&& target._private.style["display"].value == "element") {
						
						near.push(edges[i]);	
					}
				} else {
					near.push(edges[i]);
				}
			}
		} 
		
		near.sort( this.zOrderSort );
		
		if (near.length > 0) { return near[ near.length - 1 ]; } else { return null; }
	};


	CanvasRenderer.prototype.findEndpoints = function(edge) {
		var intersect;

		var source = edge.source()[0];
		var target = edge.target()[0];
		
		var srcPos = source._private.position;
		var tgtPos = target._private.position;

		var tgtArShape = edge._private.style["target-arrow-shape"].value;
		var srcArShape = edge._private.style["source-arrow-shape"].value;

		var tgtBorderW = target._private.style["border-width"].pxValue;
		var srcBorderW = source._private.style["border-width"].pxValue;

		var rs = edge._private.rscratch;
		
		if (edge._private.rscratch.edgeType == "self") {
			
			var cp = [rs.cp2cx, rs.cp2cy];

			intersect = intersectLineSelection(this, target, cp);
			
			var arrowEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].spacing(edge));
			var edgeEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].gap(edge));
			
			rs.endX = edgeEnd[0];
			rs.endY = edgeEnd[1];
			
			rs.arrowEndX = arrowEnd[0];
			rs.arrowEndY = arrowEnd[1];
			
			var cp = [rs.cp2ax, rs.cp2ay];

			intersect = intersectLineSelection(this, source, cp);
			
			var arrowStart = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[srcArShape].spacing(edge));
			var edgeStart = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[srcArShape].gap(edge));
			
			rs.startX = edgeStart[0];
			rs.startY = edgeStart[1];


			rs.arrowStartX = arrowStart[0];
			rs.arrowStartY = arrowStart[1];
			
		} else if (rs.edgeType == "straight") {

			intersect = straightIntersectLineSelection(this, target, source);

				
			if (intersect.length == 0) {
				rs.noArrowPlacement = true;
	//			return;
			} else {
				rs.noArrowPlacement = false;
			}
			
			var arrowEnd = $$.math.shortenIntersection(intersect,
				[source.position().x, source.position().y],
				CanvasRenderer.arrowShapes[tgtArShape].spacing(edge));
			var edgeEnd = $$.math.shortenIntersection(intersect,
				[source.position().x, source.position().y],
				CanvasRenderer.arrowShapes[tgtArShape].gap(edge));

			rs.endX = edgeEnd[0];
			rs.endY = edgeEnd[1];
			
			rs.arrowEndX = arrowEnd[0];
			rs.arrowEndY = arrowEnd[1];

			intersect = straightIntersectLineSelection(this,source, target);


			if (intersect.length == 0) {
				rs.noArrowPlacement = true;
	//			return;
			} else {
				rs.noArrowPlacement = false;
			}
			
			var arrowStart = $$.math.shortenIntersection(intersect,
				[target.position().x, target.position().y],
				CanvasRenderer.arrowShapes[srcArShape].spacing(edge));
			var edgeStart = $$.math.shortenIntersection(intersect,
				[target.position().x, target.position().y],
				CanvasRenderer.arrowShapes[srcArShape].gap(edge));

			rs.startX = edgeStart[0];
			rs.startY = edgeStart[1];
			
			rs.arrowStartX = arrowStart[0];
			rs.arrowStartY = arrowStart[1];
						
		} else if (rs.edgeType == "bezier") {
			// if( window.badArrow) debugger;
			var cp = [rs.cp2x, rs.cp2y];

			intersect = intersectLineSelection(this, target, cp);
			
			var arrowEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].spacing(edge));
			var edgeEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].gap(edge));
			
			rs.endX = edgeEnd[0];
			rs.endY = edgeEnd[1];
			
			rs.arrowEndX = arrowEnd[0];
			rs.arrowEndY = arrowEnd[1];
			
			intersect = intersectLineSelection(this, source, cp);
			
			var arrowStart = $$.math.shortenIntersection(
				intersect, 
				cp,
				CanvasRenderer.arrowShapes[srcArShape].spacing(edge)
			);
			var edgeStart = $$.math.shortenIntersection(
				intersect, 
				cp,
				CanvasRenderer.arrowShapes[srcArShape].gap(edge)
			);
		
			rs.startX = edgeStart[0];
			rs.startY = edgeStart[1];
			
			rs.arrowStartX = arrowStart[0];
			rs.arrowStartY = arrowStart[1];
			
			// if( isNaN(rs.startX) || isNaN(rs.startY) ){
			// 	debugger;
			// }

		} else if (rs.isArcEdge) {
			return;
		}
	}

	// Draw node
	CanvasRenderer.prototype.drawNode = function(context, node, drawOverlayInstead) {
		
		var nodeWidth, nodeHeight;
		
		if ( !node.visible() ) {
			return;
		}

		var parentOpacity = node.effectiveOpacity();
		if( parentOpacity === 0 ){ return; }

		// context.fillStyle = "orange";
		// context.fillRect(node.position().x, node.position().y, 2, 2);
		
		nodeWidth = this.getNodeWidth(node);
		nodeHeight = this.getNodeHeight(node);
		
		context.lineWidth = node._private.style["border-width"].pxValue;

		if( drawOverlayInstead === undefined || !drawOverlayInstead ){

			// Node color & opacity
			context.fillStyle = "rgba(" 
				+ node._private.style["background-color"].value[0] + ","
				+ node._private.style["background-color"].value[1] + ","
				+ node._private.style["background-color"].value[2] + ","
				+ (node._private.style["background-opacity"].value 
				* node._private.style["opacity"].value * parentOpacity) + ")";
			
			// Node border color & opacity
			context.strokeStyle = "rgba(" 
				+ node._private.style["border-color"].value[0] + ","
				+ node._private.style["border-color"].value[1] + ","
				+ node._private.style["border-color"].value[2] + ","
				+ (node._private.style["border-opacity"].value * node._private.style["opacity"].value * parentOpacity) + ")";
			
			context.lineJoin = 'miter'; // so borders are square with the node shape
			
			//var image = this.getCachedImage("url");
			
			var url = node._private.style["background-image"].value[2] ||
				node._private.style["background-image"].value[1];
			
			if (url != undefined) {
				
				var r = this;
				var image = this.getCachedImage(url,
						
						function() {
							
//							console.log(e);
							r.data.canvasNeedsRedraw[CanvasRenderer.NODE] = true;
							r.data.canvasNeedsRedraw[CanvasRenderer.DRAG] = true;
							
							// Replace Image object with Canvas to solve zooming too far
							// into image graphical errors (Jan 10 2013)
							r.swapCachedImage(url);
							
							r.redraw();
						}
				);
				
				if (image.complete == false) {

					drawPathSelection(r,context, node);
					
					context.stroke();
					context.fillStyle = "#555555";
					context.fill();
					
				} else {
					//context.clip
					this.drawInscribedImage(context, image, node);
				}
				
			} else {

				// Draw node
				drawSelection(this,context, node);
			}
			
			this.drawPie(context, node);

			// Border width, draw border
			if (node._private.style["border-width"].pxValue > 0) {
				drawPathSelection(this,context, node);

				context.stroke();
			}

		// draw the overlay
		} else {

			var overlayPadding = node._private.style["overlay-padding"].pxValue;
			var overlayOpacity = node._private.style["overlay-opacity"].value;
			var overlayColor = node._private.style["overlay-color"].value;
			if( overlayOpacity > 0 ){
				context.fillStyle = "rgba( " + overlayColor[0] + ", " + overlayColor[1] + ", " + overlayColor[2] + ", " + overlayOpacity + " )";

				CanvasRenderer.nodeShapes['roundrectangle'].draw(
					context,
					node._private.position.x,
					node._private.position.y,
					nodeWidth + overlayPadding * 2,
					nodeHeight + overlayPadding * 2
				);
			}
		}

	};

	// Round rectangle drawing
	CanvasRenderer.prototype.drawRoundRectanglePath = function(
		context, x, y, width, height, radius) {
		
		var halfWidth = width / 2;
		var halfHeight = height / 2;
		//var cornerRadius = $$.math.getRoundRectangleRadius(width, height);
		var cornerRadius = radius;
		context.translate(x, y);
		
		context.beginPath();
		
		// Start at top middle
		context.moveTo(0, -halfHeight);
		// Arc from middle top to right side
		context.arcTo(halfWidth, -halfHeight, halfWidth, 0, cornerRadius);
		// Arc from right side to bottom
		context.arcTo(halfWidth, halfHeight, 0, halfHeight, cornerRadius);
		// Arc from bottom to left side
		context.arcTo(-halfWidth, halfHeight, -halfWidth, 0, cornerRadius);
		// Arc from left side to topBorder
		context.arcTo(-halfWidth, -halfHeight, 0, -halfHeight, cornerRadius);
		// Join line
		context.lineTo(0, -halfHeight);
		
		context.closePath();
		
		context.translate(-x, -y);
	}

	// Draw text
	CanvasRenderer.prototype.drawSbgnText = function(context, node, label, textX, textY) {	

		var parentOpacity = 1;
		var parents = node.parents();
		for( var i = 0; i < parents.length; i++ ){
			var parent = parents[i];
			var opacity = parent._private.style.opacity.value;

			parentOpacity = opacity * parentOpacity;

			if( opacity === 0 ){
				return;
			}
		}

		// Font style
		var labelStyle = node._private.style["font-style"].strValue;
		var labelSize = node._private.style["font-size"].value + "px";
		var labelFamily = node._private.style["font-family"].strValue;
		var labelVariant = node._private.style["font-variant"].strValue;
		var labelWeight = node._private.style["font-weight"].strValue;
		
		context.font = labelStyle + " " + labelWeight + " "
			+ labelSize + " " + labelFamily;
		
		var text = label;
		var textTransform = node._private.style["text-transform"].value;
		
		if (textTransform == "none") {
		} else if (textTransform == "uppercase") {
			text = text.toUpperCase();
		} else if (textTransform == "lowercase") {
			text = text.toLowerCase();
		}
		
		// Calculate text draw position based on text alignment
		
		// so text outlines aren't jagged
		context.lineJoin = 'round';

		context.fillStyle = "rgba(" 
			+ node._private.style["color"].value[0] + ","
			+ node._private.style["color"].value[1] + ","
			+ node._private.style["color"].value[2] + ","
			+ (node._private.style["text-opacity"].value
			* node._private.style["opacity"].value * parentOpacity) + ")";
		
		context.strokeStyle = "rgba(" 
			+ node._private.style["text-outline-color"].value[0] + ","
			+ node._private.style["text-outline-color"].value[1] + ","
			+ node._private.style["text-outline-color"].value[2] + ","
			+ (node._private.style["text-opacity"].value
			* node._private.style["opacity"].value * parentOpacity) + ")";
		
		if (text != undefined) {
			var lineWidth = 2  * node._private.style["text-outline-width"].value; // *2 b/c the stroke is drawn centred on the middle
			if (lineWidth > 0) {
				context.lineWidth = lineWidth;
				context.strokeText(text, textX, textY);
			}

			// Thanks sysord@github for the isNaN checks!
			if (isNaN(textX)) { textX = 0; }
			if (isNaN(textY)) { textY = 0; }

			context.fillText("" + text, textX, textY);

			// record the text's width for use in bounding box calc
			node._private.rstyle.labelWidth = context.measureText( text ).width;
		}
	};

	CanvasRenderer.prototype.getNodeShape = function(node)
	{
		// TODO only allow rectangle for a compound node?
//		if (node._private.style["width"].value == "auto" ||
//		    node._private.style["height"].value == "auto")
//		{
//			return "rectangle";
//		}

		var shape = node._private.style["shape"].value;

		return shape;
	};



	////////////////////////////////////////////////////
	///////////////////custom shapes////////////////////
	////////////////////////////////////////////////////

	nodeShapes["macromolecule"] = {
		points: $$.math.generateUnitNgonPoints(4, 0),
		//padding:20,
		
		draw: function(context, node) {
			//node._private.position.x = node._private.data.sbgnbbox.x;
			//node._private.position.y = node._private.data.sbgnbbox.y;
			node._private.style["font-size"].value = 9;

			node._private.style["width"].value = node._private.data.sbgnbbox.w;
			node._private.style["width"].pxValue = node._private.data.sbgnbbox.w;
			node._private.style["width"].strValue = node._private.data.sbgnbbox.w + "px";

			node._private.style["height"].value = node._private.data.sbgnbbox.h;
			node._private.style["height"].pxValue = node._private.data.sbgnbbox.h;
			node._private.style["height"].strValue = node._private.data.sbgnbbox.h + "px";

			var width = node._private.data.sbgnbbox.w;
			var height = node._private.data.sbgnbbox.h;
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;

			var label = node._private.data.sbgnlabel;
			node._private.style["content"].value = label;

			renderer.drawRoundRectangle(context,
				centerX, centerY,
				width, height,
				5);

			//renderer.drawSbgnText(context, node, label, centerX, centerY);
			//renderer.drawText(context, node, centerX, centerY);
			context.stroke();
			context.fillStyle = "#ffffff";

			var stateCount = 0, infoCount = 0;

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateCenterX = state.bbox.x + centerX;
				var stateCenterY = state.bbox.y + centerY;
				var stateLabel = state.state.value;

				if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
					context.beginPath();
					context.translate(stateCenterX, stateCenterY);
					context.scale(stateWidth / 2, stateHeight / 2);
					context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
					context.closePath();

					context.scale(2/stateWidth, 2/stateHeight);
					context.translate(-stateCenterX, -stateCenterY);
					context.fill();

					context.fillStyle = "#000000";
					renderer.drawSbgnText(context, node, stateLabel, stateCenterX, stateCenterY);
					//renderer.drawText(context, node, centerX, centerY);
					context.fillStyle = "#ffffff";


					stateCount++;

				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectangle(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);

					context.fillStyle = "#000000";
					renderer.drawSbgnText(context, node, stateLabel, stateCenterX, stateCenterY);
					context.fillStyle = "#ffffff";


					infoCount++;
				}
				context.stroke();
			}
		},
		
		drawPath: function(context, node) {
			//node._private.position.x = node._private.data.sbgnbbox.x;
			//node._private.position.y = node._private.data.sbgnbbox.y;
			//node._private.style["font-size"].value = 9;

			var width = node._private.data.sbgnbbox.w;
			var height = node._private.data.sbgnbbox.h;
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;

			renderer.drawRoundRectanglePath(context,
				centerX, centerY,
				width, height,
				5);

			var stateCount = 0, infoCount = 0;
			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateCenterX = state.bbox.x + centerX;
				var stateCenterY = state.bbox.y + centerY;

				if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
					context.beginPath();
					context.translate(stateCenterX, stateCenterY);
					context.scale(stateWidth / 2, stateHeight / 2);
					context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
					context.closePath();

					context.scale(2/stateWidth, 2/stateHeight);
					context.translate(-stateCenterX, -stateCenterY);
					//context.fill();

					stateCount++;

				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectanglePath(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);

					infoCount++;
				}
				//context.stroke();
			}
		},
		
		intersectLine: function(node, x, y) {

			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node._private.data.sbgnbbox.w;
			var height = node._private.data.sbgnbbox.h;
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.roundRectangleIntersectLine(
					x, y,
					nodeX,
					nodeY,
					width, height,
					padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {

			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node._private.data.sbgnbbox.w;
			var height = node._private.data.sbgnbbox.h;
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.roundRectangleIntersectBox(
				x1, y1, x2, y2, 
				width, height, nodeX, nodeY, padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node._private.data.sbgnbbox.w + threshold;
			var height = node._private.data.sbgnbbox.h + threshold;
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.checkInBoundingBox(
				x, y, nodeShapes["macromolecule"].points, 
					padding, width, height, nodeX, nodeY);
		},

		// Looks like the width passed into this function is actually the total width / 2
		checkPoint: function(x, y, node, threshold) {

			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node._private.data.sbgnbbox.w + threshold;
			var height = node._private.data.sbgnbbox.h + threshold;
			var padding = node._private.style["border-width"].value / 2;

			var cornerRadius = $$.math.getRoundRectangleRadius(width, height);

			// Check hBox
			if ($$.math.pointInsidePolygon(x, y, nodeShapes["roundrectangle"].points,
				centerX, centerY, width, height - 2 * cornerRadius, [0, -1], padding)) {
				return true;
			}

			// Check vBox
			if ($$.math.pointInsidePolygon(x, y, nodeShapes["roundrectangle"].points,
				centerX, centerY, width - 2 * cornerRadius, height, [0, -1], padding)) {
				return true;
			}

			var checkInEllipse = function(x, y, centerX, centerY, width, height, padding) {
				x -= centerX;
				y -= centerY;

				x /= (width / 2 + padding);
				y /= (height / 2 + padding);

				return (Math.pow(x, 2) + Math.pow(y, 2) <= 1);
			}


			// Check top left quarter circle
			if (checkInEllipse(x, y,
				centerX - width / 2 + cornerRadius,
				centerY - height / 2 + cornerRadius,
				cornerRadius * 2, cornerRadius * 2, padding)) {

				return true;
			}

			// Check top right quarter circle
			if (checkInEllipse(x, y,
				centerX + width / 2 - cornerRadius,
				centerY - height / 2 + cornerRadius,
				cornerRadius * 2, cornerRadius * 2, padding)) {

				return true;
			}

			// Check bottom right quarter circle
			if (checkInEllipse(x, y,
				centerX + width / 2 - cornerRadius,
				centerY + height / 2 - cornerRadius,
				cornerRadius * 2, cornerRadius * 2, padding)) {

				return true;
			}

			// Check bottom left quarter circle
			if (checkInEllipse(x, y,
				centerX - width / 2 + cornerRadius,
				centerY + height / 2 - cornerRadius,
				cornerRadius * 2, cornerRadius * 2, padding)) {

				return true;
			}

			return false;
			
		}
	}

	nodeShapes["process"] = {
		points: $$.math.generateUnitNgonPoints(4, 0),

		draw: function(context, node) {
			node._private.style["font-size"].value = 11;

			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;

			renderer.drawPolygon(context,
				centerX, centerY,
				width, height,
				nodeShapes["process"].points);
		},

		drawPath: function(context, node) {
			node._private.style["font-size"].value = 11;

			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height,
				nodeShapes["process"].points);
		},

		intersectLine: function(node, x, y) {

			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes["process"].points,
					nodeX,
					nodeY,
					width, height,
					padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var points = nodeShapes["process"].points;
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.boxIntersectPolygon(x1, y1, x2, y2, 
				points, width, height, nodeX, nodeY, [0, -1], padding);
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.checkInBoundingBox(
				x, y, nodeShapes["process"].points, 
					padding, width, height, centerX, centerY);
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes["process"].points,
				centerX, centerY, width, height, [0, -1], padding);
		}
	}

	nodeShapes["compartment"] = nodeShapes["process"];


	nodeShapes["complex"] = {
		points: $$.math.generateUnitNgonPoints(8, 0),

		draw: function(context, node) {
			node._private.style["font-size"].value = 9;

			node._private.style["width"].value = node._private.data.sbgnbbox.w;
			node._private.style["width"].pxValue = node._private.data.sbgnbbox.w;
			node._private.style["width"].strValue = node._private.data.sbgnbbox.w + "px";

			node._private.style["height"].value = node._private.data.sbgnbbox.h;
			node._private.style["height"].pxValue = node._private.data.sbgnbbox.h;
			node._private.style["height"].strValue = node._private.data.sbgnbbox.h + "px";

			//var width = node._private.data.sbgnbbox.w;
			//var height = node._private.data.sbgnbbox.h;
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;

			nodeShapes["complex"].points[0] = -0.75;
			nodeShapes["complex"].points[1] = -1;

			nodeShapes["complex"].points[2] = -1;
			nodeShapes["complex"].points[3] = -0.75;

			nodeShapes["complex"].points[4] = -1;
			nodeShapes["complex"].points[5] = 0.75;

			nodeShapes["complex"].points[6] = -0.75;
			nodeShapes["complex"].points[7] = 1;

			nodeShapes["complex"].points[8] = 0.75;
			nodeShapes["complex"].points[9] = 1;

			nodeShapes["complex"].points[10] = 1;
			nodeShapes["complex"].points[11] = 0.75;

			nodeShapes["complex"].points[12] = 1;
			nodeShapes["complex"].points[13] = -0.75;

			nodeShapes["complex"].points[14] = 0.75;
			nodeShapes["complex"].points[15] = -1;
			
			renderer.drawPolygon(context,
				centerX, centerY,
				width, height, nodeShapes["complex"].points);
/*
			context.stroke();
			context.fillStyle = "#ffffff";

			var stateCount = 0, infoCount = 0;

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateCenterX = state.bbox.x + centerX;
				var stateCenterY = state.bbox.y + centerY;
				var stateLabel = state.state.value;

				if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
					context.beginPath();
					context.translate(stateCenterX, stateCenterY);
					context.scale(stateWidth / 2, stateHeight / 2);
					context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
					context.closePath();

					context.scale(2/stateWidth, 2/stateHeight);
					context.translate(-stateCenterX, -stateCenterY);
					context.fill();

					context.fillStyle = "#000000";
					renderer.drawSbgnText(context, node, stateLabel, stateCenterX, stateCenterY);
					//renderer.drawText(context, node, centerX, centerY);
					context.fillStyle = "#ffffff";


					stateCount++;

				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectangle(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);

					context.fillStyle = "#000000";
					renderer.drawSbgnText(context, node, stateLabel, stateCenterX, stateCenterY);
					context.fillStyle = "#ffffff";


					infoCount++;
				}
				context.stroke();
			}
*/
		},

		drawPath: function(context, node) {
			
			//var width = node._private.data.sbgnbbox.w;
			//var height = node._private.data.sbgnbbox.h;
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;
			
			nodeShapes["complex"].points[0] = -0.75;
			nodeShapes["complex"].points[1] = -1;

			nodeShapes["complex"].points[2] = -1;
			nodeShapes["complex"].points[3] = -0.75;

			nodeShapes["complex"].points[4] = -1;
			nodeShapes["complex"].points[5] = 0.75;

			nodeShapes["complex"].points[6] = -0.75;
			nodeShapes["complex"].points[7] = 1;

			nodeShapes["complex"].points[8] = 0.75;
			nodeShapes["complex"].points[9] = 1;

			nodeShapes["complex"].points[10] = 1;
			nodeShapes["complex"].points[11] = 0.75;

			nodeShapes["complex"].points[12] = 1;
			nodeShapes["complex"].points[13] = -0.75;

			nodeShapes["complex"].points[14] = 0.75;
			nodeShapes["complex"].points[15] = -1;
			
			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height, nodeShapes["complex"].points);
/*
			var stateCount = 0, infoCount = 0;

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateCenterX = state.bbox.x + centerX;
				var stateCenterY = state.bbox.y + centerY;

				if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
					context.beginPath();
					context.translate(stateCenterX, stateCenterY);
					context.scale(stateWidth / 2, stateHeight / 2);
					context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
					context.closePath();

					context.scale(2/stateWidth, 2/stateHeight);
					context.translate(-stateCenterX, -stateCenterY);
					//context.fill();

					stateCount++;

				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectanglePath(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);

					infoCount++;
				}
				//context.stroke();
			}
*/
		},

		intersectLine: function(node, x, y) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes["complex"].points,
					nodeX,
					nodeY,
					width, height,
					padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			var points = nodeShapes["complex"].points;

			return $$.math.boxIntersectPolygon(
				x1, y1, x2, y2,
				points, width, height, centerX, centerY, [0, -1], padding);
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			// This check is OK because it assumes the round rectangle
			// has sharp edges for the rough check 
			return $$.math.checkInBoundingBox(
				x, y, nodeShapes["complex"].points, 
					padding, width, height, centerX, centerY);
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes["complex"].points,
				centerX, centerY, width, height, [0, -1], padding);
		}
	};


})( cytoscape );
