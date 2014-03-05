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