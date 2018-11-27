(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
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
} (function ($) {
	// noinspection JSUnusedLocalSymbols
	var root = window.location.protocol + '//' + window.location.host + '/';

	var Webamp = function (options) {
		var self = this;

		self.options = options;

		// noinspection JSConstructorReturnsPrimitive
		return self.render();
	};

	Webamp.prototype.events = function(containment, snap, snapTolerance) {
		// noinspection JSValidateTypes
		$('.draggable').draggable({
			containment: typeof containment !== 'undefined' ? containment : '.widget',
			snap: !!snap,
			snapMode: 'outer',
			snapTolerance: typeof snapTolerance !== 'undefined' ? parseInt(snapTolerance, 10) : 10,
			cancel: '.window .marquee, .window .windows, .window .actions, .window .eject, .window .shuffle-repeat, .window .about, input, #option, #minimize, #shade, #close'
		});
	};

	Webamp.prototype.render = function(template) {
		var self = this;

		template = typeof template !== 'undefined' ? template : self.options.template;

		return template;
	};

	return Webamp;
}));