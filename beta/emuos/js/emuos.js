(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery', 'octokat'], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = function(root, jQuery) {
			if (jQuery === undefined) {
				if (typeof window !== 'undefined') {
					jQuery = require('jquery');
				} else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		factory(jQuery);
	}
} (function ($, Octokat) {
	var EmuOS = function (options) {
		var self = this;

		// noinspection JSUnusedGlobalSymbols
		self.$document	= $(document);
		self.$window	= $(window);
		self.$html		= $('html');
		self.$body		= $('body');

		self.options = {
			theme: 'theme-win3x',
			themes: {
				basic: 'theme-basic',
				win3x: 'theme-win3x',
				win9x: 'theme-win9x'
			},
			icons: [{
				name: 'Windows 93',
				icon: 'https://www.windows93.net/favicon.ico',
				link: 'https://www.windows93.net/'
			} , {
				name: 'Visual Studio Code',
				icon: 'apps/monaco-editor/favicon.ico',
				link: 'apps/monaco-editor/index.html'
			} , {
				name: 'Wing 2.0',
				icon: 'apps/wing/favicon.ico',
				link: 'apps/wing/index.html'
			} , {
				name: 'DOSBox 0.74',
				icon: 'apps/dosbox/favicon.ico',
				link: 'apps/dosbox/index.html'
			} , {
				name: 'Wolfenstein 3D',
				icon: 'apps/wolf3d/favicon.png',
				link: 'apps/wolf3d/index.html'
			} , {
				name: 'Quake 1',
				icon: 'apps/quake1/favicon.ico',
				link: 'apps/quake1/index.html'
			}],
			start: [{
				name: 'Item'
			}]
		};

		self.options = $.extend(true, self.options, options);

		// noinspection FallThroughInSwitchStatementJS
		switch (self.options.theme) {
			case 'theme-basic':
				break;
			case 'theme-win3x':
				$('.emuos-window .window.emuos-window-content').mCustomScrollbar({
					axis: 'y',
					scrollbarPosition: 'inside',
					scrollInertia: 0,
					alwaysShowScrollbar: 0,
					keyboard: {
						enable: true
					},
					scrollButtons: {
						enable: true
					},
					mouseWheel: {
						enable: true
					},
					advanced: {
						updateOnContentResize: true,
						updateOnImageLoad: true,
						updateOnSelectorChange: true
					},
					live: true
				});
			case 'theme-win9x':
				if (!(isIE || isEdge)) {
					// TODO: Performance problem on window drag and resize caused by custom cursors
					importStyles('css/themes/win3x/cursors.css');
					importStyles('css/themes/win9x/cursors.css');
				}
				break;
		}

		self.$html.addClass('emuos').addClass(self.options.theme);

		if (isIE) {
			self.$html.addClass('browser-ie');
		} else if (isEdge) {
			self.$html.addClass('browser-edge');
		} else if (isChrome || isOperaBlink) {
			self.$html.addClass('browser-chrome');
		} else if (isSafari || isOperaPresto) {
			self.$html.addClass('browser-webkit');
		} else if (isFirefox || isPaleMoon || isKMeleon || isNetscape) {
			self.$html.addClass('browser-firefox');
		} else {
			self.$html.addClass('browser-other');
		}

		var start = '';

		if (typeof self.options.start !== 'undefined') {
			start = '<ul data-menu-lang="*" data-menu-type="start">';

			for (var i in self.options.start) {
				// noinspection JSUnfilteredForInLoop
				start += '<li>' + self.options.start[i]['name'] + '</li>';
			}

			start += '</ul>';
		}

		this.$body.append('<div class="desktop"></div><div class="taskbar">' + start + '</div>');

		this.$desktop = $('.desktop').first();
		this.$taskbar = $('.taskbar').first();

		for (var j in self.options.icons) {

			// noinspection JSUnfilteredForInLoop
			var $icon = $('<a class="icon" href="javascript:">' +
							'<img src="' + self.options.icons[j]['icon'] + '" alt="' + self.options.icons[j]['name'] + '" />' +
							'<span>' + self.options.icons[j]['name'] + '</span>' +
						'</a>');

			// noinspection JSUnfilteredForInLoop
			$icon.data('name', self.options.icons[j]['name']);
			// noinspection JSUnfilteredForInLoop
			$icon.data('icon', self.options.icons[j]['icon']);
			// noinspection JSUnfilteredForInLoop
			$icon.data('link', self.options.icons[j]['link']);

			// noinspection JSUnfilteredForInLoop
			self.$desktop.append($icon);

			$icon.off('click').on('click', function(e) {
				e.preventDefault();
			}).off('dblclick').on('dblclick', function() {
				// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure
				self.iframe({
					title: $(this).data('name'),
					icon :$(this).data('icon'),
					src: $(this).data('link')
				});
			});
		}

		// noinspection JSUnresolvedFunction
		self.$taskbar.taskbar({
			draggable: true,
			resizable: true,
			resizableHandleOffset: 1,
			minimizeAll: false,
			languageSelect: false,
			toggleFullscreen: true,
			clock: true
		});

		// noinspection JSUnresolvedFunction
		self.$desktop.desktop({
			iconClass: '.icon',
			parent: '.emuos-taskbar-windows-containment'
		});

		self.$html.contextmenu({
			delegate: 'body, .emuos-taskbar',
			menu: [{
				title: 'Refresh',
				cmd: 'refresh',
				uiIcon: 'ui-icon-copy'
			} , {
				title: '----'
			} , {
				title: 'Themes',
				children: [{
					title: 'Basic',
					cmd: 'basic',
					uiIcon: 'ui-icon-clipboard'
				} , {
					title: 'Windows 3.x',
					cmd: 'win3x',
					uiIcon: 'ui-icon-scissors'
				} , {
					title: 'Windows 9x',
					cmd: 'win9x',
					uiIcon: 'ui-icon-clipboard'
				}]
			}],
			select: function(e, ui) {
				switch (ui.cmd) {
					case 'refresh':
						window.location = window.location;
						break;
					case 'basic':
						self.$html.removeClass('theme-win3x theme-win9x').addClass('theme-basic');
						// noinspection JSJQueryEfficiency
						$('.emuos-window .window.emuos-window-content').mCustomScrollbar('destroy');
						self.$taskbar.taskbar('option', 'resizableHandleOffset', 0).taskbar('instance')._refresh();
						break;
					case 'win3x':
						self.$html.removeClass('theme-basic theme-win9x').addClass('theme-win3x');
						// noinspection JSJQueryEfficiency
						$('.emuos-window .window.emuos-window-content').mCustomScrollbar('destroy');
						// noinspection JSJQueryEfficiency
						$('.emuos-window .window.emuos-window-content').mCustomScrollbar({
							axis: 'y',
							scrollbarPosition: 'inside',
							scrollInertia: 0,
							alwaysShowScrollbar: 0,
							keyboard: {
								enable: true
							},
							scrollButtons: {
								enable: true
							},
							mouseWheel: {
								enable: true
							},
							advanced: {
								updateOnContentResize: true,
								updateOnImageLoad: true,
								updateOnSelectorChange: true
							},
							live: true
						});
						self.$taskbar.taskbar('option', 'resizableHandleOffset', 0).taskbar('instance')._refresh();
						break;
					case 'win9x':
						self.$html.removeClass('theme-basic theme-win3x').addClass('theme-win9x');
						// noinspection JSJQueryEfficiency
						$('.emuos-window .window.emuos-window-content').mCustomScrollbar('destroy');
						self.$taskbar.taskbar('option', 'resizableHandleOffset', 1).taskbar('instance')._refresh();
						break;
				}

				return true;
			}
		});
	};

	EmuOS.prototype.window = function (options) {
		var self = this;

		var title	= typeof options.title		!== 'undefined'	? options.title		: '';
		var icon	= typeof options.icon		!== 'undefined'	? options.icon		: '';
		var content	= typeof options.content	!== 'undefined'	? options.content	: '';

		var window	= $('<div class="window" title="'+ title +'">' + content + '</div>');

		self.$body.append(window);

		// noinspection JSValidateTypes
		window.window({
			icons: {
				main: self.$html.hasClass('theme-basic') || self.$html.hasClass('theme-win9x') ? (icon !== '' ? icon : null) : ''
			}
		});

		$('.emuos-window').contextmenu({
			autoTrigger: false,
			delegate: '.emuos-window-icon',
			menu: [{
				title: 'Restore',
				cmd: 'restore',
				disabled: true
			} , {
				title: 'Move',
				cmd: 'move'
			} , {
				title: 'Size',
				cmd: 'size'
			} , {
				title: 'Minimize',
				cmd: 'minimize'
			} , {
				title: 'Maximize',
				cmd: 'maximize'
			} , {
				title: '----'
			} , {
				title: 'Close',
				cmd: 'close'
			} , {
				title: '----'
			} , {
				title: 'Next',
				cmd: 'next'
			}],
			select: function(e, ui) {
				switch (ui.cmd) {
					case 'close':
						// noinspection JSValidateTypes
						$(e.target).children('.window, .iframe').first().window('close');
						break;
				}

				return true;
			},
			close: function (e) {
				console.log(e);
			}
		});

		$('.emuos-window-icon').on('click', function(e) {
			$(this).parents('.emuos-window').first().contextmenu('open', $(this));
			e.preventDefault();
		});

		// noinspection JSValidateTypes
		return window.window('instance');
	};

	EmuOS.prototype.iframe = function (options) {
		var self = this;

		var title	= typeof options.title	!== 'undefined'	? options.title	: '';
		var icon	= typeof options.icon	!== 'undefined'	? options.icon	: '';
		var src		= typeof options.src	!== 'undefined'	? options.src	: '';

		var window	= $('<div class="iframe" title="'+ title +'"><iframe src="' + src + '" allowfullscreen></iframe></div>');

		self.$body.append(window);

		// noinspection JSValidateTypes
		window.window({
			embeddedContent: true,
			width: 640,
			height: 422,
			position: {
				my: 'center',
				at: 'center center-20%',
				of: this.$window.get(0),
				collision: 'fit'
			},
			icons: {
				main: this.$html.hasClass('theme-basic') || this.$html.hasClass('theme-win9x') ? (icon !== '' ? icon : null) : ''
			}
		});

		$('.emuos-window').contextmenu({
			autoTrigger: false,
			delegate: '.emuos-window-icon',
			menu: [{
				title: 'Restore',
				cmd: 'restore',
				disabled: true
			} , {
				title: 'Move',
				cmd: 'move'
			} , {
				title: 'Size',
				cmd: 'size'
			} , {
				title: 'Minimize',
				cmd: 'minimize'
			} , {
				title: 'Maximize',
				cmd: 'maximize'
			} , {
				title: '----'
			} , {
				title: 'Close',
				cmd: 'close'
			} , {
				title: '----'
			} , {
				title: 'Next',
				cmd: 'next'
			}],
			select: function(e, ui) {
				switch (ui.cmd) {
					case 'close':
						$(e.target).children('.window, .iframe').first().window('close');
						break;
				}

				return true;
			},
			close: function (e) {
				console.log(e);
			}
		});

		$('.emuos-window-icon').on('click', function(e) {
			$(this).parents('.emuos-window').first().contextmenu('open', $(this));
			e.preventDefault();
		});

		// noinspection JSValidateTypes
		return window.window('instance');
	};

	return EmuOS;
}));