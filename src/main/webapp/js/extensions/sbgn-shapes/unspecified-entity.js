;(function($$){"use strict";

	sbgnShapes["unspecified entity"] = true;

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("unspecified entity");

	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes["unspecified entity"] = {
		multimerPadding:3,

		draw: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var multimerPadding = nodeShapes["unspecified entity"].multimerPadding;
			var sbgnClass = node._private.data.sbgnclass;

			drawCirclePath(context, centerX, centerY, width, height);
			//context.fill();
			//drawStateAndInfos(node, context, centerX, centerY);

		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var multimerPadding = nodeShapes["unspecified entity"].multimerPadding;
			var sbgnClass = node._private.data.sbgnclass;
			var label = node._private.data.sbgnlabel;

			drawCircle(context, centerX, centerY, width, height);

			drawSbgnText(context, label, centerX, centerY - 2);
			drawPathStateAndInfos(renderer, node, context, centerX, centerY);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["ellipse"].intersectLine(centerX, centerY, width, 
				height, x, y, padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["ellipse"].intersectBox(x1, y1, x2, y2, width, 
				height, centerX, centerY, padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["ellipse"].checkPointRough(x, y, padding, width, height, 
				centerX, centerY);

		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["ellipse"].checkPoint(x, y, padding, width, height, 
				centerX, centerY);
		}
	}

})( cytoscape );