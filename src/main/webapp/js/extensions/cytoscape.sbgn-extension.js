/*
 * Copyright 2014 Memorial-Sloan Kettering Cancer Center.
 *
 * This file is part of PCViz.
 *
 * PCViz is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PCViz is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Those are the sbgn shapes, we need this map to override cytoscape.js core functions.
 * Compartment is also another sbgn shape but we did not include it since we just use
 * roundrectangle shape for it.
 */
var sbgnShapes = {'unspecified entity' : true, 'simple chemical' : true, 'macromolecule' : true, 
	'nucleic acid feature' : true, 'perturbing agent' : true, 'source and sink' : true, 
	'complex' : true, 'process' : true, 'omitted process' : true, 'uncertain process' : true, 
	'association' : true, 'dissociation' : true, 'phenotype' : true,
	'tag' : true, 'consumption' : true, 'production' : true, 'modulation' : true, 
	'stimulation' : true, 'catalysis' : true, 'inhibition' : true, 'necessary stimulation' : true,
	'logic arc' : true, 'equivalence arc' : true, 'and operator' : true,
	'or operator' : true, 'not operator' : true};



/* 
 * Those are the utilization functions to use for drawing sbgn shapes.
 */
;(function($$){ 'use strict';
	$$.sbgn = {};

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	var nodeShapes = CanvasRenderer.nodeShapes;

	function truncateText(textProp, context) {
	    var width;
	    var text = textProp.label;
	    var len = text.length;
	    var ellipsis = '...';
	    while ((width = context.measureText(text).width) > textProp.width) {
	        --len;
	        text = text.substring(0, len) + ellipsis;
	    }
	    return text;
	}

	$$.sbgn.drawText = function(context, textProp){
		context.font = textProp.font;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		var oldColor  = context.fillStyle;
		context.fillStyle = textProp.color;
		var oldOpacity = context.globalAlpha;
		context.globalAlpha = textProp.opacity;
		context.fillText('' + truncateText(textProp, context), textProp.centerX, textProp.centerY);
		context.fillStyle = oldColor;
		context.globalAlpha = oldOpacity;
		context.stroke();
	}

	$$.sbgn.drawLabelText = function(context, textProp){
		textProp.color = '#0f0f0f';
		textProp.font = '9px Arial';
		$$.sbgn.drawText(context, textProp);
	}

	$$.sbgn.drawStateText = function(context, textProp){
		var stateValue = textProp.state.value;
		var stateVariable = textProp.state.variable;

		var stateLabel = (stateVariable == null) ? stateValue : 
			stateValue + '@' + stateVariable;

		textProp.label = stateLabel;
		textProp.color = '#0f0f0f';
		textProp.font = '8px Arial';
		$$.sbgn.drawText(context, textProp);
	}

	$$.sbgn.drawInfoText = function(context, textProp){
		textProp.color = '#0f0f0f';
		textProp.font = '8px Arial';
		$$.sbgn.drawText(context, textProp);
	}

	$$.sbgn.drawCloneMarkerText = function(context, textProp){
		textProp.color = '#fff';
		textProp.font = '4px Arial';
		$$.sbgn.drawText(context, textProp);	
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

	$$.sbgn.drawStateAndInfos = function(renderer, node, context, centerX, centerY){
		var stateAndInfos = node._private.data.sbgnstatesandinfos;
		var stateCount = 0, infoCount = 0;
				
		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			var textProp = {'centerX':stateCenterX, 'centerY':stateCenterY,
				'opacity':node._private.style['text-opacity'].value, 'width': stateWidth};

			if(state.clazz == 'state variable' && stateCount < 2){//draw ellipse
				//var stateLabel = state.state.value;
				$$.sbgn.drawEllipse(context,stateCenterX, stateCenterY, 
					stateWidth, stateHeight);

				textProp.state = state.state;
				$$.sbgn.drawStateText(context, textProp);

				stateCount++;
			}
			else if(state.clazz == 'unit of information' && infoCount < 2){//draw rectangle
				renderer.drawRoundRectangle(context,
					stateCenterX, stateCenterY,
					stateWidth, stateHeight,
					5);

				textProp.label = state.label.text;
				$$.sbgn.drawInfoText(context, textProp);
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

	$$.sbgn.drawComplexStateAndInfo = function(renderer, context, node, stateAndInfos, 
		centerX, centerY, width, height){
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

					var textProp = {'centerX':stateCenterX, 'centerY':stateCenterY,
						'opacity':node._private.style['text-opacity'].value, 'width': stateWidth};

					if(state.clazz == 'state variable'){//draw ellipse
						$$.sbgn.drawEllipse(context,
							stateCenterX, stateCenterY, 
							stateWidth, stateHeight);

						textProp.state = state.state;
						$$.sbgn.drawStateText(context, textProp);
					}
					else if(state.clazz == 'unit of information'){//draw rectangle
						renderer.drawRoundRectangle(context,
							stateCenterX, stateCenterY,
							stateWidth, stateHeight,
							5);

						textProp.label = state.label.text;
						$$.sbgn.drawInfoText(context, textProp);
					}
				}
				upWidth = upWidth + width + boxPadding;
			}
			else if(relativeYPos > 0 ){
				if(downWidth + stateWidth < width){
					stateCenterX = centerX - beginPosX + boxPadding + downWidth + stateWidth/2;
					stateCenterY = centerY + beginPosY;

					var textProp = {'centerX':stateCenterX, 'centerY':stateCenterY,
						'opacity':node._private.style['text-opacity'].value, 'width': stateWidth};

					if(state.clazz == 'state variable'){//draw ellipse
						$$.sbgn.drawEllipse(context,
							stateCenterX, stateCenterY, 
							stateWidth, stateHeight);

						textProp.state = state.state;
						$$.sbgn.drawStateText(context, textProp);
					}
					else if(state.clazz == 'unit of information'){//draw rectangle
						renderer.drawRoundRectangle(context,
							stateCenterX, stateCenterY,
							stateWidth, stateHeight,
							5);
						textProp.label = state.label.text;
						$$.sbgn.drawInfoText(context, textProp);
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
			context.fillStyle = '#0f0f0f';

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

			context.scale(2/width, 2/height);
			context.translate(-centerX, -centerY);
			context.closePath();

			context.fill();

		 	context.fillStyle = oldColor;
		}
	}

	$$.sbgn.drawSourceAndSinkCloneMarker = function(context, centerX, centerY, 
		width, height, cloneMarker){
		$$.sbgn.drawUnspecifiedEntityCloneMarker(context, centerX, centerY, 
			width, height, cloneMarker)
	}

	$$.sbgn.drawSimpleChemicalCloneMarker = function(context, centerX, centerY, 
		width, height, cloneMarker, isMultimer){
		if(cloneMarker != null){
	
			var cornerRadius = $$.math.getRoundRectangleRadius(width, height);

			var firstCircleCenterX = centerX - width/2 + cornerRadius;
			var firstCircleCenterY = centerY;
			var secondCircleCenterX = centerX + width/2 - cornerRadius;
			var secondCircleCenterY = centerY;

			$$.sbgn.drawUnspecifiedEntityCloneMarker(context, firstCircleCenterX, firstCircleCenterY, 
				2 * cornerRadius, 2 * cornerRadius, cloneMarker);

			$$.sbgn.drawUnspecifiedEntityCloneMarker(context, secondCircleCenterX, secondCircleCenterY, 
				2 * cornerRadius, 2 * cornerRadius, cloneMarker);

			var oldColor  = context.fillStyle;
			context.fillStyle = '#0f0f0f';

			var recPoints = $$.math.generateUnitNgonPointsFitToSquare(4, 0);
			var cloneX = centerX;
			var cloneY = centerY + 3/4 * cornerRadius;
			var cloneWidth = width - 2 * cornerRadius;
			var cloneHeight = cornerRadius/2;

			renderer.drawPolygon(context, cloneX, cloneY, cloneWidth, cloneHeight, recPoints);

			context.fillStyle = oldColor;
		}
	}

	$$.sbgn.drawPerturbingAgentCloneMarker = function(renderer, context, centerX, centerY, 
		width, height, cloneMarker){
		if(cloneMarker != null){
			var cloneWidth = width;
			var cloneHeight = height / 4;
			var cloneX = centerX;
			var cloneY = centerY + height/2 - height/8;

			var markerPoints = new Array(-5/6, -1, 5/6, -1, 1, 1, -1, 1);

			var oldColor  = context.fillStyle;
			context.fillStyle = '#0f0f0f';

			renderer.drawPolygon(context,
				cloneX, cloneY,
				cloneWidth, cloneHeight, markerPoints);

			context.fill();

		 	context.fillStyle = oldColor;
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
			context.fillStyle = '#0f0f0f';

			$$.sbgn.drawNucAcidFeature(context, cloneWidth, cloneHeight, cloneX, cloneY, cornerRadius);
			context.fill();
		 	context.fillStyle = oldColor;
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
			context.fillStyle = '#0f0f0f';

			renderer.drawPolygon(context,
				cloneX, cloneY,
				cloneWidth, cloneHeight, markerPoints);

			context.fill();

		 	context.fillStyle = oldColor;
		}
	}

	$$.sbgn.isMultimer = function(node){
		var sbgnClass = node._private.data.sbgnclass;
		if(sbgnClass.indexOf('multimer') != -1)
			return true;
		return false;
	}

	$$.sbgn.nucleicAcidIntersectionLine = function(node, x, y, nodeX, nodeY){
		var nodeX = node._private.position.x;
		var nodeY = node._private.position.y;
		var width = node.width();
		var height = node.height();
		var padding = node._private.style['border-width'].pxValue / 2;
		var cornerRadius = nodeShapes['nucleic acid feature'].cornerRadius;

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
		var padding = node._private.style['border-width'].pxValue / 2;
		var points = nodeShapes['square'].points;
		var cornerRadius = nodeShapes['nucleic acid feature'].cornerRadius;

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
		var padding = node._private.style['border-width'].pxValue / 2;
		var cornerRadius = nodeShapes['nucleic acid feature'].cornerRadius;

		//check rectangle at top
		if ($$.math.pointInsidePolygon(x, y, nodeShapes['roundrectangle'].points,
			centerX, centerY -  cornerRadius/2, width, height - cornerRadius, [0, -1], 
			padding)) {
			return true;
		}

		//check rectangle at bottom
		if ($$.math.pointInsidePolygon(x, y, nodeShapes['roundrectangle'].points,
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
		var padding = node._private.style['border-width'].pxValue / 2;
		var stateAndInfos = node._private.data.sbgnstatesandinfos;

		var stateCount = 0, infoCount = 0;


		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w + threshold;
			var stateHeight = state.bbox.h + threshold;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == 'state variable' && stateCount < 2){//draw ellipse
				var stateCheckPoint = nodeShapes['ellipse'].checkPoint(
					x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);

				if(stateCheckPoint == true)
					return true;

				stateCount++;
			}
			else if(state.clazz == 'unit of information' && infoCount < 2){//draw rectangle
				var infoCheckPoint = nodeShapes['roundrectangle'].checkPoint(
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
		var padding = node._private.style['border-width'].pxValue / 2;

		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == 'state variable' && stateCount < 2){//draw ellipse
				return true;
				var stateCheckPointRough = nodeShapes['ellipse'].checkPointRough(
					x, y, padding, stateWidth, stateHeight, stateCenterX, stateCenterY);
				
				if(stateCheckPointRough == true)
					return true;

				stateCount++;
			}
			else if(state.clazz == 'unit of information' && infoCount < 2){//draw rectangle
				var infoCheckPointRough = nodeShapes['roundrectangle'].checkPointRough(
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
		var padding = node._private.style['border-width'].pxValue / 2;
		
		var stateAndInfos = node._private.data.sbgnstatesandinfos;
		
		var stateCount = 0, infoCount = 0;

		var intersections = new Array();

		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == 'state variable' && stateCount < 2){//draw ellipse
				var stateIntersectLines = $$.sbgn.intersectLineEllipse(x, y, centerX, centerY, 
					stateCenterX, stateCenterY, stateWidth, stateHeight, padding);

				if(stateIntersectLines.length > 0)
					intersections = intersections.concat(stateIntersectLines);

				stateCount++;
			}
			else if(state.clazz == 'unit of information' && infoCount < 2){//draw rectangle
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
		var padding = node._private.style['border-width'].pxValue / 2;
		
		var stateAndInfos = node._private.data.sbgnstatesandinfos;
		
		var stateCount = 0, infoCount = 0;
		var padding = node._private.style['border-width'].pxValue / 2;

		for(var i = 0 ; i < stateAndInfos.length ; i++){
			var state = stateAndInfos[i];
			var stateWidth = state.bbox.w;
			var stateHeight = state.bbox.h;
			var stateCenterX = state.bbox.x + centerX;
			var stateCenterY = state.bbox.y + centerY;

			if(state.clazz == 'state variable' && stateCount < 2){//draw ellipse
				var stateIntersectBox = nodeShapes['ellipse'].intersectBox(x1, y1, x2, y2,
					stateWidth, stateHeight, stateCenterX, stateCenterY, padding);

				if(stateIntersectBox == true)
					return true;

				stateCount++;
			}
			else if(state.clazz == 'unit of information' && infoCount < 2){//draw rectangle
				var infoIntersectBox = nodeShapes['roundrectangle'].intersectBox(x1, y1, x2, y2,
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

/*
 * Some of the core functions of cytoscape.js must be overrided so that we can access the data
 * associated with the node's itself.
 */
;(function($$){'use strict';

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	function drawSelection(render,context, node){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			CanvasRenderer.nodeShapes[render.getNodeShape(node)].draw(
					context,
					node); //node._private.data.weight / 5.0
		}
		else{
			CanvasRenderer.nodeShapes[render.getNodeShape(node)].draw(
					context,
					node._private.position.x,
					node._private.position.y,
					render.getNodeWidth(node),
					render.getNodeHeight(node)); //node._private.data.weight / 5.0
		}
	}

	function drawPathSelection(render,context, node){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			CanvasRenderer.nodeShapes[render.getNodeShape(node)].drawPath(
					context,
					node); //node._private.data.weight / 5.0
		}
		else{
			CanvasRenderer.nodeShapes[render.getNodeShape(node)].drawPath(
					context,
					node._private.position.x,
					node._private.position.y,
					render.getNodeWidth(node),
					render.getNodeHeight(node)); //node._private.data.weight / 5.0
		}
	}

	function intersectLineSelection(render, node, x, y){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectLine(
				node,
				x, //halfPointX,
				y //halfPointY
			);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectLine(
				node._private.position.x,
				node._private.position.y,
				render.getNodeWidth(node),
				render.getNodeHeight(node),
				x, //halfPointX,
				y, //halfPointY
				node._private.style['border-width'].pxValue / 2
			);
		}
	}

	function checkPointRoughSelection(render, node, x, y, nodeThreshold){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].checkPointRough(x, y,
				node,
				nodeThreshold);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].checkPointRough(x, y,
				node._private.style['border-width'].pxValue / 2,
				render.getNodeWidth(node) + nodeThreshold, 
				render.getNodeHeight(node) + nodeThreshold,
				node._private.position.x,
				node._private.position.y);
		}
	}

	function checkPointSelection(render, node, x, y, nodeThreshold){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].checkPoint(x, y,
				node,
				nodeThreshold);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].checkPoint(x, y,
				node._private.style['border-width'].pxValue / 2,
				render.getNodeWidth(node) + nodeThreshold, 
				render.getNodeHeight(node) + nodeThreshold,
				node._private.position.x, 
				node._private.position.y);
		}
	}

	function intersectBoxSelection(render, x1, y1, x2, y2, node){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(sbgnShapes[render.getNodeShape(node)]){
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectBox(x1, y1, x2, y2, node);
		}
		else{
			return CanvasRenderer.nodeShapes[render.getNodeShape(node)].intersectBox(x1, y1, x2, y2,
				render.getNodeWidth(node), 
				render.getNodeHeight(node),
				node._private.position.x, 
				node._private.position.y, 
				node._private.style['border-width'].pxValue / 2);
		}
	}

	CanvasRenderer.prototype.drawPie = function(context, node){
		node = node[0]; // ensure ele ref

		if( !this.hasPie(node) ){ return; } // exit early if not needed

		var nodeW = this.getNodeWidth( node );
		var nodeH = this.getNodeHeight( node );
		var x = node._private.position.x;
		var y = node._private.position.y;
		var radius = Math.min( nodeW, nodeH ) / 2; // must fit in node
		var lastPercent = 0; // what % to continue drawing pie slices from on [0, 1]

		context.save();

		// clip to the node shape
		drawPathSelection(this, context, node);

		context.clip();

		for( var i = 1; i <= $$.style.pieBackgroundN; i++ ){ // 1..N
			var size = node._private.style['pie-' + i + '-background-size'].value;
			var color = node._private.style['pie-' + i + '-background-color'];
			var percent = size / 100; // map integer range [0, 100] to [0, 1]
			var angleStart = 1.5 * Math.PI + 2 * Math.PI * lastPercent; // start at 12 o'clock and go clockwise
			var angleDelta = 2 * Math.PI * percent;
			var angleEnd = angleStart + angleDelta;

			// slice start and end points
			var sx1 = x + radius * Math.cos( angleStart );
			var sy1 = y + radius * Math.sin( angleStart );

			// ignore if
			// - zero size
			// - we're already beyond the full circle
			// - adding the current slice would go beyond the full circle
			if( size === 0 || lastPercent >= 1 || lastPercent + percent > 1 ){
				continue;
			}

			context.beginPath();
			context.moveTo(x, y);
			context.arc( x, y, radius, angleStart, angleEnd );
			context.closePath();

			context.fillStyle = 'rgb(' 
				+ color.value[0] + ','
				+ color.value[1] + ','
				+ color.value[2] + ')'
			;

			context.fill();

			lastPercent += percent;
		}

		context.restore();
	};


	CanvasRenderer.prototype.drawInscribedImage = function(context, img, node) {
		var r = this;
//		console.log(this.data);
		var zoom = this.data.cy._private.zoom;
		
		var nodeX = node._private.position.x;
		var nodeY = node._private.position.y;

		//var nodeWidth = node._private.style['width'].value;
		//var nodeHeight = node._private.style['height'].value;
		var nodeWidth = this.getNodeWidth(node);
		var nodeHeight = this.getNodeHeight(node);
		
		context.save();
		
		drawPathSelection(this, context, node);
		
		context.clip();
		
//		context.setTransform(1, 0, 0, 1, 0, 0);
		
		var imgDim = [img.width, img.height];
		context.drawImage(img, 
				nodeX - imgDim[0] / 2,
				nodeY - imgDim[1] / 2,
				imgDim[0],
				imgDim[1]);
		
		context.restore();
		
		if (node._private.style['border-width'].value > 0) {
			context.stroke();
		}
		
	};

	CanvasRenderer.prototype.getAllInBox = function(x1, y1, x2, y2) {
		var data = this.data; 
		var nodes = this.getCachedNodes(); 
		var edges = this.getCachedEdges(); 
		var box = [];
		
		var x1c = Math.min(x1, x2); 
		var x2c = Math.max(x1, x2); 
		var y1c = Math.min(y1, y2); 
		var y2c = Math.max(y1, y2); 
		x1 = x1c; 
		x2 = x2c; 
		y1 = y1c; 
		y2 = y2c; 
		var heur;
		
		for (var i=0;i<nodes.length;i++) {
			if (intersectBoxSelection(this, x1, y1, x2, y2, nodes[i])){ 
				box.push(nodes[i]); 
			}
		}
		
		for (var i=0;i<edges.length;i++) {
			if (edges[i]._private.rscratch.edgeType == 'self') {
				if ((heur = $$.math.boxInBezierVicinity(x1, y1, x2, y2,
						edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
						edges[i]._private.rscratch.cp2ax, edges[i]._private.rscratch.cp2ay,
						edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style['width'].value))
							&&
						(heur == 2 || (heur == 1 && $$.math.checkBezierInBox(x1, y1, x2, y2,
							edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
							edges[i]._private.rscratch.cp2ax, edges[i]._private.rscratch.cp2ay,
							edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style['width'].value)))
								||
					(heur = $$.math.boxInBezierVicinity(x1, y1, x2, y2,
						edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
						edges[i]._private.rscratch.cp2cx, edges[i]._private.rscratch.cp2cy,
						edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style['width'].value))
							&&
						(heur == 2 || (heur == 1 && $$.math.checkBezierInBox(x1, y1, x2, y2,
							edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
							edges[i]._private.rscratch.cp2cx, edges[i]._private.rscratch.cp2cy,
							edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style['width'].value)))
					)
				{ box.push(edges[i]); }
			}
			
			if (edges[i]._private.rscratch.edgeType == 'bezier' &&
				(heur = $$.math.boxInBezierVicinity(x1, y1, x2, y2,
						edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
						edges[i]._private.rscratch.cp2x, edges[i]._private.rscratch.cp2y,
						edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style['width'].value))
							&&
						(heur == 2 || (heur == 1 && $$.math.checkBezierInBox(x1, y1, x2, y2,
							edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
							edges[i]._private.rscratch.cp2x, edges[i]._private.rscratch.cp2y,
							edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style['width'].value))))
				{ box.push(edges[i]); }
		
			if (edges[i]._private.rscratch.edgeType == 'straight' &&
				(heur = $$.math.boxInBezierVicinity(x1, y1, x2, y2,
						edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
						edges[i]._private.rscratch.startX * 0.5 + edges[i]._private.rscratch.endX * 0.5, 
						edges[i]._private.rscratch.startY * 0.5 + edges[i]._private.rscratch.endY * 0.5, 
						edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style['width'].value))
							&& 
						(heur == 2 || (heur == 1 && $$.math.checkStraightEdgeInBox(x1, y1, x2, y2,
							edges[i]._private.rscratch.startX, edges[i]._private.rscratch.startY,
							edges[i]._private.rscratch.endX, edges[i]._private.rscratch.endY, edges[i]._private.style['width'].value))))
				{ box.push(edges[i]); }
			
		}
		
		return box;
	}

	// Find nearest element
	CanvasRenderer.prototype.findNearestElement = function(x, y, visibleElementsOnly) {
		var data = this.data; 
		var nodes = this.getCachedNodes(); 
		var edges = this.getCachedEdges(); 
		var near = [];
		var isTouch = CanvasRenderer.isTouch;
		
		var zoom = this.data.cy.zoom();
		var edgeThreshold = (isTouch ? 256 : 32) / zoom;
		var nodeThreshold = (isTouch ? 16 : 0) /  zoom;
		
		// Check nodes
		for (var i = 0; i < nodes.length; i++) {
			
			if (checkPointRoughSelection(this, nodes[i], x, y, nodeThreshold) &&
				checkPointSelection(this, nodes[i], x, y, nodeThreshold)) {
				
				if (visibleElementsOnly) {
					if (nodes[i]._private.style['opacity'].value != 0
						&& nodes[i]._private.style['visibility'].value == 'visible'
						&& nodes[i]._private.style['display'].value == 'element') {
						
						near.push(nodes[i]);	
					}
				} else {
					near.push(nodes[i]);
				}
			}
		}
		
		// Check edges
		var addCurrentEdge;
		for (var i = 0; i < edges.length; i++) {
			var edge = edges[i];
			var rs = edge._private.rscratch;

			addCurrentEdge = false;

			if (rs.edgeType == 'self') {
				if (($$.math.inBezierVicinity(x, y,
						rs.startX,
						rs.startY,
						rs.cp2ax,
						rs.cp2ay,
						rs.selfEdgeMidX,
						rs.selfEdgeMidY,
						Math.pow(edge._private.style['width'].value/2, 2))
							&&
					(Math.pow(edges[i]._private.style['width'].value/2, 2) + edgeThreshold > 
						$$.math.sqDistanceToQuadraticBezier(x, y,
							rs.startX,
							rs.startY,
							rs.cp2ax,
							rs.cp2ay,
							rs.selfEdgeMidX,
							rs.selfEdgeMidY)))
					||
					($$.math.inBezierVicinity(x, y,
						rs.selfEdgeMidX,
						rs.selfEdgeMidY,
						rs.cp2cx,
						rs.cp2cy,
						rs.endX,
						rs.endY,
						Math.pow(edges[i]._private.style['width'].value/2, 2))
							&&
					(Math.pow(edges[i]._private.style['width'].value/2, 2) + edgeThreshold > 
						$$.math.sqDistanceToQuadraticBezier(x, y,
							rs.selfEdgeMidX,
							rs.selfEdgeMidY,
							rs.cp2cx,
							rs.cp2cy,
							rs.endX,
							rs.endY))))
					 { addCurrentEdge = true; }
			
			} else if (rs.edgeType == 'straight') {
				if ($$.math.inLineVicinity(x, y, rs.startX, rs.startY, rs.endX, rs.endY, edges[i]._private.style['width'].value * 2)
						&&
					Math.pow(edges[i]._private.style['width'].value / 2, 2) + edgeThreshold >
					$$.math.sqDistanceToFiniteLine(x, y,
						rs.startX,
						rs.startY,
						rs.endX,
						rs.endY))
					{ addCurrentEdge = true; }
			
			} else if (rs.edgeType == 'bezier') {
				if ($$.math.inBezierVicinity(x, y,
					rs.startX,
					rs.startY,
					rs.cp2x,
					rs.cp2y,
					rs.endX,
					rs.endY,
					Math.pow(edges[i]._private.style['width'].value / 2, 2))
						&&
					(Math.pow(edges[i]._private.style['width'].value / 2 , 2) + edgeThreshold >
						$$.math.sqDistanceToQuadraticBezier(x, y,
							rs.startX,
							rs.startY,
							rs.cp2x,
							rs.cp2y,
							rs.endX,
							rs.endY)))
					{ addCurrentEdge = true; }
			}
			
			if (!near.length || near[near.length - 1] != edges[i]) {
				if ((CanvasRenderer.arrowShapes[edges[i]._private.style['source-arrow-shape'].value].roughCollide(x, y,
						edges[i]._private.rscratch.arrowStartX, edges[i]._private.rscratch.arrowStartY,
						this.getArrowWidth(edges[i]._private.style['width'].value),
						this.getArrowHeight(edges[i]._private.style['width'].value),
						[edges[i]._private.rscratch.arrowStartX - edges[i].source()[0]._private.position.x,
							edges[i]._private.rscratch.arrowStartY - edges[i].source()[0]._private.position.y], 0)
						&&
					CanvasRenderer.arrowShapes[edges[i]._private.style['source-arrow-shape'].value].collide(x, y,
						edges[i]._private.rscratch.arrowStartX, edges[i]._private.rscratch.arrowStartY,
						this.getArrowWidth(edges[i]._private.style['width'].value),
						this.getArrowHeight(edges[i]._private.style['width'].value),
						[edges[i]._private.rscratch.arrowStartX - edges[i].source()[0]._private.position.x,
							edges[i]._private.rscratch.arrowStartY - edges[i].source()[0]._private.position.y], 0))
					||
					(CanvasRenderer.arrowShapes[edges[i]._private.style['target-arrow-shape'].value].roughCollide(x, y,
						edges[i]._private.rscratch.arrowEndX, edges[i]._private.rscratch.arrowEndY,
						this.getArrowWidth(edges[i]._private.style['width'].value),
						this.getArrowHeight(edges[i]._private.style['width'].value),
						[edges[i]._private.rscratch.arrowEndX - edges[i].target()[0]._private.position.x,
							edges[i]._private.rscratch.arrowEndY - edges[i].target()[0]._private.position.y], 0)
						&&
					CanvasRenderer.arrowShapes[edges[i]._private.style['target-arrow-shape'].value].collide(x, y,
						edges[i]._private.rscratch.arrowEndX, edges[i]._private.rscratch.arrowEndY,
						this.getArrowWidth(edges[i]._private.style['width'].value),
						this.getArrowHeight(edges[i]._private.style['width'].value),
						[edges[i]._private.rscratch.arrowEndX - edges[i].target()[0]._private.position.x,
							edges[i]._private.rscratch.arrowEndY - edges[i].target()[0]._private.position.y], 0)))
					{ addCurrentEdge = true; }
			}
			
			if (addCurrentEdge) {
				if (visibleElementsOnly) {
					// For edges, make sure the edge is visible/has nonzero opacity,
					// then also make sure both source and target nodes are visible/have
					// nonzero opacity
					var source = data.cy.getElementById(edges[i]._private.data.source)
					var target = data.cy.getElementById(edges[i]._private.data.target)
					
					if (edges[i]._private.style['opacity'].value != 0
						&& edges[i]._private.style['visibility'].value == 'visible'
						&& edges[i]._private.style['display'].value == 'element'
						&& source._private.style['opacity'].value != 0
						&& source._private.style['visibility'].value == 'visible'
						&& source._private.style['display'].value == 'element'
						&& target._private.style['opacity'].value != 0
						&& target._private.style['visibility'].value == 'visible'
						&& target._private.style['display'].value == 'element') {
						
						near.push(edges[i]);	
					}
				} else {
					near.push(edges[i]);
				}
			}
		} 
		
		near.sort( this.zOrderSort );
		
		if (near.length > 0) { return near[ near.length - 1 ]; } else { return null; }
	};


	CanvasRenderer.prototype.findEndpoints = function(edge) {
		var intersect;

		var source = edge.source()[0];
		var target = edge.target()[0];
		
		var srcPos = source._private.position;
		var tgtPos = target._private.position;

		var tgtArShape = edge._private.style['target-arrow-shape'].value;
		var srcArShape = edge._private.style['source-arrow-shape'].value;

		var tgtBorderW = target._private.style['border-width'].pxValue;
		var srcBorderW = source._private.style['border-width'].pxValue;

		var rs = edge._private.rscratch;
		
		if (edge._private.rscratch.edgeType == 'self') {
			
			var cp = [rs.cp2cx, rs.cp2cy];

			intersect = intersectLineSelection(this, target, cp[0], cp[1]);
			
			var arrowEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].spacing(edge));
			var edgeEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].gap(edge));
			
			rs.endX = edgeEnd[0];
			rs.endY = edgeEnd[1];
			
			rs.arrowEndX = arrowEnd[0];
			rs.arrowEndY = arrowEnd[1];
			
			var cp = [rs.cp2ax, rs.cp2ay];

			intersect = intersectLineSelection(this, source, cp[0], cp[1]);
			
			var arrowStart = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[srcArShape].spacing(edge));
			var edgeStart = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[srcArShape].gap(edge));
			
			rs.startX = edgeStart[0];
			rs.startY = edgeStart[1];


			rs.arrowStartX = arrowStart[0];
			rs.arrowStartY = arrowStart[1];
			
		} else if (rs.edgeType == 'straight') {

			intersect = intersectLineSelection(this, target, source.position().x, source.position().y);

				
			if (intersect.length == 0) {
				rs.noArrowPlacement = true;
	//			return;
			} else {
				rs.noArrowPlacement = false;
			}
			
			var arrowEnd = $$.math.shortenIntersection(intersect,
				[source.position().x, source.position().y],
				CanvasRenderer.arrowShapes[tgtArShape].spacing(edge));
			var edgeEnd = $$.math.shortenIntersection(intersect,
				[source.position().x, source.position().y],
				CanvasRenderer.arrowShapes[tgtArShape].gap(edge));

			rs.endX = edgeEnd[0];
			rs.endY = edgeEnd[1];
			
			rs.arrowEndX = arrowEnd[0];
			rs.arrowEndY = arrowEnd[1];

			intersect = intersectLineSelection(this,source, target.position().x, target.position().y);


			if (intersect.length == 0) {
				rs.noArrowPlacement = true;
	//			return;
			} else {
				rs.noArrowPlacement = false;
			}
			
			var arrowStart = $$.math.shortenIntersection(intersect,
				[target.position().x, target.position().y],
				CanvasRenderer.arrowShapes[srcArShape].spacing(edge));
			var edgeStart = $$.math.shortenIntersection(intersect,
				[target.position().x, target.position().y],
				CanvasRenderer.arrowShapes[srcArShape].gap(edge));

			rs.startX = edgeStart[0];
			rs.startY = edgeStart[1];
			
			rs.arrowStartX = arrowStart[0];
			rs.arrowStartY = arrowStart[1];
						
		} else if (rs.edgeType == 'bezier') {
			// if( window.badArrow) debugger;
			var cp = [rs.cp2x, rs.cp2y];

			intersect = intersectLineSelection(this, target, cp[0], cp[1]);
			
			var arrowEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].spacing(edge));
			var edgeEnd = $$.math.shortenIntersection(intersect, cp,
				CanvasRenderer.arrowShapes[tgtArShape].gap(edge));
			
			rs.endX = edgeEnd[0];
			rs.endY = edgeEnd[1];
			
			rs.arrowEndX = arrowEnd[0];
			rs.arrowEndY = arrowEnd[1];
			
			intersect = intersectLineSelection(this, source, cp[0], cp[1]);
			
			var arrowStart = $$.math.shortenIntersection(
				intersect, 
				cp,
				CanvasRenderer.arrowShapes[srcArShape].spacing(edge)
			);
			var edgeStart = $$.math.shortenIntersection(
				intersect, 
				cp,
				CanvasRenderer.arrowShapes[srcArShape].gap(edge)
			);
		
			rs.startX = edgeStart[0];
			rs.startY = edgeStart[1];
			
			rs.arrowStartX = arrowStart[0];
			rs.arrowStartY = arrowStart[1];
			
			// if( isNaN(rs.startX) || isNaN(rs.startY) ){
			// 	debugger;
			// }

		} else if (rs.isArcEdge) {
			return;
		}
	}

	// Draw node
	CanvasRenderer.prototype.drawNode = function(context, node, drawOverlayInstead) {
		
		var nodeWidth, nodeHeight;
		
		if ( !node.visible() ) {
			return;
		}

		var parentOpacity = node.effectiveOpacity();
		if( parentOpacity === 0 ){ return; }

		// context.fillStyle = 'orange';
		// context.fillRect(node.position().x, node.position().y, 2, 2);
		
		nodeWidth = this.getNodeWidth(node);
		nodeHeight = this.getNodeHeight(node);
		
		context.lineWidth = node._private.style['border-width'].pxValue;

		if( drawOverlayInstead === undefined || !drawOverlayInstead ){

			// Node color & opacity
			context.fillStyle = 'rgba(' 
				+ node._private.style['background-color'].value[0] + ','
				+ node._private.style['background-color'].value[1] + ','
				+ node._private.style['background-color'].value[2] + ','
				+ (node._private.style['background-opacity'].value 
				* node._private.style['opacity'].value * parentOpacity) + ')';
			
			// Node border color & opacity
			context.strokeStyle = 'rgba(' 
				+ node._private.style['border-color'].value[0] + ','
				+ node._private.style['border-color'].value[1] + ','
				+ node._private.style['border-color'].value[2] + ','
				+ (node._private.style['border-opacity'].value * node._private.style['opacity'].value * parentOpacity) + ')';
			
			context.lineJoin = 'miter'; // so borders are square with the node shape
			
			//var image = this.getCachedImage('url');
			
			var url = node._private.style['background-image'].value[2] ||
				node._private.style['background-image'].value[1];
			
			if (url != undefined) {
				
				var r = this;
				var image = this.getCachedImage(url,
						
						function() {
							
//							console.log(e);
							r.data.canvasNeedsRedraw[CanvasRenderer.NODE] = true;
							r.data.canvasNeedsRedraw[CanvasRenderer.DRAG] = true;
							
							// Replace Image object with Canvas to solve zooming too far
							// into image graphical errors (Jan 10 2013)
							r.swapCachedImage(url);
							
							r.redraw();
						}
				);
				
				if (image.complete == false) {

					drawPathSelection(r,context, node);
					
					context.stroke();
					context.fillStyle = '#555555';
					context.fill();
					
				} else {
					//context.clip
					this.drawInscribedImage(context, image, node);
				}
				
			} else {

				// Draw node
				drawSelection(this,context, node);
			}
			
			this.drawPie(context, node);

			// Border width, draw border
			if (node._private.style['border-width'].pxValue > 0) {
				drawPathSelection(this,context, node);

				context.stroke();
			}

		// draw the overlay
		} else {

			var overlayPadding = node._private.style['overlay-padding'].pxValue;
			var overlayOpacity = node._private.style['overlay-opacity'].value;
			var overlayColor = node._private.style['overlay-color'].value;
			if( overlayOpacity > 0 ){
				context.fillStyle = 'rgba( ' + overlayColor[0] + ', ' + overlayColor[1] + ', ' + overlayColor[2] + ', ' + overlayOpacity + ' )';
/*
				CanvasRenderer.nodeShapes['roundrectangle'].draw(
					context,
					node._private.position.x,
					node._private.position.y,
					nodeWidth + overlayPadding * 2,
					nodeHeight + overlayPadding * 2
				);
*/
				// Draw node
				drawSelection(this, context, node);
			}
		}

	};

	// Round rectangle drawing
	CanvasRenderer.prototype.drawRoundRectanglePath = function(
		context, x, y, width, height, radius) {
		
		var halfWidth = width / 2;
		var halfHeight = height / 2;
		//var cornerRadius = $$.math.getRoundRectangleRadius(width, height);
		var cornerRadius = radius;
		context.translate(x, y);
		
		context.beginPath();
		
		// Start at top middle
		context.moveTo(0, -halfHeight);
		// Arc from middle top to right side
		context.arcTo(halfWidth, -halfHeight, halfWidth, 0, cornerRadius);
		// Arc from right side to bottom
		context.arcTo(halfWidth, halfHeight, 0, halfHeight, cornerRadius);
		// Arc from bottom to left side
		context.arcTo(-halfWidth, halfHeight, -halfWidth, 0, cornerRadius);
		// Arc from left side to topBorder
		context.arcTo(-halfWidth, -halfHeight, 0, -halfHeight, cornerRadius);
		// Join line
		context.lineTo(0, -halfHeight);
		
		context.closePath();
		
		context.translate(-x, -y);
	}


	CanvasRenderer.prototype.getNodeShape = function(node)
	{
		// TODO only allow rectangle for a compound node?
//		if (node._private.style['width'].value == 'auto' ||
//		    node._private.style['height'].value == 'auto')
//		{
//			return 'rectangle';
//		}

		var shape = node._private.style['shape'].value;

		return shape;
	};

		// Find edge control points
	CanvasRenderer.prototype.findEdgeControlPoints = function(edges) {
		var hashTable = {}; var cy = this.data.cy;
		var pairIds = [];
		
		// create a table of edge (src, tgt) => list of edges between them
		var pairId;
		for (var i = 0; i < edges.length; i++){
			var edge = edges[i];

			// ignore edges who are not to be displayed
			// they shouldn't take up space
			if( edge._private.style.display.value === 'none' ){
				continue;
			}

			var srcId = edge._private.data.source;
			var tgtId = edge._private.data.target;

			pairId = srcId > tgtId ?
				tgtId + '-' + srcId :
				srcId + '-' + tgtId ;

			if (hashTable[pairId] == undefined) {
				hashTable[pairId] = [];
			}
			
			hashTable[pairId].push( edge );
			pairIds.push( pairId );
		}

		var src, tgt, srcPos, tgtPos, srcW, srcH, tgtW, tgtH, srcShape, tgtShape, srcBorder, tgtBorder;
		var midpt;
		var vectorNormInverse;
		var badBezier;
		
		// for each pair (src, tgt), create the ctrl pts
		// Nested for loop is OK; total number of iterations for both loops = edgeCount	
		for (var p = 0; p < pairIds.length; p++) {
			pairId = pairIds[p];
		
			src = cy.getElementById( hashTable[pairId][0]._private.data.source );
			tgt = cy.getElementById( hashTable[pairId][0]._private.data.target );

			srcPos = src._private.position;
			tgtPos = tgt._private.position;

			srcW = this.getNodeWidth(src);
			srcH = this.getNodeHeight(src);

			tgtW = this.getNodeWidth(tgt);
			tgtH = this.getNodeHeight(tgt);

			srcShape = CanvasRenderer.nodeShapes[ this.getNodeShape(src) ];
			tgtShape = CanvasRenderer.nodeShapes[ this.getNodeShape(tgt) ];

			srcBorder = src._private.style['border-width'].pxValue;
			tgtBorder = tgt._private.style['border-width'].pxValue;

			badBezier = false;
			

			if (hashTable[pairId].length > 1) {

				// pt outside src shape to calc distance/displacement from src to tgt
				/*
				var srcOutside = srcShape.intersectLine(
					srcPos.x,
					srcPos.y,
					srcW,
					srcH,
					tgtPos.x,
					tgtPos.y,
					srcBorder / 2
				);
				*/
				var srcOutside = intersectLineSelection(this, src, tgtPos.x, tgtPos.y);

				// pt outside tgt shape to calc distance/displacement from src to tgt
				/*
				var tgtOutside = tgtShape.intersectLine(
					tgtPos.x,
					tgtPos.y,
					tgtW,
					tgtH,
					srcPos.x,
					srcPos.y,
					tgtBorder / 2
				);
				*/
				var tgtOutside = intersectLineSelection(this, tgt, srcPos.x, srcPos.y);

				var midpt = {
					x: ( srcOutside[0] + tgtOutside[0] )/2,
					y: ( srcOutside[1] + tgtOutside[1] )/2
				};

				var dy = ( tgtOutside[1] - srcOutside[1] );
				var dx = ( tgtOutside[0] - srcOutside[0] );
				var l = Math.sqrt( dx*dx + dy*dy );

				var vector = {
					x: dx,
					y: dy
				};
				
				var vectorNorm = {
					x: vector.x/l,
					y: vector.y/l
				};
				vectorNormInverse = {
					x: -vectorNorm.y,
					y: vectorNorm.x
				};

				// if src intersection is inside tgt or tgt intersection is inside src, then no ctrl pts to draw
				if( checkPointSelection(this, tgt, srcOutside[0], srcOutside[1], tgtBorder/2) ||
					checkPointSelection(this, src, tgtOutside[0], tgtOutside[1], srcBorder/2)
					/* tgtShape.checkPoint( srcOutside[0], srcOutside[1], tgtBorder/2, tgtW, tgtH, tgtPos.x, tgtPos.y )  ||
					srcShape.checkPoint( tgtOutside[0], tgtOutside[1], srcBorder/2, srcW, srcH, srcPos.x, srcPos.y ) */ 
				){
					vectorNormInverse = {};
					badBezier = true;
				}
				
			}
			
			var edge;
			var rs;
			
			for (var i = 0; i < hashTable[pairId].length; i++) {
				edge = hashTable[pairId][i];
				rs = edge._private.rscratch;
				
				var edgeIndex1 = rs.lastEdgeIndex;
				var edgeIndex2 = i;

				var numEdges1 = rs.lastNumEdges;
				var numEdges2 = hashTable[pairId].length;

				var srcX1 = rs.lastSrcCtlPtX;
				var srcX2 = srcPos.x;
				var srcY1 = rs.lastSrcCtlPtY;
				var srcY2 = srcPos.y;
				var srcW1 = rs.lastSrcCtlPtW;
				var srcW2 = src.outerWidth();
				var srcH1 = rs.lastSrcCtlPtH;
				var srcH2 = src.outerHeight();

				var tgtX1 = rs.lastTgtCtlPtX;
				var tgtX2 = tgtPos.x;
				var tgtY1 = rs.lastTgtCtlPtY;
				var tgtY2 = tgtPos.y;
				var tgtW1 = rs.lastTgtCtlPtW;
				var tgtW2 = tgt.outerWidth();
				var tgtH1 = rs.lastTgtCtlPtH;
				var tgtH2 = tgt.outerHeight();

				if( badBezier ){
					rs.badBezier = true;
				} else {
					rs.badBezier = false;
				}

				if( srcX1 === srcX2 && srcY1 === srcY2 && srcW1 === srcW2 && srcH1 === srcH2
				&&  tgtX1 === tgtX2 && tgtY1 === tgtY2 && tgtW1 === tgtW2 && tgtH1 === tgtH2
				&&  edgeIndex1 === edgeIndex2 && numEdges1 === numEdges2 ){
					// console.log('edge ctrl pt cache HIT')
					continue; // then the control points haven't changed and we can skip calculating them
				} else {
					rs.lastSrcCtlPtX = srcX2;
					rs.lastSrcCtlPtY = srcY2;
					rs.lastSrcCtlPtW = srcW2;
					rs.lastSrcCtlPtH = srcH2;
					rs.lastTgtCtlPtX = tgtX2;
					rs.lastTgtCtlPtY = tgtY2;
					rs.lastTgtCtlPtW = tgtW2;
					rs.lastTgtCtlPtH = tgtH2;
					rs.lastEdgeIndex = edgeIndex2;
					rs.lastNumEdges = numEdges2;
					// console.log('edge ctrl pt cache MISS')
				}

				var stepSize = edge._private.style['control-point-step-size'].value;

				// Self-edge
				if ( src.id() == tgt.id() ) {
						
					rs.edgeType = 'self';
					
					// New -- fix for large nodes
					rs.cp2ax = srcPos.x;
					rs.cp2ay = srcPos.y - (1 + Math.pow(srcH, 1.12) / 100) * stepSize * (i / 3 + 1);
					
					rs.cp2cx = src._private.position.x - (1 + Math.pow(srcW, 1.12) / 100) * stepSize * (i / 3 + 1);
					rs.cp2cy = srcPos.y;
					
					rs.selfEdgeMidX = (rs.cp2ax + rs.cp2cx) / 2.0;
					rs.selfEdgeMidY = (rs.cp2ay + rs.cp2cy) / 2.0;
					
				// Straight edge
				} else if (hashTable[pairId].length % 2 == 1
					&& i == Math.floor(hashTable[pairId].length / 2)) {
					
					rs.edgeType = 'straight';
					
				// Bezier edge
				} else {
					var distanceFromMidpoint = (0.5 - hashTable[pairId].length / 2 + i) * stepSize;
					
					rs.edgeType = 'bezier';
					
					rs.cp2x = midpt.x + vectorNormInverse.x * distanceFromMidpoint;
					rs.cp2y = midpt.y + vectorNormInverse.y * distanceFromMidpoint;
					
					// console.log(edge, midPointX, displacementX, distanceFromMidpoint);
				}

				// find endpts for edge
				this.findEndpoints( edge );

				var badStart = !$$.is.number( rs.startX ) || !$$.is.number( rs.startY );
				var badAStart = !$$.is.number( rs.arrowStartX ) || !$$.is.number( rs.arrowStartY );
				var badEnd = !$$.is.number( rs.endX ) || !$$.is.number( rs.endY );
				var badAEnd = !$$.is.number( rs.arrowEndX ) || !$$.is.number( rs.arrowEndY );

				var minCpADistFactor = 3;
				var arrowW = this.getArrowWidth( edge._private.style['width'].pxValue ) * CanvasRenderer.arrowShapeHeight;
				var minCpADist = minCpADistFactor * arrowW;
				var startACpDist = $$.math.distance( { x: rs.cp2x, y: rs.cp2y }, { x: rs.startX, y: rs.startY } );
				var closeStartACp = startACpDist < minCpADist;
				var endACpDist = $$.math.distance( { x: rs.cp2x, y: rs.cp2y }, { x: rs.endX, y: rs.endY } );
				var closeEndACp = endACpDist < minCpADist;

				if( rs.edgeType === 'bezier' ){
					var overlapping = false;

					if( badStart || badAStart || closeStartACp ){
						overlapping = true;

						// project control point along line from src centre to outside the src shape
						// (otherwise intersection will yield nothing)
						var cpD = { // delta
							x: rs.cp2x - srcPos.x,
							y: rs.cp2y - srcPos.y
						};
						var cpL = Math.sqrt( cpD.x*cpD.x + cpD.y*cpD.y ); // length of line
						var cpM = { // normalised delta
							x: cpD.x / cpL,
							y: cpD.y / cpL
						};
						var radius = Math.max(srcW, srcH);
						var cpProj = { // *2 radius guarantees outside shape
							x: rs.cp2x + cpM.x * 2 * radius,
							y: rs.cp2y + cpM.y * 2 * radius
						};
						/*
						var srcCtrlPtIntn = srcShape.intersectLine(
							srcPos.x,
							srcPos.y,
							srcW,
							srcH,
							cpProj.x,
							cpProj.y,
							srcBorder / 2
						);
						*/

						var srcCtrlPtIntn = intersectLineSelection(this, src, cpProj.x, cpProj.y);

						if( closeStartACp ){
							rs.cp2x = rs.cp2x + cpM.x * (minCpADist - startACpDist); 
							rs.cp2y = rs.cp2y + cpM.y * (minCpADist - startACpDist)
						} else {
							rs.cp2x = srcCtrlPtIntn[0] + cpM.x * minCpADist; 
							rs.cp2y = srcCtrlPtIntn[1] + cpM.y * minCpADist;
						}
					}

					if( badEnd || badAEnd || closeEndACp ){
						overlapping = true;

						// project control point along line from tgt centre to outside the tgt shape
						// (otherwise intersection will yield nothing)
						var cpD = { // delta
							x: rs.cp2x - tgtPos.x,
							y: rs.cp2y - tgtPos.y
						};
						var cpL = Math.sqrt( cpD.x*cpD.x + cpD.y*cpD.y ); // length of line
						var cpM = { // normalised delta
							x: cpD.x / cpL,
							y: cpD.y / cpL
						};
						var radius = Math.max(srcW, srcH);
						var cpProj = { // *2 radius guarantees outside shape
							x: rs.cp2x + cpM.x * 2 * radius,
							y: rs.cp2y + cpM.y * 2 * radius
						};
						/*
						var tgtCtrlPtIntn = tgtShape.intersectLine(
							tgtPos.x,
							tgtPos.y,
							tgtW,
							tgtH,
							cpProj.x,
							cpProj.y,
							tgtBorder / 2
						);
						*/
						var tgtCtrlPtIntn = intersectLineSelection(this, tgt, cpProj.x, cpProj.y);

						if( closeEndACp ){
							rs.cp2x = rs.cp2x + cpM.x * (minCpADist - endACpDist); 
							rs.cp2y = rs.cp2y + cpM.y * (minCpADist - endACpDist);
						} else {
							rs.cp2x = tgtCtrlPtIntn[0] + cpM.x * minCpADist; 
							rs.cp2y = tgtCtrlPtIntn[1] + cpM.y * minCpADist;
						}
						
					}

					if( overlapping ){
						// recalc endpts
						this.findEndpoints( edge );
					}
				}

				// project the edge into rstyle
				this.projectBezier( edge );

			}
		}
		
		return hashTable;
	}


})( cytoscape );

