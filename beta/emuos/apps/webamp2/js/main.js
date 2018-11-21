// noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(global) {
	'use strict';

	// noinspection JSFileReferences
	require.config({
		waitSeconds : 300,
		shim: {
			jquerymousewheel: {
				deps: ['jquery']
			},
			jqueryui: {
				deps: ['jquery']
			},
			webamp: {
				deps: ['jqueryui']
			}
		},
		map: {
			'*': {
				'jQuery': 'jquery'
			}
		},
		paths: {
			jquery: 'libraries/jquery-2.2.4.min',
			jquerymousewheel: 'libraries/jquery-mousewheel-3.1.13.min',
			jqueryui: 'libraries/jquery-ui-1.11.4.min',
			text: 'libraries/requirejs-text-2.0.15',
			system: 'system'
		}
	});

	// noinspection JSCheckFunctionSignatures,JSUnusedLocalSymbols
	require([
		'jquery',
		'webamp',
		'text!views/layout.html',
		'system'
	], function($, Webamp, webamp_template) {
		$(function() {
			var webamp = new Webamp({template: webamp_template});
			// noinspection JSUnresolvedFunction
			var widget = $('<div class="widget">' + webamp.render() + '</div>');

			$('body').append(widget);

			// noinspection JSUnresolvedFunction
			webamp.events();
		});
	});
} (this));