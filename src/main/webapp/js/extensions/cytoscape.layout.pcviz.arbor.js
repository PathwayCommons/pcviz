/*
 * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
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

;(function($$) {
	var defaults = {
		liveUpdate: true, // whether to show the layout as it's running
		ready: undefined, // callback on layoutready 
		stop: undefined, // callback on layoutstop
        maxIterations: 50,
		fit: true, // fit to viewport
		padding: [ 50, 50, 50, 50 ], // top, right, bottom, left

		// forces used by arbor (use arbor default on undefined)
		repulsion: undefined,
		stiffness: undefined,
		friction: undefined,
		gravity: true,
		fps: undefined,
		precision: undefined,

        // height/width
        height: 1000,
        width: 1000,

        // if we know the location of a node, try not to update it as much as possible
        byPassUpdate: 10,

		// static numbers or functions that dynamically return what these
		// values should be for each element
		nodeMass: undefined, 
		edgeLength: undefined,

		stepSize: 1, // size of timestep in simulation
        displayStepSize: 1, // will update the display every displayStep amount of time

		// function that returns true if the system is stable to indicate
		// that the layout can be stopped
		stableEnergy: function( energy ){
			return (energy.max <= 0.5) || (energy.mean <= 0.3);
		}
	}; // end of defaults
	
	function PCVizArbor(options)
	{
		this.options = $$.util.extend({}, defaults, options);
	}
		
	PCVizArbor.prototype.run = function()
	{
		var options = this.options;
		var cy = options.cy;
		var nodes = cy.nodes();
		var edges = cy.edges();
		var container = cy.container();

		// make the canvas size propotoinal to the square root of the number of nodes
		// having in mind that the size is OK for 50 nodes
		//var width = Math.max(w , Math.ceil(Math.sqrt(nodes.length) * w/Math.sqrt(30)));
		//var height = Math.max(h , Math.ceil(Math.sqrt(nodes.length) * h/Math.sqrt(30)));
        var width = options.width;
        var height = options.height;

		nodes.each(function(i, ele) {
		    if(store.enabled) {
                var position = store.get(this.id());
                if(position != null) {
                    this.position(position);
                }
		    }
		});

		// arbor doesn't work with just 1 node
		if( cy.nodes().size() <= 1 ) {
			if( options.fit ) {
				cy.reset();
			}

			cy.nodes().position({
				x: Math.round( width/2 ),
				y: Math.round( height/2 )
			});

			cy.one("layoutstop", options.stop);
			cy.trigger("layoutstop");

			cy.one("layoutstop", options.stop);
			cy.trigger("layoutstop");

			return;
		}

		var sys = this.system = arbor.ParticleSystem(
			options.repulsion,
			options.stiffness,
			options.friction,
			options.gravity,
			options.fps,
			options.dt,
			options.precision
		);

		this.system = sys;
		if( options.liveUpdate && options.fit) {
			cy.reset();
		}
	
		var ready = false;
		var iterated = 0;
        var displayIterations = 0; // used to count the iterations
        var displayStep = options.displayStepSize;

        sys.renderer = {
			init: function() {
	       			return this;
			},

			redraw: function() {
				var energy = sys.energy();

				// if we're stable (according to the client), we're done
				if( (options.stableEnergy != null
				    && energy != null
				    && energy.n > 0
				    && options.stableEnergy(energy)) || (iterated++) > options.maxIterations )
				{
				    sys.stop();
				    cy.fit();

				    // Save locations of the nodes
				    if(store.enabled) {
					    nodes.each(function(i, ele) { store.set(this.id(), this.position()); });
                    }

                    return;
				}
				var movedNodes = [];

				sys.eachNode(function(n, point) {
					var data = n.data;
					var node = data.element;
	
					if( node == null )
					{
						return;
					}
					var pos = node._private.position;

                    if(store.enabled) {
                        var position = store.get(node.id());
                        if(position != null && (iterated % options.byPassUpdate) != 0) {
                            return;
                        }
                    }
	
					if( !node.locked() )
					{
						pos.x = point.x;
						pos.y = point.y;
						movedNodes.push( node );
					}
				});
				displayIterations++; // update the screen every displayStep iterations
				if( options.liveUpdate && movedNodes.length > 0  && (displayIterations % displayStep == 0)) {
					new $$.Collection(cy, movedNodes).rtrigger("position");
				}

				if( !ready ) {
					ready = true;
					cy.one("layoutready", options.ready);
					cy.trigger("layoutready");
				}
			}
		
		}; // end of sys.renderer

		sys.screenSize( width, height );
		sys.screenPadding( options.padding[0], options.padding[1], options.padding[2], options.padding[3] );
		sys.screenStep( options.stepSize );

		function calculateValueForElement(element, value) {
			if( value == null )
			{
				return undefined;
			} 
			else if( typeof value == typeof function(){} )
			{
				return value.apply(element, [element._private.data, {
					nodes: nodes.length,
					edges: edges.length,
					element: element}]); 
			} 
			else 
			{
				return value;
			}
		}
		
		// TODO we're using a hack; sys.toScreen should work :(
		function fromScreen(pos) {
			var x = pos.x;
			var y = pos.y;

			var left = -2;
			var right = 2;

			var d = 4;
	
			return {
				x: x/width * d + left,
				y: y/height * d + right
			};
		}

		nodes.each(function(i, node)
			{
				var id = this._private.data.id;
				var mass = calculateValueForElement(this, options.nodeMass);
				var locked = this._private.locked;

				var pos = {
					x: node.position().x,
					y: node.position().y };

				this.scratch().arbor = sys.addNode(id, {
					element: this,
					mass: mass,
					fixed: locked,
					x: locked ? pos.x : undefined,
					y: locked ? pos.y : undefined
				});
			}); // end of nodes.each
	
		edges.each(function() {
            var src = this.source().id();
            var tgt = this.target().id();
            var length = calculateValueForElement(this, options.edgeLength);

            this.scratch().arbor = sys.addEdge(src, tgt, {
                length: length
            });
        }); // end of edges.each

		sys.start();
	}; // end of PCVizArbor.prototype.run

	PCVizArbor.prototype.stop = function() {
		if( this.system != null ) {
			this.system.stop();
		}
	}; // end of PCVizArbor.prototype.stop
	
	$$("layout", "pcvizarbor", PCVizArbor);

})(cytoscape); // end of ;(function($$)