/*
 * Those are the sbgn node objects
 */
;(function($$){'use strict';
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	//add each sbgn node type to cytoscape.js
	nodeShape.push('unspecified entity', 'simple chemical', 'macromolecule', 'nucleic acid feature',
		'perturbing agent', 'source and sink', 'complex', 'process', 'omitted process',
		'uncertain process', 'association', 'dissociation', 'phenotype', 'compartment',
		'tag', 'and operator', 'or operator', 'not operator');

	var nodeShapes = CanvasRenderer.nodeShapes;

	nodeShapes['unspecified entity'] = {
		multimerPadding:3,

		draw: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var multimerPadding = nodeShapes['unspecified entity'].multimerPadding;
			var sbgnClass = node._private.data.sbgnclass;

			$$.sbgn.drawEllipsePath(context, centerX, centerY, width, height);
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var multimerPadding = nodeShapes['unspecified entity'].multimerPadding;
			var sbgnClass = node._private.data.sbgnclass;
			var label = node._private.data.sbgnlabel;
			var cloneMarker = node._private.data.sbgnclonemarker;

			$$.sbgn.drawEllipse(context, centerX, centerY, width, height);

			context.stroke();

			$$.sbgn.drawSourceSinkCloneMarker(context, centerX, centerY, 
					width, height, cloneMarker);

			var textProp = {'label':label, 'centerX':centerX, 'centerY':centerY-2,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, textProp);
			
			$$.sbgn.drawStateAndInfos(renderer, node, context, centerX, centerY);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = nodeShapes['ellipse'].intersectLine(centerX, centerY, width, 
				height, x, y, padding);

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines);
			return $$.sbgn.closestIntersectionPoint([x, y], intersections);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			var nodeIntersectBox = nodeShapes['ellipse'].intersectBox(
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
			var padding = node._private.style['border-width'].pxValue / 2;

			var nodeCheckPointRough = nodeShapes['ellipse'].checkPointRough(x, y, 
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
			var padding = node._private.style['border-width'].pxValue / 2;
			
			var nodeCheckPoint =  nodeShapes['ellipse'].checkPoint(x, y, 
				padding, width, height, 
				centerX, centerY);

			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			return nodeCheckPoint || stateAndInfoCheckPoint;
		}
	};

	nodeShapes['simple chemical'] = {
		multimerPadding:3,

		draw: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var multimerPadding = nodeShapes['simple chemical'].multimerPadding;
			var padding = node._private.style['border-width'].pxValue;
			var cornerRadius = $$.math.getRoundRectangleRadius(width, height);

			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawRoundRectanglePath(context, centerX + multimerPadding, 
					centerY + multimerPadding, width, height, cornerRadius);
			}

			renderer.drawRoundRectanglePath(context, centerX, centerY, width, height, cornerRadius);
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var multimerPadding = nodeShapes['simple chemical'].multimerPadding;
			var label = node._private.data.sbgnlabel;
			var padding = node._private.style['border-width'].pxValue;
			var cloneMarker = node._private.data.sbgnclonemarker;
			var cornerRadius = $$.math.getRoundRectangleRadius(width, height);

			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawRoundRectangle(context, centerX + multimerPadding, 
					centerY + multimerPadding, width, height, cornerRadius);

				context.stroke();

				$$.sbgn.drawSimpleChemicalCloneMarker(context, 
					centerX + multimerPadding, centerY + multimerPadding, 
					width, height, cloneMarker, true);

				context.stroke();
			}

			renderer.drawRoundRectangle(context, centerX, centerY, width, height, cornerRadius);

			context.stroke();
			
			$$.sbgn.drawSimpleChemicalCloneMarker(context, centerX, centerY, 
				width, height, cloneMarker, false);

			var textProp = {'label':label, 'centerX':centerX, 'centerY':centerY-2,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, textProp);
			
			$$.sbgn.drawStateAndInfos(renderer, node, context, centerX, centerY);

		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['complex'].multimerPadding;

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = nodeShapes['roundrectangle'].intersectLine(
    			centerX, centerY, width, height, x, y, padding) ;

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectionLines = new Array();
			if($$.sbgn.isMultimer(node)){
				multimerIntersectionLines = nodeShapes['ellipse'].intersectLine(
					centerX + multimerPadding, centerY + multimerPadding, width, 
					height, x, y, padding);
			}

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines, multimerIntersectionLines);

			return $$.sbgn.closestIntersectionPoint([x, y], intersections);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['complex'].multimerPadding;

			var nodeIntersectBox = nodeShapes['roundrectangle'].intersectBox(
				x1, y1, x2, y2, width, 
				height, centerX, centerY, padding);

			var stateAndInfoIntersectBox = $$.sbgn.intersectBoxStateAndInfoBoxes(
				x1, y1, x2, y2, node);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectBox = false;
			if($$.sbgn.isMultimer(node)){
				multimerIntersectBox = nodeShapes['ellipse'].intersectBox(
				x1, y1, x2, y2, width, height, 
				centerX + multimerPadding, centerY + multimerPadding, 
				padding);
			}

			return nodeIntersectBox || stateAndInfoIntersectBox || multimerIntersectBox;

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['complex'].multimerPadding;

			var nodeCheckPointRough = nodeShapes['roundrectangle'].checkPointRough(x, y, 
				padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPointRough = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPointRough = nodeShapes['ellipse'].checkPointRough(x, y, 
				padding, width, height, 
				centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPointRough || stateAndInfoCheckPointRough || multimerCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['complex'].multimerPadding;

			var nodeCheckPoint =  nodeShapes['roundrectangle'].checkPoint(x, y, 
				padding, width, height, 
				centerX, centerY);

			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPoint = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPoint = nodeShapes['ellipse'].checkPoint(x, y, 
				padding, width, height, 
				centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
		}
	};

	nodeShapes['macromolecule'] = {
		points: $$.math.generateUnitNgonPoints(4, 0),
		cornerRadius:4,
		multimerPadding:2,

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var label = node._private.data.sbgnlabel;
			var cornerRadius = nodeShapes['macromolecule'].cornerRadius;
			var multimerPadding = nodeShapes['macromolecule'].multimerPadding;

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
		},
		
		drawPath: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var label = node._private.data.sbgnlabel;
			var cornerRadius = nodeShapes['macromolecule'].cornerRadius;
			var multimerPadding = nodeShapes['macromolecule'].multimerPadding;
			var cloneMarker = node._private.data.sbgnclonemarker;

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawRoundRectangle(context,
					centerX + multimerPadding, centerY + multimerPadding,
					width, height,
					cornerRadius);

				context.stroke();

				$$.sbgn.drawMacromoleculeCloneMarker(context, 
					centerX + multimerPadding, centerY + multimerPadding, 
					width, height, cornerRadius, cloneMarker, true);

				context.stroke();
			}

			renderer.drawRoundRectangle(context,
				centerX, centerY,
				width, height,
				cornerRadius);

			context.stroke();

			$$.sbgn.drawMacromoleculeCloneMarker(context, centerX, centerY, 
				width, height, cornerRadius, cloneMarker, false);

			var textProp = {'label':label, 'centerX':centerX, 'centerY':centerY-2,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, textProp);
			
			$$.sbgn.drawStateAndInfos(renderer, node, context, centerX, centerY);
		},
		
		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['macromolecule'].multimerPadding;
			var cornerRadius = nodeShapes['macromolecule'].cornerRadius;

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
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['macromolecule'].multimerPadding;

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
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['macromolecule'].multimerPadding;

			var nodeCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes['macromolecule'].points, 
					padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPointRough = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes['macromolecule'].points, 
					padding, width, height, centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPointRough || stateAndInfoCheckPointRough || multimerCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['macromolecule'].multimerPadding;

			var nodeCheckPoint =  nodeShapes['roundrectangle'].checkPoint(x, y, padding, 
				width, height, centerX, centerY);
			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPoint = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPoint = nodeShapes['roundrectangle'].checkPoint(x, y, padding, 
				width, height, centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
		}
	};

	nodeShapes['nucleic acid feature'] = {
		points: $$.math.generateUnitNgonPoints(4, 0),
		cornerRadius:4,
		multimerPadding:2,

		draw: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var cornerRadius = nodeShapes['nucleic acid feature'].cornerRadius;
			var multimerPadding = nodeShapes['nucleic acid feature'].multimerPadding;

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
			var cornerRadius = nodeShapes['nucleic acid feature'].cornerRadius;
			var multimerPadding = nodeShapes['nucleic acid feature'].multimerPadding;
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

			var textProp = {'label':label, 'centerX':centerX, 'centerY':centerY-2,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, textProp);

			$$.sbgn.drawStateAndInfos(renderer, node, context, centerX, centerY);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var multimerPadding = nodeShapes['complex'].multimerPadding;

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
			var multimerPadding = nodeShapes['complex'].multimerPadding;

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
			var padding = node._private.style['border-width'].pxValue / 2;
			var cornerRadius = nodeShapes['nucleic acid feature'].cornerRadius;
			var multimerPadding = nodeShapes['complex'].multimerPadding;

			var nodeCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes['nucleic acid feature'].points, 
					padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPointRough = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes['nucleic acid feature'].points, 
					padding, width, height, 
					centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPointRough || stateAndInfoCheckPointRough || multimerCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var multimerPadding = nodeShapes['nucleic acid feature'].multimerPadding;

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
	};

	nodeShapes['perturbing agent'] = {
		points: new Array(-2/3, 0, -1, 1, 1, 1, 2/3, 0, 
		1, -1, -1, -1),

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var label = node._private.data.sbgnlabel;

			renderer.drawPolygon(context,
				centerX, centerY,
				width, height,
				nodeShapes['perturbing agent'].points);
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var cloneMarker = node._private.data.sbgnclonemarker;

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height,
				nodeShapes['perturbing agent'].points);

			context.fill();

			context.stroke();

			$$.sbgn.drawPerturbingAgentCloneMarker(renderer, context, centerX, centerY, 
				width, height, cloneMarker);

			var textProp = {'label':label, 'centerX':centerX, 'centerY':centerY-2,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, textProp);
			
			$$.sbgn.drawStateAndInfos(renderer, node, context, centerX, centerY);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = renderer.polygonIntersectLine(
				x, y,
				nodeShapes['perturbing agent'].points,
				centerX,
				centerY,
				width / 2, height / 2,
				padding);

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines);

			return $$.sbgn.closestIntersectionPoint([x, y], intersections);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var points = nodeShapes['perturbing agent'].points;
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			var nodeIntersectBox = renderer.boxIntersectPolygon(x1, y1, x2, y2,
					points, width, height, centerX, centerY, [0, -1], padding);

			var stateAndInfoIntersectBox = $$.sbgn.intersectBoxStateAndInfoBoxes(
				x1, y1, x2, y2, node);

			return nodeIntersectBox || stateAndInfoIntersectBox;

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			var nodeCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes['perturbing agent'].points, 
					padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			return nodeCheckPointRough || stateAndInfoCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			var nodeCheckPoint = $$.math.pointInsidePolygon(x, y, 
				nodeShapes['perturbing agent'].points,
				centerX, centerY, width, height, [0, -1], padding);

			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			return nodeCheckPoint || stateAndInfoCheckPoint;

		}
	};

	nodeShapes['source and sink'] = {
		points: $$.math.generateUnitNgonPoints(4, 0),

		draw: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var pts = nodeShapes['source and sink'].points;

			$$.sbgn.drawEllipsePath(context, centerX, centerY,
				width, height);

			context.beginPath();
			context.translate(centerX, centerY);
			context.scale(width * Math.sqrt(2) / 2, height * Math.sqrt(2) / 2);

			context.moveTo(pts[2], pts[3]);
			context.lineTo(pts[6], pts[7]);
			context.closePath();

			context.scale(2/(width * Math.sqrt(2)), 2/(height * Math.sqrt(2)));
			context.translate(-centerX, -centerY);	

		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;
			var pts = nodeShapes['source and sink'].points;
			var cloneMarker = node._private.data.sbgnclonemarker;

			$$.sbgn.drawEllipse(context, centerX, centerY,
				width, height);

			context.stroke();

			context.beginPath();
			context.translate(centerX, centerY);
			context.scale(width * Math.sqrt(2) / 2, height * Math.sqrt(2) / 2);

			context.moveTo(pts[2], pts[3]);
			context.lineTo(pts[6], pts[7]);
			context.closePath();

			context.scale(2/(width * Math.sqrt(2)), 2/(height * Math.sqrt(2)));
			context.translate(-centerX, -centerY);	

			context.stroke();

			$$.sbgn.drawSourceAndSinkCloneMarker(context, centerX, centerY, 
				width, height, cloneMarker);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return nodeShapes['ellipse'].intersectLine(centerX, centerY, width, 
				height, x, y, padding);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return nodeShapes['ellipse'].intersectBox(x1, y1, x2, y2, width, height, 
				centerX, centerY, padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style['border-width'].pxValue / 2;

			return nodeShapes['ellipse'].checkPointRough(x, y, padding, width, height, 
				centerX, centerY);

		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return nodeShapes['ellipse'].checkPoint(x, y, padding, width, 
				height, centerX, centerY)

		}
	};

	nodeShapes['complex'] = {
		points: new Array(),
		multimerPadding:3,
		cornerLength:12,
		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;
			var cornerLength = nodeShapes['complex'].cornerLength;
			var multimerPadding = nodeShapes['complex'].multimerPadding;

			nodeShapes['complex'].points = $$.sbgn.generateComplexShapePoints(cornerLength, 
				width, height);

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawPolygonPath(context,
					centerX + multimerPadding, centerY + multimerPadding,
					width, height, nodeShapes['complex'].points);
			}

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height, nodeShapes['complex'].points);

		},

		drawPath: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var stateAndInfos = node._private.data.sbgnstatesandinfos;
			var label = node._private.data.sbgnlabel;
			var cornerLength = nodeShapes['complex'].cornerLength;
			var multimerPadding = nodeShapes['complex'].multimerPadding;
			var cloneMarker = node._private.data.sbgnclonemarker;

			node._private.style['background-opacity'] = 1;

			nodeShapes['complex'].points = $$.sbgn.generateComplexShapePoints(cornerLength, 
				width, height);

			//check whether sbgn class includes multimer substring or not
			if($$.sbgn.isMultimer(node)){
				//add multimer shape
				renderer.drawPolygon(context,
					centerX + multimerPadding, centerY + multimerPadding,
					width, height, nodeShapes['complex'].points);

				context.stroke();

				$$.sbgn.drawComplexCloneMarker(context, 
					centerX + multimerPadding, centerY + multimerPadding, 
					width, height, cornerLength, cloneMarker, true);

				context.stroke();
			}

			renderer.drawPolygon(context,
				centerX, centerY,
				width, height, nodeShapes['complex'].points);

			context.stroke();

			$$.sbgn.drawComplexCloneMarker(context, centerX, centerY, 
				width, height, cornerLength, cloneMarker, false);
			$$.sbgn.drawComplexStateAndInfo(renderer, context, node, stateAndInfos, centerX, centerY, width, height);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['complex'].multimerPadding;
			var cornerLength = nodeShapes['complex'].cornerLength;

			node._private.style['background-opacity'] = 1;

			nodeShapes['complex'].points = $$.sbgn.generateComplexShapePoints(cornerLength, 
				width, height);

			var stateAndInfoIntersectLines = $$.sbgn.intersectLineStateAndInfoBoxes(
				node, x, y);

			var nodeIntersectLines = $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes['complex'].points,
					centerX,
					centerY,
					width/2, height/2,
					padding);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectionLines = new Array();
			if($$.sbgn.isMultimer(node)){
				multimerIntersectionLines = $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes['complex'].points,
					centerX + multimerPadding,
					centerY + multimerPadding,
					width/2, height/2,
					padding);
			}

			var intersections = stateAndInfoIntersectLines.concat(nodeIntersectLines, multimerIntersectionLines);

			return $$.sbgn.closestIntersectionPoint([x, y], intersections);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			var cornerLength = nodeShapes['complex'].cornerLength;
			var multimerPadding = nodeShapes['complex'].multimerPadding;
			
			nodeShapes['complex'].points = $$.sbgn.generateComplexShapePoints(cornerLength, 
				width, height);

			var points = nodeShapes['complex'].points;

			var nodeIntersectBox = $$.math.boxIntersectPolygon(
				x1, y1, x2, y2,
				points, width, height, centerX, centerY, [0, -1], padding);

			var stateAndInfoIntersectBox = $$.sbgn.intersectBoxStateAndInfoBoxes(
				x1, y1, x2, y2, node);

			//check whether sbgn class includes multimer substring or not
			var multimerIntersectBox = false;
			if($$.sbgn.isMultimer(node)){
				multimerIntersectBox = $$.math.boxIntersectPolygon(
				x1, y1, x2, y2, points, width, height, 
				centerX + multimerPadding, centerY + multimerPadding, 
				[0, -1], padding);
			}

			return nodeIntersectBox || stateAndInfoIntersectBox || multimerIntersectBox;
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['complex'].multimerPadding;
			var cornerLength = nodeShapes['complex'].cornerLength;

			nodeShapes['complex'].points = $$.sbgn.generateComplexShapePoints(cornerLength, 
				width, height);

			var nodeCheckPointRough = $$.math.checkInBoundingBox(
				x, y, nodeShapes['complex'].points, 
					padding, width, height, centerX, centerY);

			var stateAndInfoCheckPointRough = $$.sbgn.checkPointRoughStateAndInfoBoxes(node,
				x, y, centerX, centerY);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPointRough = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPointRough = $$.math.checkInBoundingBox(
					x, y, nodeShapes['complex'].points, 
					padding, width, height, 
					centerX + multimerPadding, centerY + multimerPadding);
			}

			return nodeCheckPointRough || stateAndInfoCheckPointRough || multimerCheckPointRough;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width() + threshold;
			var height = node.height() + threshold;
			var padding = node._private.style['border-width'].pxValue / 2;
			var multimerPadding = nodeShapes['complex'].multimerPadding;
			var cornerLength = nodeShapes['complex'].cornerLength;

			nodeShapes['complex'].points = $$.sbgn.generateComplexShapePoints(cornerLength, 
				width, height);

			var nodeCheckPoint =  $$.math.pointInsidePolygon(x, y, nodeShapes['complex'].points,
				centerX, centerY, width, height, [0, -1], padding);

			var stateAndInfoCheckPoint = $$.sbgn.checkPointStateAndInfoBoxes(x, y, node, 
				threshold);

			//check whether sbgn class includes multimer substring or not
			var multimerCheckPoint = false;
			if($$.sbgn.isMultimer(node)){
				multimerCheckPoint = $$.math.pointInsidePolygon(x, y, 
					nodeShapes['complex'].points,
					centerX + multimerPadding, centerY + multimerPadding, 
					width, height, [0, -1], padding);

			}

			return nodeCheckPoint || stateAndInfoCheckPoint || multimerCheckPoint;
		}
	};

	nodeShapes['process'] = {
		points: $$.math.generateUnitNgonPointsFitToSquare(4, 0),
		label : '',

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			renderer.drawPolygon(context,
				centerX, centerY,
				width, height,
				nodeShapes['process'].points);

			var textProp = {'label':this.label, 'centerX':centerX, 'centerY':centerY,
				'opacity':node._private.style['text-opacity'].value, 'width': width};
			$$.sbgn.drawLabelText(context, textProp);
		},

		drawPath: function(context, node) {

			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height,
				nodeShapes['process'].points);
		},

		intersectLine: function(node, x, y) {

			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return $$.math.polygonIntersectLine(
					x, y, 
					nodeShapes['process'].points,
					nodeX,
					nodeY,
					width/2, height/2,
					padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var points = nodeShapes['process'].points;
			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return $$.math.boxIntersectPolygon(x1, y1, x2, y2, 
				points, width, height, nodeX, nodeY, [0, -1], padding);
		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return $$.math.checkInBoundingBox(
				x, y, nodeShapes['process'].points, 
					padding, width, height, centerX, centerY);
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes['process'].points,
				centerX, centerY, width, height, [0, -1], padding);
		}
	};

	nodeShapes['dissociation'] = {
		draw: function(context, node) {
			nodeShapes['dissociation'].drawPath(context, node);
			context.fill();
		},

		drawPath: function(context, node) {

			var centerX = node._private.position.x;
			var centerY = node._private.position.y;;
			var width = node.width();
			var height = node.height();

			context.beginPath();
			context.translate(centerX, centerY);
			context.scale(width / 4, height / 4);
			
			// At origin, radius 1, 0 to 2pi
			context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
			
			context.closePath();
			context.scale(4/width, 4/height);
			context.translate(-centerX, -centerY);

			$$.sbgn.drawEllipsePath(context, centerX, centerY, width/2, height/2);

			context.stroke();

			$$.sbgn.drawEllipsePath(context, centerX, centerY, width, height);

		},

		intersectLine: function(node, x, y) {

			var nodeX = node._private.position.x;
			var nodeY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return $$.math.intersectLineEllipse(
				x, y,
				nodeX,
				nodeY,
				width / 2 + padding,
				height / 2 + padding);
		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return $$.math.boxIntersectEllipse(
				x1, y1, x2, y2, padding, width, height, centerX, centerY);

		},

		checkPointRough: function(x, y, node, threshold) {
			return true;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			x -= centerX;
			y -= centerY;

			x /= (width / 2 + padding);
			y /= (height / 2 + padding);

			return (Math.pow(x, 2) + Math.pow(y, 2) <= 1);
		}
	};

	nodeShapes['phenotype'] = {
		points: new Array(-1, 0, -0.5, -1, 0.5, -1, 
			1, 0, 0.5, 1, -0.5, 1),

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;

			renderer.drawPolygon(context,
				centerX, centerY,
				width, height,
				nodeShapes['phenotype'].points);
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height,
				nodeShapes['phenotype'].points);

		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return renderer.polygonIntersectLine(
				x, y,
				nodeShapes['phenotype'].points,
				centerX,
				centerY,
				width / 2, height / 2,
				padding);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var points = nodeShapes['phenotype'].points;
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return renderer.boxIntersectPolygon(x1, y1, x2, y2,
					points, width, height, centerX, centerY, [0, -1], padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			
			return $$.math.checkInBoundingBox(
				x, y, nodeShapes['phenotype'].points, 
					padding, width, height, centerX, centerY);
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes['phenotype'].points,
				centerX, centerY, width, height, [0, -1], padding);

		}
	};

	nodeShapes['tag'] = {
		points: new Array(-1, -1, 1/3, -1, 1, 0, 1/3, 1, -1, 1),

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;

			renderer.drawPolygon(context,
				centerX, centerY,
				width, height,
				nodeShapes['tag'].points);
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;

			renderer.drawPolygonPath(context,
				centerX, centerY,
				width, height,
				nodeShapes['tag'].points);

			context.stroke();

			var textProp = {'label':label, 'centerX':centerX - width/6, 'centerY':centerY,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, textProp);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return renderer.polygonIntersectLine(
				x, y,
				nodeShapes['tag'].points,
				centerX,
				centerY,
				width / 2, height / 2,
				padding);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var points = nodeShapes['tag'].points;
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return renderer.boxIntersectPolygon(x1, y1, x2, y2,
					points, width, height, centerX, centerY, [0, -1], padding);

		},

		checkPointRough: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;
			
			return $$.math.checkInBoundingBox(
				x, y, nodeShapes['tag'].points, 
					padding, width, height, centerX, centerY);
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return $$.math.pointInsidePolygon(x, y, nodeShapes['tag'].points,
				centerX, centerY, width, height, [0, -1], padding);

		}
	};

	//TODO : add and, or and not operators.
	nodeShapes['and operator'] = {

		draw: function(context, node) {
			var width = node.width();
			var height = node.height();
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;

			nodeShapes['and operator'].drawPath(context, node);
			context.fill();
		},

		drawPath: function(context, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var label = node._private.data.sbgnlabel;

			$$.sbgn.drawEllipsePath(context, centerX, centerY, width, height);

			context.stroke();

			var textProp = {'label':label, 'centerX':centerX , 'centerY':centerY,
				'opacity':node._private.style['text-opacity'].value, 'width': node._private.data.sbgnbbox.w};
			$$.sbgn.drawLabelText(context, textProp);
		},

		intersectLine: function(node, x, y) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return nodeShapes['ellipse'].intersectLine(centerX, centerY, width,
				height, x, y, padding);

		},

		intersectBox: function(x1, y1, x2, y2, node) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return nodeShapes['ellipse'].intersectLine(x1, y1, x2, y2, width,
				height, centerX, centerY, padding);
		},

		checkPointRough: function(x, y, node, threshold) {
			return true;
		},

		checkPoint: function(x, y, node, threshold) {
			var centerX = node._private.position.x;
			var centerY = node._private.position.y;
			var width = node.width();
			var height = node.height();
			var padding = node._private.style['border-width'].pxValue / 2;

			return nodeShapes['ellipse'].checkPoint(x, y, padding, width,
				height, centerX, centerY);

		}
	};
	

	nodeShapes['or operator'] = nodeShapes['and operator'];
	nodeShapes['not operator'] = nodeShapes['and operator'];

	nodeShapes['omitted process'] = jQuery.extend(true, {}, nodeShapes['process']);
	nodeShapes['omitted process'].label = '\\\\';

	nodeShapes['uncertain process'] = jQuery.extend(true, {}, nodeShapes['process']);
	nodeShapes['uncertain process'].label = '?';

	nodeShapes['association'] = nodeShapes['ellipse'];

	nodeShapes['compartment'] = nodeShapes['roundrectangle'];
	
})( cytoscape );

