/*
* ===========================================================================
*
* Wolf3D Browser Version GPL Source Code
* Copyright (C) 2012 id Software LLC, a ZeniMax Media company.
*
* This file is part of the Wolf3D Browser Version GPL Source Code ("Wolf3D Browser Source Code").
*
* Wolf3D Browser Source Code is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 2 of the License, or
* (at your option) any later version.
*
* Wolf3D Browser Source Code is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License version 2
* along with Wolf3D Browser Source Code.	If not, see <http://www.gnu.org/licenses/>.
*
* If you have questions concerning this license, you may contact in writing id Software LLC, c/o ZeniMax Media Inc., Suite 120, Rockville, Maryland 20850 USA.
*
* ===========================================================================
*/

Wolf.Sound = (function() {
	Wolf.setConsts({
		// Sound channels
		// Channel 0 never willingly overrides
		// Other channels (1-7) always override a playing sound on that channel
		CHAN_AUTO			: 0,
		CHAN_WEAPON			: 1,
		CHAN_VOICE			: 2,
		CHAN_ITEM			: 3,
		CHAN_BODY			: 4,
		// Modifier flags
		CHAN_NO_PHS_ADD		: 8,	// Send to all clients, not just ones in PHS (ATTN 0 will also do this)
		CHAN_RELIABLE		: 16,	// Send by reliable message, not datagram
		// Sound attenuation values
		ATTN_NONE			: 0,	// Full volume the entire level
		ATTN_NORM			: 1,
		ATTN_IDLE			: 2,
		ATTN_STATIC			: 3,		// Diminish very rapidly with distance

		MAX_PLAYSOUNDS		: 128,
		MAX_CHANNELS		: 64,

		MUSIC_VOLUME		: 0.8,
		MASTER_VOLUME		: 0.6
	});

	var sounds = {},
		audioElements = [],
		testElement,
		currentMusic,
		soundEnabled = true,
		musicEnabled = true,
		music,
		ext,
		exts = ["ogg", "mp3", "wav"];

	testElement = document.createElement('audio');

	if ((!!testElement.canPlayType && testElement.canPlayType('audio/ogg; codecs="vorbis"')) && (!!testElement.canPlayType && testElement.canPlayType('audio/ogg; codecs="opus"'))) {
		//console.log('ogg');
		ext = 'ogg';
	} else if (testElement.canPlayType) {
		var t = testElement.canPlayType('audio/mpeg');
		if (t === 'maybe') {
			// We need to check if the browser really supports playing MP3s by loading one and seeing if the
			// loadedmetadata event is triggered... but for now assume it does support it...
			ext = 'mp3';
			//console.log('mp3');
		} else if (t === 'probably') {
			ext = 'mp3';
			//console.log('mp3');
		} else if (!!testElement.canPlayType && testElement.canPlayType('audio/wav; codecs="1"')) {
			ext = 'wav';
			//console.log('wav');
		}
	}

	function getFileName(file) {
		/*if (!ext) {
			// look for a probably
			for (var i = 0; i < exts.length; i++) {
				if (Modernizr.audio[exts[i]] == "probably") {
					ext = exts[i];
					break;
				}
			}
			// look for a maybe
			if (!ext) {
				for (var j = 0; i < exts.length; j++) {
					if (Modernizr.audio[exts[j]] == "maybe") {
						ext = exts[j];
						break;
					}
				}
			}
		}*/

		return file.split(".")[0] + "." + ext;
	}

	function createAudioElement() {
		var audio = new Audio();
		audioElements.push(audio);
		return audio;
	}

	function startSound(posPlayer, posSound, entNum, entChannel, file, volume, attenuation, timeOfs) {
		var audio, dx, dy, dist;

		if (!sounds[file]) {
			sounds[file] = [];
		}
		for (var i=0;i<sounds[file].length;i++) {
			if (sounds[file][i].ended || sounds[file][i].paused) {
				audio = sounds[file][i];
				break;
			}
		}
		if (!audio) {
			audio = createAudioElement();
			audio.src = getFileName(file);
			sounds[file].push(audio);
		}

		if (posPlayer && posSound) {
			dx = (posPlayer.x - posSound.x) / Wolf.TILEGLOBAL;
			dy = (posPlayer.y - posSound.y) / Wolf.TILEGLOBAL;
			dist = dx * dx + dy * dy;
			volume *= 1 / (1 + dist / 50);
		}

		audio.volume = volume * Wolf.MASTER_VOLUME * (soundEnabled ? 1 : 0);
		audio.play();
	}

	function startMusic(file) {
		if (!music) {
			music = createAudioElement();
			music.loop = true;
		}
		var filename = getFileName(file);
		if (currentMusic != filename) {
			music.src = currentMusic = filename;
			music.volume = Wolf.MUSIC_VOLUME * Wolf.MASTER_VOLUME * (musicEnabled ? 1 : 0);
			music.play();
		}
	}

	function stopAllSounds() {
		for (var i=0;i<audioElements.length;i++) {
			if (audioElements[i].currentTime > 0) {
				audioElements[i].currentTime = 0;
				audioElements[i].pause();
			}
		}
	}

	function init() {
	}

	function isMusicEnabled() {
		return musicEnabled;
	}

	function isSoundEnabled() {
		return soundEnabled;
	}

	function toggleMusic(enable) {
		if (typeof enable != "undefined") {
			musicEnabled = enable;
		} else {
			musicEnabled = !musicEnabled;
		}
		if (music) {
			music.volume = Wolf.MUSIC_VOLUME * Wolf.MASTER_VOLUME * (musicEnabled ? 1 : 0);
		}
	}

	function pauseMusic(enable) {
		if (music) {
			if (enable) {
				music.pause();
			} else if (music.paused) {
				music.play();
			}
		}
	}

	function toggleSound(enable) {
		if (typeof enable != "undefined") {
			soundEnabled = enable;
		} else {
			soundEnabled = !soundEnabled;
		}
	}

	//if (Modernizr.audio) {
	if ('webkitAudioContext' in window || 'AudioContext' in window) {
		//console.log('sound');
		return {
			startSound : startSound,
			startMusic : startMusic,
			stopAllSounds : stopAllSounds,
			isMusicEnabled : isMusicEnabled,
			isSoundEnabled : isSoundEnabled,
			toggleMusic : toggleMusic,
			toggleSound : toggleSound,
			pauseMusic : pauseMusic,
			init : init
		}
	} else {
		//console.log('no sound');
		return {
			startSound : Wolf.noop,
			startMusic : Wolf.noop,
			stopAllSounds : Wolf.noop,
			isMusicEnabled : Wolf.noop,
			isSoundEnabled : Wolf.noop,
			toggleMusic : Wolf.noop,
			toggleSound : Wolf.noop,
			pauseMusic : Wolf.noop,
			init : Wolf.noop
		}
	}
})();