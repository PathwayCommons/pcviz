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
			var sbgnClass = node._private.data.sbgnclass;
			var cornerLength = nodeShapes["complex"].cornerLength;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			nodeShapes["complex"].points = generateComplexShapePoints(cornerLength, 
				width, height);

			//check whether sbgn class includes multimer substring or not
			if(sbgnClass.indexOf("multimer") != -1){
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
			var sbgnClass = node._private.data.sbgnclass;
			var cornerLength = nodeShapes["complex"].cornerLength;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			nodeShapes["complex"].points = generateComplexShapePoints(cornerLength, 
				width, height);

			//check whether sbgn class includes multimer substring or not
			if(sbgnClass.indexOf("multimer") != -1){
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
			
			drawComplexCloneMarker(renderer, context, centerX, centerY, 
				width, height, cornerLength, "");
			drawComplexStateAndInfo(context, stateAndInfos, centerX, centerY, width, height);
		},

		intersectLine: function(node, x, y) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			return $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes["complex"].points,
					nodeX,
					nodeY,
					width/2, height/2,
					padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			var points = nodeShapes["complex"].points;

			return $$.math.boxIntersectPolygon(
				x1, y1, x2, y2,
				points, width, height, centerX, centerY, [0, -1], padding);
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			// This check is OK because it assumes the round rectangle
			// has sharp edges for the rough check 
			return $$.math.checkInBoundingBox(
				x, y, nodeShapes["complex"].points, 
					padding, width, height, centerX, centerY);
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].pxValue / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes["complex"].points,
				centerX, centerY, width, height, [0, -1], padding);
		}
	};
	
})( cytoscape );