/*
 * Those are the sbgn edge objects
 */
;(function($$){'use strict';
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default edge shapes are in arrowShape array,
	//all different types must be added
	var arrowShape = $$.style.types.arrowShape.enums;
	//add each sbgn node type to cytoscape.js
	arrowShape.push('consumption', 'production', 'modulation', 'stimulation',
		'catalysis', 'inhibition', 'necessary stimulation', 'logic arc',
		'equivalence arc');

	var arrowShapes = CanvasRenderer.arrowShapes;

	var bbCollide = function(x, y, centerX, centerY, width, height, direction, padding){
    	var x1 = centerX - width/2;
    	var x2 = centerX + width/2;
    	var y1 = centerY - height/2;
    	var y2 = centerY + height/2;

    	return (x1 <= x && x <= x2) && (y1 <= y && y <= y2);
  	};

	arrowShapes['consumption'] = {
	    points: [
	      0, -0.15,
	      0.30, -0.15,
	      0.30, -0.45,
	      0, -0.45
	    ],

	    textPoints: [
	    	0.20, -0.25,
	    	0.10, -0.25,
	    	0.20, -0.35,
	    	0.10, -0.35
	    ],

	    collide: function(x, y, centerX, centerY, width, height, direction, padding) {
	      var points = arrowShapes['consumption'].points;

	      return $$.math.pointInsidePolygon(
	        x, y, points, centerX, centerY, width, height, direction, padding);
	    },
	    
	    roughCollide: bbCollide,
	    
	    draw: function(context) {
	    	var points = arrowShapes['consumption'].points;
	    	var textPoints = arrowShapes['consumption'].textPoints;
/*
	    	//square
	    	context.beginPath();
	    	for (var i = 0; i < points.length / 2 ; i++) {
	        	context.lineTo(points[(i * 2)], 
	        		points[(i * 2 + 1)]);
	      	}
	      	context.closePath();

			//console.log(context.lineWidth);
	      	context.scale(1/30, 1/30);
	      	context.rotate(Math.PI /2);
	      	$$.sbgn.drawLabelText(context, '', -10, -5);
	      	context.rotate(-Math.PI /2);
	      	context.scale(30, 30);
*/
	    },
	    
	    spacing: function(edge) {
	      return 0;
	    },
	    
	    gap: function(edge) {
	    	return 0;
	    }
	};

	arrowShapes['production'] = {
	    points: [
	      0, -0.40,
	      0.30, -0.40,
	      0.30, -0.70,
	      0, -0.70
	    ],

	   	textPoints: [
	    	0.20, -0.50,
	    	0.10, -0.50,
	    	0.20, -0.60,
	    	0.10, -0.60
	    ],

	   	trianglePoints: [
    		-0.15, -0.3,
      		0, 0,
      		0.15, -0.3
    	],

    	ax : 0,
    	ay : 0,
    	awidth : 0,
    	aheight : 0,

	    collide: function(x, y, centerX, centerY, width, height, direction, padding) {
	      var points = arrowShapes['production'].trianglePoints;
	      arrowShapes['production'].ax = centerX;
	      arrowShapes['production'].ay = centerY;
	      arrowShapes['production'].awidth = width;
	      arrowShapes['production'].aheight = height;
	      return $$.math.pointInsidePolygon(
	        x, y, points, centerX, centerY, width, height, direction, padding);
	    },
	    
	    roughCollide: bbCollide,
	    
	    draw: function(context) {
	    	var points = arrowShapes['production'].points;
	    	var trianglePoints = arrowShapes['production'].trianglePoints;
	    	var textPoints = arrowShapes['production'].textPoints;

	    	//triangle
	    	for (var i = 0; i < trianglePoints.length / 2 + 1 ; i++) {
	        	context.lineTo(trianglePoints[(i * 2)% trianglePoints.length], 
	        		trianglePoints[(i * 2 + 1)% trianglePoints.length]);
	      	}

			//var oldColor  = context.fillStyle;
			//context.fillStyle = '#000000';
			context.fill();
			//context.fillStyle = oldColor;

	      	context.moveTo(points[0], points[1]);
/*
	      	//square
	      	context.beginPath();
	    	for (var i = 0; i < points.length / 2 ; i++) {
	        	context.lineTo(points[(i * 2)], 
	        		points[(i * 2 + 1)]);
	      	}
	      	context.closePath();
*/

	    },
	    
	    spacing: function(edge) {
	      return 0;
	    },
	    
	    gap: function(edge) {
	      return edge._private.style['width'].pxValue * 2;
	    }
	};

	arrowShapes['necessary stimulation'] = {
	    trianglePoints: [
	      -0.15, -0.3,
	      0, 0,
	      0.15, -0.3
	    ],

	    linePoints: [
	    	-0.15, -0.37,
	    	0.15, -0.37
	    ],
	    
	    collide: function(x, y, centerX, centerY, width, height, direction, padding) {
	      var points = arrowShapes['necessary stimulation'].trianglePoints;
	      	      
	      return $$.math.pointInsidePolygon(
	        x, y, points, centerX, centerY, width, height, direction, padding);
	    },
	    
	    roughCollide: bbCollide,
	    
	    draw: function(context) {
	    	var points = arrowShapes['necessary stimulation'].trianglePoints;
	   		var linePoints = arrowShapes['necessary stimulation'].linePoints;

	   		context.beginPath();
	    	for (var i = 0; i < points.length / 2 + 1 ; i++) {
	        	context.lineTo(points[(i * 2)% points.length], 
	        		points[(i * 2 + 1)% points.length]);
	      	}
	      	context.closePath();

	      	context.moveTo(linePoints[0], linePoints[1]);
	      	context.lineTo(linePoints[2], linePoints[3]);

	    },
	    
	    spacing: function(edge) {
	      return 0;
	    },
	    
	    gap: function(edge) {
	      return edge._private.style['width'].pxValue * 2;
	    }
	};

	arrowShapes['modulation'] = arrowShapes['diamond'];

	arrowShapes['stimulation'] = arrowShapes['triangle'];

	arrowShapes['catalysis'] = arrowShapes['circle'];

	arrowShapes['inhibition'] = arrowShapes['tee'];
	
	arrowShapes['logic arc'] = arrowShapes['none'];

	arrowShapes['equivalence arc'] = arrowShapes['none'];

})( cytoscape );