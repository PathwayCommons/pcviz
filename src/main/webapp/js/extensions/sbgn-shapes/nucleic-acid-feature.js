;(function($$){"use strict";
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("nucleic acid feature");

	var nodeShapes = CanvasRenderer.nodeShapes;
	
	nodeShapes["nucleic acid feature"] = {
		points: $$.math.generateUnitNgonPoints(4, 0),
		cornerRadius:5,

		draw: function(context, node) {
			nodeShapes["nucleic acid feature"].drawPath(context, node);
			context.fill();
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var cornerRadius = nodeShapes["nucleic acid feature"].cornerRadius;

			var halfWidth = width / 2;
			var halfHeight = height / 2;
			
			context.translate(centerX, centerY);
			context.beginPath();

			context.moveTo(-halfWidth, -halfHeight);
			context.lineTo(halfWidth, -halfHeight);
			context.lineTo(halfWidth, 0);
			context.arcTo(halfWidth, halfHeight, 0, halfHeight, cornerRadius);
			context.arcTo(-halfWidth, halfHeight, -halfWidth, 0, cornerRadius);
			context.lineTo(-halfWidth, -halfHeight);
			

			context.closePath();
			context.translate(-centerX, -centerY);

		},

		intersectLine: function(node, x, y) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;
			var cornerRadius = nodeShapes["nucleic acid feature"].cornerRadius;


			var halfWidth = width / 2;
			var halfHeight = height / 2;

			var straightLineIntersections;

			// Top segment, left to right
			{
				var topStartX = nodeX - halfWidth - padding;
				var topStartY = nodeY - halfHeight - padding;
				var topEndX = nodeX + halfWidth + padding;
				var topEndY = topStartY;
			
				straightLineIntersections = $$.math.finiteLinesIntersect(
					x, y, nodeX, nodeY, topStartX, topStartY, topEndX, topEndY, false);
			
				if (straightLineIntersections.length > 0) {
					return straightLineIntersections;
				}
			}

			// Right segment, top to bottom
			{
				var rightStartX = nodeX + halfWidth + padding;
				var rightStartY = nodeY - halfHeight - padding;
				var rightEndX = rightStartX;
				var rightEndY = nodeY + halfHeight - cornerRadius + padding;
				
				straightLineIntersections = $$.math.finiteLinesIntersect(
					x, y, nodeX, nodeY, rightStartX, rightStartY, rightEndX, rightEndY, false);
				
				if (straightLineIntersections.length > 0) {
					return straightLineIntersections;
				}
			}

			// Bottom segment, left to right
			{
				var bottomStartX = nodeX - halfWidth + cornerRadius - padding;
				var bottomStartY = nodeY + halfHeight + padding;
				var bottomEndX = nodeX + halfWidth - cornerRadius + padding;
				var bottomEndY = bottomStartY;
				
				straightLineIntersections = $$.math.finiteLinesIntersect(
					x, y, nodeX, nodeY, bottomStartX, bottomStartY, bottomEndX, bottomEndY, false);
				
				if (straightLineIntersections.length > 0) {
					return straightLineIntersections;
				}
			}

			// Left segment, top to bottom
			{
				var leftStartX = nodeX - halfWidth - padding;
				var leftStartY = nodeY - halfHeight - padding;
				var leftEndX = leftStartX;
				var leftEndY = nodeY + halfHeight - cornerRadius + padding;
			
				straightLineIntersections = $$.math.finiteLinesIntersect(
					x, y, nodeX, nodeY, leftStartX, leftStartY, leftEndX, leftEndY, false);
				
				if (straightLineIntersections.length > 0) {
					return straightLineIntersections;
				}
			}

			// Check intersections with arc segments, we have only two arcs for
			//nucleic acid features
			var arcIntersections;

			// Bottom Right
			{
				var bottomRightCenterX = nodeX + halfWidth - cornerRadius;
				var bottomRightCenterY = nodeY + halfHeight - cornerRadius
				arcIntersections = $$.math.intersectLineCircle(
					x, y, nodeX, nodeY, 
					bottomRightCenterX, bottomRightCenterY, cornerRadius + padding);
				
				// Ensure the intersection is on the desired quarter of the circle
				if (arcIntersections.length > 0
					&& arcIntersections[0] >= bottomRightCenterX
					&& arcIntersections[1] >= bottomRightCenterY) {
					return [arcIntersections[0], arcIntersections[1]];
				}
			}
			
			// Bottom Left
			{
				var bottomLeftCenterX = nodeX - halfWidth + cornerRadius;
				var bottomLeftCenterY = nodeY + halfHeight - cornerRadius
				arcIntersections = $$.math.intersectLineCircle(
					x, y, nodeX, nodeY, 
					bottomLeftCenterX, bottomLeftCenterY, cornerRadius + padding);
				
				// Ensure the intersection is on the desired quarter of the circle
				if (arcIntersections.length > 0
					&& arcIntersections[0] <= bottomLeftCenterX
					&& arcIntersections[1] >= bottomLeftCenterY) {
					return [arcIntersections[0], arcIntersections[1]];
				}
			}
			return []; // if nothing
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;
			var points = nodeShapes["square"].points;
			var cornerRadius = nodeShapes["nucleic acid feature"].cornerRadius;

			//we have a rectangle at top and a roundrectangle at bottom

			var rectIntersectBoxResult = $$.math.boxIntersectPolygon(
				x1, y1, x2, y2,
				points, width, height - cornerRadius, centerX, 
				centerY - cornerRadius/2 , [0, -1], padding);

			var roundRectIntersectBoxResult = $$.math.roundRectangleIntersectBox(
				x1, y1, x2, y2, 
				width, 2 * cornerRadius, centerX, 
				centerY + height/2 - cornerRadius, padding);

			return rectIntersectBoxResult || roundRectIntersectBoxResult;
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;
			var cornerRadius = nodeShapes["nucleic acid feature"].cornerRadius;

			//rough selection?
			/*
			return $$.math.checkInBoundingBox(
				x, y, nodeShapes["nucleic acid feature"].points, 
					padding, width, height - cornerRadius, centerX, centerY - cornerRadius/2);
			*/

			return nodeShapes["nucleic acid feature"].checkPoint(x,y,node,threshold);

		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].value / 2;
			var cornerRadius = nodeShapes["nucleic acid feature"].cornerRadius;

			//check rectangle at top
			if ($$.math.pointInsidePolygon(x, y, nodeShapes["roundrectangle"].points,
				centerX, centerY -  cornerRadius/2, width, height - cornerRadius, [0, -1], 
				padding)) {
				return true;
			}

			//check rectangle at bottom
			if ($$.math.pointInsidePolygon(x, y, nodeShapes["roundrectangle"].points,
				centerX, centerY + height/2 -  cornerRadius/2, width - 2*cornerRadius, cornerRadius, [0, -1], 
				padding)) {
				return true;
			}

			//check ellipses
			var checkInEllipse = function(x, y, centerX, centerY, width, height, padding) {
				x -= centerX;
				y -= centerY;

				x /= (width / 2 + padding);
				y /= (height / 2 + padding);

				return (Math.pow(x, 2) + Math.pow(y, 2) <= 1);
			}

			// Check bottom right quarter circle
			if (checkInEllipse(x, y,
				centerX + width / 2 - cornerRadius,
				centerY + height / 2 - cornerRadius,
				cornerRadius * 2, cornerRadius * 2, padding)) {

				return true;
			}

			// Check bottom left quarter circle
			if (checkInEllipse(x, y,
				centerX - width / 2 + cornerRadius,
				centerY + height / 2 - cornerRadius,
				cornerRadius * 2, cornerRadius * 2, padding)) {

				return true;
			}

			return false;
		}
	}

})( cytoscape );