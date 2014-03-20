;(function($$){"use strict";
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var arrowShape = $$.style.types.arrowShape.enums;
	arrowShape.push("production");
	//sbgnShapes["necessary-stimulation"] = true;

	var arrowShapes = CanvasRenderer.arrowShapes;

	var bbCollide = function(x, y, centerX, centerY, width, height, direction, padding){
    	var x1 = centerX - width/2;
    	var x2 = centerX + width/2;
    	var y1 = centerY - height/2;
    	var y2 = centerY + height/2;

    	return (x1 <= x && x <= x2) && (y1 <= y && y <= y2);
  	};

	arrowShapes["production"] = {
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
	      var points = arrowShapes["production"].trianglePoints;
	      arrowShapes["production"].ax = centerX;
	      arrowShapes["production"].ay = centerY;
	      arrowShapes["production"].awidth = width;
	      arrowShapes["production"].aheight = height;
	      return $$.math.pointInsidePolygon(
	        x, y, points, centerX, centerY, width, height, direction, padding);
	    },
	    
	    roughCollide: bbCollide,
	    
	    draw: function(context) {
	    	var points = arrowShapes["production"].points;
	    	var trianglePoints = arrowShapes["production"].trianglePoints;
	    	var textPoints = arrowShapes["production"].textPoints;

	    	//triangle
	    	for (var i = 0; i < trianglePoints.length / 2 + 1 ; i++) {
	        	context.lineTo(trianglePoints[(i * 2)% trianglePoints.length], 
	        		trianglePoints[(i * 2 + 1)% trianglePoints.length]);
	      	}

			var oldColor  = context.fillStyle;
			context.fillStyle = "#000000";
			context.fill();
			context.fillStyle = oldColor;

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
	      return 0;
	    }
	}

})( cytoscape );