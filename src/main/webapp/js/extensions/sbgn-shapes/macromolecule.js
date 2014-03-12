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
			var sbgnClass = node._private.data.sbgnclass;
			var multimerPadding = nodeShapes["macromolecule"].multimerPadding;

			//check whether sbgn class includes multimer substring or not
			if(sbgnClass.indexOf("multimer") != -1){
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
			var sbgnClass = node._private.data.sbgnclass;
			var multimerPadding = nodeShapes["macromolecule"].multimerPadding;

			//check whether sbgn class includes multimer substring or not
			if(sbgnClass.indexOf("multimer") != -1){
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
			
			drawMacromoleculeCloneMarker(context, centerX, centerY, width, height, cornerRadius, "");
			drawSbgnText(context, label, centerX, centerY - 2);
			drawPathStateAndInfos(renderer, node, context, centerX, centerY);
		},
		
		intersectLine: function(node, x, y) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style["border-width"].pxValue / 2;

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
			var padding = node._private.style["border-width"].pxValue / 2;

			return $$.math.roundRectangleIntersectBox(
				x1, y1, x2, y2, 
				width, height, nodeX, nodeY, padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].pxValue / 2;

			return $$.math.checkInBoundingBox(
				x, y, nodeShapes["macromolecule"].points, 
					padding, width, height, nodeX, nodeY);
		},

		checkPoint: function(x, y, node, threshold) {

			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style["border-width"].pxValue / 2;

			return nodeShapes["roundrectangle"].checkPoint(x, y, padding, width, height,
				centerX, centerY);			
		}
	}

})( cytoscape );