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

	var Winamp = function (options) {
		var self = this;

		self.options = options;

		// noinspection JSConstructorReturnsPrimitive
		return self.render();
	};

	Winamp.prototype.render = function(template) {
		var self = this;

		if (typeof template === 'undefined') {
			template = self.options.template;
		}

		return template;
	};

	return Winamp;
}));