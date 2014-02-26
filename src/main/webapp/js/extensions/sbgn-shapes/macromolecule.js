;(function($$){"use strict";

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("macromolecule");
	
	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes["macromolecule"] = {
		points: $$.math.generateUnitNgonPoints(4, 0),
		
		draw: function(context, node) {

			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;

			var label = node._private.data.sbgnlabel;

			renderer.drawRoundRectangle(context,
				centerX, centerY,
				width, height,
				4);

			context.font = "10px Arial";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = "#000000";
			context.fillText("" + label, centerX, centerY);
			context.fillStyle = "#ffffff";

			context.stroke();

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
					context.font = "10px Arial";

					context.textAlign = "center";
					context.textBaseline = "middle";
					context.fillStyle = "#000000";
					context.fillText("" + stateLabel, stateCenterX, stateCenterY);
					context.fillStyle = "#ffffff";

					stateCount++;

				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectangle(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);
					context.font = "10px Arial";
					context.textAlign = "center";
					context.textBaseline = "middle";
					context.fillStyle = "#000000";
					context.fillText("" + stateLabel, stateCenterX, stateCenterY);
					context.fillStyle = "#ffffff";

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

			renderer.drawRoundRectanglePath(context,
				centerX, centerY,
				width, height,
				5);

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

					stateCount++;

				}
				else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
					renderer.drawRoundRectanglePath(context,
						stateCenterX, stateCenterY,
						stateWidth, stateHeight,
						5);

					infoCount++;
				}
			}
		},
		
		intersectLine: function(node, x, y) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.roundRectangleIntersectLine(
					x, y,
					nodeX,
					nodeY,
					width, height,
					padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.roundRectangleIntersectBox(
				x1, y1, x2, y2, 
				width, height, nodeX, nodeY, padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].value / 2;

			return $$.math.checkInBoundingBox(
				x, y, nodeShapes["macromolecule"].points, 
					padding, width, height, nodeX, nodeY);
		},

		checkPoint: function(x, y, node, threshold) {

			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].value / 2;

			return nodeShapes["roundrectangle"].checkPoint(x, y, padding, width, height,
				centerX, centerY);			
		}
	}

})( cytoscape );