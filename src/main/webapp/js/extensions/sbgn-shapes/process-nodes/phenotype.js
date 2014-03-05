;(function($$){"use strict";

	sbgnShapes["phenotype"] = true;
	
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("phenotype");

	var nodeShapes = CanvasRenderer.nodeShapes;

	var perAgPoints = new Array(-1, 0, -0.5, -1, 0.5, -1, 
		1, 0, 0.5, 1, -0.5, 1);

	nodeShapes["phenotype"] = {
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
				nodeShapes["phenotype"].points);
/*
			context.font = "10px Arial";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = "#000000";
			context.fillText("" + label, centerX, centerY);
			context.fillStyle = "#ffffff";
*/
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height,
				nodeShapes["phenotype"].points);

		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return renderer.polygonIntersectLine(
				x, y,
				nodeShapes["phenotype"].points,
				centerX,
				centerY,
				width / 2, height / 2,
				padding);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var points = nodeShapes["phenotype"].points;
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return renderer.boxIntersectPolygon(x1, y1, x2, y2,
					points, width, height, centerX, centerY, [0, -1], padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;
			
			return $$.math.checkInBoundingBox(
				x, y, nodeShapes["phenotype"].points, 
					padding, width, height, centerX, centerY);
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes["phenotype"].points,
				centerX, centerY, width, height, [0, -1], padding);

		}
	}
})( cytoscape );