;(function($$){"use strict";
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var arrowShape = $$.style.types.arrowShape.enums;
	arrowShape.push("consumption");
	//sbgnShapes["necessary-stimulation"] = true;

	var arrowShapes = CanvasRenderer.arrowShapes;

	var bbCollide = function(x, y, centerX, centerY, width, height, direction, padding){
    	var x1 = centerX - width/2;
    	var x2 = centerX + width/2;
    	var y1 = centerY - height/2;
    	var y2 = centerY + height/2;

    	return (x1 <= x && x <= x2) && (y1 <= y && y <= y2);
  	};

	arrowShapes["consumption"] = {
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
	      var points = arrowShapes["consumption"].points;

	      return $$.math.pointInsidePolygon(
	        x, y, points, centerX, centerY, width, height, direction, padding);
	    },
	    
	    roughCollide: bbCollide,
	    
	    draw: function(context) {
	    	var points = arrowShapes["consumption"].points;
	    	var textPoints = arrowShapes["consumption"].textPoints;
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
	      	$$.sbgn.drawLabelText(context, "", -10, -5);
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
	}

})( cytoscape );