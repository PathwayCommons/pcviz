;(function($$){"use strict";

	sbgnShapes["perturbing agent"] = true;
	
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("perturbing agent");

	var nodeShapes = CanvasRenderer.nodeShapes;

	var perAgPoints = new Array(-2/3, 0, -1, 1, 1, 1, 2/3, 0, 
		1, -1, -1, -1);

	nodeShapes["perturbing agent"] = {
		points: perAgPoints,

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var label = node._private.data.sbgnlabel;

			renderer.drawPolygon(context,
				centerX, centerY,
				width, height,
				nodeShapes["perturbing agent"].points);

			//drawStateAndInfos(node, context, centerX, centerY);
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var cloneMarker = node._private.data.sbgnclonemarker;

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height,
				nodeShapes["perturbing agent"].points);

			context.fill();

			context.stroke();

			$$.sbgn.drawPerturbingAgentCloneMarker(renderer, context, centerX, centerY, 
				width, height, cloneMarker);

			var nodeProp = {'label':label, 'centerX':centerX, 'centerY':centerY-2,
				'opacity':node._private.style['text-opacity'].value};
			$$.sbgn.drawLabelText(context, nodeProp);
			
			$$.sbgn.drawPathStateAndInfos(renderer, node, context, centerX, centerY);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = renderer.polygonIntersectLine(
				x, y,
				nodeShapes["perturbing agent"].points,
				centerX,
				centerY,
				width / 2, height / 2,
				padding);

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines);

			return $$.sbgn.closestIntersectionPoint([x, y], intersections);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var points = nodeShapes["perturbing agent"].points;
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			var nodeIntersectBox = renderer.boxIntersectPolygon(x1, y1, x2, y2,
					points, width, height, centerX, centerY, [0, -1], padding);

			var stateAndInfoIntersectBox = $$.sbgn.intersectBoxStateAndInfoBoxes(
				x1, y1, x2, y2, node);

			return nodeIntersectBox || stateAndInfoIntersectBox;

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			var nodeCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes["perturbing agent"].points, 
					padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			return nodeCheckPointRough || stateAndInfoCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			var nodeCheckPoint = $$.math.pointInsidePolygon(x, y, 
				nodeShapes["perturbing agent"].points,
				centerX, centerY, width, height, [0, -1], padding);

			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			return nodeCheckPoint || stateAndInfoCheckPoint;

		}
	}
})( cytoscape );