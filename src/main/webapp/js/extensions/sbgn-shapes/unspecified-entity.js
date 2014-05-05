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

			$$.sbgn.drawCirclePath(context, centerX, centerY, width, height);
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
			var cloneMarker = node._private.data.sbgnclonemarker;

			$$.sbgn.drawCircle(context, centerX, centerY, width, height);

			context.stroke();

			$$.sbgn.drawSourceSinkCloneMarker(context, centerX, centerY, 
					width, height, cloneMarker);

			var nodeProp = {'label':label, 'centerX':centerX, 'centerY':centerY-2,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, nodeProp);
			
			$$.sbgn.drawPathStateAndInfos(renderer, node, context, centerX, centerY);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = nodeShapes["ellipse"].intersectLine(centerX, centerY, width, 
				height, x, y, padding);

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines);
			return $$.sbgn.closestIntersectionPoint([x, y], intersections);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			var nodeIntersectBox = nodeShapes["ellipse"].intersectBox(
				x1, y1, x2, y2, width, 
				height, centerX, centerY, padding);

			var stateAndInfoIntersectBox = $$.sbgn.intersectBoxStateAndInfoBoxes(
				x1, y1, x2, y2, node);

			return nodeIntersectBox || stateAndInfoIntersectBox;

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

			var nodeCheckPointRough = nodeShapes["ellipse"].checkPointRough(x, y, 
				padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			return nodeCheckPointRough || stateAndInfoCheckPointRough;

		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;
			
			var nodeCheckPoint =  nodeShapes["ellipse"].checkPoint(x, y, 
				padding, width, height, 
				centerX, centerY);

			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			return nodeCheckPoint || stateAndInfoCheckPoint;
		}
	}

})( cytoscape );