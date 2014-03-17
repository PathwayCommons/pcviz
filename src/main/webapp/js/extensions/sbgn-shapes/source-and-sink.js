;(function($$){"use strict";

	sbgnShapes["source and sink"] = true;

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("source and sink");

	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes["source and sink"] = {
		points: $$.math.generateUnitNgonPoints(4, 0),

		draw: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var pts = nodeShapes["source and sink"].points;

			$$.sbgn.drawCirclePath(context, centerX, centerY,
				width, height);

			context.beginPath();
			context.translate(centerX, centerY);
			context.scale(width * Math.sqrt(2) / 2, height * Math.sqrt(2) / 2);

			context.moveTo(pts[2], pts[3]);
			context.lineTo(pts[6], pts[7]);
			context.closePath();

			context.scale(2/(width * Math.sqrt(2)), 2/(height * Math.sqrt(2)));
			context.translate(-centerX, -centerY);	

		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var pts = nodeShapes["source and sink"].points;

			$$.sbgn.drawCircle(context, centerX, centerY,
				width, height);

			context.stroke();

			context.beginPath();
			context.translate(centerX, centerY);
			context.scale(width * Math.sqrt(2) / 2, height * Math.sqrt(2) / 2);

			context.moveTo(pts[2], pts[3]);
			context.lineTo(pts[6], pts[7]);
			context.closePath();

			context.scale(2/(width * Math.sqrt(2)), 2/(height * Math.sqrt(2)));
			context.translate(-centerX, -centerY);	

			context.stroke();

			$$.sbgn.drawSourceSinkCloneMarker(context, centerX, centerY, 
				width, height, "");

		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["ellipse"].intersectLine(centerX, centerY, width, 
				height, x, y, padding);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["ellipse"].intersectBox(x1, y1, x2, y2, width, height, 
				centerX, centerY, padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["ellipse"].checkPointRough(x, y, padding, width, height, 
				centerX, centerY);

		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["ellipse"].checkPoint(x, y, padding, width, 
				height, centerX, centerY)

		}
	}

})( cytoscape );