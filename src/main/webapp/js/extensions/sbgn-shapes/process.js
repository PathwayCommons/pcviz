;(function($$){"use strict";
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("process");
	
	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes["process"] = {
		points: $$.math.generateUnitNgonPoints(4, 0),

		draw: function(context, node) {
			node._private.style["font-size"].value = 11;

			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
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
	
})( cytoscape );