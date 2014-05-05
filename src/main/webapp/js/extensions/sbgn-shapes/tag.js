;(function($$){"use strict";

	sbgnShapes["tag"] = true;
	
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("tag");

	var nodeShapes = CanvasRenderer.nodeShapes;

	var tagPoints = new Array(-1, -1, 1/3, -1, 1, 0, 1/3, 1, -1, 1);

	nodeShapes["tag"] = {
		points: tagPoints,

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;

			renderer.drawPolygon(context,
				centerX, centerY,
				width, height,
				nodeShapes["tag"].points);
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
				nodeShapes["tag"].points);

			context.stroke();

			var nodeProp = {'label':label, 'centerX':centerX - width/6, 'centerY':centerY,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, nodeProp);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return renderer.polygonIntersectLine(
				x, y,
				nodeShapes["tag"].points,
				centerX,
				centerY,
				width / 2, height / 2,
				padding);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var points = nodeShapes["tag"].points;
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
				x, y, nodeShapes["tag"].points, 
					padding, width, height, centerX, centerY);
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes["tag"].points,
				centerX, centerY, width, height, [0, -1], padding);

		}
	}
})( cytoscape );