//sbgn shape rendering methods' parameters are different from default shapes.
//a map for sbgn shapes are needed to differentiate the methods.	
var sbgnShapes = new Object();

function drawSbgnText(context, label, centerX, centerY){
	context.font = "10px Arial";
	context.textAlign = "center";
	context.textBaseline = "middle";
	var oldColor  = context.fillStyle;
	context.fillStyle = "#000000";
	context.fillText("" + label, centerX, centerY);
	context.fillStyle = oldColor;
	context.stroke();
}

function drawCloneMarkerText(context, label, centerX, centerY){
	context.font = "5px Arial";
	context.textAlign = "center";
	context.textBaseline = "middle";
	var oldColor  = context.fillStyle;
	context.fillStyle = "#ffffff";
	context.fillText("" + label, centerX, centerY);
	context.fillStyle = oldColor;
	context.stroke();
}

function drawEllipsePath(context, x, y, width, height){
	context.beginPath();
	context.translate(x, y);
	context.scale(width / 2, height / 2);
	context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
	context.closePath();
	context.scale(2/width, 2/height);
	context.translate(-x, -y);
}

function drawEllipse(context, x, y, width, height){
	drawEllipsePath(context, x, y, width, height);
	context.fill();
}

function drawNucAcidFeatureOld(context, width, height, 
	centerX, centerY, cornerRadius){

	var radius = 2 * cornerRadius / height;

	context.translate(centerX, centerY);
	context.scale(width / 2, height / 2);

    context.beginPath();

    context.moveTo(-1, -1);
    context.lineTo(1, -1);
    context.lineTo(1, 0);
    context.arcTo(1, 1, 0, 1, radius);
    context.arcTo(-1, 1, -1, 0, radius);
    context.lineTo(-1, -1);

    context.closePath();

    context.scale(2 / width, 2 / height);
    context.translate(-centerX, -centerY);
}

function drawNucAcidFeature(context, width, height, 
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

function drawCirclePath(context, x, y, width, height){
		context.beginPath();
		context.translate(x, y);
		context.scale(width / 2, height / 2);
		// At origin, radius 1, 0 to 2pi
		context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
		context.closePath();

		context.scale(2/width, 2/height);
		context.translate(-x, -y);
}

function drawCircle(context, x, y, width, height){
	drawCirclePath(context, x, y, width, height);
	context.fill();
}

function drawStateAndInfos(node, context, centerX, centerY){
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

function drawPathStateAndInfos(renderer, node, context, centerX, centerY){
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
			drawEllipse(context,stateCenterX, stateCenterY, stateWidth, stateHeight);
			drawSbgnText(context, stateLabel, stateCenterX, stateCenterY);
			stateCount++;
		}
		else if(state.clazz == "unit of information" && infoCount < 2){//draw rectangle
			var stateLabel = state.label.text;
			renderer.drawRoundRectangle(context,
				stateCenterX, stateCenterY,
				stateWidth, stateHeight,
				5);
			drawSbgnText(context, stateLabel, stateCenterX, stateCenterY);
			infoCount++;
		}
		context.stroke();
	}
}

//use this function to sort states according to their x positions
function compareStates(st1, st2){
	if(st1.bbox.x < st2.bbox.x)
		return -1;
	if(st1.bbox.x > st2.bbox.x)
		return 1;
	return 0;
}

function drawComplexStateAndInfo(context, stateAndInfos, centerX, centerY, width, height){
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
}

//this function is created to have same corner length when
//complex's width or height is changed
function generateComplexShapePoints(cornerLength, width, height){
	//cp stands for corner proportion
	var cpX = cornerLength / width;
	var cpY = cornerLength / height;

	var complexPoints = new Array(-1 + cpX, -1, -1, -1 + cpY, -1, 1 - cpY, -1 + cpX, 
		1, 1 - cpX, 1, 1, 1 - cpY, 1, -1 + cpY, 1 - cpX, -1);	

	return complexPoints;
}

function drawSimpleChemicalCloneMarker(context, centerX, centerY, 
	width, height, cloneLabel){
	//TODO: add cloneLabel
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

function drawUnspecifiedEntityCloneMarker(context, centerX, centerY, 
	width, height, cloneLabel){
	drawSimpleChemicalCloneMarker(context, centerX, centerY, 
	width, height, cloneLabel);
}

function drawSourceSinkCloneMarker(context, centerX, centerY, 
	width, height, cloneLabel){
	drawSimpleChemicalCloneMarker(context, centerX, centerY, 
	width, height, cloneLabel);
}

function drawNucleicAcidFeatureCloneMarker(context, centerX, centerY, 
	width, height, cornerRadius, cloneLabel){
	//TODO: add cloneLabel
	var cloneWidth = width;
	var cloneHeight = height / 4;
	var cloneX = centerX;
	var cloneY = centerY + 3 * height / 8;

	var oldColor  = context.fillStyle;
	context.fillStyle = "#000000";

	drawNucAcidFeature(context, cloneWidth, cloneHeight, cloneX, cloneY, cornerRadius);
	
	context.fill();

 	context.fillStyle = oldColor;
}

function drawMacromoleculeCloneMarker(context, centerX, centerY, 
	width, height, cornerRadius, cloneLabel){
	drawNucleicAcidFeatureCloneMarker(context, centerX, centerY, 
		width, height, cornerRadius, cloneLabel);
}

function drawComplexCloneMarker(renderer, context, centerX, centerY, 
	width, height, cornerLength, cloneLabel){
	//cp stands for corner proportion
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

 	drawCloneMarkerText(context, "label", cloneX, cloneY);
}

function drawPerturbingAgentCloneMarker(renderer, context, centerX, centerY, 
	width, height, cloneLabel){
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

 	drawCloneMarkerText(context, "label", cloneX, cloneY);
}
