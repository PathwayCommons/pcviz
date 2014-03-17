;(function($$){"use strict";
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("complex");
	sbgnShapes["complex"] = true;

	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes["complex"] = {
		points: new Array(),
		multimerPadding:3,
		cornerLength:12,
		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;
			var cornerLength = nodeShapes["complex"].cornerLength;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			nodeShapes["complex"].points = $$.sbgn.generateComplexShapePoints(cornerLength, 
				width, height);

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawPolygonPath(context,
					centerX + multimerPadding, centerY + multimerPadding,
					width, height, nodeShapes["complex"].points);
			}

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height, nodeShapes["complex"].points);

		},

		drawPath: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;
			var label = node._private.data.sbgnlabel;
			var cornerLength = nodeShapes["complex"].cornerLength;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			nodeShapes["complex"].points = $$.sbgn.generateComplexShapePoints(cornerLength, 
				width, height);

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawPolygon(context,
					centerX + multimerPadding, centerY + multimerPadding,
					width, height, nodeShapes["complex"].points);

				context.stroke();
			}

			renderer.drawPolygon(context,
				centerX, centerY,
				width, height, nodeShapes["complex"].points);

			context.stroke();
			
			$$.sbgn.drawComplexCloneMarker(renderer, context, centerX, centerY, 
				width, height, cornerLength, "");
			$$.sbgn.drawComplexStateAndInfo(context, stateAndInfos, centerX, centerY, width, height);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes["complex"].points,
					centerX,
					centerY,
					width/2, height/2,
					padding);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectionLines = new Array();
			if($$.sbgn.isMultimer(node)){
				multimerIntersectionLines = $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes["complex"].points,
					centerX + multimerPadding,
					centerY + multimerPadding,
					width/2, height/2,
					padding);
			}

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines, multimerIntersectionLines);

			return $$.sbgn.closestIntersectionPoint([x, y], intersections);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			var points = nodeShapes["complex"].points;

			var nodeIntersectBox = $$.math.boxIntersectPolygon(
				x1, y1, x2, y2,
				points, width, height, centerX, centerY, [0, -1], padding);

			var stateAndInfoIntersectBox = $$.sbgn.intersectBoxStateAndInfoBoxes(
				x1, y1, x2, y2, node);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectBox = false;
			if($$.sbgn.isMultimer(node)){
				multimerIntersectBox = $$.math.boxIntersectPolygon(
				x1, y1, x2, y2, points, width, height, 
				centerX + multimerPadding, centerY + multimerPadding, 
				[0, -1], padding);
			}

			return nodeIntersectBox || stateAndInfoIntersectBox || multimerIntersectBox;
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			var nodeCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes["complex"].points, 
					padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPointRough = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPointRough = $$.math.checkInBoundingBox(
					x, y, nodeShapes["complex"].points, 
					padding, width, height, 
					centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPointRough || stateAndInfoCheckPointRough || multimerCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].pxValue / 2;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			var nodeCheckPoint =  $$.math.pointInsidePolygon(x, y, nodeShapes["complex"].points,
				centerX, centerY, width, height, [0, -1], padding);

			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPoint = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPoint = $$.math.pointInsidePolygon(x, y, 
					nodeShapes["complex"].points,
					centerX + multimerPadding, centerY + multimerPadding, 
					width, height, [0, -1], padding);

			}

			return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
		}
	};
	
})( cytoscape );