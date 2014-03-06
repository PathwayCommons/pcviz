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

//			context.fill();
/*
			//complex state and info drawing
			var upWidth = 0, downWidth = 0;
			var boxPadding = 10, betweenBoxPadding = 5;
			var beginPosY = height / 2, beginPosX = width / 2;


			stateAndInfos.sort(compareStates);

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;

				if(stateCenterY < 0 ){
					if(upWidth + stateWidth < width){
						var stateCenterX = centerX - beginPosX + boxPadding + upWidth + stateWidth/2;
						var stateCenterY = centerY - beginPosY;
						if(state.clazz == "state variable"){//draw ellipse
							drawEllipsePath(context,
								stateCenterX, stateCenterY, 
								stateWidth, stateHeight);
						}
						else if(state.clazz == "unit of information"){//draw rectangle
							renderer.drawRoundRectanglePath(context,
								stateCenterX, stateCenterY,
								stateWidth, stateHeight,
								5);
						}
					}
					upWidth = upWidth + width + boxPadding;
				}
				if(stateCenterY > 0 ){
					if(downWidth + stateWidth < width){
						var stateCenterX = centerX - beginPosX + boxPadding + downWidth + stateWidth/2;
						var stateCenterY = centerY + beginPosY;
						if(state.clazz == "state variable"){//draw ellipse
							drawEllipsePath(context,
								stateCenterX, stateCenterY, 
								stateWidth, stateHeight);
						}
						else if(state.clazz == "unit of information"){//draw rectangle
							renderer.drawRoundRectanglePath(context,
								stateCenterX, stateCenterY,
								stateWidth, stateHeight,
								5);
						}
					}
					downWidth = downWidth + width + boxPadding;
				}
				context.stroke();
			}
*/

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
			
			//complex state and info drawing
			var upWidth = 0, downWidth = 0;
			var boxPadding = 10, betweenBoxPadding = 5;
			var beginPosY = height / 2, beginPosX = width / 2;

			stateAndInfos.sort(compareStates);

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateLabel = state.state.value;
				var relativeYPos = state.bbox.y;

				if(relativeYPos < 0 ){
					if(upWidth + stateWidth < width){
						var stateCenterX = centerX - beginPosX + boxPadding + upWidth + stateWidth/2;
						var stateCenterY = centerY - beginPosY;
						if(state.clazz == "state variable"){//draw ellipse
							drawEllipse(context,
								stateCenterX, stateCenterY, 
								stateWidth, stateHeight);
							drawSbgnText(context, stateLabel, stateCenterX, stateCenterY);
						}
						else if(state.clazz == "unit of information"){//draw rectangle
							renderer.drawRoundRectangle(context,
								stateCenterX, stateCenterY,
								stateWidth, stateHeight,
								5);
							drawSbgnText(context, stateLabel, stateCenterX, stateCenterY);
						}
					}
					upWidth = upWidth + width + boxPadding;
				}
				else if(relativeYPos > 0 ){
					if(downWidth + stateWidth < width){
						var stateCenterX = centerX - beginPosX + boxPadding + downWidth + stateWidth/2;
						var stateCenterY = centerY + beginPosY;
						if(state.clazz == "state variable"){//draw ellipse
							drawEllipse(context,
								stateCenterX, stateCenterY, 
								stateWidth, stateHeight);
							drawSbgnText(context, stateLabel, stateCenterX, stateCenterY);
						}
						else if(state.clazz == "unit of information"){//draw rectangle
							renderer.drawRoundRectangle(context,
								stateCenterX, stateCenterY,
								stateWidth, stateHeight,
								5);
							drawSbgnText(context, stateLabel, stateCenterX, stateCenterY);
						}
					}
					downWidth = downWidth + width + boxPadding;
				}
				context.stroke();
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