;(function($$){"use strict";
	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;
	
	//default node shapes are in nodeShape array,
	//all different types must be added
	var arrowShape = $$.style.types.arrowShape.enums;
	arrowShape.push("necessary stimulation");
	//sbgnShapes["necessary-stimulation"] = true;

	var arrowShapes = CanvasRenderer.arrowShapes;

	var bbCollide = function(x, y, centerX, centerY, width, height, direction, padding){
    	var x1 = centerX - width/2;
    	var x2 = centerX + width/2;
    	var y1 = centerY - height/2;
    	var y2 = centerY + height/2;

    	return (x1 <= x && x <= x2) && (y1 <= y && y <= y2);
  	};

	arrowShapes["necessary stimulation"] = {
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
	      var points = arrowShapes["necessary stimulation"].trianglePoints;
	      	      
	      return $$.math.pointInsidePolygon(
	        x, y, points, centerX, centerY, width, height, direction, padding);
	    },
	    
	    roughCollide: bbCollide,
	    
	    draw: function(context) {
	    	var points = arrowShapes["necessary stimulation"].trianglePoints;
	   		var linePoints = arrowShapes["necessary stimulation"].linePoints;

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
	}

})( cytoscape );