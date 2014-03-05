;(function($$){"use strict";

	sbgnShapes["dissociation"] = true;

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("dissociation");
	
	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes["dissociation"] = {

		draw: function(context, node) {
			nodeShapes["dissociation"].drawPath(context, node);
			context.fill();
		},

		drawPath: function(context, node) {

			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();

			context.beginPath();
			context.translate(centerX, centerY);
			context.scale(width / 4, height / 4);
			
			// At origin, radius 1, 0 to 2pi
			context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
			
			context.closePath();
			context.scale(4/width, 4/height);
			context.translate(-centerX, -centerY);

			drawEllipsePath(context, centerX, centerY, width/2, height/2);

			context.stroke();

			drawEllipsePath(context, centerX, centerY, width, height);

		},

		intersectLine: function(node, x, y) {

			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return $$.math.intersectLineEllipse(
				x, y,
				nodeX,
				nodeY,
				width / 2 + padding,
				height / 2 + padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return $$.math.boxIntersectEllipse(
				x1, y1, x2, y2, padding, width, height, centerX, centerY);

		},

		checkPointRough: function(x, y, node, threshold) {
			return true;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			x -= centerX;
			y -= centerY;

			x /= (width / 2 + padding);
			y /= (height / 2 + padding);

			return (Math.pow(x, 2) + Math.pow(y, 2) <= 1);
		}
	}
	
})( cytoscape );