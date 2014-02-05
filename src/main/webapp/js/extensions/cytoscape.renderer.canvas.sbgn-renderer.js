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

;(function($$){

	var CanvasRenderer = $$('renderer', 'canvas');
	var renderer = CanvasRenderer.prototype;

	// TODO access CanvasRenderer.nodeShapes object and
	// define additional custom shapes when necessary.
	// see the file extensions/renderer.canvas.node-shapes.js
	// under the main cytoscape.js repo for default shape implementations.

	//console.log(CanvasRenderer.nodeShapes);

	//default node shapes are in nodeShape array,
	//all different types must be added
	var nodeShape = $$.style.types.nodeShape.enums;
	nodeShape.push("macromolecule");

	var nodeShapes = CanvasRenderer.nodeShapes;

	function drawLabel(context, text, element, parentOpacity, textX, textY){
		var textTransform = element._private.style["text-transform"].value;

		if (textTransform == "none") {
		} else if (textTransform == "uppercase") {
			text = text.toUpperCase();
		} else if (textTransform == "lowercase") {
			text = text.toLowerCase();
		}
		
		// Calculate text draw position based on text alignment
		
		// so text outlines aren't jagged
		context.lineJoin = 'round';

		context.fillStyle = "rgba(" 
			+ element._private.style["color"].value[0] + ","
			+ element._private.style["color"].value[1] + ","
			+ element._private.style["color"].value[2] + ","
			+ (element._private.style["text-opacity"].value
			* element._private.style["opacity"].value * parentOpacity) + ")";
		
		context.strokeStyle = "rgba(" 
			+ element._private.style["text-outline-color"].value[0] + ","
			+ element._private.style["text-outline-color"].value[1] + ","
			+ element._private.style["text-outline-color"].value[2] + ","
			+ (element._private.style["text-opacity"].value
			* element._private.style["opacity"].value * parentOpacity) + ")";
		
		if (text != undefined) {
			var lineWidth = 2  * element._private.style["text-outline-width"].value; // *2 b/c the stroke is drawn centred on the middle
			if (lineWidth > 0) {
				context.lineWidth = lineWidth;
				context.strokeText(text, textX, textY);
			}

			// Thanks sysord@github for the isNaN checks!
			if (isNaN(textX)) { textX = 0; }
			if (isNaN(textY)) { textY = 0; }

			context.fillText("" + text, textX, textY);

			// record the text's width for use in bounding box calc
			element._private.rstyle.labelWidth = context.measureText( text ).width;
		}
	}

	function drawSelection(render,context, node){
		//TODO: do it for all classes in sbgn, create a sbgn class array to check
		if(render.getNodeShape(node) == "macromoleculee"){
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
		if(render.getNodeShape(node) == "macromoleculee"){
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

	//For some shapes, style changes are not enough.
	//Some of the core files must be changed.
	//drawText and drawNode functions are overrided

	// Draw text
	CanvasRenderer.prototype.drawText = function(context, element, textX, textY) { 
		var parentOpacity = 1;
		var parents = element.parents();
		for( var i = 0; i < parents.length; i++ ){
			var parent = parents[i];
			var opacity = parent._private.style.opacity.value;

			parentOpacity = opacity * parentOpacity;

			if( opacity === 0 ){
				return;
			}
		}

		// Font style
		var labelStyle = element._private.style["font-style"].strValue;
		var labelSize = element._private.style["font-size"].value + "px";
		var labelFamily = element._private.style["font-family"].strValue;
		var labelVariant = element._private.style["font-variant"].strValue;
		var labelWeight = element._private.style["font-weight"].strValue;
		
		context.font = labelStyle + " " + labelWeight + " "
			+ labelSize + " " + labelFamily;

		var text;
		var labelArray;

		if( $.isArray(element._private.style["content"].value)){
			labelArray = (element._private.style["content"].value);
			for(var i = 0 ; i < labelArray.length ; i++)
				drawLabel(context, labelArray[i], element, parentOpacity, textX+i*10, textY+i*10);

		}
		else{
			text = String(element._private.style["content"].value);
			drawLabel(context, text, element, parentOpacity, textX, textY);

		}

	};

	// Draw node
	CanvasRenderer.prototype.drawNode = function(context, node, drawOverlayInstead) {
		
		if ( !node.visible() ) {
			return;
		}

		var parentOpacity = 1;
		var parents = node.parents();
		for( var i = 0; i < parents.length; i++ ){
			var parent = parents[i];
			var opacity = parent._private.style.opacity.value;

			parentOpacity = opacity * parentOpacity;

			if( opacity === 0 ){
				return;
			}
		}
		
		context.lineWidth = node._private.style["border-width"].pxValue;

		if( drawOverlayInstead === undefined || !drawOverlayInstead ){

			// Node color & opacity
			context.fillStyle = "rgba(" 
				+ node._private.style["background-color"].value[0] + ","
				+ node._private.style["background-color"].value[1] + ","
				+ node._private.style["background-color"].value[2] + ","
				+ (node._private.style["background-opacity"].value 
				* node._private.style["opacity"].value * parentOpacity) + ")";
			
			// Node border color & opacity
			context.strokeStyle = "rgba(" 
				+ node._private.style["border-color"].value[0] + ","
				+ node._private.style["border-color"].value[1] + ","
				+ node._private.style["border-color"].value[2] + ","
				+ (node._private.style["border-opacity"].value * node._private.style["opacity"].value * parentOpacity) + ")";
			
			
			
			//var image = this.getCachedImage("url");
			
			var url = node._private.style["background-image"].value[2] ||
				node._private.style["background-image"].value[1];
			
			if (url != undefined) {
				
				var r = this;
				var image = this.getCachedImage(url,
						
						function() {
							
//							console.log(e);
							r.data.canvasNeedsRedraw[CanvasRenderer.NODE] = true;
							r.data.canvasRedrawReason[CanvasRenderer.NODE].push("image finished load");
							r.data.canvasNeedsRedraw[CanvasRenderer.DRAG] = true;
							r.data.canvasRedrawReason[CanvasRenderer.DRAG].push("image finished load");
							
							// Replace Image object with Canvas to solve zooming too far
							// into image graphical errors (Jan 10 2013)
							r.swapCachedImage(url);
							
							r.redraw();
						}
				);
				
				if (image.complete == false) {

					drawPathSelection(r,context, node);

					context.stroke();
					context.fillStyle = "#555555";
					context.fill();
					
				} else {
					//context.clip
					this.drawInscribedImage(this, context, image, node);
				}
				
			} else {

				drawSelection(this, context, node);

			}
			
			this.drawPie(context, node);

			// Border width, draw border
			if (node._private.style["border-width"].value > 0) {

				drawPathSelection(this, context, node);

				context.stroke();
			}

		// draw the overlay
		} else {

			var overlayPadding = node._private.style["overlay-padding"].value;
			var overlayOpacity = node._private.style["overlay-opacity"].value;
			var overlayColor = node._private.style["overlay-color"].value;
			if( overlayOpacity > 0 ){
				context.fillStyle = "rgba( " + overlayColor[0] + ", " + overlayColor[1] + ", " + overlayColor[2] + ", " + overlayOpacity + " )";

				drawSelection(this, context, node);

			}
		}

	};

	


})( cytoscape );
