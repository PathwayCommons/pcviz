//sbgn shape rendering methods' parameters are different from default shapes.
//a map for sbgn shapes are needed to differentiate the methods.	
;(function($$){ 'use strict';
	$$.sbgn = {};

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	var nodeShapes = CanvasRenderer.nodeShapes;

	$$.sbgn.drawText = function(context, label, centerX, centerY, color, font){
		context.font = font;
		context.textAlign = "center";
		context.textBaseline = "middle";
		var oldColor  = context.fillStyle;
		context.fillStyle = color;
		context.fillText("" + label, centerX, centerY);
		context.fillStyle = oldColor;
		context.stroke();
	}

	$$.sbgn.drawLabelText = function(context, label, centerX, centerY){
		$$.sbgn.drawText(context, label, centerX, 
			centerY,  "#000", "9px Arial");
	}

	$$.sbgn.drawStateText = function(context, state, centerX, centerY){
		var stateValue = state.value;
		var stateVariable = state.variable;

		var stateLabel = (stateVariable == null) ? stateValue : 
			stateValue + "@" + stateVariable;

		$$.sbgn.drawText(context, stateLabel, centerX,
			centerY, "#000", "8px Arial");
	}

	$$.sbgn.drawCloneMarkerText = function(context, label, centerX, centerY){
		$$.sbgn.drawText(context, label, centerX, 
			centerY, "#fff", "4px Arial");		
	}

	$$.sbgn.drawEllipsePath = function(context, x, y, width, height){
		context.beginPath();
		context.translate(x, y);
		context.scale(width / 2, height / 2);
		context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
		context.closePath();
		context.scale(2/width, 2/height);
		context.translate(-x, -y);
	}

	$$.sbgn.drawEllipse = function(context, x, y, width, height){
		$$.sbgn.drawEllipsePath(context, x, y, width, height);
		context.fill();
	}

	$$.sbgn.drawNucAcidFeature = function(context, width, height, 
		centerX, centerY, cornerRadius){
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
	}

	$$.sbgn.drawCirclePath = function(context, x, y, width, height){
			context.beginPath();
			context.translate(x, y);
			context.scale(width / 2, height / 2);
			// At origin, radius 1, 0 to 2pi
			context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
			context.closePath();

			context.scale(2/width, 2/height);
			context.translate(-x, -y);
	}

	$$.sbgn.drawCircle = function(context, x, y, width, height){
		$$.sbgn.drawCirclePath(context, x, y, width, height);
		context.fill();
	}

	$$.sbgn.drawStateAndInfos = function(node, context, centerX, centerY){
		var stateAndInfos = node._private.data.sbgnstatesandinfos;
		var stateCount = 0, infoCount = 0;

		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
				var stateLabel = state.state.value;
				//drawEllipsePath(context,stateCenterX, stateCenterY, stateWidth, stateHeight);
				stateCount++;
			}
			else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
				var stateLabel = state.label.text;
				//renderer.drawRoundRectanglePath(context,
				//	stateCenterX, stateCenterY,
				//	stateWidth, stateHeight,
				//	5);

				infoCount++;
			}
			//context.stroke();
		}
	}

	$$.sbgn.drawPathStateAndInfos = function(renderer, node, context, centerX, centerY){
		var stateAndInfos = node._private.data.sbgnstatesandinfos;
		var stateCount = 0, infoCount = 0;
				
		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
				//var stateLabel = state.state.value;
				$$.sbgn.drawEllipse(context,stateCenterX, stateCenterY, 
					stateWidth, stateHeight);
				$$.sbgn.drawStateText(context, state.state, stateCenterX, 
					stateCenterY);
				stateCount++;
			}
			else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
				var stateLabel = state.label.text;
				renderer.drawRoundRectangle(context,
					stateCenterX, stateCenterY,
					stateWidth, stateHeight,
					5);
					$$.sbgn.drawStateText(context, stateLabel, stateCenterX, 
						stateCenterY);
					infoCount++;
			}
			context.stroke();
		}
	}

	//use this function to sort states according to their x positions
	$$.sbgn.compareStates = function(st1, st2){
		if(st1.bbox.x < st2.bbox.x)
			return -1;
		if(st1.bbox.x > st2.bbox.x)
			return 1;
		return 0;
	}

	$$.sbgn.drawComplexStateAndInfo = function(context, stateAndInfos, centerX, centerY, width, height){
		var upWidth = 0, downWidth = 0;
		var boxPadding = 10, betweenBoxPadding = 5;
		var beginPosY = height / 2, beginPosX = width / 2;

		stateAndInfos.sort($$.sbgn.compareStates);

		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateLabel = state.state.value;
			var relativeYPos = state.bbox.y;
			var stateCenterX, stateCenterY;

			if(relativeYPos < 0 ){
				if(upWidth + stateWidth < width){
					stateCenterX = centerX - beginPosX + boxPadding + upWidth + stateWidth/2;
					stateCenterY = centerY - beginPosY;
					if(state.clazz == "state variable"){//draw ellipse
						$$.sbgn.drawEllipse(context,
							stateCenterX, stateCenterY, 
							stateWidth, stateHeight);
						$$.sbgn.drawStateText(context, stateLabel, stateCenterX, 
							stateCenterY);
					}
					else if(state.clazz == "unit of information"){//draw rectangle
						$$.sbgn.renderer.drawRoundRectangle(context,
							stateCenterX, stateCenterY,
							stateWidth, stateHeight,
							5);
						$$.sbgn.drawStateText(context, stateLabel, stateCenterX, 
							stateCenterY);
					}
				}
				upWidth = upWidth + width + boxPadding;
			}
			else if(relativeYPos > 0 ){
				if(downWidth + stateWidth < width){
					stateCenterX = centerX - beginPosX + boxPadding + downWidth + stateWidth/2;
					stateCenterY = centerY + beginPosY;
					if(state.clazz == "state variable"){//draw ellipse
						$$.sbgn.drawEllipse(context,
							stateCenterX, stateCenterY, 
							stateWidth, stateHeight);
						$$.sbgn.drawStateText(context, stateLabel, stateCenterX, stateCenterY);
					}
					else if(state.clazz == "unit of information"){//draw rectangle
						$$.sbgn.renderer.drawRoundRectangle(context,
							stateCenterX, stateCenterY,
							stateWidth, stateHeight,
							5);
						$$.sbgn.drawStateText(context, stateLabel, stateCenterX, stateCenterY);
					}
				}
				downWidth = downWidth + width + boxPadding;
			}
			context.stroke();

			//update new state and info position(relative to node center)
			state.bbox.x = stateCenterX - centerX;
			state.bbox.y = stateCenterY - centerY;
		}
	}

	//this function is created to have same corner length when
	//complex's width or height is changed
	$$.sbgn.generateComplexShapePoints = function(cornerLength, width, height){
		//cp stands for corner proportion
		var cpX = cornerLength / width;
		var cpY = cornerLength / height;

		var complexPoints = new Array(-1 + cpX, -1, -1, -1 + cpY, -1, 1 - cpY, -1 + cpX, 
			1, 1 - cpX, 1, 1, 1 - cpY, 1, -1 + cpY, 1 - cpX, -1);	

		return complexPoints;
	}

	$$.sbgn.drawUnspecifiedEntityCloneMarker = function(context, centerX, centerY, 
		width, height, cloneMarker){
		if(cloneMarker != null){
			var oldColor  = context.fillStyle;
			context.fillStyle = "#000000";

			context.beginPath();
			context.translate(centerX, centerY);
			context.scale(width / 2, height / 2);

			var markerBeginX = - 1 * Math.sin(Math.PI/3);
			var markerBeginY = Math.cos(Math.PI/3);
			var markerEndX = 1 * Math.sin(Math.PI/3);
			var markerEndY = markerBeginY;

			context.moveTo(markerBeginX,markerBeginY);
			context.lineTo(markerEndX,markerEndY);
			context.arc(0, 0, 1, Math.PI/6, 5*Math.PI/6);
			context.closePath();
					
			context.scale(2/width, 2/height);
			context.translate(-centerX, -centerY);
			context.fill();

		 	context.fillStyle = oldColor;
		}
	}

	$$.sbgn.drawSourceAndSinkCloneMarker = function(context, centerX, centerY, 
		width, height, cloneMarker){
		$$.sbgn.drawSimpleChemicalCloneMarker(context, centerX, centerY, 
		width, height, cloneMarker);
	}

	$$.sbgn.drawSimpleChemicalCloneMarker = function(context, centerX, centerY, 
		width, height, cloneMarker, isMultimer){
		$$.sbgn.drawUnspecifiedEntityCloneMarker(context, centerX, centerY, 
			width, height, cloneMarker);

		if(!isMultimer && cloneMarker != null){
		 	$$.sbgn.drawCloneMarkerText(context, "label", cloneX, cloneY);
		}
	}

	$$.sbgn.drawPerturbingAgentCloneMarker = function(context, centerX, centerY, 
		width, height, cloneMarker){
		if(cloneMarker != null){
			var cloneWidth = width;
			var cloneHeight = height / 4;
			var cloneX = centerX;
			var cloneY = centerY + height/2 - height/8;

			var markerPoints = new Array(-5/6, -1, 5/6, -1, 1, 1, -1, 1);

			var oldColor  = context.fillStyle;
			context.fillStyle = "#000000";

			renderer.drawPolygon(context,
				cloneX, cloneY,
				cloneWidth, cloneHeight, markerPoints);

			context.fill();

		 	context.fillStyle = oldColor;

		 	$$.sbgn.drawCloneMarkerText(context, "label", cloneX, cloneY);
		}
	}

	$$.sbgn.drawNucleicAcidFeatureCloneMarker = function(context, centerX, centerY, 
		width, height, cornerRadius, cloneMarker, isMultimer){
		if(cloneMarker != null){
			var cloneWidth = width;
			var cloneHeight = height / 4;
			var cloneX = centerX;
			var cloneY = centerY + 3 * height / 8;
			var oldColor  = context.fillStyle;
			context.fillStyle = "#000000";

			$$.sbgn.drawNucAcidFeature(context, cloneWidth, cloneHeight, cloneX, cloneY, cornerRadius);
			context.fill();
		 	context.fillStyle = oldColor;
		 	if(!isMultimer){
		 		$$.sbgn.drawCloneMarkerText(context, "label", cloneX, cloneY);
		 	}
		}
	}

	$$.sbgn.drawMacromoleculeCloneMarker = function(context, centerX, centerY, 
		width, height, cornerRadius, cloneMarker, isMultimer){
		$$.sbgn.drawNucleicAcidFeatureCloneMarker(context, centerX, centerY, 
			width, height, cornerRadius, cloneMarker, isMultimer);
	}

	$$.sbgn.drawComplexCloneMarker = function(context, centerX, centerY, 
		width, height, cornerLength, cloneMarker, isMultimer){
		if(cloneMarker != null){
			var cpX = cornerLength / width;
			var cpY = cornerLength / height;
			var cloneWidth = width - 2;
			var cloneHeight = height * cpY / 2;
			var cloneX = centerX;
			var cloneY = centerY + height/2 - cloneHeight/2;

			var markerPoints = new Array(-1, -1, 1, -1, 1-cpX, 1, -1+cpX, 1);

			var oldColor  = context.fillStyle;
			context.fillStyle = "#000000";

			renderer.drawPolygon(context,
				cloneX, cloneY,
				cloneWidth, cloneHeight, markerPoints);

			context.fill();

		 	context.fillStyle = oldColor;

		 	if(!isMultimer){
		 		$$.sbgn.drawCloneMarkerText(context, "label", cloneX, cloneY);
		 	}
		}
	}

	$$.sbgn.isMultimer = function(node){
		var sbgnClass = node._private.data.sbgnclass;
		if(sbgnClass.indexOf("multimer") != -1)
			return true;
		return false;
	}

	$$.sbgn.nucleicAcidIntersectionLine = function(node, x, y, nodeX, nodeY){
		var nodeX = node._private.position.x;
		var nodeY = node._private.position.y;
		var width = node.width();
		var height = node.height();
		var padding = node._private.style["border-width"].pxValue / 2;
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
	}

	$$.sbgn.nucleicAcidIntersectionBox = function(x1, y1, x2, y2, centerX, centerY, node){
		var width = node.width();
		var height = node.height();
		var padding = node._private.style["border-width"].pxValue / 2;
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
	}

	$$.sbgn.nucleicAcidCheckPoint = function(x, y, centerX, centerY, node, threshold){
		var width = node.width();
		var height = node.height();
		var padding = node._private.style["border-width"].pxValue / 2;
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

	$$.sbgn.checkPointStateAndInfoBoxes = function(x, y, node, threshold){
		var centerX = node._private.position.x;
		var centerY = node._private.position.y;
		var padding = node._private.style["border-width"].pxValue / 2;
		var stateAndInfos = node._private.data.sbgnstatesandinfos;

		var stateCount = 0, infoCount = 0;


		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w + threshold;
			var stateHeight = state.bbox.h + threshold;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
				var stateCheckPoint = nodeShapes["ellipse"].checkPoint(
					x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);

				if(stateCheckPoint == true)
					return true;

				stateCount++;
			}
			else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
				var infoCheckPoint = nodeShapes["roundrectangle"].checkPoint(
					x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);
				
				if(infoCheckPoint == true)
					return true;

				infoCount++;
			}

		}
		return false;
	}

	$$.sbgn.checkPointRoughStateAndInfoBoxes = function(node, x, y, 
		centerX, centerY){
		var stateAndInfos = node._private.data.sbgnstatesandinfos;
		var stateCount = 0, infoCount = 0;
		var padding = node._private.style["border-width"].pxValue / 2;

		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
				return true;
				var stateCheckPointRough = nodeShapes["ellipse"].checkPointRough(
					x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);
				
				if(stateCheckPointRough == true)
					return true;

				stateCount++;
			}
			else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
				var infoCheckPointRough = nodeShapes["roundrectangle"].checkPointRough(
					x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);
				
				if(infoCheckPointRough == true)
					return true;

				infoCount++;
			}

		}
		return false;
	}

	$$.sbgn.intersectLineStateAndInfoBoxes = function(node, x, y){
		var centerX = node._private.position.x;
		var centerY = node._private.position.y;
		var padding = node._private.style["border-width"].pxValue / 2;
		
		var stateAndInfos = node._private.data.sbgnstatesandinfos;
		
		var stateCount = 0, infoCount = 0;

		var intersections = new Array();

		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
				var stateIntersectLines = $$.sbgn.intersectLineEllipse(x, y, centerX, centerY, 
					stateCenterX, stateCenterY, stateWidth, stateHeight, padding);

				if(stateIntersectLines.length > 0)
					intersections = intersections.concat(stateIntersectLines);

				stateCount++;
			}
			else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
				var infoIntersectLines = $$.sbgn.roundRectangleIntersectLine(x, y, centerX, centerY, 
					stateCenterX, stateCenterY, stateWidth, stateHeight, 5, padding);

				if(infoIntersectLines.length > 0)
					intersections = intersections.concat(infoIntersectLines);

				infoCount++;
			}

		}
		if(intersections.length > 0)
			return intersections;
		return [];
	}

	$$.sbgn.intersectBoxStateAndInfoBoxes = function(x1, y1, x2, y2, node){
		var centerX = node._private.position.x;
		var centerY = node._private.position.y;
		var width = node.width();
		var height = node.height();
		var padding = node._private.style["border-width"].pxValue / 2;
		
		var stateAndInfos = node._private.data.sbgnstatesandinfos;
		
		var stateCount = 0, infoCount = 0;
		var padding = node._private.style["border-width"].pxValue / 2;

		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == "state variable" && stateCount < 2){//draw ellipse
				var stateIntersectBox = nodeShapes["ellipse"].intersectBox(x1, y1, x2, y2,
					stateWidth, stateHeight, stateCenterX, stateCenterY, padding);

				if(stateIntersectBox == true)
					return true;

				stateCount++;
			}
			else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
				var infoIntersectBox = nodeShapes["roundrectangle"].intersectBox(x1, y1, x2, y2,
					stateWidth, stateHeight, stateCenterX, stateCenterY, padding);
				
				if(infoIntersectBox == true)
					return true;

				infoCount++;
			}

		}

		return false;
	}

	function calculateDistance(point1, point2){
		var distance = Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2);
		return Math.sqrt(distance);
	}

	$$.sbgn.closestPoint = function(point, cp1, cp2){
		if(cp1.length < 1)
			return cp2;
		else if(cp2.length < 1)
			return cp1;

		var distance1 = calculateDistance(point, cp1);
		var distance2 = calculateDistance(point, cp2);

		if(distance1 < distance2)
			return cp1;
		return cp2;
	}

	$$.sbgn.closestIntersectionPoint = function(point, intersections){
		if(intersections.length <= 0)
			return [];

		var closestIntersection = new Array();
		var minDistance = Number.MAX_VALUE;

		for(var i = 0 ; i < intersections.length ; i = i + 2){
			var checkPoint = [intersections[i], intersections[i+1]];
			var distance = calculateDistance(point, checkPoint);

			if(distance < minDistance){
				minDistance = distance;
				closestIntersection = checkPoint;
			}
		}

		return closestIntersection;
	}

  	$$.sbgn.intersectLineEllipse = function(
    	x1, y1, x2, y2, centerX, centerY, width, height, padding) {
  		
  		var w = width/2 + padding;
  		var h = height/2 + padding;
  		var an = centerX;
  		var bn = centerY; 

	    var d = [x2 - x1, y2 - y1]; 

	    var m = d[1] / d[0];
	    var n = -1 * m * x2 + y2;
	    var a = h * h + w * w * m * m;
	    var b = -2 * an * h * h + 2 * m * n * w * w - 2 * bn * m * w * w;
	    var c = an * an * h * h + n * n * w * w - 2 * bn * w * w * n + 
	    	bn * bn * w * w - h * h * w * w;
	    
	    var discriminant = b*b-4*a*c;
	    
	    if (discriminant < 0) {
	      return [];
	    }
	    
	    var t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
	    var t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
	    
	    var xMin = Math.min(t1, t2);
	    var xMax = Math.max(t1, t2);

	    var yMin = m * xMin - m * x2 + y2;
		var yMax = m * xMax - m * x2 + y2;

		return [xMin, yMin, xMax, yMax];
  	}

  	//this function gives the intersections of any line with a round rectangle 
  	$$.sbgn.roundRectangleIntersectLine = function(
    	x1, y1, x2, y2, nodeX, nodeY, width, height, cornerRadius, padding) {
    	    
	    var halfWidth = width / 2;
	    var halfHeight = height / 2;
	    
	    // Check intersections with straight line segments
	    var straightLineIntersections = new Array();
	    
	    // Top segment, left to right
	    {
	    	var topStartX = nodeX - halfWidth + cornerRadius - padding;
	      	var topStartY = nodeY - halfHeight - padding;
	      	var topEndX = nodeX + halfWidth - cornerRadius + padding;
	      	var topEndY = topStartY;
	      
	      	var intersection = renderer.finiteLinesIntersect(
	        	x1, y1, x2, y2, topStartX, topStartY, topEndX, topEndY, false);
	      
	      	if (intersection.length > 0) {
	      		straightLineIntersections = straightLineIntersections.concat(intersection);
	      	}
	    }
	    
	    // Right segment, top to bottom
	    {
	    	var rightStartX = nodeX + halfWidth + padding;
	      	var rightStartY = nodeY - halfHeight + cornerRadius - padding;
	      	var rightEndX = rightStartX;
	      	var rightEndY = nodeY + halfHeight - cornerRadius + padding;
	      
	      	var intersection = renderer.finiteLinesIntersect(
	        	x1, y1, x2, y2, rightStartX, rightStartY, rightEndX, rightEndY, false);
	      
	      	if (intersection.length > 0) {
	      		straightLineIntersections = straightLineIntersections.concat(intersection);
	      	}
	    }
	    
	    // Bottom segment, left to right
	    {
	      	var bottomStartX = nodeX - halfWidth + cornerRadius - padding;
	      	var bottomStartY = nodeY + halfHeight + padding;
	      	var bottomEndX = nodeX + halfWidth - cornerRadius + padding;
	      	var bottomEndY = bottomStartY;
	      
	      	var intersection = renderer.finiteLinesIntersect(
	        	x1, y1, x2, y2, bottomStartX, bottomStartY, bottomEndX, bottomEndY, false);
	      
	      	if (intersection.length > 0) {
	      		straightLineIntersections = straightLineIntersections.concat(intersection);
	      	}
	    }
	    
	    // Left segment, top to bottom
	    {
	      	var leftStartX = nodeX - halfWidth - padding;
	      	var leftStartY = nodeY - halfHeight + cornerRadius - padding;
	      	var leftEndX = leftStartX;
	      	var leftEndY = nodeY + halfHeight - cornerRadius + padding;
	      
	      	var intersection = renderer.finiteLinesIntersect(
	        	x1, y1, x2, y2, leftStartX, leftStartY, leftEndX, leftEndY, false);
	      
	      	if (intersection.length > 0) {
	      		straightLineIntersections = straightLineIntersections.concat(intersection);
	      	}
	    }
	    
	    // Check intersections with arc segments
	    var arcIntersections;
	    
	    // Top Left
	    {
	      	var topLeftCenterX = nodeX - halfWidth + cornerRadius;
	      	var topLeftCenterY = nodeY - halfHeight + cornerRadius
	      	arcIntersections = renderer.intersectLineCircle(
	        	x1, y1, x2, y2, 
	        	topLeftCenterX, topLeftCenterY, cornerRadius + padding);
	      
	      	// Ensure the intersection is on the desired quarter of the circle
	      	if (arcIntersections.length > 0
	        	&& arcIntersections[0] <= topLeftCenterX
	        	&& arcIntersections[1] <= topLeftCenterY) {
	      		straightLineIntersections = straightLineIntersections.concat(arcIntersections);
	      	}
	    }
	    
	    // Top Right
	    {
	      	var topRightCenterX = nodeX + halfWidth - cornerRadius;
	      	var topRightCenterY = nodeY - halfHeight + cornerRadius
	      	arcIntersections = renderer.intersectLineCircle(
	        	x1, y1, x2, y2, 
	        	topRightCenterX, topRightCenterY, cornerRadius + padding);
	      
	      	// Ensure the intersection is on the desired quarter of the circle
	      	if (arcIntersections.length > 0
	        	&& arcIntersections[0] >= topRightCenterX
	        	&& arcIntersections[1] <= topRightCenterY) {
	      		straightLineIntersections = straightLineIntersections.concat(arcIntersections);
	      	}
	    }
	    
	    // Bottom Right
	    {
	      	var bottomRightCenterX = nodeX + halfWidth - cornerRadius;
	      	var bottomRightCenterY = nodeY + halfHeight - cornerRadius
	      	arcIntersections = renderer.intersectLineCircle(
	        	x1, y1, x2, y2, 
	        	bottomRightCenterX, bottomRightCenterY, cornerRadius + padding);
	      
	      	// Ensure the intersection is on the desired quarter of the circle
	      	if (arcIntersections.length > 0
	        	&& arcIntersections[0] >= bottomRightCenterX
	        	&& arcIntersections[1] >= bottomRightCenterY) {
	      		straightLineIntersections = straightLineIntersections.concat(arcIntersections);
	      	}
	    }
	    
	    // Bottom Left
	    {
	      	var bottomLeftCenterX = nodeX - halfWidth + cornerRadius;
	      	var bottomLeftCenterY = nodeY + halfHeight - cornerRadius
	      	arcIntersections = renderer.intersectLineCircle(
	        	x1, y1, x2, y2, 
	        	bottomLeftCenterX, bottomLeftCenterY, cornerRadius + padding);
	      
	      	// Ensure the intersection is on the desired quarter of the circle
	      	if (arcIntersections.length > 0
	        	&& arcIntersections[0] <= bottomLeftCenterX
	        	&& arcIntersections[1] >= bottomLeftCenterY) {
	      		straightLineIntersections = straightLineIntersections.concat(arcIntersections);
	      	}
	    }

	    if(straightLineIntersections.length > 0)
	    	return straightLineIntersections;
	    return []; // if nothing
	};

})( cytoscape );

