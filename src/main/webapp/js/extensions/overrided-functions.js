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

	function intersectLineSelection(render, node, x, y){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectLine(
				node,
				x, //halfPointX,
				y //halfPointY
			);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectLine(
				node._private.position.x,
				node._private.position.y,
				render.getNodeWidth(node),
				render.getNodeHeight(node),
				x, //halfPointX,
				y, //halfPointY
				node._private.style["border-width"].pxValue / 2
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
				node._private.style["border-width"].pxValue / 2,
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
				node._private.style["border-width"].pxValue / 2,
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
				node._private.style["border-width"].pxValue / 2);
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
		var data = this.data; 
		var nodes = this.getCachedNodes(); 
		var edges = this.getCachedEdges(); 
		var box = [];
		
		var x1c = Math.min(x1, x2); 
		var x2c = Math.max(x1, x2); 
		var y1c = Math.min(y1, y2); 
		var y2c = Math.max(y1, y2); 
		x1 = x1c; 
		x2 = x2c; 
		y1 = y1c; 
		y2 = y2c; 
		var heur;
		
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

	// Find nearest element
	CanvasRenderer.prototype.findNearestElement = function(x, y, visibleElementsOnly) {
		var data = this.data; 
		var nodes = this.getCachedNodes(); 
		var edges = this.getCachedEdges(); 
		var near = [];
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

			intersect = intersectLineSelection(this, target, cp[0], cp[1]);
			
			var arrowEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].spacing(edge));
			var edgeEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].gap(edge));
			
			rs.endX = edgeEnd[0];
			rs.endY = edgeEnd[1];
			
			rs.arrowEndX = arrowEnd[0];
			rs.arrowEndY = arrowEnd[1];
			
			var cp = [rs.cp2ax, rs.cp2ay];

			intersect = intersectLineSelection(this, source, cp[0], cp[1]);
			
			var arrowStart = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[srcArShape].spacing(edge));
			var edgeStart = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[srcArShape].gap(edge));
			
			rs.startX = edgeStart[0];
			rs.startY = edgeStart[1];


			rs.arrowStartX = arrowStart[0];
			rs.arrowStartY = arrowStart[1];
			
		} else if (rs.edgeType == "straight") {

			intersect = intersectLineSelection(this, target, source.position().x, source.position().y);

				
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

			intersect = intersectLineSelection(this,source, target.position().x, target.position().y);


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

			intersect = intersectLineSelection(this, target, cp[0], cp[1]);
			
			var arrowEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].spacing(edge));
			var edgeEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].gap(edge));
			
			rs.endX = edgeEnd[0];
			rs.endY = edgeEnd[1];
			
			rs.arrowEndX = arrowEnd[0];
			rs.arrowEndY = arrowEnd[1];
			
			intersect = intersectLineSelection(this, source, cp[0], cp[1]);
			
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
/*
				CanvasRenderer.nodeShapes['roundrectangle'].draw(
					context,
					node._private.position.x,
					node._private.position.y,
					nodeWidth + overlayPadding * 2,
					nodeHeight + overlayPadding * 2
				);
*/
				// Draw node
				drawSelection(this, context, node);
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

		// Find edge control points
	CanvasRenderer.prototype.findEdgeControlPoints = function(edges) {
		var hashTable = {}; var cy = this.data.cy;
		var pairIds = [];
		
		// create a table of edge (src, tgt) => list of edges between them
		var pairId;
		for (var i = 0; i < edges.length; i++){
			var edge = edges[i];

			// ignore edges who are not to be displayed
			// they shouldn't take up space
			if( edge._private.style.display.value === 'none' ){
				continue;
			}

			var srcId = edge._private.data.source;
			var tgtId = edge._private.data.target;

			pairId = srcId > tgtId ?
				tgtId + '-' + srcId :
				srcId + '-' + tgtId ;

			if (hashTable[pairId] == undefined) {
				hashTable[pairId] = [];
			}
			
			hashTable[pairId].push( edge );
			pairIds.push( pairId );
		}

		var src, tgt, srcPos, tgtPos, srcW, srcH, tgtW, tgtH, srcShape, tgtShape, srcBorder, tgtBorder;
		var midpt;
		var vectorNormInverse;
		var badBezier;
		
		// for each pair (src, tgt), create the ctrl pts
		// Nested for loop is OK; total number of iterations for both loops = edgeCount	
		for (var p = 0; p < pairIds.length; p++) {
			pairId = pairIds[p];
		
			src = cy.getElementById( hashTable[pairId][0]._private.data.source );
			tgt = cy.getElementById( hashTable[pairId][0]._private.data.target );

			srcPos = src._private.position;
			tgtPos = tgt._private.position;

			srcW = this.getNodeWidth(src);
			srcH = this.getNodeHeight(src);

			tgtW = this.getNodeWidth(tgt);
			tgtH = this.getNodeHeight(tgt);

			srcShape = CanvasRenderer.nodeShapes[ this.getNodeShape(src) ];
			tgtShape = CanvasRenderer.nodeShapes[ this.getNodeShape(tgt) ];

			srcBorder = src._private.style["border-width"].pxValue;
			tgtBorder = tgt._private.style["border-width"].pxValue;

			badBezier = false;
			

			if (hashTable[pairId].length > 1) {

				// pt outside src shape to calc distance/displacement from src to tgt
				/*
				var srcOutside = srcShape.intersectLine(
					srcPos.x,
					srcPos.y,
					srcW,
					srcH,
					tgtPos.x,
					tgtPos.y,
					srcBorder / 2
				);
				*/
				var srcOutside = intersectLineSelection(this, src, tgtPos.x, tgtPos.y);

				// pt outside tgt shape to calc distance/displacement from src to tgt
				/*
				var tgtOutside = tgtShape.intersectLine(
					tgtPos.x,
					tgtPos.y,
					tgtW,
					tgtH,
					srcPos.x,
					srcPos.y,
					tgtBorder / 2
				);
				*/
				var tgtOutside = intersectLineSelection(this, tgt, srcPos.x, srcPos.y);

				var midpt = {
					x: ( srcOutside[0] + tgtOutside[0] )/2,
					y: ( srcOutside[1] + tgtOutside[1] )/2
				};

				var dy = ( tgtOutside[1] - srcOutside[1] );
				var dx = ( tgtOutside[0] - srcOutside[0] );
				var l = Math.sqrt( dx*dx + dy*dy );

				var vector = {
					x: dx,
					y: dy
				};
				
				var vectorNorm = {
					x: vector.x/l,
					y: vector.y/l
				};
				vectorNormInverse = {
					x: -vectorNorm.y,
					y: vectorNorm.x
				};

				// if src intersection is inside tgt or tgt intersection is inside src, then no ctrl pts to draw
				if( checkPointSelection(this, tgt, srcOutside[0], srcOutside[1], tgtBorder/2) ||
					checkPointSelection(this, src, tgtOutside[0], tgtOutside[1], srcBorder/2)
					/* tgtShape.checkPoint( srcOutside[0], srcOutside[1], tgtBorder/2, tgtW, tgtH, tgtPos.x, tgtPos.y )  ||
					srcShape.checkPoint( tgtOutside[0], tgtOutside[1], srcBorder/2, srcW, srcH, srcPos.x, srcPos.y ) */ 
				){
					vectorNormInverse = {};
					badBezier = true;
				}
				
			}
			
			var edge;
			var rs;
			
			for (var i = 0; i < hashTable[pairId].length; i++) {
				edge = hashTable[pairId][i];
				rs = edge._private.rscratch;
				
				var edgeIndex1 = rs.lastEdgeIndex;
				var edgeIndex2 = i;

				var numEdges1 = rs.lastNumEdges;
				var numEdges2 = hashTable[pairId].length;

				var srcX1 = rs.lastSrcCtlPtX;
				var srcX2 = srcPos.x;
				var srcY1 = rs.lastSrcCtlPtY;
				var srcY2 = srcPos.y;
				var srcW1 = rs.lastSrcCtlPtW;
				var srcW2 = src.outerWidth();
				var srcH1 = rs.lastSrcCtlPtH;
				var srcH2 = src.outerHeight();

				var tgtX1 = rs.lastTgtCtlPtX;
				var tgtX2 = tgtPos.x;
				var tgtY1 = rs.lastTgtCtlPtY;
				var tgtY2 = tgtPos.y;
				var tgtW1 = rs.lastTgtCtlPtW;
				var tgtW2 = tgt.outerWidth();
				var tgtH1 = rs.lastTgtCtlPtH;
				var tgtH2 = tgt.outerHeight();

				if( badBezier ){
					rs.badBezier = true;
				} else {
					rs.badBezier = false;
				}

				if( srcX1 === srcX2 && srcY1 === srcY2 && srcW1 === srcW2 && srcH1 === srcH2
				&&  tgtX1 === tgtX2 && tgtY1 === tgtY2 && tgtW1 === tgtW2 && tgtH1 === tgtH2
				&&  edgeIndex1 === edgeIndex2 && numEdges1 === numEdges2 ){
					// console.log('edge ctrl pt cache HIT')
					continue; // then the control points haven't changed and we can skip calculating them
				} else {
					rs.lastSrcCtlPtX = srcX2;
					rs.lastSrcCtlPtY = srcY2;
					rs.lastSrcCtlPtW = srcW2;
					rs.lastSrcCtlPtH = srcH2;
					rs.lastTgtCtlPtX = tgtX2;
					rs.lastTgtCtlPtY = tgtY2;
					rs.lastTgtCtlPtW = tgtW2;
					rs.lastTgtCtlPtH = tgtH2;
					rs.lastEdgeIndex = edgeIndex2;
					rs.lastNumEdges = numEdges2;
					// console.log('edge ctrl pt cache MISS')
				}

				var stepSize = edge._private.style["control-point-step-size"].value;

				// Self-edge
				if ( src.id() == tgt.id() ) {
						
					rs.edgeType = "self";
					
					// New -- fix for large nodes
					rs.cp2ax = srcPos.x;
					rs.cp2ay = srcPos.y - (1 + Math.pow(srcH, 1.12) / 100) * stepSize * (i / 3 + 1);
					
					rs.cp2cx = src._private.position.x - (1 + Math.pow(srcW, 1.12) / 100) * stepSize * (i / 3 + 1);
					rs.cp2cy = srcPos.y;
					
					rs.selfEdgeMidX = (rs.cp2ax + rs.cp2cx) / 2.0;
					rs.selfEdgeMidY = (rs.cp2ay + rs.cp2cy) / 2.0;
					
				// Straight edge
				} else if (hashTable[pairId].length % 2 == 1
					&& i == Math.floor(hashTable[pairId].length / 2)) {
					
					rs.edgeType = "straight";
					
				// Bezier edge
				} else {
					var distanceFromMidpoint = (0.5 - hashTable[pairId].length / 2 + i) * stepSize;
					
					rs.edgeType = "bezier";
					
					rs.cp2x = midpt.x + vectorNormInverse.x * distanceFromMidpoint;
					rs.cp2y = midpt.y + vectorNormInverse.y * distanceFromMidpoint;
					
					// console.log(edge, midPointX, displacementX, distanceFromMidpoint);
				}

				// find endpts for edge
				this.findEndpoints( edge );

				var badStart = !$$.is.number( rs.startX ) || !$$.is.number( rs.startY );
				var badAStart = !$$.is.number( rs.arrowStartX ) || !$$.is.number( rs.arrowStartY );
				var badEnd = !$$.is.number( rs.endX ) || !$$.is.number( rs.endY );
				var badAEnd = !$$.is.number( rs.arrowEndX ) || !$$.is.number( rs.arrowEndY );

				var minCpADistFactor = 3;
				var arrowW = this.getArrowWidth( edge._private.style['width'].pxValue ) * CanvasRenderer.arrowShapeHeight;
				var minCpADist = minCpADistFactor * arrowW;
				var startACpDist = $$.math.distance( { x: rs.cp2x, y: rs.cp2y }, { x: rs.startX, y: rs.startY } );
				var closeStartACp = startACpDist < minCpADist;
				var endACpDist = $$.math.distance( { x: rs.cp2x, y: rs.cp2y }, { x: rs.endX, y: rs.endY } );
				var closeEndACp = endACpDist < minCpADist;

				if( rs.edgeType === "bezier" ){
					var overlapping = false;

					if( badStart || badAStart || closeStartACp ){
						overlapping = true;

						// project control point along line from src centre to outside the src shape
						// (otherwise intersection will yield nothing)
						var cpD = { // delta
							x: rs.cp2x - srcPos.x,
							y: rs.cp2y - srcPos.y
						};
						var cpL = Math.sqrt( cpD.x*cpD.x + cpD.y*cpD.y ); // length of line
						var cpM = { // normalised delta
							x: cpD.x / cpL,
							y: cpD.y / cpL
						};
						var radius = Math.max(srcW, srcH);
						var cpProj = { // *2 radius guarantees outside shape
							x: rs.cp2x + cpM.x * 2 * radius,
							y: rs.cp2y + cpM.y * 2 * radius
						};
						/*
						var srcCtrlPtIntn = srcShape.intersectLine(
							srcPos.x,
							srcPos.y,
							srcW,
							srcH,
							cpProj.x,
							cpProj.y,
							srcBorder / 2
						);
						*/

						var srcCtrlPtIntn = intersectLineSelection(this, src, cpProj.x, cpProj.y);

						if( closeStartACp ){
							rs.cp2x = rs.cp2x + cpM.x * (minCpADist - startACpDist); 
							rs.cp2y = rs.cp2y + cpM.y * (minCpADist - startACpDist)
						} else {
							rs.cp2x = srcCtrlPtIntn[0] + cpM.x * minCpADist; 
							rs.cp2y = srcCtrlPtIntn[1] + cpM.y * minCpADist;
						}
					}

					if( badEnd || badAEnd || closeEndACp ){
						overlapping = true;

						// project control point along line from tgt centre to outside the tgt shape
						// (otherwise intersection will yield nothing)
						var cpD = { // delta
							x: rs.cp2x - tgtPos.x,
							y: rs.cp2y - tgtPos.y
						};
						var cpL = Math.sqrt( cpD.x*cpD.x + cpD.y*cpD.y ); // length of line
						var cpM = { // normalised delta
							x: cpD.x / cpL,
							y: cpD.y / cpL
						};
						var radius = Math.max(srcW, srcH);
						var cpProj = { // *2 radius guarantees outside shape
							x: rs.cp2x + cpM.x * 2 * radius,
							y: rs.cp2y + cpM.y * 2 * radius
						};
						/*
						var tgtCtrlPtIntn = tgtShape.intersectLine(
							tgtPos.x,
							tgtPos.y,
							tgtW,
							tgtH,
							cpProj.x,
							cpProj.y,
							tgtBorder / 2
						);
						*/
						var tgtCtrlPtIntn = intersectLineSelection(this, tgt, cpProj.x, cpProj.y);

						if( closeEndACp ){
							rs.cp2x = rs.cp2x + cpM.x * (minCpADist - endACpDist); 
							rs.cp2y = rs.cp2y + cpM.y * (minCpADist - endACpDist);
						} else {
							rs.cp2x = tgtCtrlPtIntn[0] + cpM.x * minCpADist; 
							rs.cp2y = tgtCtrlPtIntn[1] + cpM.y * minCpADist;
						}
						
					}

					if( overlapping ){
						// recalc endpts
						this.findEndpoints( edge );
					}
				}

				// project the edge into rstyle
				this.projectBezier( edge );

			}
		}
		
		return hashTable;
	}


})( cytoscape );
