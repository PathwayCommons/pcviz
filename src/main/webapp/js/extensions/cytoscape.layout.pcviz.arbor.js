;(function($$){
	
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

		// static numbers or functions that dynamically return what these
		// values should be for each element
		nodeMass: undefined, 
		edgeLength: undefined,

		stepSize: 1, // size of timestep in simulation

		// function that returns true if the system is stable to indicate
		// that the layout can be stopped
		stableEnergy: function( energy ){
			return (energy.max <= 0.5) || (energy.mean <= 0.3);
		}
	};
	
	function PCVizArbor(options){
		this.options = $$.util.extend({}, defaults, options);
	}
		
	PCVizArbor.prototype.run = function(){
		var options = this.options;
		var cy = options.cy;
		var nodes = cy.nodes();
		var edges = cy.edges();
		var container = cy.container();
		var width = container.clientWidth;
		var height = container.clientHeight;

		// arbor doesn't work with just 1 node
		if( cy.nodes().size() <= 1 ){
			if( options.fit ){
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

		var sys = this.system = arbor.ParticleSystem(options.repulsion, options.stiffness, options.friction, options.gravity, options.fps, options.dt, options.precision);
		this.system = sys;

		if( options.liveUpdate && options.fit ){
			cy.reset();
		}
		
		var ready = false;
        var iterated = 0;
		
        sys.renderer = {
			init: function(){
                return this;
			},

			redraw: function(){
				var energy = sys.energy();

				// if we're stable (according to the client), we're done
				if( (options.stableEnergy != null
                    && energy != null
                    && energy.n > 0
                    && options.stableEnergy(energy)) || iterated > options.maxIterations ){
					sys.stop();
					return;
				}

				var movedNodes = [];
				
				sys.eachNode(function(n, point){ 
					var data = n.data;
					var node = data.element;
					
					if( node == null ){
						return;
					}
					var pos = node._private.position;
					
					if( !node.locked() ){
						pos.x = point.x;
						pos.y = point.y;
						
						movedNodes.push( node );
					}
				});

				if( options.liveUpdate && movedNodes.length > 0){
					new $$.Collection(cy, movedNodes).rtrigger("position");
				}

				if( !ready ){
					ready = true;
					cy.one("layoutready", options.ready);
					cy.trigger("layoutready");
				}
			}
			
		};
		sys.screenSize( width, height );
		sys.screenPadding( options.padding[0], options.padding[1], options.padding[2], options.padding[3] );
		sys.screenStep( options.stepSize );

		function calculateValueForElement(element, value){
			if( value == null ){
				return undefined;
			} else if( typeof value == typeof function(){} ){
				return value.apply(element, [element._private.data, {
					nodes: nodes.length,
					edges: edges.length,
					element: element
				}]); 
			} else {
				return value;
			}
		}
		
		// TODO we're using a hack; sys.toScreen should work :(
		function fromScreen(pos){
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

		nodes.each(function(i, node){
			var id = this._private.data.id;
			var mass = calculateValueForElement(this, options.nodeMass);
			var locked = this._private.locked;
			
			var pos = fromScreen({
				x: node.position().x,
				y: node.position().y
			});

			if( node.locked() ){
				return;
			}

			this.scratch().arbor = sys.addNode(id, {
				element: this,
				mass: mass,
				fixed: locked,
				x: locked ? pos.x : undefined,
				y: locked ? pos.y : undefined
			});
		});
		
		edges.each(function(){
			var src = this.source().id();
			var tgt = this.target().id();
			var length = calculateValueForElement(this, options.edgeLength);
			
			this.scratch().arbor = sys.addEdge(src, tgt, {
				length: length
			});
		});
		
		function packToCenter(callback){
			// TODO implement this for IE :(
			
			if( options.fit ){
				cy.fit();
			}
			callback();
		}
		
		sys.start();
	};

	PCVizArbor.prototype.stop = function(){
		if( this.system != null ){
			this.system.stop();
		}
	};
	
	$$("layout", "pcvizarbor", PCVizArbor);
	
	
})(cytoscape);
