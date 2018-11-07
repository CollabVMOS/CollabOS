;(function() {

	/***
	 * FIXME: The load order is very important, because crappy code...
	 *
	 * "js/wolf.js",
	 * "js/random.js",
	 * "js/angle.js",
	 * "js/math.js",
	 * "js/input.js",
	 * "js/sound.js",
	 * "js/menu.js",
	 * "js/file.js",
	 * "js/episodes.js",
	 * "js/maps.js",
	 * "js/game.js",
	 * "js/playerai.js",
	 * "js/player.js",
	 * "js/sprites.js",
	 * "js/powerups.js",
	 * "js/ai.js",
	 * "js/actorai.js",
	 * "js/actors.js",
	 * "js/actstat.js",
	 * "js/weapon.js",
	 * "js/doors.js",
	 * "js/pushwall.js",
	 * "js/areas.js",
	 * "js/level.js",
	 * "js/raycaster.js",
	 * "js/renderer.js"
	 */

	require.config({
		shim: {
			wolf: {
				exports: 'Wolf'
			},
			random: ['wolf'],
			angle: ['wolf'],
			math: ['wolf', 'angle'],
			input: ['wolf'],
			sound: ['wolf'],
			menu: ['wolf', 'input', 'sound', 'episodes'],
			file: ['wolf'],
			game: ['wolf', 'menu', 'math', 'random', 'raycaster', 'input', 'sound', 'sprites', 'episodes', 'level', 'actors', 'playerai', 'player', 'doors', 'pushwall'],
			playerai: ['math', 'level', 'doors', 'pushwall', 'actors', 'player', 'powerups'],
			player: ['wolf'],
			sprites: ['wolf'],
			powerups: ['wolf', 'sprites'],
			ai: ['wolf'],
			actorai: ['wolf'],
			actors: ['wolf'],
			actstat: ['wolf', 'ai'],
			weapon: ['wolf'],
			doors: ['wolf'],
			pushwall: ['wolf'],
			areas: ['wolf'],
			level: ['wolf', 'file', 'maps', 'doors', 'sprites', 'actors', 'powerups'],
			raycaster: ['wolf', 'math', 'level'],
			episodes: ['wolf'],
			maps: ['wolf'],
			renderer: ['wolf', 'math', 'raycaster', 'sprites', 'maps', 'level', 'doors', 'actors', 'powerups']
		},
		paths: {
			jquery: 'libraries/jquery-3.3.1.min',
			image: 'libraries/requirejs-image-0.2.2.min',
			text: 'libraries/requirejs-text-2.0.15'
		}
	});

	require([
		'jquery',
		'text!../templates/wolf3d.html',
		'wolf',
		'requestanimframe',
		'random',
		'angle',
		'math',
		'input',
		'sound',
		'menu',
		'file',
		'game',
		'playerai',
		'player',
		'sprites',
		'powerups',
		'ai',
		'actorai',
		'actors',
		'actstat',
		'weapon',
		'doors',
		'pushwall',
		'areas',
		'level',
		'raycaster',
		'episodes',
		'maps',
		'renderer',
		'image!art/menubg_main.png',
		'image!art/menuitems.png',
		'image!art/menuselector.png',
		'image!art/menubg_episodes.png',
		'image!art/menuitems_episodes.png',
		'image!art/menubg_skill.png',
		'image!art/menubg_levels.png',
		'image!art/menuitems_levels.png',
		'image!art/skillfaces.png',
		'image!art/getpsyched.png',
		'image!art/menubg_control.png',
		'image!art/menulight.png',
		'image!art/menubg_customize.png',
		'image!art/control_keys.png',
		'image!art/confirm_newgame.png',
		'image!art/paused.png'
	], function ($, template, Wolf) {
		$(function() {
			$('html').removeClass('no-js').addClass('js');

			var $body = $('body');

			$body.html(template).promise().done(function() {
				var $progress = $('<div>');

				$progress.addClass('load-progress').appendTo('#title-screen');

				$('#title-screen').show();

				$progress.animate({
					width: '100%'
				}, 1000, function() {
					$('#title-screen').fadeOut(1500, function() {
						// noinspection JSUnresolvedVariable
						Wolf.Input.init();
						// noinspection JSUnresolvedVariable
						Wolf.Game.init();
						// noinspection JSUnresolvedVariable
						Wolf.Menu.show();
					});
				});
			});
		});
	});
})();