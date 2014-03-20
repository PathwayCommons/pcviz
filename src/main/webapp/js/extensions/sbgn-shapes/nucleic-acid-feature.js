;(function($$){"use strict";

	sbgnShapes["nucleic acid feature"] = true;


	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("nucleic acid feature");

	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes["nucleic acid feature"] = {
		points: $$.math.generateUnitNgonPoints(4, 0),
		cornerRadius:4,
		multimerPadding:2,

		draw: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var cornerRadius = nodeShapes["nucleic acid feature"].cornerRadius;
			var multimerPadding = nodeShapes["nucleic acid feature"].multimerPadding;

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				$$.sbgn.drawNucAcidFeature(context, width, height, 
					centerX + multimerPadding, 
					centerY + multimerPadding, 
					cornerRadius);
			}

			$$.sbgn.drawNucAcidFeature(context, width, height, centerX, 
				centerY, cornerRadius);
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var cornerRadius = nodeShapes["nucleic acid feature"].cornerRadius;
			var multimerPadding = nodeShapes["nucleic acid feature"].multimerPadding;
			var cloneMarker = node._private.data.sbgnclonemarker;

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				$$.sbgn.drawNucAcidFeature(context, width, height, 
					centerX + multimerPadding, 
					centerY + multimerPadding, 
					cornerRadius);
				context.fill();
				context.stroke();

				$$.sbgn.drawNucleicAcidFeatureCloneMarker(context, 
					centerX + multimerPadding, centerY + multimerPadding, 
					width, height, cornerRadius, cloneMarker, true);

				context.stroke();
			}

			$$.sbgn.drawNucAcidFeature(context, width, height, centerX, 
				centerY, cornerRadius);
			context.fill();

			context.stroke();

			$$.sbgn.drawNucleicAcidFeatureCloneMarker(context, centerX, centerY, 
				width, height, cornerRadius, cloneMarker, false);
			$$.sbgn.drawLabelText(context, label, centerX, centerY - 2);
			$$.sbgn.drawPathStateAndInfos(renderer, node, context, centerX, centerY);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = $$.sbgn.nucleicAcidIntersectionLine(node, 
				x, y, centerX, centerY);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectionLines = new Array();
			if($$.sbgn.isMultimer(node)){
				multimerIntersectionLines = $$.sbgn.nucleicAcidIntersectionLine(node, 
					x, y, centerX + multimerPadding, centerY + multimerPadding);
			}

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines, 
				multimerIntersectionLines);

			return $$.sbgn.closestIntersectionPoint([x, y], intersections);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			var nodeIntersectBox = $$.sbgn.nucleicAcidIntersectionBox(
				x1, y1, x2, y2, centerX, centerY, node);

			var stateAndInfoIntersectBox = $$.sbgn.intersectBoxStateAndInfoBoxes(
				x1, y1, x2, y2, node);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectBox = false;
			if($$.sbgn.isMultimer(node)){
				multimerIntersectBox = $$.sbgn.nucleicAcidIntersectionBox(
					x1, y1, x2, y2, 
					centerX + multimerPadding, centerY + multimerPadding, 
					node);
			}

			return nodeIntersectBox || stateAndInfoIntersectBox || multimerIntersectBox;
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;
			var cornerRadius = nodeShapes["nucleic acid feature"].cornerRadius;
			var multimerPadding = nodeShapes["complex"].multimerPadding;

			var nodeCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes["nucleic acid feature"].points, 
					padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPointRough = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes["nucleic acid feature"].points, 
					padding, width, height, 
					centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPointRough || stateAndInfoCheckPointRough || multimerCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var multimerPadding = nodeShapes["nucleic acid feature"].multimerPadding;

			var nodeCheckPoint = $$.sbgn.nucleicAcidCheckPoint(x, y, centerX, centerY,
				node, threshold);
			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPoint = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPoint = $$.sbgn.nucleicAcidCheckPoint(x, y, 
					centerX + multimerPadding, centerY + multimerPadding,
					node, threshold);
			}

			return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
		}
	}

})( cytoscape );