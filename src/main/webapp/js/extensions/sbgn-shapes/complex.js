;(function($$){"use strict";
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("complex");
	sbgnShapes["complex"] = true;

	var nodeShapes = CanvasRenderer.nodeShapes;

	//this function is created to have same corner length when
	//complex's width or height is changed
	function generateComplexShapePoints(cornerLength, width, height){
		//cp stands for corner proportion
		var cpX = cornerLength / width;
		var cpY = cornerLength / height;

		var complexPoints = new Array(-1 + cpX, -1, -1, -1 + cpY, -1, 1 - cpY, -1 + cpX, 
			1, 1 - cpX, 1, 1, 1 - cpY, 1, -1 + cpY, 1 - cpX, -1);	

		return complexPoints;
	}

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

			context.fill();
			var stateCount = 0, infoCount = 0;

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateCenterX = state.bbox.x + centerX;
				var stateCenterY = state.bbox.y + centerY;
				var stateLabel = state.state.value;

				if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
					drawEllipsePath(context,stateCenterX, stateCenterY, stateWidth, stateHeight);
					stateCount++;
				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectanglePath(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);
					infoCount++;
				}
				context.stroke();
			}

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
			
			var stateCount = 0, infoCount = 0;

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateCenterX = state.bbox.x + centerX;
				var stateCenterY = state.bbox.y + centerY;
				var stateLabel = state.state.value;

				if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
					drawEllipse(context,stateCenterX, stateCenterY, stateWidth, stateHeight);
					drawSbgnText(context, stateLabel, stateCenterX, stateCenterY);
					stateCount++;
				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectangle(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);
					drawSbgnText(context, stateLabel, stateCenterX, stateCenterY);
					infoCount++;
				}
			}
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