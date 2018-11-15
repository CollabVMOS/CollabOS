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
			jqueryuicontextmenu: {
				deps: ['jqueryui']
			},
			jqueryuitree: {
				deps: ['jqueryui']
			},
			jquerycustomscrollbar: {
				deps: ['jquery']
			},
			jsrsasign: {
				exports: 'KJUR'
			},
			octokat: {
				deps: ['promise', 'fetch']
			},
			emuos: {
				deps: ['desktop']
			},
			filesystem: {
				deps: ['jqueryui', 'jqyeryajaxretry', 'jsrsasign', 'octokat']
			},
			desktop: {
				deps: ['window']
			},
			taskbar: {
				deps: ['filesystem']
			},
			window: {
				deps: ['taskbar']
			},
			winamp: {
				deps: ['jquery']
			},
			lang: {
				deps: ['taskbar']
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
			jqueryuicontextmenu: 'libraries/jquery-ui-contextmenu-1.18.1.min',
			jqueryuitree: 'libraries/jquery-ui-tree-3.0.0.min',
			jquerycustomscrollbar: 'libraries/jquery-customscrollbar-3.1.5.min',
			jqyeryajaxretry: 'libraries/jquery-ajax-retry-0.2.7.min',
			jsrsasign: 'libraries/jsrsasign-all-8.0.12.min',
			promise: 'polyfills/es6-promise-4.2.5.min',
			fetch: 'polyfills/es6-fetch-3.0.0',
			octokat: 'libraries/octokat-0.10.0',
			json: 'libraries/requirejs-json-0.3.2',
			text: 'libraries/requirejs-text-2.0.15',
			optional: 'libraries/requirejs-optional-1.0.0',
			emuos: 'emuos',
			system: 'system',
			filesystem: 'filesystem',
			desktop: 'desktop',
			taskbar: 'taskbar',
			window: 'window',
			winamp: 'apps/winamp/winamp',
			lang: 'lang-en'
		}
	});

	// noinspection JSCheckFunctionSignatures,JSUnusedLocalSymbols
	require([
		'text!../certs/emudisk.pem',
		'jquery',
		'filesystem',
		'emuos',
		'apps/winamp/winamp',
		'text!apps/winamp/winamp.html',
		'text!apps/tree/tree.html',
		'desktop',
		'taskbar',
		'window',
		'lang',
		'system',
		'jquerymousewheel',
		'jqueryuicontextmenu',
		'jqueryuitree',
		'jquerycustomscrollbar',
		'jqyeryajaxretry'
	], function(github_private_key, $, FileSystem, EmuOS, AppWinamp, winamp_template, tree_template) {
		$(function() {
			var filesystem = new FileSystem({
				github: {
					private_key: github_private_key
				}
			});

			var winamp = new AppWinamp({template: winamp_template});

			// noinspection JSUnusedLocalSymbols
			var desktop = new EmuOS({
				filesystem: filesystem,
				theme: 'theme-win9x',
				apps: {
					winamp: winamp
				}
			});

			// noinspection JSUnresolvedFunction
			/*desktop.window({
				title: 'Tree Component',
				icon: 'apps/wing/favicon.ico',
				content: tree_template
			});

			// noinspection JSUnresolvedFunction
			filesystem.getTree(function (tree) {
				console.log(tree);

				// noinspection AmdModulesDependencies
				$('#treeview').btechcotree({
					containerid: 'treeview',
					dataset: {root: tree},
					datatype: $treedatatype.Json,
					dataformat: $treedataformat.Hierarchy,
					class_node_collapse: 'ui-icon-circle-minus',
					class_node_expand: 'ui-icon-circle-plus',
					class_node_item: 'ui-icon-clipboard',
					class_node_highlight: 'ui-state-highlight',
					class_node_add: 'ui-icon-plusthick',
					class_node_remove: 'ui-icon-minusthick',
					collapse_tree: true,
					show_button_check: false,
					show_button_add: false,
					show_button_remove: false,
					node_remove_message: 'Are you sure?'
				});
			});*/
		});
	});
} (this));