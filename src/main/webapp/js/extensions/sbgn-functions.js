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

function drawNucAcidFeature(context, halfWidth, halfHeight, 
	centerX, centerY, cornerRadius){
	
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

function drawCircle(context, x, y, width, height){
		context.beginPath();
		context.translate(x, y);
		context.scale(width / 2, height / 2);
		// At origin, radius 1, 0 to 2pi
		context.arc(0, 0, 1, 0, Math.PI * 2 * 0.999, false); // *0.999 b/c chrome rendering bug on full circle
		context.closePath();

		context.scale(2/width, 2/height);
		context.translate(-x, -y);
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

//use this function to sort states according to their x positions
function compareStates(st1, st2){
	if(st1.bbox.x < st2.bbox.x)
		return -1;
	if(st1.bbox.x > st2.bbox.x)
		return 1;
	return 0;
}