;(function($$){"use strict";
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("complex");

	var nodeShapes = CanvasRenderer.nodeShapes;

	var complexPoints = new Array(-0.75, -1, -1, -0.75, -1, 0.75, -0.75, 
		1, 0.75, 1, 1, 0.75, 1, -0.75, 0.75, -1);

	nodeShapes["complex"] = {
		points: complexPoints,

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;
	
			renderer.drawPolygon(context,
				centerX, centerY,
				width, height, nodeShapes["complex"].points);

			context.stroke();
			context.fillStyle = "#ffffff";

			var stateCount = 0, infoCount = 0;

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateCenterX = state.bbox.x + centerX;
				var stateCenterY = state.bbox.y + centerY;
				var stateLabel = state.state.value;

				if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
					context.beginPath();
					context.translate(stateCenterX, stateCenterY);
					context.scale(stateWidth / 2, stateHeight / 2);
					context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
					context.closePath();

					context.scale(2/stateWidth, 2/stateHeight);
					context.translate(-stateCenterX, -stateCenterY);
					context.fill();

					context.fillStyle = "#000000";
					renderer.drawSbgnText(context, node, stateLabel, stateCenterX, stateCenterY);
					//renderer.drawText(context, node, centerX, centerY);
					context.fillStyle = "#ffffff";


					stateCount++;

				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectangle(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);

					context.fillStyle = "#000000";
					renderer.drawSbgnText(context, node, stateLabel, stateCenterX, stateCenterY);
					context.fillStyle = "#ffffff";


					infoCount++;
				}
				context.stroke();
			}

		},

		drawPath: function(context, node) {
			
			//var width = node._private.data.sbgnbbox.w;
			//var height = node._private.data.sbgnbbox.h;
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;
		
			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height, nodeShapes["complex"].points);

			var stateCount = 0, infoCount = 0;

			for(var i = 0 ; i < stateAndInfos.length ; i++){
				var state = stateAndInfos[i];
				var stateWidth = state.bbox.w;
				var stateHeight = state.bbox.h;
				var stateCenterX = state.bbox.x + centerX;
				var stateCenterY = state.bbox.y + centerY;

				if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
					context.beginPath();
					context.translate(stateCenterX, stateCenterY);
					context.scale(stateWidth / 2, stateHeight / 2);
					context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
					context.closePath();

					context.scale(2/stateWidth, 2/stateHeight);
					context.translate(-stateCenterX, -stateCenterY);
					//context.fill();

					stateCount++;

				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectanglePath(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);

					infoCount++;
				}
				//context.stroke();
			}

		},

		intersectLine: function(node, x, y) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes["complex"].points,
					nodeX,
					nodeY,
					width, height,
					padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

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
			var padding = node._private.style["border-width"].value / 2;

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
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes["complex"].points,
				centerX, centerY, width, height, [0, -1], padding);
		}
	};
	
})( cytoscape );