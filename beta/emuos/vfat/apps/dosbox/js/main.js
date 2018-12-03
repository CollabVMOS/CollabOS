// noinspection ThisExpressionReferencesGlobalObjectJS,JSUnusedLocalSymbols
(function(global) {
	'use strict';

	// noinspection JSFileReferences
	require.config({
		waitSeconds: 300,
		shim: {
			jquery: {
				deps: ['system']
			},
			purl: {
				deps: ['jquery']
			},
			loader: {
				deps: ['browserfs']
			},
			browserfs: {
				deps: ['es6promise']
			},
			es6promise: {
				deps: ['jquery']
			}
		},
		map: {
			'*': {
				'jQuery': 'jquery'
			}
		},
		paths: {
			jquery: 'libraries/jquery-3.3.1.min',
			json: 'libraries/requirejs-json-0.3.2',
			text: 'libraries/requirejs-text-2.0.15',
			optional: 'libraries/requirejs-optional-1.0.0',
			purl: 'libraries/purl-2.3.1',
			es6promise: 'polyfills/es6-promise-4.2.5.min',
			es6fetch: 'polyfills/es6-fetch-3.0.0',
			browserfs: 'libraries/browserfs-1.4.3.min',
			dropbox: 'libraries/dropbox-sdk-4.0.12.min',
			system: '../../../../js/system'
		}
	});

	// noinspection JSCheckFunctionSignatures,JSUnusedLocalSymbols
	require([
		'jquery',
		'purl',
		'json!games.json',
		'browserfs',
		'dropbox',
		'es6fetch',
		'loader'
	], function($, purl, games, browserfs, dropbox, fetch, loader) {
		$(function() {
			function format_name(name) {
				return typeof name !== 'undefined' ? name : '?';
			}

			function format_bytes(bytes, decimals) {
				if (bytes === 0) {
					return '0 Bytes';
				}

				var k = 1024,
					dm = decimals <= 0 ? 0 : decimals || 2,
					sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
					i = Math.floor(Math.log(bytes) / Math.log(k));

				return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
			}

			function render_game_dropdown(games) {
				var html = '';

				var i = 0;

				for (var game in games['games']) {
					// noinspection JSUnfilteredForInLoop
					if (typeof games['games'][game]['enabled'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						if (games['games'][game]['enabled'] === true || games['games'][game]['enabled'] === 'true') {
							// noinspection JSUnfilteredForInLoop
							html += '<option value="' + i + '" data-game="' + games['games'][game]['id'] + '">' + games['games'][game]['name'] + ' (' + games['games'][game]['year'] + ')' + ' (' + games['games'][game]['genre'] + ')'  + ' (' + format_bytes(parseInt(games['games'][game]['size'], 10)) + ')</option>';
							i++;
						}
					} else { // noinspection JSUnfilteredForInLoop
						if (typeof games['games'][game]['enabled'] === 'undefined') {
							// noinspection JSUnfilteredForInLoop
							html += '<option value="' + i + '" data-game="' + games['games'][game]['id'] + '">' + games['games'][game]['name'] + ' (' + games['games'][game]['year'] + ')' + ' (' + games['games'][game]['genre'] + ')' + ' (' + format_bytes(parseInt(games['games'][game]['size'], 10)) + ')</option>';
							i++;
						}
					}
				}

				return html;
			}

			function render_game_list(games) {
				var html = '<table>';

				html += '<thead>';
				html += '<tr>';
				// html += '<th>ID</th>';
				html += '<th>Name</th>';
				html += '<th>Year</th>';
				html += '<th>Genre</th>';
				html += '<th>Size</th>';
				html += '<th>Developer</th>';
				html += '<th>Publisher</th>';
				html += '<th>Copyright</th>';
				html += '<th>License</th>';
				html += '</tr>';

				html += '</thead>';
				html += '<tbody>';


				for (var game in games['games']) {
					// noinspection JSUnfilteredForInLoop
					if (typeof games['games'][game]['enabled'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						if (games['games'][game]['enabled'] === true || games['games'][game]['enabled'] === 'true') {
							html += '<tr>';
							// noinspection JSUnfilteredForInLoop
							// html += '<td>' + games['games'][game]['id'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['name'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['year'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['genre'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + format_bytes(parseInt(games['games'][game]['size'], 10)) + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['developer'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['publisher'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + format_name(games['games'][game]['copyright']) + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['license'] + '</td>';
							html += '</tr>';
						}
					} else {
						// noinspection JSUnfilteredForInLoop
						if (typeof games['games'][game]['enabled'] === 'undefined') {
							html += '<tr>';
							// noinspection JSUnfilteredForInLoop
							// html += '<td>' + games['games'][game]['id'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['name'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['year'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['genre'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + format_bytes(parseInt(games['games'][game]['size'], 10)) + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['developer'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['publisher'] + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + format_name(games['games'][game]['copyright']) + '</td>';
							// noinspection JSUnfilteredForInLoop
							html += '<td>' + games['games'][game]['license'] + '</td>';
							html += '</tr>';
						}
					}
				}

				html += '</tbody>';
				html += '</table>';

				return html;
			}

			function get_file_order(index, file, files) {
				for (var f in files) {
					// noinspection JSUnfilteredForInLoop
					if (files[f]['metadata']['name'] === file[index]) {
						// noinspection JSUnfilteredForInLoop
						return files[f]['link'];
					}
				}
			}

			function start(file, executable, args, mode, sync) {
				if (typeof sync !== 'undefined') {
					if (sync === true) {
						sync = '';
					} else {
						sync = 'no';
					}
				} else {
					sync = '';
				}

				if (Array.isArray(file)) {
					var files = [];

					for (var f in file) {
						// noinspection JSUnfilteredForInLoop
						dbx.filesGetTemporaryLink({path: '/' + file[f]}).then(function(response) {
							// noinspection JSUnfilteredForInLoop,JSReferencingMutableVariableFromClosure
							files.push(response);
						}).catch(function(error) {
							console.log(error);
						});
					}

					var int = null;

					int = setInterval(function() {
						if (files.length === file.length) {
							clearInterval(int);
							int = null;
							// noinspection JSUnresolvedFunction,JSUnresolvedVariable,AmdModulesDependencies
							var emulator = new Emulator(document.getElementById('canvas'), null,
								new DosBoxLoader(DosBoxLoader.emulatorJS(SYSTEM_FEATURE_WEBASSEMBLY && mode !== 'asm' ? 'js/dosbox-' + sync + 'sync-wasm.js' : (SYSTEM_FEATURE_ASMJS ? 'js/dosbox-' + sync + 'sync-asm.js' : alert('DOSBox cannot work because WebAssembly and/or ASM.JS is not supported in your browser!'))),
									DosBoxLoader.locateAdditionalEmulatorJS(function(filename) {
										if (filename === 'dosbox.html.mem') {
											return 'js/dosbox-sync.mem';
										}

										if (filename === 'dosbox.wasm') {
											return 'js/dosbox-sync.wasm';
										}
										return filename;
									}),
									DosBoxLoader.nativeResolution(640, 400),
									DosBoxLoader.mountZip('a', DosBoxLoader.fetchFile('OS File', get_file_order(0, file, files))),
									DosBoxLoader.mountZip('b', DosBoxLoader.fetchFile('Game File', get_file_order(1, file, files))),
									DosBoxLoader.extraArgs(args),
									DosBoxLoader.startExe(executable)));
							emulator.start({waitAfterDownloading: false});
						}
					}, 100);
				} else {
					// noinspection JSUnresolvedFunction
					dbx.filesGetTemporaryLink({path: '/' + file}).then(function(response) {
						// noinspection JSUnresolvedFunction,JSUnresolvedVariable,AmdModulesDependencies
						var emulator = new Emulator(document.getElementById('canvas'), null,
							new DosBoxLoader(DosBoxLoader.emulatorJS(SYSTEM_FEATURE_WEBASSEMBLY && mode !== 'asm' ? 'js/dosbox-' + sync + 'sync-wasm.js' : (SYSTEM_FEATURE_ASMJS ? 'js/dosbox-' + sync + 'sync-asm.js' : alert('DOSBox cannot work because WebAssembly and/or ASM.JS is not supported in your browser!'))),
								DosBoxLoader.locateAdditionalEmulatorJS(function(filename) {
									if (filename === 'dosbox.html.mem') {
										return 'js/dosbox-' + sync + 'sync.mem';
									}

									if (filename === 'dosbox.wasm') {
										return 'js/dosbox-' + sync + 'sync.wasm';
									}
									return filename;
								}),
								DosBoxLoader.nativeResolution(640, 400),
								DosBoxLoader.mountZip('c', DosBoxLoader.fetchFile('Game File', response.link)),
								DosBoxLoader.extraArgs(args),
								DosBoxLoader.startExe(executable)));
						emulator.start({waitAfterDownloading: false});
					}).catch(function(error) {
						console.log(error);
					});
				}
			}

			global.BrowserFS = browserfs;

			// noinspection JSUnresolvedFunction
			var dbx = new dropbox.Dropbox({accessToken: 'Rw1XBhHt3aAAAAAAAAADLlH_3RQLTgbyiwKwBQlcRIHkzxzKbhFyX4oTPGvSqgqt', fetch: fetch.fetch});

			var $game_dropdown = $('.game-dropdown');
			var $game_list = $('.game-list');

			$game_list.html('').html(render_game_list(games));
			$game_dropdown.html('').html(render_game_dropdown(games));

			if (SYSTEM_FEATURE_CANVAS && SYSTEM_FEATURE_TYPED_ARRAYS) {
				var first = typeof $.url().param('game') === 'undefined';

				if (!first) {
					$('.game option').prop('selected', false).removeAttr('selected');

					var index_selected = parseInt($.url().param('game'), 10);
					var game_selected = $game_dropdown.find('option:eq('+ index_selected +')').prop('selected', true).attr('selected', true).data('game');

					for (var game in games['games']) {
						// noinspection JSUnfilteredForInLoop
						if (games['games'][game]['id'] === game_selected) {
							// noinspection JSUnfilteredForInLoop
							start(typeof games['games'][game]['files'] !== 'undefined' ? games['games'][game]['files'] : games['games'][game]['file'], games['games'][game]['executable'], games['games'][game]['args'], games['games'][game]['mode'], games['games'][game]['sync']);
							break;
						}
					}
				}

				$(document).on('click', '.load', function() {
					var index_selected = parseInt($game_dropdown.val(), 10);
					var game_selected = $game_dropdown.find('option:eq('+ index_selected +')').data('game');

					if (first) {
						first = false;

						for (var game in games['games']) {
							// noinspection JSUnfilteredForInLoop
							if (games['games'][game]['id'] === game_selected) {
								// noinspection JSUnfilteredForInLoop
								start(typeof games['games'][game]['files'] !== 'undefined' ? games['games'][game]['files'] : games['games'][game]['file'], games['games'][game]['executable'], games['games'][game]['args'], games['games'][game]['mode'], games['games'][game]['sync']);
								break;
							}
						}
					} else {
						location.href = location.protocol + '//' + location.host + location.pathname + '?game=' + index_selected;
					}
				});

				$(document).on('click', '.list', function() {
					$game_list.toggle();
				});
			} else {
				alert('DOSBox cannot work because Canvas and/or Typed Arrays are not supported in your browser!')
			}
		});
	});
} (this));