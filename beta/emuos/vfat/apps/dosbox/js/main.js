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

			function format_version(version) {
				return typeof version !== 'undefined' ? version : '-';
			}

			function format_bytes(bytes, decimals) {
				if (bytes === 0) {
					return '0 Bytes';
				}

				var k = 1024,
					dm = decimals <= 0 ? 0 : decimals || 2,
					sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
					i = Math.floor(Math.log(bytes) / Math.log(k));
					i = i === 1 && bytes >= 1000000 ? 2 : i;

				return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
			}

			function render_game_dropdown(games) {
				var html = '';

				var i = 0;

				for (var game in games['games']) {
					var list = '';

					// noinspection JSUnfilteredForInLoop
					if (typeof games['games'][game]['clones'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						list += '<optgroup label="' + (typeof games['games'][game]['group'] !== 'undefined' ? games['games'][game]['group'] : (typeof games['games'][game]['description'] !== 'undefined' ? games['games'][game]['description'] : games['games'][game]['name'])) + ' (' + games['games'][game]['genre'] + ')' + '">';
						// noinspection JSUnfilteredForInLoop
						list +=		'<option value="' + i + '" data-game="' + games['games'][game]['id'] + '">' + games['games'][game]['name'] + ' (' + games['games'][game]['year'] + ')' + (typeof games['games'][game]['retail'] !== 'undefined' ? (games['games'][game]['retail'] === true ? ' (' + 'Retail' + ')' : '') : '') + ' (' + format_bytes(parseInt(games['games'][game]['size'], 10)) + ')</option>';

						i++;

						// noinspection JSUnfilteredForInLoop
						for (var clone in games['games'][game]['clones']) {
							// noinspection JSUnfilteredForInLoop
							list += '<option value="' + i + '" data-game="' + (typeof games['games'][game]['clones'][clone]['id'] !== 'undefined' ? games['games'][game]['clones'][clone]['id'] : games['games'][game]['id']) + '">' + (typeof games['games'][game]['clones'][clone]['name'] !== 'undefined' ? games['games'][game]['clones'][clone]['name'] : games['games'][game]['name']) + ' (' + (typeof games['games'][game]['clones'][clone]['year'] !== 'undefined' ? games['games'][game]['clones'][clone]['year'] : games['games'][game]['year']) + ')' + (typeof games['games'][game]['clones'][clone]['retail'] !== 'undefined' ? (games['games'][game]['clones'][clone]['retail'] === true ? ' (' + 'Retail' + ')' : '') : '') + ' (' + format_bytes(parseInt((typeof games['games'][game]['clones'][clone]['size'] !== 'undefined' ? games['games'][game]['clones'][clone]['size'] : games['games'][game]['size']), 10)) + ')</option>';

							i++;
						}

						list += '</optgroup>';
					} else {
						// noinspection JSUnfilteredForInLoop
						list += '<option value="' + i + '" data-game="' + games['games'][game]['id'] + '">' + games['games'][game]['name'] + ' (' + games['games'][game]['year'] + ')' + ' (' + games['games'][game]['genre'] + ')' + (typeof games['games'][game]['retail'] !== 'undefined' ? (games['games'][game]['retail'] === true ? ' (' + 'Retail' + ')' : '') : '') + ' (' + format_bytes(parseInt(games['games'][game]['size'], 10)) + ')</option>';

						i++;
					}

					// noinspection JSUnfilteredForInLoop
					if (typeof games['games'][game]['enabled'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						if (games['games'][game]['enabled'] === true) {
							html += list;
						}
					} else {
						html += list;
					}
				}

				return html;
			}

			function render_game_list(games) {
				var html =	'<table>' +
								'<thead>' +
									'<tr>' +
										//'<th>ID</th>' +
										'<th>Name</th>' +
										'<th>Version</th>' +
										'<th>Year</th>' +
										'<th>Genre</th>' +
										'<th>Size</th>' +
										// '<th>Developer</th>' +
										// '<th>Publisher</th>' +
										// '<th>Copyright</th>' +
										'<th>License</th>' +
										'<th>Status</th>' +
									'</tr>' +
								'</thead>' +
								'<tbody>';
				for (var game in games['games']) {
					// noinspection JSUnfilteredForInLoop
					var list = 	//'<td>' + games['games'][game]['id'] + '</td>' +
						'<td>' + games['games'][game]['name'] + '</td>' +
						'<td>' + format_version(games['games'][game]['version']) + '</td>' +
						'<td>' + games['games'][game]['year'] + '</td>' +
						'<td>' + games['games'][game]['genre'] + '</td>' +
						'<td>' + format_bytes(parseInt(games['games'][game]['size'], 10)) + '</td>' +
						// '<td>' + format_name(games['games'][game]['developer']) + '</td>' +
						// '<td>' + format_name(games['games'][game]['publisher']) + '</td>' +
						// '<td>' + format_name(games['games'][game]['copyright']) + '</td>' +
						'<td>' + games['games'][game]['license'] + '</td>' +
						'<td>' + games['games'][game]['status'] + '</td>';

					// noinspection JSUnfilteredForInLoop
					if (typeof games['games'][game]['enabled'] !== 'undefined') {
						// noinspection JSUnfilteredForInLoop
						if (games['games'][game]['enabled'] === true) {
							html += '<tr>' + list + '</tr>';
						}
					} else {
						html += '<tr>' + list + '</tr>';
					}
				}

				html += 	'</tbody>' +
						'</table>';

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

			if (SYSTEM_FEATURE_CANVAS && SYSTEM_FEATURE_TYPED_ARRAYS && SYSTEM_FEATURE_ASMJS && SYSTEM_FEATURE_WEBASSEMBLY) {
				var first = typeof $.url().param('game') === 'undefined';

				if (!first) {
					$('.game option').prop('selected', false).removeAttr('selected');

					var index_selected = parseInt($.url().param('game'), 10);
					var game_selected = $game_dropdown.find('option[value="'+ index_selected +'"]').prop('selected', true).attr('selected', true).data('game');

					for (var game in games['games']) {
						// noinspection JSUnfilteredForInLoop
						if (games['games'][game]['id'] === game_selected) {
							// noinspection JSUnfilteredForInLoop
							start(typeof games['games'][game]['files'] !== 'undefined' ? games['games'][game]['files'] : games['games'][game]['file'], games['games'][game]['executable'], games['games'][game]['args'], games['games'][game]['mode'], games['games'][game]['sync']);
							break;
						} else {
							// noinspection JSUnfilteredForInLoop
							if (typeof games['games'][game]['clones'] !== 'undefined') {
								// noinspection JSUnfilteredForInLoop,JSUnusedLocalSymbols
								for (var clone in games['games'][game]['clones']) {
									// noinspection JSUnfilteredForInLoop
									if (games['games'][game]['clones'][clone]['id'] === game_selected) {
										// noinspection JSUnfilteredForInLoop
										start((typeof games['games'][game]['clones'][clone]['files'] !== 'undefined' ? games['games'][game]['clones'][clone]['files'] : (typeof games['games'][game]['clones'][clone]['file'] !== 'undefined' ? games['games'][game]['clones'][clone]['file'] : (typeof games['games'][game]['files'] !== 'undefined' ? games['games'][game]['files'] : games['games'][game]['file']))), games['games'][game]['clones'][clone]['executable'], games['games'][game]['clones'][clone]['args'], games['games'][game]['clones'][clone]['mode'], games['games'][game]['clones'][clone]['sync']);
									}
								}
							}
						}
					}
				}

				$(document).on('click', '.load', function() {
					var index_selected = parseInt($game_dropdown.val(), 10);
					var game_selected = $game_dropdown.find('option[value="' + index_selected + '"]').data('game');

					if (first) {
						first = false;

						for (var game in games['games']) {
							// noinspection JSUnfilteredForInLoop
							if (games['games'][game]['id'] === game_selected) {
								// noinspection JSUnfilteredForInLoop
								start(typeof games['games'][game]['files'] !== 'undefined' ? games['games'][game]['files'] : games['games'][game]['file'], games['games'][game]['executable'], games['games'][game]['args'], games['games'][game]['mode'], games['games'][game]['sync']);
								break;
							} else {
								// noinspection JSUnfilteredForInLoop
								if (typeof games['games'][game]['clones'] !== 'undefined') {
									// noinspection JSUnfilteredForInLoop,JSUnusedLocalSymbols
									for (var clone in games['games'][game]['clones']) {
										// noinspection JSUnfilteredForInLoop
										if (games['games'][game]['clones'][clone]['id'] === game_selected) {
											// noinspection JSUnfilteredForInLoop
											start((typeof games['games'][game]['clones'][clone]['files'] !== 'undefined' ? games['games'][game]['clones'][clone]['files'] : (typeof games['games'][game]['clones'][clone]['file'] !== 'undefined' ? games['games'][game]['clones'][clone]['file'] : (typeof games['games'][game]['files'] !== 'undefined' ? games['games'][game]['files'] : games['games'][game]['file']))), games['games'][game]['clones'][clone]['executable'], games['games'][game]['clones'][clone]['args'], games['games'][game]['clones'][clone]['mode'], games['games'][game]['clones'][clone]['sync']);
										}
									}
								}
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
				alert('DOSBox cannot work because your browser is not supported!')
			}
		});
	});
} (this));