;(function($) {
	$.noty.themes.pcvizTheme = {
		name: 'pcvizTheme',
		helpers: {
			borderFix: function() {
				if (this.options.dismissQueue) {
					var selector = this.options.layout.container.selector + ' ' + this.options.layout.parent.selector;
					switch (this.options.layout.name) {
						case 'top':
							$(selector).css({borderRadius: '0px 0px 0px 0px'});
							$(selector).last().css({borderRadius: '0px 0px 5px 5px'}); break;
						case 'topCenter': case 'topLeft': case 'topRight':
						case 'bottomCenter': case 'bottomLeft': case 'bottomRight':
						case 'center': case 'centerLeft': case 'centerRight': case 'inline':
							$(selector).css({borderRadius: '0px 0px 0px 0px'});
							$(selector).first().css({'border-top-left-radius': '5px', 'border-top-right-radius': '5px'});
							$(selector).last().css({'border-bottom-left-radius': '5px', 'border-bottom-right-radius': '5px'}); break;
						case 'bottom':
							$(selector).css({borderRadius: '0px 0px 0px 0px'});
							$(selector).first().css({borderRadius: '5px 5px 0px 0px'}); break;
						default: break;
					}
				}
			}
		},
		modal: {
			css: {
				position: 'fixed',
				width: '100%',
				height: '100%',
				backgroundColor: '#000',
				zIndex: 10000,
				opacity: 0.6,
				display: 'none',
				left: 0,
				top: 0
			}
		},
		style: function() {

			this.$bar.css({
				overflow: 'hidden'
			});

			this.$message.css({
				fontSize: '13px',
				lineHeight: '16px',
				textAlign: 'center',
				padding: '8px 10px 9px',
				width: 'auto',
				position: 'relative'
			});

			this.$closeButton.css({
				position: 'absolute',
				top: 4, right: 4,
				width: 10, height: 10,
				display: 'none',
				cursor: 'pointer'
			});

			this.$buttons.css({
				padding: 5,
				textAlign: 'right',
				borderTop: '1px solid #ccc',
				backgroundColor: '#fff'
			});

			this.$buttons.find('button').css({
				marginLeft: 5
			});

			this.$buttons.find('button:first').css({
				marginLeft: 0
			});

			this.$bar.bind({
				mouseenter: function() { $(this).find('.noty_close').stop().fadeTo('normal',1); },
				mouseleave: function() { $(this).find('.noty_close').stop().fadeTo('normal',0); }
			});

			switch (this.options.layout.name) {
				case 'top':
					this.$bar.css({
						borderRadius: '0px 0px 5px 5px',
						borderBottom: '2px solid #eee',
						borderLeft: '2px solid #eee',
						borderRight: '2px solid #eee'
					});
				break;
				case 'topCenter': case 'center': case 'bottomCenter': case 'inline':
					this.$bar.css({
						borderRadius: '5px',
						border: '1px solid #eee'
					});
					this.$message.css({fontSize: '13px', textAlign: 'center'});
				break;
				case 'topLeft': case 'topRight':
				case 'bottomLeft': case 'bottomRight':
				case 'centerLeft': case 'centerRight':
					this.$bar.css({
						borderRadius: '5px',
						border: '1px solid #eee'
					});
					this.$message.css({fontSize: '13px', textAlign: 'left'});
				break;
				case 'bottom':
					this.$bar.css({
						borderRadius: '5px 5px 0px 0px',
						borderTop: '2px solid #eee',
						borderLeft: '2px solid #eee',
						borderRight: '2px solid #eee'
					});
				break;
				default:
					this.$bar.css({
						border: '2px solid #eee'
					});
				break;
			}

			switch (this.options.type) {
				case 'alert': case 'notification':
					this.$bar.css({backgroundColor: '#FFF', borderColor: '#CCC', color: '#444'}); break;
				case 'warning':
					this.$bar.css({backgroundColor: '#f1c40f', borderColor: '#f1c40f', color: '#826200'});
					this.$buttons.css({borderTop: '1px solid #FFC237'}); break;
				case 'error':
					this.$bar.css({backgroundColor: '#e74c3c', borderColor: '#e74c3c', color: '#FFF'});
					this.$message.css({fontWeight: 'bold'});
					this.$buttons.css({borderTop: '1px solid darkred'}); break;
				case 'information':
					this.$bar.css({backgroundColor: '#57B7E2', borderColor: '#0B90C4', color: '#FFF'});
					this.$buttons.css({borderTop: '1px solid #0B90C4'}); break;
				case 'success':
					this.$bar.css({backgroundColor: 'lightgreen', borderColor: '#50C24E', color: 'darkgreen'});
					this.$buttons.css({borderTop: '1px solid #50C24E'});break;
				default:
					this.$bar.css({backgroundColor: '#FFF', borderColor: '#CCC', color: '#444'}); break;
			}
		},
		callback: {
			onShow: function() { $.noty.themes.pcvizTheme.helpers.borderFix.apply(this); },
			onClose: function() { $.noty.themes.pcvizTheme.helpers.borderFix.apply(this); }
		}
	};

})(jQuery);
