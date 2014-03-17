;(function($$){"use strict";

	sbgnShapes["macromolecule"] = true;

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("macromolecule");
	
	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes["macromolecule"] = {
		points: $$.math.generateUnitNgonPoints(4, 0),
		cornerRadius:4,
		multimerPadding:2,

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var label = node._private.data.sbgnlabel;
			var cornerRadius = nodeShapes["macromolecule"].cornerRadius;
			var multimerPadding = nodeShapes["macromolecule"].multimerPadding;

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawRoundRectanglePath(context,
					centerX + multimerPadding, centerY + multimerPadding,
					width, height,
					cornerRadius);
			}

			renderer.drawRoundRectanglePath(context,
				centerX, centerY, width, height,
				cornerRadius);
			//context.fill();
			//drawStateAndInfos(node, context, centerX, centerY);
		},
		
		drawPath: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var label = node._private.data.sbgnlabel;
			var cornerRadius = nodeShapes["macromolecule"].cornerRadius;
			var multimerPadding = nodeShapes["macromolecule"].multimerPadding;

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawRoundRectangle(context,
					centerX + multimerPadding, centerY + multimerPadding,
					width, height,
					cornerRadius);

				context.stroke();
			}

			renderer.drawRoundRectangle(context,
				centerX, centerY,
				width, height,
				cornerRadius);

			context.stroke();
			
			$$.sbgn.drawMacromoleculeCloneMarker(context, centerX, centerY, width, height, cornerRadius, "");
			$$.sbgn.drawSbgnText(context, label, centerX, centerY - 2);
			$$.sbgn.drawPathStateAndInfos(renderer, node, context, centerX, centerY);
		},
		
		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;
			var multimerPadding = nodeShapes["macromolecule"].multimerPadding;
			var cornerRadius = nodeShapes["macromolecule"].cornerRadius;

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = $$.sbgn.roundRectangleIntersectLine(
					x, y,
					centerX, centerY,
					centerX, centerY,
					width, height,
					cornerRadius, padding);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectionLines = new Array();
			if($$.sbgn.isMultimer(node)){
				multimerIntersectionLines = $$.sbgn.roundRectangleIntersectLine(
					x, y, 
					centerX, centerY, 
					centerX + multimerPadding, centerY + multimerPadding, 
					width, height, 
					cornerRadius, padding);
			}

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines, multimerIntersectionLines);

			return $$.sbgn.closestIntersectionPoint([x, y], intersections);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;
			var multimerPadding = nodeShapes["macromolecule"].multimerPadding;

			var nodeIntersectBox = $$.math.roundRectangleIntersectBox(
				x1, y1, x2, y2, 
				width, height, centerX, centerY, padding);

			var stateAndInfoIntersectBox = $$.sbgn.intersectBoxStateAndInfoBoxes(
				x1, y1, x2, y2, node);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectBox = false;
			if($$.sbgn.isMultimer(node)){
				multimerIntersectBox = $$.math.roundRectangleIntersectBox(
				x1, y1, x2, y2, width, height, centerX + multimerPadding, 
				centerY + multimerPadding, padding);
			}

			return nodeIntersectBox || stateAndInfoIntersectBox || multimerIntersectBox;
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].pxValue / 2;
			var multimerPadding = nodeShapes["macromolecule"].multimerPadding;

			var nodeCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes["macromolecule"].points, 
					padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPointRough = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes["macromolecule"].points, 
					padding, width, height, centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPointRough || stateAndInfoCheckPointRough || multimerCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].pxValue / 2;
			var multimerPadding = nodeShapes["macromolecule"].multimerPadding;

			var nodeCheckPoint =  nodeShapes["roundrectangle"].checkPoint(x, y, padding, 
				width, height, centerX, centerY);
			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPoint = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPoint = nodeShapes["roundrectangle"].checkPoint(x, y, padding, 
				width, height, centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
		}
	}

})( cytoscape );