;(function($$){"use strict";

	sbgnShapes["simple chemical"] = true;

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("simple chemical");

	var nodeShapes = CanvasRenderer.nodeShapes;

	function drawCircle(context, width, height, centerX, centerY){
		context.beginPath();
		context.translate(centerX, centerY);
		context.scale(width / 2, height / 2);
		// At origin, radius 1, 0 to 2pi
		context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
		context.closePath();

		context.scale(2/width, 2/height);
		context.translate(-centerX, -centerY);
	}

	nodeShapes["simple chemical"] = {
		multimerPadding:3,

		draw: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var multimerPadding = nodeShapes["simple chemical"].multimerPadding;

			if(sbgnClass.indexOf("multimer") != -1){
				//add multimer shape
				drawCircle(context, width, height, centerX + multimerPadding, 
					centerY + multimerPadding);
			}

			drawCircle(context, width, height, centerX, centerY);
			context.fill();

		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var multimerPadding = nodeShapes["simple chemical"].multimerPadding;

			if(sbgnClass.indexOf("multimer") != -1){
				//add multimer shape
				drawCircle(context, width, height, centerX + multimerPadding,
				 centerY + multimerPadding);
			
				context.stroke();
				context.fill();
			}

			drawCircle(context, width, height, centerX, centerY);

			context.stroke();
			context.fill();
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