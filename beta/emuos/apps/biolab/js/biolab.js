// Built with IMPACT - impactjs.org

(function (window) {
	"use strict";
	Number.prototype.map = function (istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
	};
	Number.prototype.limit = function (min, max) {
		return Math.min(max, Math.max(min, this));
	};
	Number.prototype.round = function (precision) {
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	};
	Number.prototype.floor = function () {
		return Math.floor(this);
	};
	Number.prototype.ceil = function () {
		return Math.ceil(this);
	};
	Number.prototype.toInt = function () {
		return (this | 0);
	};
	Number.prototype.toRad = function () {
		return (this / 180) * Math.PI;
	};
	Number.prototype.toDeg = function () {
		return (this * 180) / Math.PI;
	};
	Array.prototype.erase = function (item) {
		for (var i = this.length; i--;) {
			if (this[i] === item) {
				this.splice(i, 1);
			}
		}
		return this;
	};
	Array.prototype.random = function () {
		return this[Math.floor(Math.random() * this.length)];
	};
	Function.prototype.bind = Function.prototype.bind || function (oThis) {
		if (typeof this !== "function") {
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}
		var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {
		}, fBound = function () {
			return fToBind.apply((this instanceof fNOP && oThis ? this : oThis), aArgs.concat(Array.prototype.slice.call(arguments)));
		};
		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
	window.ig = {
		game: null,
		debug: null,
		version: '1.20',
		global: window,
		modules: {},
		resources: [],
		ready: false,
		baked: false,
		nocache: '',
		ua: {},
		prefix: (window.ImpactPrefix || ''),
		lib: 'lib/',
		_current: null,
		_loadQueue: [],
		_waitForOnload: 0,
		$: function (selector) {
			return selector.charAt(0) == '#' ? document.getElementById(selector.substr(1)) : document.getElementsByTagName(selector);
		},
		$new: function (name) {
			return document.createElement(name);
		},
		copy: function (object) {
			if (!object || typeof(object) != 'object' || object instanceof HTMLElement || object instanceof ig.Class) {
				return object;
			}
			else if (object instanceof Array) {
				var c = [];
				for (var i = 0, l = object.length; i < l; i++) {
					c[i] = ig.copy(object[i]);
				}
				return c;
			}
			else {
				var c = {};
				for (var i in object) {
					c[i] = ig.copy(object[i]);
				}
				return c;
			}
		},
		merge: function (original, extended) {
			for (var key in extended) {
				var ext = extended[key];
				if (typeof(ext) != 'object' || ext instanceof HTMLElement || ext instanceof ig.Class) {
					original[key] = ext;
				}
				else {
					if (!original[key] || typeof(original[key]) != 'object') {
						original[key] = (ext instanceof Array) ? [] : {};
					}
					ig.merge(original[key], ext);
				}
			}
			return original;
		},
		ksort: function (obj) {
			if (!obj || typeof(obj) != 'object') {
				return [];
			}
			var keys = [], values = [];
			for (var i in obj) {
				keys.push(i);
			}
			keys.sort();
			for (var i = 0; i < keys.length; i++) {
				values.push(obj[keys[i]]);
			}
			return values;
		},
		setVendorAttribute: function (el, attr, val) {
			var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
			el[attr] = el['ms' + uc] = el['moz' + uc] = el['webkit' + uc] = el['o' + uc] = val;
		},
		getVendorAttribute: function (el, attr) {
			var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
			return el[attr] || el['ms' + uc] || el['moz' + uc] || el['webkit' + uc] || el['o' + uc];
		},
		normalizeVendorAttribute: function (el, attr) {
			var prefixedVal = ig.getVendorAttribute(el, attr);
			if (!el[attr] && prefixedVal) {
				el[attr] = prefixedVal;
			}
		},
		getImagePixels: function (image, x, y, width, height) {
			var canvas = ig.$new('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			var ctx = canvas.getContext('2d');
			var ratio = ig.getVendorAttribute(ctx, 'backingStorePixelRatio') || 1;
			ig.normalizeVendorAttribute(ctx, 'getImageDataHD');
			var realWidth = image.width / ratio, realHeight = image.height / ratio;
			canvas.width = Math.ceil(realWidth);
			canvas.height = Math.ceil(realHeight);
			ctx.drawImage(image, 0, 0, realWidth, realHeight);
			return (ratio === 1) ? ctx.getImageData(x, y, width, height) : ctx.getImageDataHD(x, y, width, height);
		},
		module: function (name) {
			if (ig._current) {
				throw("Module '" + ig._current.name + "' defines nothing");
			}
			if (ig.modules[name] && ig.modules[name].body) {
				throw("Module '" + name + "' is already defined");
			}
			ig._current = {name: name, requires: [], loaded: false, body: null};
			ig.modules[name] = ig._current;
			ig._loadQueue.push(ig._current);
			return ig;
		},
		requires: function () {
			ig._current.requires = Array.prototype.slice.call(arguments);
			return ig;
		},
		defines: function (body) {
			ig._current.body = body;
			ig._current = null;
			ig._initDOMReady();
		},
		addResource: function (resource) {
			ig.resources.push(resource);
		},
		setNocache: function (set) {
			ig.nocache = set ? '?' + Date.now() : '';
		},
		log: function () {
		},
		assert: function (condition, msg) {
		},
		show: function (name, number) {
		},
		mark: function (msg, color) {
		},
		_loadScript: function (name, requiredFrom) {
			ig.modules[name] = {name: name, requires: [], loaded: false, body: null};
			ig._waitForOnload++;
			var path = ig.prefix + ig.lib + name.replace(/\./g, '/') + '.js' + ig.nocache;
			var script = ig.$new('script');
			script.type = 'text/javascript';
			script.src = path;
			script.onload = function () {
				ig._waitForOnload--;
				ig._execModules();
			};
			script.onerror = function () {
				throw('Failed to load module ' + name + ' at ' + path + ' ' + 'required from ' + requiredFrom);
			};
			ig.$('head')[0].appendChild(script);
		},
		_execModules: function () {
			var modulesLoaded = false;
			for (var i = 0; i < ig._loadQueue.length; i++) {
				var m = ig._loadQueue[i];
				var dependenciesLoaded = true;
				for (var j = 0; j < m.requires.length; j++) {
					var name = m.requires[j];
					if (!ig.modules[name]) {
						dependenciesLoaded = false;
						ig._loadScript(name, m.name);
					}
					else if (!ig.modules[name].loaded) {
						dependenciesLoaded = false;
					}
				}
				if (dependenciesLoaded && m.body) {
					ig._loadQueue.splice(i, 1);
					m.loaded = true;
					m.body();
					modulesLoaded = true;
					i--;
				}
			}
			if (modulesLoaded) {
				ig._execModules();
			}
			else if (!ig.baked && ig._waitForOnload == 0 && ig._loadQueue.length != 0) {
				var unresolved = [];
				for (var i = 0; i < ig._loadQueue.length; i++) {
					var unloaded = [];
					var requires = ig._loadQueue[i].requires;
					for (var j = 0; j < requires.length; j++) {
						var m = ig.modules[requires[j]];
						if (!m || !m.loaded) {
							unloaded.push(requires[j]);
						}
					}
					unresolved.push(ig._loadQueue[i].name + ' (requires: ' + unloaded.join(', ') + ')');
				}
				throw('Unresolved (circular?) dependencies. ' + "Most likely there's a name/path mismatch for one of the listed modules:\n" +
					unresolved.join('\n'));
			}
		},
		_DOMReady: function () {
			if (!ig.modules['dom.ready'].loaded) {
				if (!document.body) {
					return setTimeout(ig._DOMReady, 13);
				}
				ig.modules['dom.ready'].loaded = true;
				ig._waitForOnload--;
				ig._execModules();
			}
			return 0;
		},
		_boot: function () {
			if (document.location.href.match(/\?nocache/)) {
				ig.setNocache(true);
			}
			ig.ua.pixelRatio = window.devicePixelRatio || 1;
			ig.ua.viewport = {width: window.innerWidth, height: window.innerHeight};
			ig.ua.screen = {
				width: window.screen.availWidth * ig.ua.pixelRatio,
				height: window.screen.availHeight * ig.ua.pixelRatio
			};
			ig.ua.iPhone = /iPhone/i.test(navigator.userAgent);
			ig.ua.iPhone4 = (ig.ua.iPhone && ig.ua.pixelRatio == 2);
			ig.ua.iPad = /iPad/i.test(navigator.userAgent);
			ig.ua.android = /android/i.test(navigator.userAgent);
			ig.ua.iOS = ig.ua.iPhone || ig.ua.iPad;
			ig.ua.mobile = ig.ua.iOS || ig.ua.android;
		},
		_initDOMReady: function () {
			if (ig.modules['dom.ready']) {
				ig._execModules();
				return;
			}
			ig._boot();
			ig.modules['dom.ready'] = {requires: [], loaded: false, body: null};
			ig._waitForOnload++;
			if (document.readyState === 'complete') {
				ig._DOMReady();
			}
			else {
				document.addEventListener('DOMContentLoaded', ig._DOMReady, false);
				window.addEventListener('load', ig._DOMReady, false);
			}
		}
	};
	ig.normalizeVendorAttribute(window, 'requestAnimationFrame');
	if (window.requestAnimationFrame) {
		var next = 1, anims = {};
		window.ig.setAnimation = function (callback, element) {
			var current = next++;
			anims[current] = true;
			var animate = function () {
				if (!anims[current]) {
					return;
				}
				window.requestAnimationFrame(animate, element);
				callback();
			};
			window.requestAnimationFrame(animate, element);
			return current;
		};
		window.ig.clearAnimation = function (id) {
			delete anims[id];
		};
	}
	else {
		window.ig.setAnimation = function (callback, element) {
			return window.setInterval(callback, 1000 / 60);
		};
		window.ig.clearAnimation = function (id) {
			window.clearInterval(id);
		};
	}
	var initializing = false, fnTest = /xyz/.test(function () {
		xyz;
	}) ? /\bparent\b/ : /.*/;
	window.ig.Class = function () {
	};
	var inject = function (prop) {
		var proto = this.prototype;
		var parent = {};
		for (var name in prop) {
			if (typeof(prop[name]) == "function" && typeof(proto[name]) == "function" && fnTest.test(prop[name])) {
				parent[name] = proto[name];
				proto[name] = (function (name, fn) {
					return function () {
						var tmp = this.parent;
						this.parent = parent[name];
						var ret = fn.apply(this, arguments);
						this.parent = tmp;
						return ret;
					};
				})(name, prop[name]);
			}
			else {
				proto[name] = prop[name];
			}
		}
	};
	window.ig.Class.extend = function (prop) {
		var parent = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		for (var name in prop) {
			if (typeof(prop[name]) == "function" && typeof(parent[name]) == "function" && fnTest.test(prop[name])) {
				prototype[name] = (function (name, fn) {
					return function () {
						var tmp = this.parent;
						this.parent = parent[name];
						var ret = fn.apply(this, arguments);
						this.parent = tmp;
						return ret;
					};
				})(name, prop[name]);
			}
			else {
				prototype[name] = prop[name];
			}
		}

		function Class() {
			if (!initializing) {
				if (this.staticInstantiate) {
					var obj = this.staticInstantiate.apply(this, arguments);
					if (obj) {
						return obj;
					}
				}
				for (var p in this) {
					if (typeof(this[p]) == 'object') {
						this[p] = ig.copy(this[p]);
					}
				}
				if (this.init) {
					this.init.apply(this, arguments);
				}
			}
			return this;
		}

		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = window.ig.Class.extend;
		Class.inject = inject;
		return Class;
	};
})(window);

// impact/image.js
ig.baked = true;
ig.module('impact.image').defines(function () {
	"use strict";
	ig.Image = ig.Class.extend({
		data: null,
		width: 0,
		height: 0,
		loaded: false,
		failed: false,
		loadCallback: null,
		path: '',
		staticInstantiate: function (path) {
			return ig.Image.cache[path] || null;
		},
		init: function (path) {
			this.path = path;
			this.load();
		},
		load: function (loadCallback) {
			if (this.loaded) {
				if (loadCallback) {
					loadCallback(this.path, true);
				}
				return;
			}
			else if (!this.loaded && ig.ready) {
				this.loadCallback = loadCallback || null;
				this.data = new Image();
				this.data.onload = this.onload.bind(this);
				this.data.onerror = this.onerror.bind(this);
				this.data.src = ig.prefix + this.path + ig.nocache;
			}
			else {
				ig.addResource(this);
			}
			ig.Image.cache[this.path] = this;
		},
		reload: function () {
			this.loaded = false;
			this.data = new Image();
			this.data.onload = this.onload.bind(this);
			this.data.src = this.path + '?' + Date.now();
		},
		onload: function (event) {
			this.width = this.data.width;
			this.height = this.data.height;
			this.loaded = true;
			if (ig.system.scale != 1) {
				this.resize(ig.system.scale);
			}
			if (this.loadCallback) {
				this.loadCallback(this.path, true);
			}
		},
		onerror: function (event) {
			this.failed = true;
			if (this.loadCallback) {
				this.loadCallback(this.path, false);
			}
		},
		resize: function (scale) {
			var origPixels = ig.getImagePixels(this.data, 0, 0, this.width, this.height);
			var widthScaled = this.width * scale;
			var heightScaled = this.height * scale;
			var scaled = ig.$new('canvas');
			scaled.width = widthScaled;
			scaled.height = heightScaled;
			var scaledCtx = scaled.getContext('2d');
			var scaledPixels = scaledCtx.getImageData(0, 0, widthScaled, heightScaled);
			for (var y = 0; y < heightScaled; y++) {
				for (var x = 0; x < widthScaled; x++) {
					var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
					var indexScaled = (y * widthScaled + x) * 4;
					scaledPixels.data[indexScaled] = origPixels.data[index];
					scaledPixels.data[indexScaled + 1] = origPixels.data[index + 1];
					scaledPixels.data[indexScaled + 2] = origPixels.data[index + 2];
					scaledPixels.data[indexScaled + 3] = origPixels.data[index + 3];
				}
			}
			scaledCtx.putImageData(scaledPixels, 0, 0);
			this.data = scaled;
		},
		draw: function (targetX, targetY, sourceX, sourceY, width, height) {
			if (!this.loaded) {
				return;
			}
			var scale = ig.system.scale;
			sourceX = sourceX ? sourceX * scale : 0;
			sourceY = sourceY ? sourceY * scale : 0;
			width = (width ? width : this.width) * scale;
			height = (height ? height : this.height) * scale;
			ig.system.context.drawImage(this.data, sourceX, sourceY, width, height, ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY), width, height);
			ig.Image.drawCount++;
		},
		drawTile: function (targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY) {
			tileHeight = tileHeight ? tileHeight : tileWidth;
			if (!this.loaded || tileWidth > this.width || tileHeight > this.height) {
				return;
			}
			var scale = ig.system.scale;
			var tileWidthScaled = Math.floor(tileWidth * scale);
			var tileHeightScaled = Math.floor(tileHeight * scale);
			var scaleX = flipX ? -1 : 1;
			var scaleY = flipY ? -1 : 1;
			if (flipX || flipY) {
				ig.system.context.save();
				ig.system.context.scale(scaleX, scaleY);
			}
			ig.system.context.drawImage(this.data, (Math.floor(tile * tileWidth) % this.width) * scale, (Math.floor(tile * tileWidth / this.width) * tileHeight) * scale, tileWidthScaled, tileHeightScaled, ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0), ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0), tileWidthScaled, tileHeightScaled);
			if (flipX || flipY) {
				ig.system.context.restore();
			}
			ig.Image.drawCount++;
		}
	});
	ig.Image.drawCount = 0;
	ig.Image.cache = {};
	ig.Image.reloadCache = function () {
		for (var path in ig.Image.cache) {
			ig.Image.cache[path].reload();
		}
	};
});

// impact/font.js
ig.baked = true;
ig.module('impact.font').requires('impact.image').defines(function () {
	"use strict";
	ig.Font = ig.Image.extend({
		widthMap: [], indices: [], firstChar: 32, alpha: 1, letterSpacing: 1, lineSpacing: 0, onload: function (ev) {
			this._loadMetrics(this.data);
			this.parent(ev);
		}, widthForString: function (text) {
			if (text.indexOf('\n') !== -1) {
				var lines = text.split('\n');
				var width = 0;
				for (var i = 0; i < lines.length; i++) {
					width = Math.max(width, this._widthForLine(lines[i]));
				}
				return width;
			}
			else {
				return this._widthForLine(text);
			}
		}, _widthForLine: function (text) {
			var width = 0;
			for (var i = 0; i < text.length; i++) {
				width += this.widthMap[text.charCodeAt(i) - this.firstChar] + this.letterSpacing;
			}
			return width;
		}, heightForString: function (text) {
			return text.split('\n').length * (this.height + this.lineSpacing);
		}, draw: function (text, x, y, align) {
			if (typeof(text) != 'string') {
				text = text.toString();
			}
			if (text.indexOf('\n') !== -1) {
				var lines = text.split('\n');
				var lineHeight = this.height + this.lineSpacing;
				for (var i = 0; i < lines.length; i++) {
					this.draw(lines[i], x, y + i * lineHeight, align);
				}
				return;
			}
			if (align == ig.Font.ALIGN.RIGHT || align == ig.Font.ALIGN.CENTER) {
				var width = this._widthForLine(text);
				x -= align == ig.Font.ALIGN.CENTER ? width / 2 : width;
			}
			x = Math.round(x);
			if (this.alpha !== 1) {
				ig.system.context.globalAlpha = this.alpha;
			}
			for (var i = 0; i < text.length; i++) {
				var c = text.charCodeAt(i);
				x += this._drawChar(c - this.firstChar, x, y);
			}
			if (this.alpha !== 1) {
				ig.system.context.globalAlpha = 1;
			}
			ig.Image.drawCount += text.length;
		}, _drawChar: function (c, targetX, targetY) {
			if (!this.loaded || c < 0 || c >= this.indices.length) {
				return 0;
			}
			var scale = ig.system.scale;
			var charX = this.indices[c] * scale;
			var charY = 0;
			var charWidth = this.widthMap[c] * scale;
			var charHeight = (this.height - 2) * scale;
			ig.system.context.drawImage(this.data, charX, charY, charWidth, charHeight, ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY), charWidth, charHeight);
			return this.widthMap[c] + this.letterSpacing;
		}, _loadMetrics: function (image) {
			this.height = image.height - 1;
			this.widthMap = [];
			this.indices = [];
			var px = ig.getImagePixels(image, 0, image.height - 1, image.width, 1);
			var currentChar = 0;
			var currentWidth = 0;
			for (var x = 0; x < image.width; x++) {
				var index = x * 4 + 3;
				if (px.data[index] > 127) {
					currentWidth++;
				}
				else if (px.data[index] == 0 && currentWidth) {
					this.widthMap.push(currentWidth);
					this.indices.push(x - currentWidth);
					currentChar++;
					currentWidth = 0;
				}
			}
			this.widthMap.push(currentWidth);
			this.indices.push(x - currentWidth);
		}
	});
	ig.Font.ALIGN = {LEFT: 0, RIGHT: 1, CENTER: 2};
});

// impact/sound.js
ig.baked = true;
ig.module('impact.sound').defines(function () {
	"use strict";
	ig.SoundManager = ig.Class.extend({
		clips: {}, volume: 1, format: null, init: function () {
			if (!ig.Sound.enabled || !window.Audio) {
				ig.Sound.enabled = false;
				return;
			}
			var probe = new Audio();
			for (var i = 0; i < ig.Sound.use.length; i++) {
				var format = ig.Sound.use[i];
				if (probe.canPlayType(format.mime)) {
					this.format = format;
					break;
				}
			}
			if (!this.format) {
				ig.Sound.enabled = false;
			}
		}, load: function (path, multiChannel, loadCallback) {
			var realPath = ig.prefix + path.replace(/[^\.]+$/, this.format.ext) + ig.nocache;
			if (this.clips[path]) {
				if (multiChannel && this.clips[path].length < ig.Sound.channels) {
					for (var i = this.clips[path].length; i < ig.Sound.channels; i++) {
						var a = new Audio(realPath);
						a.load();
						this.clips[path].push(a);
					}
				}
				return this.clips[path][0];
			}
			var clip = new Audio(realPath);
			if (loadCallback) {
				clip.addEventListener('canplaythrough', function cb(ev) {
					clip.removeEventListener('canplaythrough', cb, false);
					loadCallback(path, true, ev);
				}, false);
				clip.addEventListener('error', function (ev) {
					loadCallback(path, false, ev);
				}, false);
			}
			clip.preload = 'auto';
			clip.load();
			this.clips[path] = [clip];
			if (multiChannel) {
				for (var i = 1; i < ig.Sound.channels; i++) {
					var a = new Audio(realPath);
					a.load();
					this.clips[path].push(a);
				}
			}
			return clip;
		}, get: function (path) {
			var channels = this.clips[path];
			for (var i = 0, clip; clip = channels[i++];) {
				if (clip.paused || clip.ended) {
					if (clip.ended) {
						clip.currentTime = 0;
					}
					return clip;
				}
			}
			channels[0].pause();
			channels[0].currentTime = 0;
			return channels[0];
		}
	});
	ig.Music = ig.Class.extend({
		tracks: [],
		namedTracks: {},
		currentTrack: null,
		currentIndex: 0,
		random: false,
		_volume: 1,
		_loop: false,
		_fadeInterval: 0,
		_fadeTimer: null,
		_endedCallbackBound: null,
		init: function () {
			this._endedCallbackBound = this._endedCallback.bind(this);
			if (Object.defineProperty) {
				Object.defineProperty(this, "volume", {get: this.getVolume.bind(this), set: this.setVolume.bind(this)});
				Object.defineProperty(this, "loop", {get: this.getLooping.bind(this), set: this.setLooping.bind(this)});
			}
			else if (this.__defineGetter__) {
				this.__defineGetter__('volume', this.getVolume.bind(this));
				this.__defineSetter__('volume', this.setVolume.bind(this));
				this.__defineGetter__('loop', this.getLooping.bind(this));
				this.__defineSetter__('loop', this.setLooping.bind(this));
			}
		},
		add: function (music, name) {
			if (!ig.Sound.enabled) {
				return;
			}
			var path = music instanceof ig.Sound ? music.path : music;
			var track = ig.soundManager.load(path, false);
			track.loop = this._loop;
			track.volume = this._volume;
			track.addEventListener('ended', this._endedCallbackBound, false);
			this.tracks.push(track);
			if (name) {
				this.namedTracks[name] = track;
			}
			if (!this.currentTrack) {
				this.currentTrack = track;
			}
		},
		next: function () {
			if (!this.tracks.length) {
				return;
			}
			this.stop();
			this.currentIndex = this.random ? Math.floor(Math.random() * this.tracks.length) : (this.currentIndex + 1) % this.tracks.length;
			this.currentTrack = this.tracks[this.currentIndex];
			this.play();
		},
		pause: function () {
			if (!this.currentTrack) {
				return;
			}
			this.currentTrack.pause();
		},
		stop: function () {
			if (!this.currentTrack) {
				return;
			}
			this.currentTrack.pause();
			this.currentTrack.currentTime = 0;
		},
		play: function (name) {
			if (name && this.namedTracks[name]) {
				var newTrack = this.namedTracks[name];
				if (newTrack != this.currentTrack) {
					this.stop();
					this.currentTrack = newTrack;
				}
			}
			else if (!this.currentTrack) {
				return;
			}
			this.currentTrack.play();
		},
		getLooping: function () {
			return this._loop;
		},
		setLooping: function (l) {
			this._loop = l;
			for (var i in this.tracks) {
				this.tracks[i].loop = l;
			}
		},
		getVolume: function () {
			return this._volume;
		},
		setVolume: function (v) {
			this._volume = v.limit(0, 1);
			for (var i in this.tracks) {
				this.tracks[i].volume = this._volume;
			}
		},
		fadeOut: function (time) {
			if (!this.currentTrack) {
				return;
			}
			clearInterval(this._fadeInterval);
			this.fadeTimer = new ig.Timer(time);
			this._fadeInterval = setInterval(this._fadeStep.bind(this), 50);
		},
		_fadeStep: function () {
			var v = this.fadeTimer.delta().map(-this.fadeTimer.target, 0, 1, 0).limit(0, 1) * this._volume;
			if (v <= 0.01) {
				this.stop();
				this.currentTrack.volume = this._volume;
				clearInterval(this._fadeInterval);
			}
			else {
				this.currentTrack.volume = v;
			}
		},
		_endedCallback: function () {
			if (this._loop) {
				this.play();
			}
			else {
				this.next();
			}
		}
	});
	ig.Sound = ig.Class.extend({
		path: '', volume: 1, currentClip: null, multiChannel: true, init: function (path, multiChannel) {
			this.path = path;
			this.multiChannel = (multiChannel !== false);
			this.load();
		}, load: function (loadCallback) {
			if (!ig.Sound.enabled) {
				if (loadCallback) {
					loadCallback(this.path, true);
				}
				return;
			}
			if (ig.ready) {
				ig.soundManager.load(this.path, this.multiChannel, loadCallback);
			}
			else {
				ig.addResource(this);
			}
		}, play: function () {
			if (!ig.Sound.enabled) {
				return;
			}
			this.currentClip = ig.soundManager.get(this.path);
			this.currentClip.volume = ig.soundManager.volume * this.volume;
			this.currentClip.play();
		}, stop: function () {
			if (this.currentClip) {
				this.currentClip.pause();
				this.currentClip.currentTime = 0;
			}
		}
	});
	ig.Sound.FORMAT = {
		MP3: {ext: 'mp3', mime: 'audio/mpeg'},
		M4A: {ext: 'm4a', mime: 'audio/mp4; codecs=mp4a'},
		OGG: {ext: 'ogg', mime: 'audio/ogg; codecs=vorbis'},
		WEBM: {ext: 'webm', mime: 'audio/webm; codecs=vorbis'},
		CAF: {ext: 'caf', mime: 'audio/x-caf'}
	};
	ig.Sound.use = [ig.Sound.FORMAT.OGG, ig.Sound.FORMAT.MP3];
	ig.Sound.channels = 4;
	ig.Sound.enabled = true;
});

// impact/loader.js
ig.baked = true;
ig.module('impact.loader').requires('impact.image', 'impact.font', 'impact.sound').defines(function () {
	"use strict";
	ig.Loader = ig.Class.extend({
		resources: [],
		gameClass: null,
		status: 0,
		done: false,
		_unloaded: [],
		_drawStatus: 0,
		_intervalId: 0,
		_loadCallbackBound: null,
		init: function (gameClass, resources) {
			this.gameClass = gameClass;
			this.resources = resources;
			this._loadCallbackBound = this._loadCallback.bind(this);
			for (var i = 0; i < this.resources.length; i++) {
				this._unloaded.push(this.resources[i].path);
			}
		},
		load: function () {
			ig.system.clear('#000');
			if (!this.resources.length) {
				this.end();
				return;
			}
			for (var i = 0; i < this.resources.length; i++) {
				this.loadResource(this.resources[i]);
			}
			this._intervalId = setInterval(this.draw.bind(this), 16);
		},
		loadResource: function (res) {
			res.load(this._loadCallbackBound);
		},
		end: function () {
			if (this.done) {
				return;
			}
			this.done = true;
			clearInterval(this._intervalId);
			ig.system.setGame(this.gameClass);
		},
		draw: function () {
			this._drawStatus += (this.status - this._drawStatus) / 5;
			var s = ig.system.scale;
			var w = ig.system.width * 0.6;
			var h = ig.system.height * 0.1;
			var x = ig.system.width * 0.5 - w / 2;
			var y = ig.system.height * 0.5 - h / 2;
			ig.system.context.fillStyle = '#000';
			ig.system.context.fillRect(0, 0, 480, 320);
			ig.system.context.fillStyle = '#fff';
			ig.system.context.fillRect(x * s, y * s, w * s, h * s);
			ig.system.context.fillStyle = '#000';
			ig.system.context.fillRect(x * s + s, y * s + s, w * s - s - s, h * s - s - s);
			ig.system.context.fillStyle = '#fff';
			ig.system.context.fillRect(x * s, y * s, w * s * this._drawStatus, h * s);
		},
		_loadCallback: function (path, status) {
			if (status) {
				this._unloaded.erase(path);
			}
			else {
				throw('Failed to load resource: ' + path);
			}
			this.status = 1 - (this._unloaded.length / this.resources.length);
			if (this._unloaded.length == 0) {
				setTimeout(this.end.bind(this), 250);
			}
		}
	});
});

// impact/timer.js
ig.baked = true;
ig.module('impact.timer').defines(function () {
	"use strict";
	ig.Timer = ig.Class.extend({
		target: 0, base: 0, last: 0, pausedAt: 0, init: function (seconds) {
			this.base = ig.Timer.time;
			this.last = ig.Timer.time;
			this.target = seconds || 0;
		}, set: function (seconds) {
			this.target = seconds || 0;
			this.base = ig.Timer.time;
			this.pausedAt = 0;
		}, reset: function () {
			this.base = ig.Timer.time;
			this.pausedAt = 0;
		}, tick: function () {
			var delta = ig.Timer.time - this.last;
			this.last = ig.Timer.time;
			return (this.pausedAt ? 0 : delta);
		}, delta: function () {
			return (this.pausedAt || ig.Timer.time) - this.base - this.target;
		}, pause: function () {
			if (!this.pausedAt) {
				this.pausedAt = ig.Timer.time;
			}
		}, unpause: function () {
			if (this.pausedAt) {
				this.base += ig.Timer.time - this.pausedAt;
				this.pausedAt = 0;
			}
		}
	});
	ig.Timer._last = 0;
	ig.Timer.time = Number.MIN_VALUE;
	ig.Timer.timeScale = 1;
	ig.Timer.maxStep = 0.05;
	ig.Timer.step = function () {
		var current = Date.now();
		var delta = (current - ig.Timer._last) / 1000;
		ig.Timer.time += Math.min(delta, ig.Timer.maxStep) * ig.Timer.timeScale;
		ig.Timer._last = current;
	};
});

// impact/system.js
ig.baked = true;
ig.module('impact.system').requires('impact.timer', 'impact.image').defines(function () {
	"use strict";
	ig.System = ig.Class.extend({
		fps: 30,
		width: 320,
		height: 240,
		realWidth: 320,
		realHeight: 240,
		scale: 1,
		tick: 0,
		animationId: 0,
		newGameClass: null,
		running: false,
		delegate: null,
		clock: null,
		canvas: null,
		context: null,
		init: function (canvasId, fps, width, height, scale) {
			this.fps = fps;
			this.clock = new ig.Timer();
			this.canvas = ig.$(canvasId);
			this.resize(width, height, scale);
			this.context = this.canvas.getContext('2d');
			this.getDrawPos = ig.System.drawMode;
			if (this.scale != 1) {
				ig.System.scaleMode = ig.System.SCALE.CRISP;
			}
			ig.System.scaleMode(this.canvas, this.context);
		},
		resize: function (width, height, scale) {
			this.width = width;
			this.height = height;
			this.scale = scale || this.scale;
			this.realWidth = this.width * this.scale;
			this.realHeight = this.height * this.scale;
			this.canvas.width = this.realWidth;
			this.canvas.height = this.realHeight;
		},
		setGame: function (gameClass) {
			if (this.running) {
				this.newGameClass = gameClass;
			}
			else {
				this.setGameNow(gameClass);
			}
		},
		setGameNow: function (gameClass) {
			ig.game = new (gameClass)();
			ig.system.setDelegate(ig.game);
		},
		setDelegate: function (object) {
			if (typeof(object.run) == 'function') {
				this.delegate = object;
				this.startRunLoop();
			} else {
				throw('System.setDelegate: No run() function in object');
			}
		},
		stopRunLoop: function () {
			ig.clearAnimation(this.animationId);
			this.running = false;
		},
		startRunLoop: function () {
			this.stopRunLoop();
			this.animationId = ig.setAnimation(this.run.bind(this), this.canvas);
			this.running = true;
		},
		clear: function (color) {
			this.context.fillStyle = color;
			this.context.fillRect(0, 0, this.realWidth, this.realHeight);
		},
		run: function () {
			ig.Timer.step();
			this.tick = this.clock.tick();
			this.delegate.run();
			ig.input.clearPressed();
			if (this.newGameClass) {
				this.setGameNow(this.newGameClass);
				this.newGameClass = null;
			}
		},
		getDrawPos: null
	});
	ig.System.DRAW = {
		AUTHENTIC: function (p) {
			return Math.round(p) * this.scale;
		}, SMOOTH: function (p) {
			return Math.round(p * this.scale);
		}, SUBPIXEL: function (p) {
			return p * this.scale;
		}
	};
	ig.System.drawMode = ig.System.DRAW.SMOOTH;
	ig.System.SCALE = {
		CRISP: function (canvas, context) {
			ig.setVendorAttribute(context, 'imageSmoothingEnabled', false);
			canvas.style.imageRendering = '-moz-crisp-edges';
			canvas.style.imageRendering = '-o-crisp-edges';
			canvas.style.imageRendering = '-webkit-optimize-contrast';
			canvas.style.imageRendering = 'crisp-edges';
			canvas.style.msInterpolationMode = 'nearest-neighbor';
		}, SMOOTH: function (canvas, context) {
			ig.setVendorAttribute(context, 'imageSmoothingEnabled', true);
			canvas.style.imageRendering = '';
			canvas.style.msInterpolationMode = '';
		}
	};
	ig.System.scaleMode = ig.System.SCALE.SMOOTH;
});

// impact/input.js
ig.baked = true;
ig.module('impact.input').defines(function () {
	"use strict";
	ig.KEY = {
		'MOUSE1': -1,
		'MOUSE2': -3,
		'MWHEEL_UP': -4,
		'MWHEEL_DOWN': -5,
		'BACKSPACE': 8,
		'TAB': 9,
		'ENTER': 13,
		'PAUSE': 19,
		'CAPS': 20,
		'ESC': 27,
		'SPACE': 32,
		'PAGE_UP': 33,
		'PAGE_DOWN': 34,
		'END': 35,
		'HOME': 36,
		'LEFT_ARROW': 37,
		'UP_ARROW': 38,
		'RIGHT_ARROW': 39,
		'DOWN_ARROW': 40,
		'INSERT': 45,
		'DELETE': 46,
		'_0': 48,
		'_1': 49,
		'_2': 50,
		'_3': 51,
		'_4': 52,
		'_5': 53,
		'_6': 54,
		'_7': 55,
		'_8': 56,
		'_9': 57,
		'A': 65,
		'B': 66,
		'C': 67,
		'D': 68,
		'E': 69,
		'F': 70,
		'G': 71,
		'H': 72,
		'I': 73,
		'J': 74,
		'K': 75,
		'L': 76,
		'M': 77,
		'N': 78,
		'O': 79,
		'P': 80,
		'Q': 81,
		'R': 82,
		'S': 83,
		'T': 84,
		'U': 85,
		'V': 86,
		'W': 87,
		'X': 88,
		'Y': 89,
		'Z': 90,
		'NUMPAD_0': 96,
		'NUMPAD_1': 97,
		'NUMPAD_2': 98,
		'NUMPAD_3': 99,
		'NUMPAD_4': 100,
		'NUMPAD_5': 101,
		'NUMPAD_6': 102,
		'NUMPAD_7': 103,
		'NUMPAD_8': 104,
		'NUMPAD_9': 105,
		'MULTIPLY': 106,
		'ADD': 107,
		'SUBSTRACT': 109,
		'DECIMAL': 110,
		'DIVIDE': 111,
		'F1': 112,
		'F2': 113,
		'F3': 114,
		'F4': 115,
		'F5': 116,
		'F6': 117,
		'F7': 118,
		'F8': 119,
		'F9': 120,
		'F10': 121,
		'F11': 122,
		'F12': 123,
		'SHIFT': 16,
		'CTRL': 17,
		'ALT': 18,
		'PLUS': 187,
		'COMMA': 188,
		'MINUS': 189,
		'PERIOD': 190
	};
	ig.Input = ig.Class.extend({
		bindings: {},
		actions: {},
		presses: {},
		locks: {},
		delayedKeyup: {},
		isUsingMouse: false,
		isUsingKeyboard: false,
		isUsingAccelerometer: false,
		mouse: {x: 0, y: 0},
		accel: {x: 0, y: 0, z: 0},
		initMouse: function () {
			if (this.isUsingMouse) {
				return;
			}
			this.isUsingMouse = true;
			var mouseWheelBound = this.mousewheel.bind(this);
			ig.system.canvas.addEventListener('mousewheel', mouseWheelBound, false);
			ig.system.canvas.addEventListener('DOMMouseScroll', mouseWheelBound, false);
			ig.system.canvas.addEventListener('contextmenu', this.contextmenu.bind(this), false);
			ig.system.canvas.addEventListener('mousedown', this.keydown.bind(this), false);
			ig.system.canvas.addEventListener('mouseup', this.keyup.bind(this), false);
			ig.system.canvas.addEventListener('mousemove', this.mousemove.bind(this), false);
			ig.system.canvas.addEventListener('touchstart', this.keydown.bind(this), false);
			ig.system.canvas.addEventListener('touchend', this.keyup.bind(this), false);
			ig.system.canvas.addEventListener('touchmove', this.mousemove.bind(this), false);
		},
		initKeyboard: function () {
			if (this.isUsingKeyboard) {
				return;
			}
			this.isUsingKeyboard = true;
			window.addEventListener('keydown', this.keydown.bind(this), false);
			window.addEventListener('keyup', this.keyup.bind(this), false);
		},
		initAccelerometer: function () {
			if (this.isUsingAccelerometer) {
				return;
			}
			window.addEventListener('devicemotion', this.devicemotion.bind(this), false);
		},
		mousewheel: function (event) {
			var delta = event.wheelDelta ? event.wheelDelta : (event.detail * -1);
			var code = delta > 0 ? ig.KEY.MWHEEL_UP : ig.KEY.MWHEEL_DOWN;
			var action = this.bindings[code];
			if (action) {
				this.actions[action] = true;
				this.presses[action] = true;
				this.delayedKeyup[action] = true;
				event.stopPropagation();
				event.preventDefault();
			}
		},
		getEventPosition: function (event) {
			var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
			var scale = ig.system.scale * (internalWidth / ig.system.realWidth);
			var pos = {left: 0, top: 0};
			if (ig.system.canvas.getBoundingClientRect) {
				pos = ig.system.canvas.getBoundingClientRect();
			}
			return {x: (event.clientX - pos.left) / scale, y: (event.clientY - pos.top) / scale};
		},
		mousemove: function (event) {
			ig.input.mouse = this.getEventPosition(event.touches ? event.touches[0] : event);
		},
		contextmenu: function (event) {
			if (this.bindings[ig.KEY.MOUSE2]) {
				event.stopPropagation();
				event.preventDefault();
			}
		},
		keydown: function (event) {
			var tag = event.target.tagName;
			if (tag == 'INPUT' || tag == 'TEXTAREA') {
				return;
			}
			var code = event.type == 'keydown' ? event.keyCode : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
			if (event.type == 'touchstart' || event.type == 'mousedown') {
				this.mousemove(event);
			}
			var action = this.bindings[code];
			if (action) {
				this.actions[action] = true;
				if (!this.locks[action]) {
					this.presses[action] = true;
					this.locks[action] = true;
				}
				event.stopPropagation();
				event.preventDefault();
			}
		},
		keyup: function (event) {
			var tag = event.target.tagName;
			if (tag == 'INPUT' || tag == 'TEXTAREA') {
				return;
			}
			var code = event.type == 'keyup' ? event.keyCode : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
			var action = this.bindings[code];
			if (action) {
				this.delayedKeyup[action] = true;
				event.stopPropagation();
				event.preventDefault();
			}
		},
		devicemotion: function (event) {
			this.accel = event.accelerationIncludingGravity;
		},
		bind: function (key, action) {
			if (key < 0) {
				this.initMouse();
			}
			else if (key > 0) {
				this.initKeyboard();
			}
			this.bindings[key] = action;
		},
		bindTouch: function (selector, action) {
			var element = ig.$(selector);
			var that = this;
			element.addEventListener('touchstart', function (ev) {
				that.touchStart(ev, action);
			}, false);
			element.addEventListener('touchend', function (ev) {
				that.touchEnd(ev, action);
			}, false);
		},
		unbind: function (key) {
			var action = this.bindings[key];
			this.delayedKeyup[action] = true;
			this.bindings[key] = null;
		},
		unbindAll: function () {
			this.bindings = {};
			this.actions = {};
			this.presses = {};
			this.locks = {};
			this.delayedKeyup = {};
		},
		state: function (action) {
			return this.actions[action];
		},
		pressed: function (action) {
			return this.presses[action];
		},
		released: function (action) {
			return this.delayedKeyup[action];
		},
		clearPressed: function () {
			for (var action in this.delayedKeyup) {
				this.actions[action] = false;
				this.locks[action] = false;
			}
			this.delayedKeyup = {};
			this.presses = {};
		},
		touchStart: function (event, action) {
			this.actions[action] = true;
			this.presses[action] = true;
			event.stopPropagation();
			event.preventDefault();
			return false;
		},
		touchEnd: function (event, action) {
			this.delayedKeyup[action] = true;
			event.stopPropagation();
			event.preventDefault();
			return false;
		}
	});
});

// impact/impact.js
ig.baked = true;
ig.module('impact.impact').requires('dom.ready', 'impact.loader', 'impact.system', 'impact.input', 'impact.sound').defines(function () {
	"use strict";
	ig.main = function (canvasId, gameClass, fps, width, height, scale, loaderClass) {
		ig.system = new ig.System(canvasId, fps, width, height, scale || 1);
		ig.input = new ig.Input();
		ig.soundManager = new ig.SoundManager();
		ig.music = new ig.Music();
		ig.ready = true;
		var loader = new (loaderClass || ig.Loader)(gameClass, ig.resources);
		loader.load();
	};
});

// plugins/impact-splash-loader.js
ig.baked = true;
ig.module('plugins.impact-splash-loader').requires('impact.loader').defines(function () {
	ig.ImpactSplashLoader = ig.Loader.extend({
		endTime: 0, fadeToWhiteTime: 200, fadeToGameTime: 800, logoWidth: 340, logoHeight: 120, end: function () {
			this.parent();
			this.endTime = Date.now();
			ig.system.setDelegate(this);
		}, run: function () {
			var t = Date.now() - this.endTime;
			var alpha = 1;
			if (t < this.fadeToWhiteTime) {
				this.draw();
				alpha = t.map(0, this.fadeToWhiteTime, 0, 1);
			}
			else if (t < this.fadeToGameTime) {
				ig.game.run();
				alpha = t.map(this.fadeToWhiteTime, this.fadeToGameTime, 1, 0);
			}
			else {
				ig.system.setDelegate(ig.game);
				return;
			}
			ig.system.context.fillStyle = 'rgba(255,255,255,' + alpha + ')';
			ig.system.context.fillRect(0, 0, ig.system.realWidth, ig.system.realHeight);
		}, draw: function () {
			this._drawStatus += (this.status - this._drawStatus) / 5;
			var ctx = ig.system.context;
			var w = ig.system.realWidth;
			var h = ig.system.realHeight;
			var scale = w / this.logoWidth / 3;
			var center = (w - this.logoWidth * scale) / 2;
			ctx.fillStyle = 'rgba(0,0,0,0.8)';
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = 'rgb(128,128,128)';
			ctx.textAlign = 'right';
			ctx.font = '10px Arial';
			ctx.fillText('http://impactjs.com', w - 10, h - 10);
			ctx.textAlign = 'left';
			ctx.save();
			ctx.translate(center, h / 2.5);
			ctx.scale(scale, scale);
			ctx.lineWidth = '3';
			ctx.strokeStyle = 'rgb(255,255,255)';
			ctx.strokeRect(25, this.logoHeight + 40, 300, 20);
			ctx.fillStyle = 'rgb(255,255,255)';
			ctx.fillRect(30, this.logoHeight + 45, 290 * this._drawStatus, 10);
			this.drawPaths('rgb(255,255,255)', ig.ImpactSplashLoader.PATHS_IMPACT);
			var comet = ig.ImpactSplashLoader.PATHS_COMET;
			comet[5][0] = 3 - Math.random() * this._drawStatus * 7;
			comet[5][1] = 3 - Math.random() * this._drawStatus * 10;
			comet[7][0] = 29.5 - Math.random() * this._drawStatus * 10;
			comet[7][1] = 40.4 - Math.random() * this._drawStatus * 10;
			comet[9][0] = 16.1 - Math.random() * this._drawStatus * 10;
			comet[9][1] = 36.1 - Math.random() * this._drawStatus * 5;
			ctx.translate(-Math.random() * this._drawStatus * 7, -Math.random() * this._drawStatus * 5);
			this.drawPaths('rgb(243,120,31)', comet);
			ctx.restore();
		}, drawPaths: function (color, paths) {
			var ctx = ig.system.context;
			ctx.fillStyle = color;
			for (var i = 0; i < paths.length; i += 2) {
				ctx[ig.ImpactSplashLoader.OPS[paths[i]]].apply(ctx, paths[i + 1]);
			}
		}
	});
	ig.ImpactSplashLoader.OPS = {
		bp: 'beginPath',
		cp: 'closePath',
		f: 'fill',
		m: 'moveTo',
		l: 'lineTo',
		bc: 'bezierCurveTo'
	};
	ig.ImpactSplashLoader.PATHS_COMET = ['bp', [], 'm', [85.1, 58.3], 'l', [0.0, 0.0], 'l', [29.5, 40.4], 'l', [16.1, 36.1], 'l', [54.6, 91.6], 'bc', [65.2, 106.1, 83.4, 106.7, 93.8, 95.7], 'bc', [103.9, 84.9, 98.6, 67.6, 85.1, 58.3], 'cp', [], 'm', [76.0, 94.3], 'bc', [68.5, 94.3, 62.5, 88.2, 62.5, 80.8], 'bc', [62.5, 73.3, 68.5, 67.2, 76.0, 67.2], 'bc', [83.5, 67.2, 89.6, 73.3, 89.6, 80.8], 'bc', [89.6, 88.2, 83.5, 94.3, 76.0, 94.3], 'cp', [], 'f', []];
	ig.ImpactSplashLoader.PATHS_IMPACT = ['bp', [], 'm', [128.8, 98.7], 'l', [114.3, 98.7], 'l', [114.3, 26.3], 'l', [128.8, 26.3], 'l', [128.8, 98.7], 'cp', [], 'f', [], 'bp', [], 'm', [159.2, 70.1], 'l', [163.6, 26.3], 'l', [184.6, 26.3], 'l', [184.6, 98.7], 'l', [170.3, 98.7], 'l', [170.3, 51.2], 'l', [164.8, 98.7], 'l', [151.2, 98.7], 'l', [145.7, 50.7], 'l', [145.7, 98.7], 'l', [134.1, 98.7], 'l', [134.1, 26.3], 'l', [155.0, 26.3], 'l', [159.2, 70.1], 'cp', [], 'f', [], 'bp', [], 'm', [204.3, 98.7], 'l', [189.8, 98.7], 'l', [189.8, 26.3], 'l', [211.0, 26.3], 'bc', [220.0, 26.3, 224.5, 30.7, 224.5, 39.7], 'l', [224.5, 60.1], 'bc', [224.5, 69.1, 220.0, 73.6, 211.0, 73.6], 'l', [204.3, 73.6], 'l', [204.3, 98.7], 'cp', [], 'm', [207.4, 38.7], 'l', [204.3, 38.7], 'l', [204.3, 61.2], 'l', [207.4, 61.2], 'bc', [209.1, 61.2, 210.0, 60.3, 210.0, 58.6], 'l', [210.0, 41.3], 'bc', [210.0, 39.5, 209.1, 38.7, 207.4, 38.7], 'cp', [], 'f', [], 'bp', [], 'm', [262.7, 98.7], 'l', [248.3, 98.7], 'l', [247.1, 88.2], 'l', [238.0, 88.2], 'l', [237.0, 98.7], 'l', [223.8, 98.7], 'l', [233.4, 26.3], 'l', [253.1, 26.3], 'l', [262.7, 98.7], 'cp', [], 'm', [239.4, 75.5], 'l', [245.9, 75.5], 'l', [242.6, 43.9], 'l', [239.4, 75.5], 'cp', [], 'f', [], 'bp', [], 'm', [300.9, 66.7], 'l', [300.9, 85.9], 'bc', [300.9, 94.9, 296.4, 99.4, 287.4, 99.4], 'l', [278.5, 99.4], 'bc', [269.5, 99.4, 265.1, 94.9, 265.1, 85.9], 'l', [265.1, 39.1], 'bc', [265.1, 30.1, 269.5, 25.6, 278.5, 25.6], 'l', [287.2, 25.6], 'bc', [296.2, 25.6, 300.7, 30.1, 300.7, 39.1], 'l', [300.7, 56.1], 'l', [286.4, 56.1], 'l', [286.4, 40.7], 'bc', [286.4, 38.9, 285.6, 38.1, 283.8, 38.1], 'l', [282.1, 38.1], 'bc', [280.4, 38.1, 279.5, 38.9, 279.5, 40.7], 'l', [279.5, 84.3], 'bc', [279.5, 86.1, 280.4, 86.9, 282.1, 86.9], 'l', [284.0, 86.9], 'bc', [285.8, 86.9, 286.6, 86.1, 286.6, 84.3], 'l', [286.6, 66.7], 'l', [300.9, 66.7], 'cp', [], 'f', [], 'bp', [], 'm', [312.5, 98.7], 'l', [312.5, 39.2], 'l', [303.7, 39.2], 'l', [303.7, 26.3], 'l', [335.8, 26.3], 'l', [335.8, 39.2], 'l', [327.0, 39.2], 'l', [327.0, 98.7], 'l', [312.5, 98.7], 'cp', [], 'f', []];
});

// impact/animation.js
ig.baked = true;
ig.module('impact.animation').requires('impact.timer', 'impact.image').defines(function () {
	"use strict";
	ig.AnimationSheet = ig.Class.extend({
		width: 8, height: 8, image: null, init: function (path, width, height) {
			this.width = width;
			this.height = height;
			this.image = new ig.Image(path);
		}
	});
	ig.Animation = ig.Class.extend({
		sheet: null,
		timer: null,
		sequence: [],
		flip: {x: false, y: false},
		pivot: {x: 0, y: 0},
		frame: 0,
		tile: 0,
		loopCount: 0,
		alpha: 1,
		angle: 0,
		init: function (sheet, frameTime, sequence, stop) {
			this.sheet = sheet;
			this.pivot = {x: sheet.width / 2, y: sheet.height / 2};
			this.timer = new ig.Timer();
			this.frameTime = frameTime;
			this.sequence = sequence;
			this.stop = !!stop;
			this.tile = this.sequence[0];
		},
		rewind: function () {
			this.timer.set();
			this.loopCount = 0;
			this.tile = this.sequence[0];
			return this;
		},
		gotoFrame: function (f) {
			this.timer.set(this.frameTime * -f);
			this.update();
		},
		gotoRandomFrame: function () {
			this.gotoFrame(Math.floor(Math.random() * this.sequence.length))
		},
		update: function () {
			var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
			this.loopCount = Math.floor(frameTotal / this.sequence.length);
			if (this.stop && this.loopCount > 0) {
				this.frame = this.sequence.length - 1;
			}
			else {
				this.frame = frameTotal % this.sequence.length;
			}
			this.tile = this.sequence[this.frame];
		},
		draw: function (targetX, targetY) {
			var bbsize = Math.max(this.sheet.width, this.sheet.height);
			if (targetX > ig.system.width || targetY > ig.system.height || targetX + bbsize < 0 || targetY + bbsize < 0) {
				return;
			}
			if (this.alpha != 1) {
				ig.system.context.globalAlpha = this.alpha;
			}
			if (this.angle == 0) {
				this.sheet.image.drawTile(targetX, targetY, this.tile, this.sheet.width, this.sheet.height, this.flip.x, this.flip.y);
			}
			else {
				ig.system.context.save();
				ig.system.context.translate(ig.system.getDrawPos(targetX + this.pivot.x), ig.system.getDrawPos(targetY + this.pivot.y));
				ig.system.context.rotate(this.angle);
				this.sheet.image.drawTile(-this.pivot.x, -this.pivot.y, this.tile, this.sheet.width, this.sheet.height, this.flip.x, this.flip.y);
				ig.system.context.restore();
			}
			if (this.alpha != 1) {
				ig.system.context.globalAlpha = 1;
			}
		}
	});
});

// impact/entity.js
ig.baked = true;
ig.module('impact.entity').requires('impact.animation', 'impact.impact').defines(function () {
	"use strict";
	ig.Entity = ig.Class.extend({
		id: 0,
		settings: {},
		size: {x: 16, y: 16},
		offset: {x: 0, y: 0},
		pos: {x: 0, y: 0},
		last: {x: 0, y: 0},
		vel: {x: 0, y: 0},
		accel: {x: 0, y: 0},
		friction: {x: 0, y: 0},
		maxVel: {x: 100, y: 100},
		zIndex: 0,
		gravityFactor: 1,
		standing: false,
		bounciness: 0,
		minBounceVelocity: 40,
		anims: {},
		animSheet: null,
		currentAnim: null,
		health: 10,
		type: 0,
		checkAgainst: 0,
		collides: 0,
		_killed: false,
		slopeStanding: {min: (44).toRad(), max: (136).toRad()},
		init: function (x, y, settings) {
			this.id = ++ig.Entity._lastId;
			this.pos.x = x;
			this.pos.y = y;
			ig.merge(this, settings);
		},
		addAnim: function (name, frameTime, sequence, stop) {
			if (!this.animSheet) {
				throw('No animSheet to add the animation ' + name + ' to.');
			}
			var a = new ig.Animation(this.animSheet, frameTime, sequence, stop);
			this.anims[name] = a;
			if (!this.currentAnim) {
				this.currentAnim = a;
			}
			return a;
		},
		update: function () {
			this.last.x = this.pos.x;
			this.last.y = this.pos.y;
			this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
			this.vel.x = this.getNewVelocity(this.vel.x, this.accel.x, this.friction.x, this.maxVel.x);
			this.vel.y = this.getNewVelocity(this.vel.y, this.accel.y, this.friction.y, this.maxVel.y);
			var mx = this.vel.x * ig.system.tick;
			var my = this.vel.y * ig.system.tick;
			var res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y);
			this.handleMovementTrace(res);
			if (this.currentAnim) {
				this.currentAnim.update();
			}
		},
		getNewVelocity: function (vel, accel, friction, max) {
			if (accel) {
				return (vel + accel * ig.system.tick).limit(-max, max);
			}
			else if (friction) {
				var delta = friction * ig.system.tick;
				if (vel - delta > 0) {
					return vel - delta;
				}
				else if (vel + delta < 0) {
					return vel + delta;
				}
				else {
					return 0;
				}
			}
			return vel.limit(-max, max);
		},
		handleMovementTrace: function (res) {
			this.standing = false;
			if (res.collision.y) {
				if (this.bounciness > 0 && Math.abs(this.vel.y) > this.minBounceVelocity) {
					this.vel.y *= -this.bounciness;
				}
				else {
					if (this.vel.y > 0) {
						this.standing = true;
					}
					this.vel.y = 0;
				}
			}
			if (res.collision.x) {
				if (this.bounciness > 0 && Math.abs(this.vel.x) > this.minBounceVelocity) {
					this.vel.x *= -this.bounciness;
				}
				else {
					this.vel.x = 0;
				}
			}
			if (res.collision.slope) {
				var s = res.collision.slope;
				if (this.bounciness > 0) {
					var proj = this.vel.x * s.nx + this.vel.y * s.ny;
					this.vel.x = (this.vel.x - s.nx * proj * 2) * this.bounciness;
					this.vel.y = (this.vel.y - s.ny * proj * 2) * this.bounciness;
				}
				else {
					var lengthSquared = s.x * s.x + s.y * s.y;
					var dot = (this.vel.x * s.x + this.vel.y * s.y) / lengthSquared;
					this.vel.x = s.x * dot;
					this.vel.y = s.y * dot;
					var angle = Math.atan2(s.x, s.y);
					if (angle > this.slopeStanding.min && angle < this.slopeStanding.max) {
						this.standing = true;
					}
				}
			}
			this.pos = res.pos;
		},
		draw: function () {
			if (this.currentAnim) {
				this.currentAnim.draw(this.pos.x - this.offset.x - ig.game._rscreen.x, this.pos.y - this.offset.y - ig.game._rscreen.y);
			}
		},
		kill: function () {
			ig.game.removeEntity(this);
		},
		receiveDamage: function (amount, from) {
			this.health -= amount;
			if (this.health <= 0) {
				this.kill();
			}
		},
		touches: function (other) {
			return !(this.pos.x >= other.pos.x + other.size.x || this.pos.x + this.size.x <= other.pos.x || this.pos.y >= other.pos.y + other.size.y || this.pos.y + this.size.y <= other.pos.y);
		},
		distanceTo: function (other) {
			var xd = (this.pos.x + this.size.x / 2) - (other.pos.x + other.size.x / 2);
			var yd = (this.pos.y + this.size.y / 2) - (other.pos.y + other.size.y / 2);
			return Math.sqrt(xd * xd + yd * yd);
		},
		angleTo: function (other) {
			return Math.atan2((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2), (other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2));
		},
		check: function (other) {
		},
		collideWith: function (other, axis) {
		},
		ready: function () {
		}
	});
	ig.Entity._lastId = 0;
	ig.Entity.COLLIDES = {NEVER: 0, LITE: 1, PASSIVE: 2, ACTIVE: 4, FIXED: 8};
	ig.Entity.TYPE = {NONE: 0, A: 1, B: 2, BOTH: 3};
	ig.Entity.checkPair = function (a, b) {
		if (a.checkAgainst & b.type) {
			a.check(b);
		}
		if (b.checkAgainst & a.type) {
			b.check(a);
		}
		if (a.collides && b.collides && a.collides + b.collides > ig.Entity.COLLIDES.ACTIVE) {
			ig.Entity.solveCollision(a, b);
		}
	};
	ig.Entity.solveCollision = function (a, b) {
		var weak = null;
		if (a.collides == ig.Entity.COLLIDES.LITE || b.collides == ig.Entity.COLLIDES.FIXED) {
			weak = a;
		}
		else if (b.collides == ig.Entity.COLLIDES.LITE || a.collides == ig.Entity.COLLIDES.FIXED) {
			weak = b;
		}
		if (a.last.x + a.size.x > b.last.x && a.last.x < b.last.x + b.size.x) {
			if (a.last.y < b.last.y) {
				ig.Entity.seperateOnYAxis(a, b, weak);
			}
			else {
				ig.Entity.seperateOnYAxis(b, a, weak);
			}
			a.collideWith(b, 'y');
			b.collideWith(a, 'y');
		}
		else if (a.last.y + a.size.y > b.last.y && a.last.y < b.last.y + b.size.y) {
			if (a.last.x < b.last.x) {
				ig.Entity.seperateOnXAxis(a, b, weak);
			}
			else {
				ig.Entity.seperateOnXAxis(b, a, weak);
			}
			a.collideWith(b, 'x');
			b.collideWith(a, 'x');
		}
	};
	ig.Entity.seperateOnXAxis = function (left, right, weak) {
		var nudge = (left.pos.x + left.size.x - right.pos.x);
		if (weak) {
			var strong = left === weak ? right : left;
			weak.vel.x = -weak.vel.x * weak.bounciness + strong.vel.x;
			var resWeak = ig.game.collisionMap.trace(weak.pos.x, weak.pos.y, weak == left ? -nudge : nudge, 0, weak.size.x, weak.size.y);
			weak.pos.x = resWeak.pos.x;
		}
		else {
			var v2 = (left.vel.x - right.vel.x) / 2;
			left.vel.x = -v2;
			right.vel.x = v2;
			var resLeft = ig.game.collisionMap.trace(left.pos.x, left.pos.y, -nudge / 2, 0, left.size.x, left.size.y);
			left.pos.x = Math.floor(resLeft.pos.x);
			var resRight = ig.game.collisionMap.trace(right.pos.x, right.pos.y, nudge / 2, 0, right.size.x, right.size.y);
			right.pos.x = Math.ceil(resRight.pos.x);
		}
	};
	ig.Entity.seperateOnYAxis = function (top, bottom, weak) {
		var nudge = (top.pos.y + top.size.y - bottom.pos.y);
		if (weak) {
			var strong = top === weak ? bottom : top;
			weak.vel.y = -weak.vel.y * weak.bounciness + strong.vel.y;
			var nudgeX = 0;
			if (weak == top && Math.abs(weak.vel.y - strong.vel.y) < weak.minBounceVelocity) {
				weak.standing = true;
				nudgeX = strong.vel.x * ig.system.tick;
			}
			var resWeak = ig.game.collisionMap.trace(weak.pos.x, weak.pos.y, nudgeX, weak == top ? -nudge : nudge, weak.size.x, weak.size.y);
			weak.pos.y = resWeak.pos.y;
			weak.pos.x = resWeak.pos.x;
		}
		else if (ig.game.gravity && (bottom.standing || top.vel.y > 0)) {
			var resTop = ig.game.collisionMap.trace(top.pos.x, top.pos.y, 0, -(top.pos.y + top.size.y - bottom.pos.y), top.size.x, top.size.y);
			top.pos.y = resTop.pos.y;
			if (top.bounciness > 0 && top.vel.y > top.minBounceVelocity) {
				top.vel.y *= -top.bounciness;
			}
			else {
				top.standing = true;
				top.vel.y = 0;
			}
		}
		else {
			var v2 = (top.vel.y - bottom.vel.y) / 2;
			top.vel.y = -v2;
			bottom.vel.y = v2;
			var nudgeX = bottom.vel.x * ig.system.tick;
			var resTop = ig.game.collisionMap.trace(top.pos.x, top.pos.y, nudgeX, -nudge / 2, top.size.x, top.size.y);
			top.pos.y = resTop.pos.y;
			var resBottom = ig.game.collisionMap.trace(bottom.pos.x, bottom.pos.y, 0, nudge / 2, bottom.size.x, bottom.size.y);
			bottom.pos.y = resBottom.pos.y;
		}
	};
});

// impact/map.js
ig.baked = true;
ig.module('impact.map').defines(function () {
	"use strict";
	ig.Map = ig.Class.extend({
		tilesize: 8, width: 1, height: 1, data: [[]], name: null, init: function (tilesize, data) {
			this.tilesize = tilesize;
			this.data = data;
			this.height = data.length;
			this.width = data[0].length;
		}, getTile: function (x, y) {
			var tx = Math.floor(x / this.tilesize);
			var ty = Math.floor(y / this.tilesize);
			if ((tx >= 0 && tx < this.width) && (ty >= 0 && ty < this.height)) {
				return this.data[ty][tx];
			}
			else {
				return 0;
			}
		}, setTile: function (x, y, tile) {
			var tx = Math.floor(x / this.tilesize);
			var ty = Math.floor(y / this.tilesize);
			if ((tx >= 0 && tx < this.width) && (ty >= 0 && ty < this.height)) {
				this.data[ty][tx] = tile;
			}
		}
	});
});

// impact/collision-map.js
ig.baked = true;
ig.module('impact.collision-map').requires('impact.map').defines(function () {
	"use strict";
	ig.CollisionMap = ig.Map.extend({
		lastSlope: 1, tiledef: null, init: function (tilesize, data, tiledef) {
			this.parent(tilesize, data);
			this.tiledef = tiledef || ig.CollisionMap.defaultTileDef;
			for (var t in this.tiledef) {
				if (t | 0 > this.lastSlope) {
					this.lastSlope = t | 0;
				}
			}
		}, trace: function (x, y, vx, vy, objectWidth, objectHeight) {
			var res = {collision: {x: false, y: false, slope: false}, pos: {x: x, y: y}, tile: {x: 0, y: 0}};
			var steps = Math.ceil(Math.max(Math.abs(vx), Math.abs(vy)) / this.tilesize);
			if (steps > 1) {
				var sx = vx / steps;
				var sy = vy / steps;
				for (var i = 0; i < steps && (sx || sy); i++) {
					this._traceStep(res, x, y, sx, sy, objectWidth, objectHeight, vx, vy, i);
					x = res.pos.x;
					y = res.pos.y;
					if (res.collision.x) {
						sx = 0;
						vx = 0;
					}
					if (res.collision.y) {
						sy = 0;
						vy = 0;
					}
					if (res.collision.slope) {
						break;
					}
				}
			}
			else {
				this._traceStep(res, x, y, vx, vy, objectWidth, objectHeight, vx, vy, 0);
			}
			return res;
		}, _traceStep: function (res, x, y, vx, vy, width, height, rvx, rvy, step) {
			res.pos.x += vx;
			res.pos.y += vy;
			var t = 0;
			if (vx) {
				var pxOffsetX = (vx > 0 ? width : 0);
				var tileOffsetX = (vx < 0 ? this.tilesize : 0);
				var firstTileY = Math.max(Math.floor(y / this.tilesize), 0);
				var lastTileY = Math.min(Math.ceil((y + height) / this.tilesize), this.height);
				var tileX = Math.floor((res.pos.x + pxOffsetX) / this.tilesize);
				var prevTileX = Math.floor((x + pxOffsetX) / this.tilesize);
				if (step > 0 || tileX == prevTileX || prevTileX < 0 || prevTileX >= this.width) {
					prevTileX = -1;
				}
				if (tileX >= 0 && tileX < this.width) {
					for (var tileY = firstTileY; tileY < lastTileY; tileY++) {
						if (prevTileX != -1) {
							t = this.data[tileY][prevTileX];
							if (t > 1 && t <= this.lastSlope && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, prevTileX, tileY)) {
								break;
							}
						}
						t = this.data[tileY][tileX];
						if (t == 1 || t > this.lastSlope || (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY))) {
							if (t > 1 && t <= this.lastSlope && res.collision.slope) {
								break;
							}
							res.collision.x = true;
							res.tile.x = t;
							x = res.pos.x = tileX * this.tilesize - pxOffsetX + tileOffsetX;
							rvx = 0;
							break;
						}
					}
				}
			}
			if (vy) {
				var pxOffsetY = (vy > 0 ? height : 0);
				var tileOffsetY = (vy < 0 ? this.tilesize : 0);
				var firstTileX = Math.max(Math.floor(res.pos.x / this.tilesize), 0);
				var lastTileX = Math.min(Math.ceil((res.pos.x + width) / this.tilesize), this.width);
				var tileY = Math.floor((res.pos.y + pxOffsetY) / this.tilesize);
				var prevTileY = Math.floor((y + pxOffsetY) / this.tilesize);
				if (step > 0 || tileY == prevTileY || prevTileY < 0 || prevTileY >= this.height) {
					prevTileY = -1;
				}
				if (tileY >= 0 && tileY < this.height) {
					for (var tileX = firstTileX; tileX < lastTileX; tileX++) {
						if (prevTileY != -1) {
							t = this.data[prevTileY][tileX];
							if (t > 1 && t <= this.lastSlope && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, prevTileY)) {
								break;
							}
						}
						t = this.data[tileY][tileX];
						if (t == 1 || t > this.lastSlope || (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY))) {
							if (t > 1 && t <= this.lastSlope && res.collision.slope) {
								break;
							}
							res.collision.y = true;
							res.tile.y = t;
							res.pos.y = tileY * this.tilesize - pxOffsetY + tileOffsetY;
							break;
						}
					}
				}
			}
		}, _checkTileDef: function (res, t, x, y, vx, vy, width, height, tileX, tileY) {
			var def = this.tiledef[t];
			if (!def) {
				return false;
			}
			var lx = (tileX + def[0]) * this.tilesize, ly = (tileY + def[1]) * this.tilesize,
				lvx = (def[2] - def[0]) * this.tilesize, lvy = (def[3] - def[1]) * this.tilesize, solid = def[4];
			var tx = x + vx + (lvy < 0 ? width : 0) - lx, ty = y + vy + (lvx > 0 ? height : 0) - ly;
			if (lvx * ty - lvy * tx > 0) {
				if (vx * -lvy + vy * lvx < 0) {
					return solid;
				}
				var length = Math.sqrt(lvx * lvx + lvy * lvy);
				var nx = lvy / length, ny = -lvx / length;
				var proj = tx * nx + ty * ny;
				var px = nx * proj, py = ny * proj;
				if (px * px + py * py >= vx * vx + vy * vy) {
					return solid || (lvx * (ty - vy) - lvy * (tx - vx) < 0.5);
				}
				res.pos.x = x + vx - px;
				res.pos.y = y + vy - py;
				res.collision.slope = {x: lvx, y: lvy, nx: nx, ny: ny};
				return true;
			}
			return false;
		}
	});
	var H = 1 / 2, N = 1 / 3, M = 2 / 3, SOLID = true, NON_SOLID = false;
	ig.CollisionMap.defaultTileDef = {
		5: [0, 1, 1, M, SOLID],
		6: [0, M, 1, N, SOLID],
		7: [0, N, 1, 0, SOLID],
		3: [0, 1, 1, H, SOLID],
		4: [0, H, 1, 0, SOLID],
		2: [0, 1, 1, 0, SOLID],
		10: [H, 1, 1, 0, SOLID],
		21: [0, 1, H, 0, SOLID],
		32: [M, 1, 1, 0, SOLID],
		43: [N, 1, M, 0, SOLID],
		54: [0, 1, N, 0, SOLID],
		27: [0, 0, 1, N, SOLID],
		28: [0, N, 1, M, SOLID],
		29: [0, M, 1, 1, SOLID],
		25: [0, 0, 1, H, SOLID],
		26: [0, H, 1, 1, SOLID],
		24: [0, 0, 1, 1, SOLID],
		11: [0, 0, H, 1, SOLID],
		22: [H, 0, 1, 1, SOLID],
		33: [0, 0, N, 1, SOLID],
		44: [N, 0, M, 1, SOLID],
		55: [M, 0, 1, 1, SOLID],
		16: [1, N, 0, 0, SOLID],
		17: [1, M, 0, N, SOLID],
		18: [1, 1, 0, M, SOLID],
		14: [1, H, 0, 0, SOLID],
		15: [1, 1, 0, H, SOLID],
		13: [1, 1, 0, 0, SOLID],
		8: [H, 1, 0, 0, SOLID],
		19: [1, 1, H, 0, SOLID],
		30: [N, 1, 0, 0, SOLID],
		41: [M, 1, N, 0, SOLID],
		52: [1, 1, M, 0, SOLID],
		38: [1, M, 0, 1, SOLID],
		39: [1, N, 0, M, SOLID],
		40: [1, 0, 0, N, SOLID],
		36: [1, H, 0, 1, SOLID],
		37: [1, 0, 0, H, SOLID],
		35: [1, 0, 0, 1, SOLID],
		9: [1, 0, H, 1, SOLID],
		20: [H, 0, 0, 1, SOLID],
		31: [1, 0, M, 1, SOLID],
		42: [M, 0, N, 1, SOLID],
		53: [N, 0, 0, 1, SOLID],
		12: [0, 0, 1, 0, NON_SOLID],
		23: [1, 1, 0, 1, NON_SOLID],
		34: [1, 0, 1, 1, NON_SOLID],
		45: [0, 1, 0, 0, NON_SOLID]
	};
	ig.CollisionMap.staticNoCollision = {
		trace: function (x, y, vx, vy) {
			return {collision: {x: false, y: false, slope: false}, pos: {x: x + vx, y: y + vy}, tile: {x: 0, y: 0}};
		}
	};
});

// impact/background-map.js
ig.baked = true;
ig.module('impact.background-map').requires('impact.map', 'impact.image').defines(function () {
	"use strict";
	ig.BackgroundMap = ig.Map.extend({
		tiles: null,
		scroll: {x: 0, y: 0},
		distance: 1,
		repeat: false,
		tilesetName: '',
		foreground: false,
		enabled: true,
		preRender: false,
		preRenderedChunks: null,
		chunkSize: 512,
		debugChunks: false,
		anims: {},
		init: function (tilesize, data, tileset) {
			this.parent(tilesize, data);
			this.setTileset(tileset);
		},
		setTileset: function (tileset) {
			this.tilesetName = tileset instanceof ig.Image ? tileset.path : tileset;
			this.tiles = new ig.Image(this.tilesetName);
			this.preRenderedChunks = null;
		},
		setScreenPos: function (x, y) {
			this.scroll.x = x / this.distance;
			this.scroll.y = y / this.distance;
		},
		preRenderMapToChunks: function () {
			var totalWidth = this.width * this.tilesize * ig.system.scale,
				totalHeight = this.height * this.tilesize * ig.system.scale;
			var chunkCols = Math.ceil(totalWidth / this.chunkSize), chunkRows = Math.ceil(totalHeight / this.chunkSize);
			this.preRenderedChunks = [];
			for (var y = 0; y < chunkRows; y++) {
				this.preRenderedChunks[y] = [];
				for (var x = 0; x < chunkCols; x++) {
					var chunkWidth = (x == chunkCols - 1) ? totalWidth - x * this.chunkSize : this.chunkSize;
					var chunkHeight = (y == chunkRows - 1) ? totalHeight - y * this.chunkSize : this.chunkSize;
					this.preRenderedChunks[y][x] = this.preRenderChunk(x, y, chunkWidth, chunkHeight);
				}
			}
		},
		preRenderChunk: function (cx, cy, w, h) {
			var tw = w / this.tilesize / ig.system.scale + 1, th = h / this.tilesize / ig.system.scale + 1;
			var nx = (cx * this.chunkSize / ig.system.scale) % this.tilesize,
				ny = (cy * this.chunkSize / ig.system.scale) % this.tilesize;
			var tx = Math.floor(cx * this.chunkSize / this.tilesize / ig.system.scale),
				ty = Math.floor(cy * this.chunkSize / this.tilesize / ig.system.scale);
			var chunk = ig.$new('canvas');
			chunk.width = w;
			chunk.height = h;
			var oldContext = ig.system.context;
			ig.system.context = chunk.getContext("2d");
			for (var x = 0; x < tw; x++) {
				for (var y = 0; y < th; y++) {
					if (x + tx < this.width && y + ty < this.height) {
						var tile = this.data[y + ty][x + tx];
						if (tile) {
							this.tiles.drawTile(x * this.tilesize - nx, y * this.tilesize - ny, tile - 1, this.tilesize);
						}
					}
				}
			}
			ig.system.context = oldContext;
			return chunk;
		},
		draw: function () {
			if (!this.tiles.loaded || !this.enabled) {
				return;
			}
			if (this.preRender) {
				this.drawPreRendered();
			}
			else {
				this.drawTiled();
			}
		},
		drawPreRendered: function () {
			if (!this.preRenderedChunks) {
				this.preRenderMapToChunks();
			}
			var dx = ig.system.getDrawPos(this.scroll.x), dy = ig.system.getDrawPos(this.scroll.y);
			if (this.repeat) {
				var w = this.width * this.tilesize * ig.system.scale;
				dx = (dx % w + w) % w;
				var h = this.height * this.tilesize * ig.system.scale;
				dy = (dy % h + h) % h;
			}
			var minChunkX = Math.max(Math.floor(dx / this.chunkSize), 0),
				minChunkY = Math.max(Math.floor(dy / this.chunkSize), 0),
				maxChunkX = Math.ceil((dx + ig.system.realWidth) / this.chunkSize),
				maxChunkY = Math.ceil((dy + ig.system.realHeight) / this.chunkSize),
				maxRealChunkX = this.preRenderedChunks[0].length, maxRealChunkY = this.preRenderedChunks.length;
			if (!this.repeat) {
				maxChunkX = Math.min(maxChunkX, maxRealChunkX);
				maxChunkY = Math.min(maxChunkY, maxRealChunkY);
			}
			var nudgeY = 0;
			for (var cy = minChunkY; cy < maxChunkY; cy++) {
				var nudgeX = 0;
				for (var cx = minChunkX; cx < maxChunkX; cx++) {
					var chunk = this.preRenderedChunks[cy % maxRealChunkY][cx % maxRealChunkX];
					var x = -dx + cx * this.chunkSize - nudgeX;
					var y = -dy + cy * this.chunkSize - nudgeY;
					ig.system.context.drawImage(chunk, x, y);
					ig.Image.drawCount++;
					if (this.debugChunks) {
						ig.system.context.strokeStyle = '#f0f';
						ig.system.context.strokeRect(x, y, this.chunkSize, this.chunkSize);
					}
					if (this.repeat && chunk.width < this.chunkSize && x + chunk.width < ig.system.realWidth) {
						nudgeX = this.chunkSize - chunk.width;
						maxChunkX++;
					}
				}
				if (this.repeat && chunk.height < this.chunkSize && y + chunk.height < ig.system.realHeight) {
					nudgeY = this.chunkSize - chunk.height;
					maxChunkY++;
				}
			}
		},
		drawTiled: function () {
			var tile = 0, anim = null, tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
				tileOffsetY = (this.scroll.y / this.tilesize).toInt(), pxOffsetX = this.scroll.x % this.tilesize,
				pxOffsetY = this.scroll.y % this.tilesize, pxMinX = -pxOffsetX - this.tilesize,
				pxMinY = -pxOffsetY - this.tilesize, pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
				pxMaxY = ig.system.height + this.tilesize - pxOffsetY;
			for (var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
				var tileY = mapY + tileOffsetY;
				if (tileY >= this.height || tileY < 0) {
					if (!this.repeat) {
						continue;
					}
					tileY = (tileY % this.height + this.height) % this.height;
				}
				for (var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize) {
					var tileX = mapX + tileOffsetX;
					if (tileX >= this.width || tileX < 0) {
						if (!this.repeat) {
							continue;
						}
						tileX = (tileX % this.width + this.width) % this.width;
					}
					if ((tile = this.data[tileY][tileX])) {
						if ((anim = this.anims[tile - 1])) {
							anim.draw(pxX, pxY);
						}
						else {
							this.tiles.drawTile(pxX, pxY, tile - 1, this.tilesize);
						}
					}
				}
			}
		}
	});
});

// impact/game.js
ig.baked = true;
ig.module('impact.game').requires('impact.impact', 'impact.entity', 'impact.collision-map', 'impact.background-map').defines(function () {
	"use strict";
	ig.Game = ig.Class.extend({
		clearColor: '#000000',
		gravity: 0,
		screen: {x: 0, y: 0},
		_rscreen: {x: 0, y: 0},
		entities: [],
		namedEntities: {},
		collisionMap: ig.CollisionMap.staticNoCollision,
		backgroundMaps: [],
		backgroundAnims: {},
		autoSort: false,
		sortBy: null,
		cellSize: 64,
		_deferredKill: [],
		_levelToLoad: null,
		_doSortEntities: false,
		staticInstantiate: function () {
			this.sortBy = this.sortBy || ig.Game.SORT.Z_INDEX;
			ig.game = this;
			return null;
		},
		loadLevel: function (data) {
			this.screen = {x: 0, y: 0};
			this.entities = [];
			this.namedEntities = {};
			for (var i = 0; i < data.entities.length; i++) {
				var ent = data.entities[i];
				this.spawnEntity(ent.type, ent.x, ent.y, ent.settings);
			}
			this.sortEntities();
			this.collisionMap = ig.CollisionMap.staticNoCollision;
			this.backgroundMaps = [];
			for (var i = 0; i < data.layer.length; i++) {
				var ld = data.layer[i];
				if (ld.name == 'collision') {
					this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data);
				}
				else {
					var newMap = new ig.BackgroundMap(ld.tilesize, ld.data, ld.tilesetName);
					newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
					newMap.repeat = ld.repeat;
					newMap.distance = ld.distance;
					newMap.foreground = !!ld.foreground;
					newMap.preRender = !!ld.preRender;
					newMap.name = ld.name;
					this.backgroundMaps.push(newMap);
				}
			}
			for (var i = 0; i < this.entities.length; i++) {
				this.entities[i].ready();
			}
		},
		loadLevelDeferred: function (data) {
			this._levelToLoad = data;
		},
		getMapByName: function (name) {
			if (name == 'collision') {
				return this.collisionMap;
			}
			for (var i = 0; i < this.backgroundMaps.length; i++) {
				if (this.backgroundMaps[i].name == name) {
					return this.backgroundMaps[i];
				}
			}
			return null;
		},
		getEntityByName: function (name) {
			return this.namedEntities[name];
		},
		getEntitiesByType: function (type) {
			var entityClass = typeof(type) === 'string' ? ig.global[type] : type;
			var a = [];
			for (var i = 0; i < this.entities.length; i++) {
				var ent = this.entities[i];
				if (ent instanceof entityClass && !ent._killed) {
					a.push(ent);
				}
			}
			return a;
		},
		spawnEntity: function (type, x, y, settings) {
			var entityClass = typeof(type) === 'string' ? ig.global[type] : type;
			if (!entityClass) {
				throw("Can't spawn entity of type " + type);
			}
			var ent = new (entityClass)(x, y, settings || {});
			this.entities.push(ent);
			if (ent.name) {
				this.namedEntities[ent.name] = ent;
			}
			return ent;
		},
		sortEntities: function () {
			this.entities.sort(this.sortBy);
		},
		sortEntitiesDeferred: function () {
			this._doSortEntities = true;
		},
		removeEntity: function (ent) {
			if (ent.name) {
				delete this.namedEntities[ent.name];
			}
			ent._killed = true;
			ent.type = ig.Entity.TYPE.NONE;
			ent.checkAgainst = ig.Entity.TYPE.NONE;
			ent.collides = ig.Entity.COLLIDES.NEVER;
			this._deferredKill.push(ent);
		},
		run: function () {
			this.update();
			this.draw();
		},
		update: function () {
			if (this._levelToLoad) {
				this.loadLevel(this._levelToLoad);
				this._levelToLoad = null;
			}
			if (this._doSortEntities || this.autoSort) {
				this.sortEntities();
				this._doSortEntities = false;
			}
			this.updateEntities();
			this.checkEntities();
			for (var i = 0; i < this._deferredKill.length; i++) {
				this.entities.erase(this._deferredKill[i]);
			}
			this._deferredKill = [];
			for (var tileset in this.backgroundAnims) {
				var anims = this.backgroundAnims[tileset];
				for (var a in anims) {
					anims[a].update();
				}
			}
		},
		updateEntities: function () {
			for (var i = 0; i < this.entities.length; i++) {
				var ent = this.entities[i];
				if (!ent._killed) {
					ent.update();
				}
			}
		},
		draw: function () {
			if (this.clearColor) {
				ig.system.clear(this.clearColor);
			}
			this._rscreen.x = ig.system.getDrawPos(this.screen.x) / ig.system.scale;
			this._rscreen.y = ig.system.getDrawPos(this.screen.y) / ig.system.scale;
			var mapIndex;
			for (mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++) {
				var map = this.backgroundMaps[mapIndex];
				if (map.foreground) {
					break;
				}
				map.setScreenPos(this.screen.x, this.screen.y);
				map.draw();
			}
			this.drawEntities();
			for (mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++) {
				var map = this.backgroundMaps[mapIndex];
				map.setScreenPos(this.screen.x, this.screen.y);
				map.draw();
			}
		},
		drawEntities: function () {
			for (var i = 0; i < this.entities.length; i++) {
				this.entities[i].draw();
			}
		},
		checkEntities: function () {
			var hash = {};
			for (var e = 0; e < this.entities.length; e++) {
				var entity = this.entities[e];
				if (entity.type == ig.Entity.TYPE.NONE && entity.checkAgainst == ig.Entity.TYPE.NONE && entity.collides == ig.Entity.COLLIDES.NEVER) {
					continue;
				}
				var checked = {}, xmin = Math.floor(entity.pos.x / this.cellSize),
					ymin = Math.floor(entity.pos.y / this.cellSize),
					xmax = Math.floor((entity.pos.x + entity.size.x) / this.cellSize) + 1,
					ymax = Math.floor((entity.pos.y + entity.size.y) / this.cellSize) + 1;
				for (var x = xmin; x < xmax; x++) {
					for (var y = ymin; y < ymax; y++) {
						if (!hash[x]) {
							hash[x] = {};
							hash[x][y] = [entity];
						}
						else if (!hash[x][y]) {
							hash[x][y] = [entity];
						}
						else {
							var cell = hash[x][y];
							for (var c = 0; c < cell.length; c++) {
								if (entity.touches(cell[c]) && !checked[cell[c].id]) {
									checked[cell[c].id] = true;
									ig.Entity.checkPair(entity, cell[c]);
								}
							}
							cell.push(entity);
						}
					}
				}
			}
		}
	});
	ig.Game.SORT = {
		Z_INDEX: function (a, b) {
			return a.zIndex - b.zIndex;
		}, POS_X: function (a, b) {
			return (a.pos.x + a.size.x) - (b.pos.x + b.size.x);
		}, POS_Y: function (a, b) {
			return (a.pos.y + a.size.y) - (b.pos.y + b.size.y);
		}
	};
});

// biolab/camera.js
ig.baked = true;
ig.module('biolab.camera').defines(function () {
	Camera = ig.Class.extend({
		trap: {pos: {x: 0, y: 0}, size: {x: 16, y: 16}},
		max: {x: 0, y: 0},
		offset: {x: 0, y: 0},
		pos: {x: 0, y: 0},
		damping: 5,
		lookAhead: {x: 0, y: 0},
		currentLookAhead: {x: 0, y: 0},
		debug: false,
		init: function (offsetX, offsetY, damping) {
			this.offset.x = offsetX;
			this.offset.y = offsetY;
			this.damping = damping;
		},
		set: function (entity) {
			this.pos.x = entity.pos.x - this.offset.x;
			this.pos.y = entity.pos.y - this.offset.y;
			this.trap.pos.x = entity.pos.x - this.trap.size.x / 2;
			this.trap.pos.y = entity.pos.y - this.trap.size.y;
		},
		follow: function (entity) {
			this.pos.x = this.move('x', entity.pos.x, entity.size.x);
			this.pos.y = this.move('y', entity.pos.y, entity.size.y);
			ig.game.screen.x = this.pos.x;
			ig.game.screen.y = this.pos.y;
		},
		move: function (axis, pos, size) {
			var lookAhead = 0;
			if (pos < this.trap.pos[axis]) {
				this.trap.pos[axis] = pos;
				this.currentLookAhead[axis] = this.lookAhead[axis];
			}
			else if (pos + size > this.trap.pos[axis] + this.trap.size[axis]) {
				this.trap.pos[axis] = pos + size - this.trap.size[axis];
				this.currentLookAhead[axis] = -this.lookAhead[axis];
			}
			return (this.pos[axis] - (this.pos[axis] - this.trap.pos[axis] + this.offset[axis]
				+ this.currentLookAhead[axis]) * ig.system.tick * this.damping).limit(0, this.max[axis]);
		},
		draw: function () {
			if (this.debug) {
				ig.system.context.fillStyle = 'rgba(255,0,255,0.3)';
				ig.system.context.fillRect((this.trap.pos.x - this.pos.x) * ig.system.scale, (this.trap.pos.y - this.pos.y) * ig.system.scale, this.trap.size.x * ig.system.scale, this.trap.size.y * ig.system.scale);
			}
		}
	});
});

// biolab/entities/particle.js
ig.baked = true;
ig.module('biolab.entities.particle').requires('impact.entity').defines(function () {
	EntityParticle = ig.Entity.extend({
		size: {x: 4, y: 4},
		offset: {x: 0, y: 0},
		maxVel: {x: 160, y: 160},
		minBounceVelocity: 0,
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.LITE,
		lifetime: 5,
		fadetime: 1,
		bounciness: 0.6,
		friction: {x: 20, y: 0},
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			var vx = this.vel.x;
			this.vel.x = (Math.random() * 2 - 1) * vx;
			this.vel.y = Math.random() * -(this.vel.y - 20) * Math.cos(Math.abs(this.vel.x) / vx) - 20;
			this.currentAnim.flip.x = (Math.random() > 0.5);
			this.currentAnim.flip.y = (Math.random() > 0.5);
			this.currentAnim.gotoRandomFrame();
			this.idleTimer = new ig.Timer();
		},
		update: function () {
			if (this.idleTimer.delta() > this.lifetime) {
				this.kill();
				return;
			}
			this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
			this.parent();
		}
	});
});

// biolab/entities/player.js
ig.baked = true;
ig.module('biolab.entities.player').requires('impact.entity', 'biolab.entities.particle').defines(function () {
	EntityPlayer = ig.Entity.extend({
		size: {x: 8, y: 14},
		offset: {x: 4, y: 2},
		maxVel: {x: 60, y: 240},
		accelDef: {ground: 400, air: 200},
		frictionDef: {ground: 400, air: 100},
		jump: 120,
		bounciness: 0,
		health: 10,
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		flip: false,
		flippedAnimOffset: 24,
		idle: false,
		moved: false,
		wasStanding: false,
		canHighJump: false,
		highJumpTimer: null,
		idleTimer: null,
		sfxPlasma: new ig.Sound('media/sounds/plasma.ogg'),
		sfxDie: new ig.Sound('media/sounds/die-respawn.ogg', false),
		animSheet: new ig.AnimationSheet('media/sprites/player.png', 16, 16),
		init: function (x, y, settings) {
			this.friction.y = 0;
			this.parent(x, y, settings);
			this.idleTimer = new ig.Timer();
			this.highJumpTimer = new ig.Timer();
			this.addAnim('idle', 1, [0]);
			this.addAnim('scratch', 0.3, [2, 1, 2, 1, 2], true);
			this.addAnim('shrug', 0.3, [3, 3, 3, 3, 3, 3, 4, 3, 3], true);
			this.addAnim('run', 0.07, [6, 7, 8, 9, 10, 11]);
			this.addAnim('jump', 1, [15]);
			this.addAnim('fall', 0.4, [12, 13]);
			this.addAnim('land', 0.15, [14]);
			this.addAnim('die', 0.07, [18, 19, 20, 21, 22, 23, 16, 16, 16]);
			this.addAnim('spawn', 0.07, [16, 16, 16, 23, 22, 21, 20, 19, 18]);
		},
		update: function () {
			if (this.currentAnim == this.anims.spawn) {
				this.currentAnim.update();
				if (this.currentAnim.loopCount) {
					this.currentAnim = this.anims.idle.rewind();
				}
				else {
					return;
				}
			}
			if (this.currentAnim == this.anims.die) {
				this.currentAnim.update();
				if (this.currentAnim.loopCount) {
					this.kill();
				}
				return;
			}
			this.moved = false;
			this.friction.x = this.standing ? this.frictionDef.ground : this.frictionDef.air;
			if (ig.input.state('left')) {
				this.accel.x = -(this.standing ? this.accelDef.ground : this.accelDef.air);
				this.flip = true;
				this.moved = true;
			}
			else if (ig.input.state('right')) {
				this.accel.x = (this.standing ? this.accelDef.ground : this.accelDef.air);
				this.flip = false;
				this.moved = true;
			}
			else {
				this.accel.x = 0;
			}
			if (ig.input.pressed('shoot')) {
				var x = this.pos.x + (this.flip ? -3 : 5);
				var y = this.pos.y + 6;
				ig.game.spawnEntity(EntityProjectile, x, y, {flip: this.flip});
				this.sfxPlasma.play();
			}
			this.wantsJump = this.wantsJump || ig.input.pressed('jump');
			if (this.standing && (ig.input.pressed('jump') || (!this.wasStanding && this.wantsJump && ig.input.state('jump')))) {
				ig.mark('jump');
				this.wantsJump = false;
				this.canHighJump = true;
				this.highJumpTimer.set(0.14);
				this.vel.y = -this.jump / 4;
			}
			else if (this.canHighJump) {
				var d = this.highJumpTimer.delta();
				if (ig.input.state('jump')) {
					var f = Math.max(0, d > 0 ? ig.system.tick - d : ig.system.tick);
					this.vel.y -= this.jump * f * 6.5;
				}
				else {
					this.canHighJump = false;
				}
				if (d > 0) {
					this.canHighJump = false;
				}
			}
			this.wasStanding = this.standing;
			this.parent();
			this.setAnimation();
		},
		setAnimation: function () {
			if ((!this.wasStanding && this.standing)) {
				this.currentAnim = this.anims.land.rewind();
			}
			else if (this.standing && (this.currentAnim != this.anims.land || this.currentAnim.loopCount > 0)) {
				if (this.moved) {
					if (this.standing) {
						this.currentAnim = this.anims.run;
					}
					this.idle = false;
				}
				else {
					if (!this.idle || this.currentAnim.stop && this.currentAnim.loopCount > 0) {
						this.idle = true;
						this.idleTimer.set(Math.random() * 4 + 3);
						this.currentAnim = this.anims.idle;
					}
					if (this.idleTimer.delta() > 0) {
						this.idleTimer.reset();
						this.currentAnim = [this.anims.scratch, this.anims.shrug].random().rewind();
					}
				}
			}
			else if (!this.standing) {
				if (this.vel.y < 0) {
					this.currentAnim = this.anims.jump;
				} else {
					if (this.currentAnim != this.anims.fall) {
						this.anims.fall.rewind();
					}
					this.currentAnim = this.anims.fall;
				}
				this.idle = false;
			}
			this.currentAnim.flip.x = this.flip;
			if (this.flip) {
				this.currentAnim.tile += this.flippedAnimOffset;
			}
		},
		collideWith: function (other, axis) {
			if (axis == 'y' && this.standing && this.currentAnim != this.anims.die) {
				this.currentAnim.update();
				this.setAnimation();
			}
		},
		receiveDamage: function (amount, from) {
			if (this.currentAnim != this.anims.die) {
				this.currentAnim = this.anims.die.rewind();
				for (var i = 0; i < 3; i++) {
					ig.game.spawnEntity(EntityPlayerGib, this.pos.x, this.pos.y);
				}
				ig.game.spawnEntity(EntityPlayerGibGun, this.pos.x, this.pos.y);
				this.sfxDie.play();
			}
		},
		kill: function () {
			this.parent();
			ig.game.respawnPlayerAtLastCheckpoint(this.pos.x, this.pos.y);
		}
	});
	EntityPlayerGib = EntityParticle.extend({
		lifetime: 0.8,
		fadetime: 0.4,
		friction: {x: 0, y: 0},
		vel: {x: 30, y: 80},
		gravityFactor: 0,
		animSheet: new ig.AnimationSheet('media/sprites/player.png', 8, 8),
		init: function (x, y, settings) {
			this.addAnim('idle', 7, [82, 94]);
			this.parent(x, y, settings);
		}
	});
	EntityPlayerGibGun = EntityParticle.extend({
		lifetime: 2,
		fadetime: 0.4,
		size: {x: 8, y: 8},
		friction: {x: 30, y: 0},
		vel: {x: 60, y: 50},
		animSheet: new ig.AnimationSheet('media/sprites/player.png', 8, 8),
		init: function (x, y, settings) {
			this.addAnim('idle', 0.5, [11]);
			this.parent(x, y, settings);
			this.currentAnim.flip.y = false;
		}
	});
	EntityProjectile = ig.Entity.extend({
		size: {x: 6, y: 3},
		offset: {x: 1, y: 2},
		maxVel: {x: 200, y: 0},
		gravityFactor: 0,
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.NEVER,
		flip: false,
		hasHit: false,
		animSheet: new ig.AnimationSheet('media/sprites/projectile.png', 8, 8),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
			this.addAnim('idle', 1, [0]);
			this.addAnim('hit', 0.1, [0, 1, 2, 3, 4, 5], true);
		},
		update: function () {
			if (this.hasHit && this.currentAnim.loopCount > 0) {
				this.kill();
			}
			this.parent();
			this.currentAnim.flip.x = this.flip;
		},
		handleMovementTrace: function (res) {
			this.parent(res);
			if (res.collision.x || res.collision.y) {
				this.currentAnim = this.anims.hit;
				this.hasHit = true;
			}
		},
		check: function (other) {
			if (!this.hasHit) {
				other.receiveDamage(10, this);
				this.hasHit = true;
				this.currentAnim = this.anims.hit;
				this.vel.x = 0;
			}
		}
	});
});

// biolab/entities/blob.js
ig.baked = true;
ig.module('biolab.entities.blob').requires('impact.entity', 'biolab.entities.particle').defines(function () {
	EntityBlob = ig.Entity.extend({
		size: {x: 10, y: 13},
		offset: {x: 3, y: 3},
		maxVel: {x: 100, y: 100},
		seenPlayer: false,
		inJump: false,
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,
		jumpTimer: null,
		health: 20,
		sfxGib: new ig.Sound('media/sounds/wetgib.ogg'),
		animSheet: new ig.AnimationSheet('media/sprites/blob.png', 16, 16),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.jumpTimer = new ig.Timer();
			this.addAnim('idle', 0.5, [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
			this.addAnim('crawl', 0.1, [0, 1]);
			this.addAnim('jump', 0.2, [2, 3, 4]);
			this.addAnim('hit', 0.1, [5]);
			this.currentAnim.gotoRandomFrame();
			this.currentAnim.flip.x = (Math.random() > 0.5);
		},
		update: function () {
			var ydist = Math.abs(ig.game.player.pos.y - this.pos.y);
			var xdist = Math.abs(ig.game.player.pos.x - this.pos.x);
			var xdir = ig.game.player.pos.x - this.pos.x < 0 ? -1 : 1;
			var wasStanding = this.standing;
			if (!this.seenPlayer) {
				if (xdist < 64 && ydist < 20) {
					this.seenPlayer = true;
				}
			}
			else if (this.standing && this.currentAnim != this.anims.hit) {
				if (this.currentAnim != this.anims.jump && this.jumpTimer.delta() > 0.5 && ((xdist < 40 && xdist > 20) || ig.game.collisionMap.getTile(this.pos.x + this.size.x * xdir, this.pos.y + this.size.y) == 1)) {
					this.currentAnim = this.anims.jump.rewind();
					this.currentAnim.flip.x = (xdir < 0);
					this.vel.x = 0;
				}
				else if (this.currentAnim == this.anims.jump && this.currentAnim.loopCount) {
					this.vel.y = -70;
					this.vel.x = 60 * (this.currentAnim.flip.x ? -1 : 1);
					this.inJump = true;
				}
				else if (this.currentAnim != this.anims.jump && this.jumpTimer.delta() > 0.2) {
					this.currentAnim = this.anims.crawl;
					this.currentAnim.flip.x = (xdir < 0);
					this.vel.x = 20 * xdir;
				}
			}
			if (this.currentAnim == this.anims.hit && this.currentAnim.loopCount) {
				this.currentAnim = this.anims.idle;
			}
			if (this.inJump && this.vel.x == 0 && this.currentAnim != this.anims.hit) {
				this.vel.x = 30 * (this.currentAnim.flip.x ? -1 : 1);
			}
			this.parent();
			if (this.standing && !wasStanding && this.currentAnim != this.anims.hit) {
				this.inJump = false;
				this.jumpTimer.reset();
				this.anims.idle.flip.x = this.currentAnim.flip.x;
				this.currentAnim = this.anims.idle;
				this.vel.x = 0;
			}
		},
		kill: function () {
			var gibs = ig.ua.mobile ? 5 : 30;
			for (var i = 0; i < gibs; i++) {
				ig.game.spawnEntity(EntityBlobGib, this.pos.x, this.pos.y);
			}
			this.parent();
		},
		receiveDamage: function (amount, from) {
			this.anims.hit.flip.x = this.currentAnim.flip.x;
			this.currentAnim = this.anims.hit.rewind();
			this.seenPlayer = true;
			this.inJump = false;
			this.vel.x = from.vel.x > 0 ? 50 : -50;
			var gibs = ig.ua.mobile ? 2 : 5;
			for (var i = 0; i < gibs; i++) {
				ig.game.spawnEntity(EntityBlobGib, this.pos.x, this.pos.y);
			}
			this.sfxGib.play();
			this.parent(amount);
		},
		check: function (other) {
			other.receiveDamage(10, this);
		}
	});
	EntityBlobGib = EntityParticle.extend({
		lifetime: 3,
		fadetime: 6,
		friction: {x: 0, y: 0},
		vel: {x: 60, y: 150},
		animSheet: new ig.AnimationSheet('media/sprites/blob-gibs.png', 4, 4),
		init: function (x, y, settings) {
			this.addAnim('idle', 0.1, [0, 1, 2]);
			this.parent(x, y, settings);
		}
	});
});

// biolab/entities/grunt.js
ig.baked = true;
ig.module('biolab.entities.grunt').requires('impact.entity', 'biolab.entities.player', 'biolab.entities.particle').defines(function () {
	EntityGrunt = ig.Entity.extend({
		size: {x: 10, y: 13},
		offset: {x: 3, y: 3},
		maxVel: {x: 100, y: 100},
		friction: {x: 400, y: 0},
		seenPlayer: false,
		inJump: false,
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,
		jumpTimer: null,
		health: 20,
		flippedAnimOffset: 12,
		flip: false,
		shootTimer: null,
		sfxHit: new ig.Sound('media/sounds/drygib.ogg'),
		sfxPlasma: new ig.Sound('media/sounds/grunt-plasma.ogg'),
		animSheet: new ig.AnimationSheet('media/sprites/grunt.png', 16, 16),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.jumpTimer = new ig.Timer();
			this.addAnim('idle', 0.5, [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1]);
			this.addAnim('walk', 0.1, [6, 7, 8, 9, 10, 11]);
			this.addAnim('shoot', 1, [2]);
			this.addAnim('hit', 0.1, [3]);
			this.currentAnim.gotoRandomFrame();
			this.flip = (Math.random() > 0.5);
			this.shootTimer = new ig.Timer();
		},
		update: function () {
			var ydist = Math.abs(ig.game.player.pos.y - this.pos.y);
			var xdist = Math.abs(ig.game.player.pos.x - this.pos.x);
			var xdir = ig.game.player.pos.x - this.pos.x < 0 ? -1 : 1;
			if (!this.seenPlayer) {
				if (xdist < 160 && ydist < 32) {
					this.seenPlayer = true;
					this.shootTimer.set(1.5);
				}
			}
			else if (this.standing && this.currentAnim != this.anims.hit) {
				if ((xdist > 160 || (xdist > 96 && this.currentAnim == this.anims.walk)) && this.shootTimer.delta() > 0) {
					this.currentAnim = this.anims.walk;
					this.vel.x = 30 * xdir;
				}
				else if (this.currentAnim == this.anims.walk) {
					this.currentAnim = this.anims.idle;
					this.vel.x = 0;
					this.shootTimer.set(1);
				}
				else if (ydist < 64 && this.shootTimer.delta() > 0) {
					var x = this.pos.x + (this.flip ? -3 : 5);
					var y = this.pos.y + 6;
					ig.game.spawnEntity(EntityGruntProjectile, x, y, {flip: this.flip});
					this.sfxPlasma.play();
					this.shootTimer.set(2);
					this.currentAnim = this.anims.idle;
				}
				if (this.currentAnim == this.anims.idle && this.shootTimer.delta() > -0.5) {
					this.currentAnim = this.anims.shoot;
				}
				this.flip = (xdir < 0);
			}
			if (this.currentAnim == this.anims.hit && this.currentAnim.loopCount) {
				this.currentAnim = this.anims.idle.rewind();
			}
			this.parent();
			this.currentAnim.flip.x = this.flip;
			if (this.flip) {
				this.currentAnim.tile += this.flippedAnimOffset;
			}
		},
		kill: function () {
			this.parent();
			this.spawnGibs(10);
		},
		receiveDamage: function (amount, from) {
			this.currentAnim = this.anims.hit.rewind();
			this.vel.x = from.vel.x > 0 ? 60 : -60;
			this.parent(amount);
			this.spawnGibs(3);
			this.sfxHit.play();
			this.seenPlayer = true;
			if (this.shootTimer.delta() > -0.3) {
				this.shootTimer.set(0.7);
			}
		},
		spawnGibs: function (amount) {
			var cx = this.pos.x + this.size.x / 2;
			var cy = this.pos.y + this.size.y / 2;
			for (var i = 0; i < amount; i++) {
				ig.game.spawnEntity(EntityGruntGib, cx, cy);
			}
		},
		check: function (other) {
			other.receiveDamage(10, this);
		}
	});
	EntityGruntGibGun = EntityParticle.extend({
		lifetime: 2,
		fadetime: 0.4,
		size: {x: 8, y: 8},
		friction: {x: 30, y: 0},
		vel: {x: 60, y: 50},
		animSheet: new ig.AnimationSheet('media/sprites/grunt.png', 8, 8),
		init: function (x, y, settings) {
			this.addAnim('idle', 0.5, [11]);
			this.parent(x, y, settings);
			this.currentAnim.flip.y = false;
		}
	});
	EntityGruntGib = EntityParticle.extend({
		lifetime: 1,
		fadetime: 0.5,
		bounciness: 0.6,
		vel: {x: 50, y: 150},
		size: {x: 4, y: 4},
		animSheet: new ig.AnimationSheet('media/sprites/grunt.png', 4, 4),
		init: function (x, y, settings) {
			this.addAnim('idle', 5, [16, 17, 40, 41]);
			this.parent(x, y, settings);
		}
	});
	EntityGruntProjectile = EntityProjectile.extend({
		maxVel: {x: 120, y: 0},
		checkAgainst: ig.Entity.TYPE.A,
		animSheet: new ig.AnimationSheet('media/sprites/grunt-projectile.png', 8, 8)
	});
});

// biolab/entities/dropper.js
ig.baked = true;
ig.module('biolab.entities.dropper').requires('impact.entity', 'biolab.entities.particle', 'biolab.entities.blob').defines(function () {
	EntityDropper = ig.Entity.extend({
		size: {x: 14, y: 8},
		offset: {x: 1, y: 0},
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NEVER,
		health: 80,
		shootTimer: null,
		shootWaitTimer: null,
		canShoot: false,
		animSheet: new ig.AnimationSheet('media/sprites/dropper.png', 16, 8),
		sfxHit: new ig.Sound('media/sounds/wetgib.ogg'),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.shootWaitTimer = new ig.Timer(1);
			this.shootTimer = new ig.Timer(10);
			this.addAnim('idle', 1, [0]);
			this.addAnim('shoot', 0.2, [1, 2, 2, 1]);
			this.addAnim('hit', 0.2, [3]);
		},
		update: function () {
			if (this.currentAnim == this.anims.hit && this.currentAnim.loopCount) {
				this.currentAnim = this.anims.idle;
				this.shootWaitTimer.set(0.5);
			}
			else if (this.currentAnim == this.anims.idle && this.shootWaitTimer.delta() > 0 && this.distanceTo(ig.game.player) < 128) {
				this.currentAnim = this.anims.shoot.rewind();
				this.shootTimer.set(0.8);
				this.canShoot = true;
			}
			else if (this.currentAnim == this.anims.shoot && this.canShoot && this.shootTimer.delta() > 0) {
				this.canShoot = false;
				ig.game.spawnEntity(EntityDropperShot, this.pos.x + 5, this.pos.y + 6);
			}
			if (this.currentAnim == this.anims.shoot && this.currentAnim.loopCount) {
				this.currentAnim = this.anims.idle.rewind();
				this.shootWaitTimer.set(0.5);
			}
			this.currentAnim.update();
		},
		kill: function () {
			this.spawnGibs(20);
			this.parent();
		},
		check: function (other) {
			other.receiveDamage(10, this);
		},
		receiveDamage: function (amount, from) {
			this.currentAnim = this.anims.hit.rewind();
			this.parent(amount);
			this.spawnGibs(3);
			this.sfxHit.play();
		},
		spawnGibs: function (amount) {
			var cx = this.pos.x + this.size.x / 2;
			var cy = this.pos.y + this.size.y / 2;
			for (var i = 0; i < amount; i++) {
				ig.game.spawnEntity(EntityDropperGib, cx, cy);
			}
		}
	});
	EntityDropperShot = ig.Entity.extend({
		size: {x: 4, y: 4},
		offset: {x: 2, y: 4},
		vel: {x: 0, y: 0},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.LITE,
		animSheet: new ig.AnimationSheet('media/sprites/dropper.png', 8, 8),
		init: function (x, y, settings) {
			this.addAnim('idle', 0.1, [8]);
			this.addAnim('drop', 0.1, [9, 10, 11], true);
			this.parent(x, y, settings);
		},
		update: function () {
			if (this.currentAnim == this.anims.drop && this.currentAnim.loopCount) {
				this.kill();
			}
			this.parent();
		},
		handleMovementTrace: function (res) {
			this.parent(res);
			if ((res.collision.x || res.collision.y) && this.currentAnim != this.anims.drop) {
				this.currentAnim = this.anims.drop.rewind();
			}
		},
		check: function (other) {
			if (this.currentAnim != this.anims.drop) {
				other.receiveDamage(10, this);
				this.kill();
			}
		}
	});
	EntityDropperGib = EntityParticle.extend({
		lifetime: 3,
		fadetime: 6,
		friction: {x: 0, y: 0},
		vel: {x: 60, y: 150},
		animSheet: new ig.AnimationSheet('media/sprites/blob-gibs.png', 4, 4),
		init: function (x, y, settings) {
			this.addAnim('idle', 0.1, [0, 1, 2]);
			this.parent(x, y, settings);
		}
	});
});

// biolab/entities/spike.js
ig.baked = true;
ig.module('biolab.entities.spike').requires('impact.entity', 'biolab.entities.particle').defines(function () {
	EntitySpike = ig.Entity.extend({
		size: {x: 16, y: 9},
		offset: {x: 0, y: 7},
		maxVel: {x: 100, y: 100},
		friction: {x: 150, y: 0},
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,
		health: 30,
		flip: false,
		shootTimer: null,
		shootWaitTimer: null,
		canShoot: false,
		animSheet: new ig.AnimationSheet('media/sprites/spike.png', 16, 16),
		sfxHit: new ig.Sound('media/sounds/drygib.ogg'),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.shootTimer = new ig.Timer(10);
			this.shootWaitTimer = new ig.Timer(10);
			this.addAnim('crawl', 0.08, [5, 6, 7]);
			this.addAnim('shoot', 0.15, [3, 3, 0, 1, 2, 2, 2, 1, 3, 3, 3]);
			this.addAnim('hit', 0.1, [8]);
		},
		update: function () {
			if (this.currentAnim == this.anims.shoot) {
				if (this.currentAnim.loopCount) {
					this.currentAnim = this.anims.crawl.rewind();
				}
				if (this.canShoot && this.shootTimer.delta() > 0) {
					this.canShoot = false;
					ig.game.spawnEntity(EntitySpikeShot, this.pos.x + 6, this.pos.y - 4, {dir: 'up'});
					ig.game.spawnEntity(EntitySpikeShot, this.pos.x + 1, this.pos.y - 2, {dir: 'left'});
					ig.game.spawnEntity(EntitySpikeShot, this.pos.x + 10, this.pos.y - 2, {dir: 'right'});
				}
			}
			else if (this.currentAnim == this.anims.crawl) {
				if (this.shootWaitTimer.delta() > 0 && this.distanceTo(ig.game.player) < 160) {
					this.currentAnim = this.anims.shoot.rewind();
					this.shootWaitTimer.set(5);
					this.shootTimer.set(1.2);
					this.canShoot = true;
					this.vel.x = 0;
				}
				else {
					if (!ig.game.collisionMap.getTile(this.pos.x + (this.flip ? +4 : this.size.x - 4), this.pos.y + this.size.y + 1)) {
						this.flip = !this.flip;
					}
					var xdir = this.flip ? -1 : 1;
					this.vel.x = 14 * xdir;
				}
			}
			else if (this.currentAnim == this.anims.hit && this.currentAnim.loopCount) {
				this.currentAnim = this.anims.crawl.rewind();
			}
			this.parent();
		},
		handleMovementTrace: function (res) {
			this.parent(res);
			if (res.collision.x) {
				this.flip = !this.flip;
			}
		},
		kill: function () {
			this.parent();
			this.spawnGibs(10);
		},
		receiveDamage: function (amount, from) {
			this.currentAnim = this.anims.hit.rewind();
			this.vel.x = from.vel.x > 0 ? 50 : -50;
			this.parent(amount);
			this.spawnGibs(3);
			this.sfxHit.play();
		},
		spawnGibs: function (amount) {
			var cx = this.pos.x + this.size.x / 2;
			var cy = this.pos.y + this.size.y / 2;
			for (var i = 0; i < amount; i++) {
				ig.game.spawnEntity(EntitySpikeGib, cx, cy);
			}
		},
		check: function (other) {
			other.receiveDamage(10, this);
		}
	});
	EntitySpikeShot = ig.Entity.extend({
		size: {x: 4, y: 4},
		offset: {x: 2, y: 0},
		maxVel: {x: 60, y: 60},
		lastPos: {x: 0, y: 0},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.LITE,
		gravityFactor: 0,
		animSheet: new ig.AnimationSheet('media/sprites/spike.png', 8, 8),
		init: function (x, y, settings) {
			if (settings.dir == 'up') {
				this.vel.y = -this.maxVel.y;
			}
			else if (settings.dir == 'left') {
				this.vel.x = -this.maxVel.x;
			}
			else if (settings.dir == 'right') {
				this.vel.x = this.maxVel.x;
			}
			this.addAnim('idle', 0.1, [8, 9]);
			this.addAnim('hit', 0.1, [18, 19]);
			this.parent(x, y, settings);
		},
		handleMovementTrace: function (res) {
			this.parent(res);
			if (res.collision.x || res.collision.y) {
				this.currentAnim = this.anims.hit.rewind();
			}
		},
		collideWith: function (other, axis) {
			this.currentAnim = this.anims.hit;
			this.hasHit = true;
		},
		update: function () {
			this.parent();
			if (this.currentAnim == this.anims.hit && this.currentAnim.loopCount > 0) {
				this.kill();
			}
		},
		check: function (other) {
			other.receiveDamage(10, this);
			this.currentAnim = this.anims.hit;
		}
	});
	EntitySpikeGib = EntityParticle.extend({
		lifetime: 4,
		fadetime: 1,
		bounciness: 0.6,
		vel: {x: 30, y: 80},
		size: {x: 4, y: 4},
		offset: {x: 2, y: 2},
		animSheet: new ig.AnimationSheet('media/sprites/spike.png', 8, 8),
		init: function (x, y, settings) {
			this.addAnim('idle', 5, [28, 29, 38, 39]);
			this.parent(x, y, settings);
		}
	});
});

// biolab/entities/crate.js
ig.baked = true;
ig.module('biolab.entities.crate').requires('impact.entity', 'biolab.entities.particle').defines(function () {
	EntityCrate = ig.Entity.extend({
		size: {x: 8, y: 8},
		offset: {x: 0, y: 0},
		maxVel: {x: 60, y: 150},
		friction: {x: 100, y: 0},
		health: 5,
		bounciness: 0.4,
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.ACTIVE,
		sfxCrack: new ig.Sound('media/sounds/crack.ogg'),
		animSheet: new ig.AnimationSheet('media/sprites/crate.png', 8, 8),
		init: function (x, y, settings) {
			this.addAnim('idle', 1, [0]);
			this.parent(x, y, settings);
		},
		kill: function () {
			this.sfxCrack.play();
			var gibs = ig.ua.mobile ? 3 : 10;
			for (var i = 0; i < gibs; i++) {
				ig.game.spawnEntity(EntityCrateDebris, this.pos.x, this.pos.y);
			}
			this.parent();
		}
	});
	EntityCrateDebris = EntityParticle.extend({
		lifetime: 2,
		fadetime: 1,
		bounciness: 0.6,
		vel: {x: 60, y: 120},
		animSheet: new ig.AnimationSheet('media/sprites/crate.png', 4, 4),
		init: function (x, y, settings) {
			this.addAnim('idle', 5, [2, 3, 6, 7]);
			this.parent(x, y, settings);
		}
	});
});

// biolab/entities/mine.js
ig.baked = true;
ig.module('biolab.entities.mine').requires('impact.entity', 'biolab.entities.particle').defines(function () {
	EntityMine = ig.Entity.extend({
		size: {x: 8, y: 5},
		offset: {x: 4, y: 3},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NEVER,
		health: 10,
		animSheet: new ig.AnimationSheet('media/sprites/mine.png', 16, 8),
		sfxExplode: new ig.Sound('media/sounds/mine.ogg', false),
		init: function (x, y, settings) {
			this.addAnim('idle', 0.17, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3]);
			this.currentAnim.gotoRandomFrame();
			this.parent(x, y, settings);
		},
		kill: function () {
			for (var i = 0; i < 10; i++) {
				ig.game.spawnEntity(EntityMineGib, this.pos.x, this.pos.y);
			}
			this.sfxExplode.play();
			this.parent();
		},
		check: function (other) {
			this.kill();
			other.receiveDamage(10, this);
		}
	});
	EntityMineGib = EntityParticle.extend({
		lifetime: 3,
		fadetime: 4,
		friction: {x: 0, y: 0},
		vel: {x: 60, y: 150},
		animSheet: new ig.AnimationSheet('media/sprites/mine.png', 4, 4),
		init: function (x, y, settings) {
			this.addAnim('idle', 0.1, [0]);
			this.parent(x, y, settings);
		}
	});
});

// biolab/entities/spewer.js
ig.baked = true;
ig.module('biolab.entities.spewer').requires('impact.entity', 'biolab.entities.particle').defines(function () {
	EntitySpewer = ig.Entity.extend({
		size: {x: 16, y: 8},
		offset: {x: 0, y: 0},
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NEVER,
		health: 20,
		shootTimer: null,
		shootWaitTimer: null,
		canShoot: false,
		animSheet: new ig.AnimationSheet('media/sprites/spewer.png', 16, 8),
		sfxHit: new ig.Sound('media/sounds/drygib.ogg'),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.shootWaitTimer = new ig.Timer(1);
			this.shootTimer = new ig.Timer(10);
			this.addAnim('idle', 0.5, [0, 0, 0, 0, 0, 0, 0, 0, 1]);
			this.addAnim('shoot', 0.15, [1, 2, 2, 1, 1]);
			this.addAnim('hit', 0.1, [3]);
		},
		update: function () {
			if (this.currentAnim == this.anims.hit && this.currentAnim.loopCount) {
				this.currentAnim = this.anims.idle;
				this.shootWaitTimer.set(0.5);
			}
			else if (this.currentAnim == this.anims.idle && this.shootWaitTimer.delta() > 0 && this.distanceTo(ig.game.player) < 80) {
				this.currentAnim = this.anims.shoot.rewind();
				this.shootTimer.set(0.45);
				this.canShoot = true;
			}
			else if (this.currentAnim == this.anims.shoot && this.canShoot && this.shootTimer.delta() > 0) {
				this.canShoot = false;
				ig.game.spawnEntity(EntitySpewerShot, this.pos.x + 4, this.pos.y - 4);
			}
			if (this.currentAnim == this.anims.shoot && this.currentAnim.loopCount) {
				this.currentAnim = this.anims.idle.rewind();
				this.shootWaitTimer.set(1.5);
			}
			this.currentAnim.flip.x = (this.pos.x - ig.game.player.pos.x < 0);
			this.parent();
		},
		kill: function () {
			this.spawnGibs(10);
			this.parent();
		},
		check: function (other) {
			other.receiveDamage(10, this);
		},
		receiveDamage: function (amount, from) {
			this.currentAnim = this.anims.hit.rewind();
			this.parent(amount);
			this.spawnGibs(3);
			this.sfxHit.play();
		},
		spawnGibs: function (amount) {
			var cx = this.pos.x + this.size.x / 2;
			var cy = this.pos.y + this.size.y / 2;
			for (var i = 0; i < amount; i++) {
				ig.game.spawnEntity(EntitySpewerGib, cx, cy);
			}
		}
	});
	EntitySpewerShot = ig.Entity.extend({
		friction: {x: 20, y: 0},
		bounciness: 0.7,
		size: {x: 4, y: 4},
		vel: {x: 60, y: 150},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.LITE,
		bounceCount: 0,
		animSheet: new ig.AnimationSheet('media/sprites/spewer.png', 4, 4),
		init: function (x, y, settings) {
			var xdir = x - ig.game.player.pos.x > 0 ? -1 : 1;
			this.vel.x = Math.random().map(0, 1, 40, 120) * xdir;
			this.vel.y = -100;
			this.addAnim('idle', 0.1, [16]);
			this.parent(x, y, settings);
		},
		handleMovementTrace: function (res) {
			this.parent(res);
			if (res.collision.x || res.collision.y) {
				this.bounceCount++;
				if (this.bounceCount >= 3) {
					this.kill();
				}
			}
		},
		check: function (other) {
			other.receiveDamage(10, this);
			this.kill();
		}
	});
	EntitySpewerGib = EntityParticle.extend({
		lifetime: 1,
		fadetime: 0.5,
		bounciness: 0.6,
		vel: {x: 50, y: 150},
		size: {x: 4, y: 4},
		animSheet: new ig.AnimationSheet('media/sprites/spewer.png', 4, 4),
		init: function (x, y, settings) {
			this.addAnim('idle', 5, [18, 19, 38, 39]);
			this.parent(x, y, settings);
		}
	});
});

// biolab/entities/trigger.js
ig.baked = true;
ig.module('biolab.entities.trigger').requires('impact.entity').defines(function () {
	EntityTrigger = ig.Entity.extend({
		size: {x: 16, y: 16},
		_wmScalable: true,
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(196, 255, 0, 0.7)',
		target: null,
		delay: -1,
		delayTimer: null,
		canFire: true,
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NEVER,
		init: function (x, y, settings) {
			if (settings.checks) {
				this.checkAgainst = ig.Entity.TYPE[settings.checks.toUpperCase()] || ig.Entity.TYPE.A;
				delete settings.check;
			}
			this.parent(x, y, settings);
			this.delayTimer = new ig.Timer();
		},
		check: function (other) {
			if (this.canFire && this.delayTimer.delta() >= 0) {
				if (typeof(this.target) == 'object') {
					for (var t in this.target) {
						var ent = ig.game.getEntityByName(this.target[t]);
						if (ent && typeof(ent.triggeredBy) == 'function') {
							ent.triggeredBy(other, this);
						}
					}
				}
				if (this.delay == -1) {
					this.canFire = false;
				}
				else {
					this.delayTimer.set(this.delay);
				}
			}
		},
		update: function () {
		}
	});
});

// biolab/entities/earthquake.js
ig.baked = true;
ig.module('biolab.entities.earthquake').requires('biolab.entities.trigger').defines(function () {
	EntityEarthquake = ig.Entity.extend({
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(80, 130, 170, 0.7)',
		size: {x: 8, y: 8},
		duration: 1,
		strength: 8,
		screen: {x: 0, y: 0},
		sound: new ig.Sound('media/sounds/earthquake.ogg', false),
		quakeTimer: null,
		init: function (x, y, settings) {
			this.quakeTimer = new ig.Timer();
			this.parent(x, y, settings);
		},
		triggeredBy: function (entity, trigger) {
			this.quakeTimer.set(this.duration);
			if (this.sound) {
				this.sound.play();
			}
		},
		update: function () {
			var delta = this.quakeTimer.delta();
			if (delta < -0.1) {
				var s = this.strength * Math.pow(-delta / this.duration, 2);
				if (s > 0.5) {
					ig.game.screen.x += Math.random().map(0, 1, -s, s);
					ig.game.screen.y += Math.random().map(0, 1, -s, s);
				}
			}
		}
	});
});

// biolab/entities/mover.js
ig.baked = true;
ig.module('biolab.entities.mover').requires('impact.entity').defines(function () {
	EntityMover = ig.Entity.extend({
		size: {x: 24, y: 8},
		maxVel: {x: 100, y: 100},
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.FIXED,
		target: null,
		targets: [],
		currentTarget: 0,
		speed: 20,
		gravityFactor: 0,
		animSheet: new ig.AnimationSheet('media/sprites/elevator.png', 24, 8),
		init: function (x, y, settings) {
			this.addAnim('idle', 1, [0]);
			this.parent(x, y, settings);
			this.targets = ig.ksort(this.target);
		},
		update: function () {
			var oldDistance = 0;
			var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
			if (target) {
				oldDistance = this.distanceTo(target);
				var angle = this.angleTo(target);
				this.vel.x = Math.cos(angle) * this.speed;
				this.vel.y = Math.sin(angle) * this.speed;
			}
			else {
				this.vel.x = 0;
				this.vel.y = 0;
			}
			this.parent();
			var newDistance = this.distanceTo(target);
			if (target && (newDistance > oldDistance || newDistance < 0.5)) {
				this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
				this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
				this.currentTarget++;
				if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
					this.currentTarget = 0;
				}
			}
		},
		receiveDamage: function (amount, from) {
		}
	});
});

// biolab/entities/debris.js
ig.baked = true;
ig.module('biolab.entities.debris').requires('impact.entity', 'biolab.entities.particle').defines(function () {
	EntityDebris = ig.Entity.extend({
		_wmScalable: true,
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(255, 170, 66, 0.7)',
		size: {x: 8, y: 8},
		duration: 5,
		count: 5,
		durationTimer: null,
		nextEmit: null,
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.durationTimer = new ig.Timer();
			this.nextEmit = new ig.Timer();
		},
		triggeredBy: function (entity, trigger) {
			this.durationTimer.set(this.duration);
			this.nextEmit.set(0);
		},
		update: function () {
			if (this.durationTimer.delta() < 0 && this.nextEmit.delta() >= 0) {
				this.nextEmit.set(this.duration / this.count);
				var x = Math.random().map(0, 1, this.pos.x, this.pos.x + this.size.x);
				var y = Math.random().map(0, 1, this.pos.y, this.pos.y + this.size.y);
				ig.game.spawnEntity(EntityDebrisParticle, x, y);
			}
		}
	});
	EntityDebrisParticle = EntityParticle.extend({
		lifetime: 2,
		fadetime: 1,
		bounciness: 0.6,
		vel: {x: 60, y: 0},
		animSheet: new ig.AnimationSheet('media/sprites/debris.png', 4, 4),
		init: function (x, y, settings) {
			this.addAnim('idle', 5, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
			this.parent(x, y, settings);
		}
	});
});

// biolab/entities/delay.js
ig.baked = true;
ig.module('biolab.entities.delay').requires('impact.entity').defines(function () {
	EntityDelay = ig.Entity.extend({
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(255, 100, 0, 0.7)',
		size: {x: 8, y: 8},
		delay: 1,
		delayTimer: null,
		triggerEntity: null,
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.delayTimer = new ig.Timer();
		},
		triggeredBy: function (entity, trigger) {
			this.fire = true;
			this.delayTimer.set(this.delay);
			this.triggerEntity = entity;
		},
		update: function () {
			if (this.fire && this.delayTimer.delta() > 0) {
				this.fire = false;
				for (var t in this.target) {
					var ent = ig.game.getEntityByName(this.target[t]);
					if (ent && typeof(ent.triggeredBy) == 'function') {
						ent.triggeredBy(this.triggerEntity, this);
					}
				}
			}
		}
	});
});

// biolab/entities/void.js
ig.baked = true;
ig.module('biolab.entities.void').requires('impact.entity').defines(function () {
	EntityVoid = ig.Entity.extend({
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(128, 28, 230, 0.7)',
		size: {x: 8, y: 8},
		update: function () {
		}
	});
});

// biolab/entities/hurt.js
ig.baked = true;
ig.module('biolab.entities.hurt').requires('impact.entity').defines(function () {
	EntityHurt = ig.Entity.extend({
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(255, 0, 0, 0.7)',
		size: {x: 8, y: 8},
		damage: 10,
		triggeredBy: function (entity, trigger) {
			entity.receiveDamage(this.damage, this);
		},
		update: function () {
		}
	});
});

// biolab/entities/levelchange.js
ig.baked = true;
ig.module('biolab.entities.levelchange').requires('impact.entity').defines(function () {
	EntityLevelchange = ig.Entity.extend({
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(0, 0, 255, 0.7)',
		size: {x: 8, y: 8},
		level: null,
		triggeredBy: function (entity, trigger) {
			if (this.level) {
				var levelName = this.level.replace(/^(Level)?(\w)(\w*)/, function (m, l, a, b) {
					return a.toUpperCase() + b;
				});
				ig.game.endLevel(ig.global['Level' + levelName]);
			}
		},
		update: function () {
		}
	});
});

// biolab/entities/respawn-pod.js
ig.baked = true;
ig.module('biolab.entities.respawn-pod').requires('impact.entity').defines(function () {
	EntityRespawnPod = ig.Entity.extend({
		size: {x: 18, y: 16},
		zIndex: -1,
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NEVER,
		sound: new ig.Sound('media/sounds/respawn-activate.ogg', false),
		animSheet: new ig.AnimationSheet('media/sprites/respawn-pod.png', 18, 16),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.addAnim('idle', 0.5, [0, 1]);
			this.addAnim('activated', 0.5, [2, 3]);
			this.addAnim('respawn', 0.1, [0, 4]);
		},
		update: function () {
			if (this.currentAnim == this.anims.respawn && this.currentAnim.loopCount > 4) {
				this.currentAnim = this.anims.activated;
			}
			this.currentAnim.update();
		},
		getSpawnPos: function () {
			return {x: (this.pos.x + 11), y: this.pos.y};
		},
		activate: function () {
			this.sound.play();
			this.active = true;
			this.currentAnim = this.anims.activated;
			ig.game.lastCheckpoint = this;
		},
		check: function (other) {
			if (!this.active) {
				this.activate();
			}
		}
	});
});

// biolab/entities/test-tube.js
ig.baked = true;
ig.module('biolab.entities.test-tube').requires('impact.entity').defines(function () {
	EntityTestTube = ig.Entity.extend({
		size: {x: 8, y: 10},
		checkAgainst: ig.Entity.TYPE.A,
		animSheet: new ig.AnimationSheet('media/sprites/test-tube.png', 8, 10),
		collect: new ig.Sound('media/sounds/collect.ogg'),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.addAnim('idle', 0.1, [0, 0, 0, 1, 2, 3, 0, 0, 0, 2, 0, 0, 1, 0, 0]);
			this.currentAnim.gotoRandomFrame();
		},
		check: function (other) {
			this.kill();
			this.collect.play();
			ig.game.tubeCount++;
		},
		update: function () {
			this.currentAnim.update();
		}
	});
});

// biolab/entities/glass-dome.js
ig.baked = true;
ig.module('biolab.entities.glass-dome').requires('impact.entity', 'biolab.entities.particle').defines(function () {
	EntityGlassDome = ig.Entity.extend({
		size: {x: 40, y: 32},
		offset: {x: 0, y: 0},
		health: 80,
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.FIXED,
		sfxHit: new ig.Sound('media/sounds/glass-impact.ogg'),
		sfxBreak: new ig.Sound('media/sounds/glass-shatter.ogg'),
		animSheet: new ig.AnimationSheet('media/sprites/glass-dome.png', 40, 32),
		init: function (x, y, settings) {
			this.addAnim('idle', 1, [0]);
			this.parent(x, y, settings);
		},
		receiveDamage: function (amount, from) {
			if (this.distanceTo(ig.game.player) > 160) {
				return;
			}
			this.parent(amount, from);
			this.sfxHit.play();
			for (var i = 0; i < 3; i++) {
				ig.game.spawnEntity(EntityGlassShards, from.pos.x, from.pos.y);
			}
		},
		kill: function () {
			this.sfxBreak.play();
			var shards = ig.ua.mobile ? 20 : 100;
			for (var i = 0; i < shards; i++) {
				var x = Math.random().map(0, 1, this.pos.x, this.pos.x + this.size.x);
				var y = Math.random().map(0, 1, this.pos.y, this.pos.y + this.size.y);
				ig.game.spawnEntity(EntityGlassShards, x, y);
			}
			this.parent();
		}
	});
	EntityGlassShards = EntityParticle.extend({
		lifetime: 3,
		fadetime: 1,
		bounciness: 0.5,
		vel: {x: 60, y: 120},
		collides: ig.Entity.COLLIDES.NEVER,
		animSheet: new ig.AnimationSheet('media/sprites/glass-shards.png', 4, 4),
		init: function (x, y, settings) {
			this.lifetime = Math.random() * 3 + 1;
			this.addAnim('idle', 5, [0, 1, 2, 3]);
			this.parent(x, y, settings);
		}
	});
});

// biolab/perlin-noise.js
ig.baked = true;
ig.module('biolab.perlin-noise').defines(function () {
	PerlinNoise = ig.Class.extend({
		gx: [], gy: [], p: [], size: 256, init: function (size) {
			this.size = size || 256;
			for (var i = 0; i < this.size; i++) {
				this.gx.push(Math.random() * 2 - 1);
				this.gy.push(Math.random() * 2 - 1);
			}
			for (var j = 0; j < this.size; j++) {
				this.p.push(j);
			}
			this.p.sort(function () {
				return 0.5 - Math.random()
			});
		}, noise2: function (x, y) {
			var qx0 = x | 0;
			var qx1 = qx0 + 1;
			var tx0 = x - qx0;
			var tx1 = tx0 - 1;
			var qy0 = y | 0;
			var qy1 = qy0 + 1;
			var ty0 = y - qy0;
			var ty1 = ty0 - 1;
			qx0 = qx0 % this.size;
			qx1 = qx1 % this.size;
			qy0 = qy0 % this.size;
			qy1 = qy1 % this.size;
			var q00 = this.p[(qy0 + this.p[qx0]) % this.size];
			var q01 = this.p[(qy0 + this.p[qx1]) % this.size];
			var q10 = this.p[(qy1 + this.p[qx0]) % this.size];
			var q11 = this.p[(qy1 + this.p[qx1]) % this.size];
			var v00 = this.gx[q00] * tx0 + this.gy[q00] * ty0;
			var v01 = this.gx[q01] * tx1 + this.gy[q01] * ty0;
			var v10 = this.gx[q10] * tx0 + this.gy[q10] * ty1;
			var v11 = this.gx[q11] * tx1 + this.gy[q11] * ty1;
			var wx = (3 - 2 * tx0) * tx0 * tx0;
			var v0 = v00 - wx * (v00 - v01);
			var v1 = v10 - wx * (v10 - v11);
			var wy = (3 - 2 * ty0) * ty0 * ty0;
			var v = v0 - wy * (v0 - v1);
			return v;
		}
	});
});

// biolab/entities/endhub.js
ig.baked = true;
ig.module('biolab.entities.endhub').requires('impact.entity', 'biolab.perlin-noise').defines(function () {
	EntityEndhub = ig.Entity.extend({
		size: {x: 24, y: 24},
		zIndex: -1,
		sound: new ig.Sound('media/sounds/respawn-activate.ogg', false),
		soundEnd: new ig.Sound('media/sounds/theend.ogg', false),
		animSheet: new ig.AnimationSheet('media/sprites/endhub.png', 24, 24),
		stage: 0,
		stageTimer: null,
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.addAnim('idle', 0.5, [0, 1]);
			this.addAnim('activated', 0.5, [2, 3]);
			this.stageTimer = new ig.Timer(0);
		},
		update: function () {
			this.currentAnim.update();
		},
		triggeredBy: function (entity, trigger) {
			this.stage++;
			this.stageTimer.set(0);
			if (this.stage == 1) {
				this.sound.play();
				this.currentAnim = this.anims.activated;
				ig.music.fadeOut(4);
			}
			else if (this.stage == 2) {
				this.soundEnd.play();
				var pn = new PerlinNoise();
				var sx = this.pos.x;
				var sy = this.pos.y - 24;
				var particles = ig.ua.mobile ? 30 : 100;
				for (var i = 0; i < particles; i++) {
					ig.game.spawnEntity(EntityPlasma, sx, sy, {noise: pn, index: i * 10});
				}
			}
			else if (this.stage == 3) {
				ig.game.spawnEntity(EntityFadeScreen, sx, sy);
			}
			else if (this.stage == 4) {
				ig.game.end();
			}
		}
	});
	EntityFadeScreen = ig.Entity.extend({
		duration: 1, color: '#fff', alpha: 0, init: function (x, y, settings) {
			this.fadeTimer = new ig.Timer(this.duration);
		}, update: function () {
			this.alpha = this.fadeTimer.delta().map(-this.duration, 0, 0, 1).limit(0, 1);
		}, draw: function () {
			ig.system.context.globalAlpha = this.alpha;
			ig.system.clear(this.color);
			ig.system.context.globalAlpha = 1;
		}
	});
	EntityPlasma = ig.Entity.extend({
		noise: null,
		index: 0,
		animSheet: new ig.AnimationSheet('media/sprites/plasma.png', 20, 20),
		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.center = {x: x, y: y};
			this.timer = new ig.Timer();
			this.addAnim('idle', 5, [0]);
			this.update();
		},
		update: function () {
			var d = this.timer.delta();
			var t = d * 100 + 16000;
			var i = this.index;
			var xn1 = this.noise.noise2(i / 97, t / 883);
			var xn2 = this.noise.noise2(i / 41, t / 311) * 2;
			var xn3 = this.noise.noise2(i / 13, t / 89) * 0.5;
			var yn1 = this.noise.noise2(i / 97, t / 701);
			var yn2 = this.noise.noise2(i / 41, t / 373) * 2;
			var yn3 = this.noise.noise2(i / 13, t / 97) * 0.5;
			var scale = (80 / (d * d * 0.7)).limit(0, 1000);
			this.pos.x = this.center.x + (xn1 + xn2 + xn3) * 40 * scale;
			this.pos.y = this.center.y + (yn1 + yn2 + yn3) * 30 * scale;
		},
		draw: function () {
			ig.system.context.globalCompositeOperation = 'lighter';
			this.parent();
			ig.system.context.globalCompositeOperation = 'source-over';
		}
	});
});

// biolab/levels/biolab1.js
ig.baked = true;
ig.module('biolab.levels.biolab1').requires('impact.image', 'biolab.entities.respawn-pod', 'biolab.entities.blob', 'biolab.entities.spike', 'biolab.entities.delay', 'biolab.entities.trigger', 'biolab.entities.test-tube', 'biolab.entities.debris', 'biolab.entities.hurt', 'biolab.entities.earthquake', 'biolab.entities.player', 'biolab.entities.mine', 'biolab.entities.levelchange').defines(function () {
	LevelBiolab1 = {
		"entities": [{"type": "EntityRespawnPod", "x": 576, "y": 80}, {
			"type": "EntityRespawnPod",
			"x": 1668,
			"y": 112
		}, {"type": "EntityRespawnPod", "x": 1216, "y": 24}, {
			"type": "EntityBlob",
			"x": 1831,
			"y": 99
		}, {"type": "EntityBlob", "x": 503, "y": 123}, {
			"type": "EntitySpike",
			"x": 1332,
			"y": 39
		}, {
			"type": "EntityDelay",
			"x": 280,
			"y": 44,
			"settings": {"name": "delay1", "target": {"1": "introD1"}, "delay": 1}
		}, {
			"type": "EntityTrigger",
			"x": 1912,
			"y": 140,
			"settings": {"size": {"x": 128, "y": 12}, "target": {"1": "kill"}, "delay": 0, "checks": "both"}
		}, {"type": "EntityTestTube", "x": 408, "y": 100}, {
			"type": "EntityTestTube",
			"x": 1892,
			"y": 92
		}, {"type": "EntityTestTube", "x": 1548, "y": 68}, {
			"type": "EntityDebris",
			"x": 208,
			"y": 8,
			"settings": {"size": {"x": 152}, "name": "introD1", "duration": 2.5, "count": 40}
		}, {
			"type": "EntityDebris",
			"x": 88,
			"y": 48,
			"settings": {"size": {"x": 64}, "duration": 1, "count": 10, "name": "introD3"}
		}, {
			"type": "EntityHurt",
			"x": 1828,
			"y": 68,
			"settings": {"damage": 1000, "name": "kill"}
		}, {
			"type": "EntityTrigger",
			"x": 1720,
			"y": 140,
			"settings": {"size": {"x": 32, "y": 12}, "target": {"1": "kill"}, "delay": 0, "checks": "both"}
		}, {
			"type": "EntityTrigger",
			"x": 1784,
			"y": 140,
			"settings": {"size": {"x": 32, "y": 12}, "target": {"1": "kill"}, "delay": 0, "checks": "both"}
		}, {"type": "EntityBlob", "x": 1347, "y": 83}, {
			"type": "EntityTestTube",
			"x": 816,
			"y": 124
		}, {"type": "EntityTestTube", "x": 1268, "y": 116}, {
			"type": "EntityTestTube",
			"x": 1764,
			"y": 108
		}, {"type": "EntitySpike", "x": 1964, "y": 95}, {
			"type": "EntityEarthquake",
			"x": 176,
			"y": 96,
			"settings": {"name": "introEQ", "strength": 6, "duration": 5}
		}, {
			"type": "EntityTrigger",
			"x": 128,
			"y": 80,
			"settings": {
				"target": {"1": "introEQ", "2": "delay1", "3": "introD2", "4": "introD3"},
				"size": {"y": 56, "x": 24}
			}
		}, {
			"type": "EntityDebris",
			"x": 152,
			"y": 32,
			"settings": {"size": {"x": 56}, "duration": 2, "count": 30, "name": "introD2"}
		}, {"type": "EntityBlob", "x": 403, "y": 139}, {
			"type": "EntityPlayer",
			"x": 76,
			"y": 122
		}, {"type": "EntityMine", "x": 1440, "y": 35}, {
			"type": "EntityTrigger",
			"x": 1848,
			"y": 140,
			"settings": {"size": {"x": 32, "y": 12}, "target": {"1": "kill"}, "delay": 0, "checks": "both"}
		}, {"type": "EntityMine", "x": 1528, "y": 147}, {
			"type": "EntityTrigger",
			"x": 2032,
			"y": 80,
			"settings": {"size": {"y": 24, "x": 8}, "target": {"1": "nextLevel"}}
		}, {"type": "EntityMine", "x": 1576, "y": 147}, {
			"type": "EntityLevelchange",
			"x": 2052,
			"y": 88,
			"settings": {"name": "nextLevel", "level": "biolab2"}
		}, {"type": "EntitySpike", "x": 1132, "y": 31}, {
			"type": "EntitySpike",
			"x": 1072,
			"y": 95
		}, {"type": "EntityBlob", "x": 1363, "y": 139}, {
			"type": "EntityTestTube",
			"x": 1164,
			"y": 84
		}, {"type": "EntityBlob", "x": 1555, "y": 43}, {
			"type": "EntityBlob",
			"x": 655,
			"y": 83
		}, {"type": "EntitySpike", "x": 816, "y": 103}, {"type": "EntityTestTube", "x": 356, "y": 100}],
		"layer": [{
			"name": "background",
			"width": 30,
			"height": 20,
			"linkWithCollision": false,
			"visible": 1,
			"tilesetName": "media/tiles/biolab.png",
			"repeat": true,
			"preRender": false,
			"distance": "2",
			"tilesize": 8,
			"foreground": false,
			"data": [[0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 80, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 80, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 64, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 64, 0, 0, 0, 48, 0, 80, 0, 0, 0, 0, 64, 0, 0, 0, 64, 0, 0], [0, 48, 0, 0, 0, 0, 0, 32, 80, 32, 0, 0, 80, 0, 0, 0, 48, 0, 48, 0, 0, 0, 0, 80, 0, 0, 0, 64, 0, 0], [0, 48, 0, 0, 80, 32, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 48, 0, 48, 0, 0, 0, 0, 64, 0, 0, 0, 80, 0, 0], [0, 48, 0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 64, 0, 80, 0, 48, 0, 80, 0, 0, 32, 32, 80, 32, 32, 0, 0, 0, 0], [0, 48, 0, 0, 48, 48, 0, 0, 0, 80, 0, 0, 80, 0, 64, 0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 48, 48, 0, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 48, 48, 0, 0, 0, 64, 0, 0, 0, 0, 80, 0, 48, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 80, 32, 0, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 0, 0, 0, 80, 0, 0, 0, 80, 0, 0, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 32, 80, 32, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 32, 80, 32, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 80, 0, 0, 0, 0, 80, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0]]
		}, {
			"name": "collision",
			"width": 256,
			"height": 20,
			"linkWithCollision": false,
			"visible": 0,
			"tilesetName": "",
			"repeat": false,
			"preRender": false,
			"distance": "1",
			"tilesize": 8,
			"foreground": false,
			"data": [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
		}, {
			"name": "main",
			"width": 256,
			"height": 20,
			"linkWithCollision": true,
			"visible": 1,
			"tilesetName": "media/tiles/biolab.png",
			"repeat": false,
			"preRender": false,
			"distance": "1",
			"tilesize": 8,
			"foreground": false,
			"data": [[79, 77, 77, 78, 77, 79, 77, 77, 78, 77, 78, 77, 79, 77, 77, 71, 63, 77, 77, 77, 78, 77, 77, 78, 77, 4, 3, 1, 3, 1, 4, 5, 2, 26, 27, 27, 28, 2, 1, 5, 4, 22, 1, 4, 5, 1, 78, 79, 62, 71, 59, 78, 77, 78, 78, 77, 77, 77, 78, 77, 79, 71, 77, 79, 77, 77, 77, 77, 77, 77, 78, 71, 78, 77, 77, 78, 77, 77, 77, 61, 77, 78, 77, 78, 77, 78, 77, 78, 19, 79, 77, 77, 79, 77, 4, 5, 78, 75, 57, 58, 62, 19, 34, 19, 60, 61, 58, 74, 77, 5, 4, 78, 63, 77, 78, 56, 78, 78, 57, 78, 58, 78, 78, 55, 78, 1, 4, 7, 26, 27, 28, 3, 23, 1, 26, 27, 28, 1, 3, 1, 2, 1, 21, 4, 1, 21, 1, 26, 27, 28, 4, 5, 3, 26, 27, 28, 5, 2, 4, 3, 1, 2, 1, 21, 4, 26, 27, 27, 27, 28, 4, 7, 5, 7, 7, 3, 1, 20, 1, 3, 5, 1, 5, 3, 1, 5, 1, 10, 11, 11, 12, 2, 3, 1, 3, 1, 23, 77, 78, 78, 77, 63, 78, 77, 19, 56, 71, 71, 55, 19, 63, 78, 77, 78, 77, 78, 77, 79, 77, 77, 71, 19, 77, 77, 62, 78, 77, 77, 19, 71, 78, 77, 77, 59, 77, 79, 19, 71, 77, 77, 78, 75, 58, 77, 77, 77, 78, 63, 77, 78, 77, 77, 78, 58, 74, 77], [77, 78, 61, 74, 77, 79, 78, 77, 77, 78, 77, 63, 77, 77, 75, 71, 62, 78, 77, 78, 77, 63, 77, 77, 78, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 77, 62, 53, 71, 61, 76, 79, 77, 77, 78, 77, 78, 77, 77, 77, 71, 77, 78, 77, 77, 61, 74, 77, 78, 77, 71, 77, 78, 78, 77, 77, 78, 63, 77, 77, 77, 77, 77, 78, 77, 77, 77, 19, 63, 77, 78, 20, 1, 20, 7, 1, 5, 2, 1, 1, 19, 18, 19, 1, 20, 1, 20, 1, 2, 20, 1, 1, 73, 77, 56, 78, 73, 78, 77, 78, 79, 78, 55, 63, 20, 5, 2, 0, 0, 0, 2, 4, 5, 0, 0, 0, 4, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 0, 0, 1, 61, 79, 77, 61, 77, 58, 59, 19, 56, 71, 71, 55, 19, 77, 77, 78, 77, 77, 77, 76, 77, 78, 79, 71, 19, 57, 58, 57, 60, 76, 79, 19, 71, 77, 75, 76, 58, 61, 77, 19, 71, 78, 77, 79, 57, 63, 59, 77, 79, 77, 78, 77, 63, 77, 75, 60, 60, 79, 77], [77, 78, 78, 77, 77, 77, 76, 62, 61, 59, 77, 75, 60, 61, 60, 71, 61, 74, 77, 77, 60, 74, 75, 62, 79, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 78, 75, 76, 71, 70, 60, 77, 77, 78, 77, 79, 77, 78, 77, 78, 71, 78, 77, 63, 77, 78, 77, 79, 77, 77, 71, 77, 77, 63, 77, 78, 77, 77, 77, 63, 61, 77, 78, 77, 77, 77, 77, 19, 77, 79, 77, 1, 50, 52, 69, 68, 69, 69, 70, 33, 19, 33, 19, 33, 70, 69, 69, 68, 69, 52, 50, 1, 57, 78, 56, 78, 57, 78, 60, 57, 76, 78, 55, 74, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 60, 59, 75, 59, 78, 62, 20, 19, 56, 71, 71, 55, 19, 4, 76, 63, 77, 62, 61, 60, 79, 77, 77, 71, 19, 59, 79, 60, 78, 61, 77, 19, 71, 63, 60, 57, 79, 59, 78, 19, 71, 77, 77, 78, 62, 57, 61, 62, 74, 78, 77, 77, 78, 78, 59, 58, 61, 74, 79], [63, 77, 63, 77, 1, 20, 1, 1, 4, 1, 3, 3, 76, 79, 62, 71, 76, 61, 1, 1, 3, 4, 1, 1, 20, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 79, 78, 59, 71, 53, 74, 78, 79, 77, 78, 77, 77, 77, 77, 75, 71, 77, 78, 77, 77, 78, 77, 77, 78, 77, 71, 76, 77, 77, 77, 78, 63, 77, 77, 77, 79, 77, 77, 2, 7, 3, 7, 5, 61, 77, 78, 8, 54, 70, 18, 70, 70, 66, 70, 36, 18, 18, 18, 36, 70, 66, 70, 70, 18, 70, 54, 8, 77, 79, 56, 63, 78, 59, 61, 62, 78, 79, 55, 63, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 58, 62, 61, 77, 78, 76, 5, 19, 56, 71, 71, 55, 19, 2, 60, 78, 77, 20, 26, 27, 27, 28, 20, 71, 19, 20, 26, 27, 27, 28, 20, 19, 71, 20, 26, 27, 27, 28, 20, 19, 71, 5, 1, 1, 2, 5, 3, 1, 5, 2, 4, 1, 5, 77, 63, 57, 58, 62, 78], [77, 77, 63, 77, 3, 0, 0, 0, 0, 0, 0, 1, 60, 70, 65, 71, 70, 60, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 62, 61, 62, 71, 70, 62, 61, 77, 2, 1, 4, 5, 1, 10, 11, 11, 11, 12, 26, 27, 27, 27, 28, 10, 11, 11, 11, 12, 3, 1, 2, 4, 1, 78, 77, 78, 75, 63, 7, 5, 5, 5, 19, 62, 74, 63, 24, 33, 33, 33, 18, 71, 66, 67, 53, 54, 54, 54, 53, 67, 66, 71, 18, 33, 33, 33, 24, 78, 60, 56, 78, 79, 58, 59, 76, 78, 78, 55, 78, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 76, 79, 78, 63, 77, 78, 4, 19, 56, 71, 71, 55, 19, 78, 63, 78, 79, 4, 0, 0, 0, 0, 1, 71, 19, 1, 0, 0, 0, 0, 1, 19, 71, 5, 0, 0, 0, 0, 7, 19, 71, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 77, 63, 77, 60, 76, 77], [63, 77, 59, 78, 4, 0, 0, 0, 0, 0, 0, 2, 4, 26, 27, 27, 28, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 58, 59, 53, 71, 60, 79, 60, 76, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 74, 77, 63, 78, 77, 4, 20, 23, 21, 20, 60, 60, 58, 24, 0, 46, 0, 19, 71, 54, 67, 71, 18, 36, 18, 71, 67, 54, 71, 19, 0, 47, 0, 24, 73, 57, 56, 78, 63, 78, 78, 78, 57, 61, 55, 57, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 42, 43, 42, 0, 0, 0, 6, 20, 1, 2, 1, 3, 1, 7, 20, 4, 1, 3, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 3, 20, 4, 5, 1, 2, 1, 7, 2, 4, 1, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 41, 8, 77, 59, 61, 75, 77, 60, 19, 56, 71, 71, 55, 19, 77, 78, 77, 77, 1, 0, 0, 0, 0, 5, 71, 19, 4, 0, 0, 0, 0, 4, 19, 71, 7, 0, 0, 0, 0, 5, 19, 71, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 79, 57, 77, 63, 77, 77], [75, 61, 62, 78, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 2, 59, 60, 71, 76, 61, 58, 2, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 63, 77, 77, 75, 60, 19, 61, 60, 59, 19, 58, 58, 62, 24, 0, 0, 0, 18, 70, 54, 67, 71, 68, 66, 68, 71, 67, 54, 70, 18, 0, 0, 0, 24, 57, 60, 56, 79, 73, 57, 77, 73, 62, 60, 55, 77, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 47, 46, 0, 0, 0, 20, 2, 60, 58, 76, 74, 57, 63, 8, 19, 33, 19, 17, 18, 1, 2, 1, 3, 1, 3, 1, 4, 20, 1, 1, 4, 1, 35, 19, 18, 33, 19, 18, 33, 19, 35, 1, 3, 20, 1, 22, 0, 0, 0, 0, 0, 0, 0, 0, 2, 24, 77, 77, 59, 58, 78, 58, 19, 56, 71, 71, 55, 19, 60, 77, 79, 77, 3, 0, 0, 0, 0, 5, 71, 19, 1, 0, 0, 0, 0, 1, 19, 71, 3, 0, 0, 0, 0, 4, 20, 7, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 77, 57, 59, 77, 77, 77], [77, 76, 77, 78, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 27, 27, 28, 20, 2, 26, 27, 27, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 4, 74, 60, 62, 58, 19, 62, 58, 57, 19, 62, 76, 2, 4, 0, 0, 0, 47, 18, 34, 17, 71, 68, 66, 68, 71, 17, 34, 18, 46, 0, 0, 0, 4, 60, 57, 56, 57, 60, 60, 59, 57, 74, 78, 55, 60, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 71, 61, 57, 62, 77, 79, 77, 24, 19, 1, 1, 2, 1, 4, 1, 10, 11, 11, 12, 1, 2, 1, 5, 4, 1, 3, 1, 5, 20, 1, 20, 2, 1, 4, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 42, 44, 43, 44, 4, 24, 5, 78, 60, 62, 76, 5, 19, 56, 71, 71, 55, 19, 5, 76, 77, 78, 1, 0, 0, 0, 0, 3, 71, 19, 5, 0, 0, 0, 0, 5, 3, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 41, 62, 60, 61, 77, 58, 60], [78, 77, 63, 77, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 26, 27, 27, 27, 28, 2, 4, 1, 3, 5, 4, 4, 23, 22, 0, 0, 0, 0, 0, 45, 0, 36, 35, 33, 35, 36, 0, 45, 0, 0, 0, 0, 0, 2, 5, 33, 56, 34, 18, 59, 60, 62, 35, 18, 55, 18, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 71, 60, 62, 58, 75, 77, 77, 24, 19, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 27, 27, 28, 0, 0, 71, 0, 0, 26, 27, 27, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 45, 0, 5, 24, 4, 77, 63, 77, 79, 20, 19, 56, 71, 71, 55, 19, 20, 78, 63, 77, 4, 0, 0, 0, 0, 20, 3, 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 77, 78, 79, 77, 78, 61], [77, 63, 78, 77, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 45, 0, 0, 47, 0, 0, 0, 0, 0, 0, 0, 3, 4, 34, 19, 34, 35, 70, 65, 71, 70, 52, 55, 35, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 71, 58, 62, 60, 61, 78, 79, 40, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 40, 4, 5, 3, 4, 6, 5, 19, 56, 4, 4, 55, 19, 5, 77, 77, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 3, 5, 1, 4, 1, 6], [77, 77, 78, 77, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 70, 70, 53, 70, 70, 36, 65, 71, 35, 70, 55, 33, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 43, 0, 0, 0, 0, 0, 20, 71, 73, 79, 60, 78, 77, 77, 77, 78, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 4, 5, 1, 2, 1, 3, 2, 1, 35, 35, 7, 1, 40, 1, 4, 1, 3, 1, 4, 1, 4, 1, 3, 1, 20, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [79, 77, 77, 60, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 70, 68, 71, 68, 70, 18, 66, 71, 18, 52, 19, 35, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 46, 0, 0, 0, 0, 0, 5, 71, 77, 63, 62, 79, 79, 78, 79, 77, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 53, 19, 35, 70, 36, 35, 33, 19, 33, 36, 52, 1, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [77, 77, 1, 1, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 2, 6, 4, 1, 1, 1, 2, 4, 6, 4, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 4, 20, 2, 3, 1, 1, 10, 11, 11, 11, 12, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 4, 10, 12, 63, 78, 76, 78, 77, 77, 77, 77, 9, 0, 0, 0, 0, 0, 3, 5, 2, 3, 1, 4, 1, 4, 1, 6, 0, 0, 71, 0, 0, 6, 3, 1, 5, 2, 1, 3, 2, 1, 1, 53, 19, 33, 36, 17, 53, 35, 19, 18, 36, 69, 7, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [63, 60, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 34, 3, 2, 7, 3, 5, 18, 4, 18, 17, 17, 17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 26, 28, 5, 26, 28, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 43, 42, 43, 0, 0, 0, 0, 0, 0, 0, 24, 19, 2, 71, 77, 77, 63, 77, 78, 63, 77, 77, 25, 0, 0, 0, 0, 4, 7, 18, 17, 33, 34, 33, 18, 17, 52, 4, 10, 11, 11, 11, 12, 4, 33, 18, 33, 65, 17, 34, 18, 18, 34, 4, 1, 26, 27, 27, 28, 1, 1, 3, 4, 1, 3, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 5, 3, 6, 0, 0, 0, 0, 6, 3, 1, 5, 2, 1, 5, 1, 1, 5, 2, 1, 22], [77, 62, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 42, 44, 43, 0, 0, 0, 42, 43, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 44, 42, 0, 0, 0, 25, 34, 18, 4, 5, 4, 2, 35, 19, 35, 33, 33, 33, 1, 2, 1, 1, 5, 1, 4, 2, 6, 0, 0, 0, 0, 0, 0, 43, 42, 43, 43, 42, 44, 43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 46, 0, 0, 0, 0, 0, 0, 0, 24, 19, 2, 71, 62, 79, 78, 60, 78, 77, 75, 78, 41, 0, 0, 0, 0, 0, 4, 1, 7, 5, 1, 1, 3, 2, 1, 22, 26, 27, 27, 27, 28, 22, 1, 20, 3, 1, 2, 20, 3, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 2, 4, 6, 0, 0, 0, 0, 1, 71, 19, 3, 0, 0, 0, 0, 20, 17, 35, 19, 35, 18, 35, 35, 19, 17, 17, 17, 18], [77, 77, 5, 0, 0, 13, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 15, 13, 0, 0, 0, 6, 5, 4, 2, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 45, 45, 46, 0, 0, 0, 46, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 46, 0, 0, 0, 41, 17, 69, 67, 55, 20, 4, 35, 19, 35, 53, 53, 58, 77, 63, 77, 78, 63, 78, 77, 4, 20, 0, 0, 0, 0, 0, 0, 46, 0, 45, 0, 45, 47, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 4, 10, 12, 78, 58, 78, 79, 78, 18, 36, 17, 22, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 4, 3, 6, 0, 0, 0, 0, 3, 71, 19, 5, 0, 0, 0, 0, 2, 71, 19, 2, 0, 0, 0, 0, 22, 1, 3, 1, 1, 1, 2, 1, 3, 2, 1, 1, 1], [60, 77, 1, 0, 0, 29, 30, 31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 30, 30, 30, 31, 0, 0, 0, 5, 66, 71, 70, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 70, 69, 70, 55, 56, 70, 52, 19, 52, 59, 60, 61, 74, 78, 76, 79, 77, 76, 78, 79, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 1, 2, 1, 4, 0, 0, 0, 42, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 71, 78, 61, 58, 78, 78, 20, 2, 5, 3, 23, 6, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 3, 10, 11, 11, 11, 12, 1, 3, 3, 0, 0, 0, 0, 2, 19, 71, 4, 0, 0, 0, 0, 1, 71, 19, 1, 0, 0, 0, 0, 3, 71, 19, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5], [77, 77, 23, 1, 2, 2, 1, 1, 4, 1, 3, 1, 23, 1, 4, 1, 1, 23, 3, 1, 1, 2, 5, 1, 1, 3, 3, 1, 1, 66, 71, 70, 1, 1, 4, 23, 5, 1, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 4, 1, 3, 23, 1, 3, 1, 3, 23, 1, 4, 1, 3, 1, 70, 69, 70, 55, 56, 70, 69, 19, 69, 79, 75, 76, 62, 77, 78, 77, 78, 79, 77, 75, 2, 1, 1, 2, 4, 1, 1, 4, 1, 1, 6, 1, 1, 4, 1, 3, 1, 1, 1, 2, 6, 1, 1, 3, 1, 1, 21, 4, 1, 1, 21, 18, 33, 35, 18, 20, 0, 0, 0, 46, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 71, 63, 77, 62, 61, 63, 56, 55, 19, 3, 1, 5, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 18, 35, 19, 18, 35, 18, 19, 35, 18, 1, 81, 82, 81, 82, 5, 19, 71, 3, 81, 82, 81, 82, 4, 71, 19, 2, 82, 82, 81, 82, 5, 71, 19, 2, 81, 82, 81, 82, 81, 82, 82, 82, 81, 81, 81, 82, 81, 82, 81, 82, 3], [79, 78, 79, 77, 78, 77, 60, 59, 60, 63, 77, 79, 77, 77, 78, 77, 78, 79, 63, 77, 78, 77, 78, 63, 79, 60, 62, 65, 69, 66, 71, 70, 67, 69, 60, 76, 58, 59, 61, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 19, 3, 18, 7, 20, 4, 19, 20, 7, 6, 20, 18, 5, 2, 65, 69, 67, 55, 56, 70, 69, 71, 69, 77, 58, 61, 60, 73, 62, 60, 63, 78, 77, 78, 60, 61, 77, 77, 78, 77, 77, 78, 77, 77, 79, 61, 75, 61, 76, 61, 63, 77, 78, 77, 77, 79, 77, 79, 77, 77, 77, 76, 60, 61, 77, 77, 78, 77, 77, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 71, 78, 79, 60, 60, 78, 56, 55, 19, 1, 2, 22, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 36, 33, 19, 52, 52, 52, 19, 33, 36, 2, 89, 90, 90, 89, 1, 19, 71, 2, 90, 89, 89, 90, 1, 71, 19, 4, 89, 90, 89, 90, 7, 71, 19, 3, 90, 90, 89, 90, 89, 90, 89, 89, 90, 90, 89, 89, 90, 90, 89, 89, 1], [77, 79, 77, 77, 79, 78, 63, 58, 77, 77, 63, 78, 77, 63, 77, 77, 77, 78, 77, 77, 79, 77, 78, 63, 77, 77, 75, 60, 61, 66, 71, 62, 76, 59, 61, 59, 62, 60, 58, 1, 1, 3, 1, 1, 23, 1, 4, 1, 1, 7, 1, 1, 7, 1, 1, 4, 1, 4, 19, 2, 4, 5, 20, 23, 19, 2, 5, 21, 7, 4, 20, 53, 53, 53, 71, 55, 56, 70, 69, 71, 69, 62, 60, 57, 59, 76, 79, 57, 77, 78, 77, 63, 60, 61, 77, 79, 77, 63, 78, 77, 79, 77, 74, 62, 60, 60, 60, 62, 58, 77, 63, 77, 77, 78, 77, 77, 77, 78, 78, 77, 59, 77, 63, 77, 77, 77, 79, 1, 1, 4, 1, 1, 6, 1, 1, 1, 6, 1, 1, 1, 6, 1, 1, 1, 6, 1, 1, 1, 71, 78, 77, 79, 77, 78, 56, 55, 19, 2, 3, 1, 1, 5, 1, 3, 2, 3, 1, 3, 1, 4, 1, 5, 3, 1, 4, 1, 2, 10, 11, 11, 11, 12, 5, 1, 4, 1, 2, 5, 4, 10, 11, 11, 11, 12, 1, 10, 11, 11, 11, 12, 5, 1, 2, 1, 22, 35, 18, 19, 33, 33, 18, 19, 17, 17, 1, 3, 5, 4, 19, 1, 19, 71, 1, 3, 19, 4, 5, 1, 71, 19, 1, 5, 1, 19, 5, 1, 71, 19, 1, 1, 3, 1, 19, 2, 5, 1, 5, 1, 19, 2, 4, 5, 1, 20, 1, 20]]
		}]
	};
	LevelBiolab1Resources = [new ig.Image('media/tiles/biolab.png'), new ig.Image('media/tiles/biolab.png')];
});

// biolab/levels/biolab2.js
ig.baked = true;
ig.module('biolab.levels.biolab2').requires('impact.image').defines(function () {
	LevelBiolab2 = {
		"entities": [{"type": "EntityPlayer", "x": 24, "y": 90}, {
			"type": "EntityGrunt",
			"x": 351,
			"y": 163
		}, {"type": "EntityGrunt", "x": 487, "y": 123}, {
			"type": "EntityGrunt",
			"x": 419,
			"y": 139
		}, {"type": "EntityTestTube", "x": 268, "y": 100}, {
			"type": "EntityRespawnPod",
			"x": 520,
			"y": 120
		}, {"type": "EntityBlob", "x": 695, "y": 163}, {
			"type": "EntitySpike",
			"x": 772,
			"y": 239
		}, {"type": "EntityGrunt", "x": 779, "y": 163}, {
			"type": "EntityGrunt",
			"x": 635,
			"y": 75
		}, {"type": "EntityTestTube", "x": 644, "y": 164}, {
			"type": "EntityGrunt",
			"x": 663,
			"y": 299
		}, {"type": "EntityTestTube", "x": 824, "y": 228}, {
			"type": "EntityMine",
			"x": 112,
			"y": 107
		}, {"type": "EntityCrate", "x": 228, "y": 96}, {
			"type": "EntityCrate",
			"x": 236,
			"y": 96
		}, {"type": "EntityCrate", "x": 232, "y": 88}, {
			"type": "EntityBlob",
			"x": 171,
			"y": 91
		}, {"type": "EntityGrunt", "x": 943, "y": 283}, {
			"type": "EntityGrunt",
			"x": 967,
			"y": 283
		}, {"type": "EntityTestTube", "x": 868, "y": 260}, {
			"type": "EntityTestTube",
			"x": 1284,
			"y": 188
		}, {"type": "EntityGrunt", "x": 1343, "y": 171}, {
			"type": "EntitySpike",
			"x": 1392,
			"y": 159
		}, {"type": "EntityRespawnPod", "x": 1256, "y": 272}, {
			"type": "EntitySpike",
			"x": 1144,
			"y": 263
		}, {"type": "EntityBlob", "x": 1207, "y": 299}, {
			"type": "EntityCrate",
			"x": 1236,
			"y": 304
		}, {"type": "EntityCrate", "x": 1232, "y": 296}, {
			"type": "EntityCrate",
			"x": 1228,
			"y": 304
		}, {"type": "EntityRespawnPod", "x": 1488, "y": 152}, {
			"type": "EntityDropper",
			"x": 1605,
			"y": 136
		}, {"type": "EntityDropper", "x": 1653, "y": 136}, {
			"type": "EntityDropper",
			"x": 1701,
			"y": 136
		}, {"type": "EntityCrate", "x": 824, "y": 304}, {
			"type": "EntityCrate",
			"x": 836,
			"y": 304
		}, {"type": "EntityCrate", "x": 844, "y": 304}, {
			"type": "EntityCrate",
			"x": 832,
			"y": 296
		}, {"type": "EntityCrate", "x": 844, "y": 296}, {
			"type": "EntityCrate",
			"x": 844,
			"y": 288
		}, {"type": "EntityCrate", "x": 852, "y": 304}, {
			"type": "EntityCrate",
			"x": 852,
			"y": 296
		}, {"type": "EntityRespawnPod", "x": 692, "y": 256}, {
			"type": "EntityLevelchange",
			"x": 2064,
			"y": 20,
			"settings": {"name": "nextLevel", "level": "biolab3"}
		}, {
			"type": "EntityTrigger",
			"x": 2032,
			"y": 8,
			"settings": {"size": {"x": 8, "y": 32}, "target": {"1": "nextLevel"}}
		}, {"type": "EntityBlob", "x": 1863, "y": 251}, {
			"type": "EntityRespawnPod",
			"x": 1880,
			"y": 296
		}, {"type": "EntityTestTube", "x": 1904, "y": 148}, {
			"type": "EntityTestTube",
			"x": 1800,
			"y": 300
		}, {"type": "EntityTestTube", "x": 1200, "y": 244}, {
			"type": "EntityDropper",
			"x": 1869,
			"y": 72
		}, {"type": "EntityRespawnPod", "x": 1832, "y": 96}, {
			"type": "EntityGrunt",
			"x": 2011,
			"y": 131
		}, {"type": "EntityGrunt", "x": 1683, "y": 59}, {
			"type": "EntitySpike",
			"x": 1976,
			"y": 39
		}, {"type": "EntitySpike", "x": 1960, "y": 207}, {
			"type": "EntityTestTube",
			"x": 736,
			"y": 116
		}, {"type": "EntityTestTube", "x": 1836, "y": 196}, {
			"type": "EntityCrate",
			"x": 1912,
			"y": 232
		}, {"type": "EntityCrate", "x": 1900, "y": 232}, {
			"type": "EntityCrate",
			"x": 1908,
			"y": 224
		}, {
			"type": "EntityTrigger",
			"x": 1296,
			"y": 300,
			"settings": {"size": {"x": 32, "y": 12}, "delay": 0, "checks": "both", "target": {"1": "kill1"}}
		}, {
			"type": "EntityTrigger",
			"x": 1384,
			"y": 292,
			"settings": {"size": {"x": 104, "y": 20}, "target": {"1": "kill1"}, "checks": "both", "delay": 0}
		}, {
			"type": "EntityHurt",
			"x": 1352,
			"y": 256,
			"settings": {"damage": 1000, "name": "kill1"}
		}, {
			"type": "EntityTrigger",
			"x": 1672,
			"y": 204,
			"settings": {"delay": 0, "checks": "both", "target": {"1": "kill2"}, "size": {"x": 24, "y": 28}}
		}, {
			"type": "EntityTrigger",
			"x": 1720,
			"y": 204,
			"settings": {"checks": "both", "target": {"1": "kill2"}, "delay": 0, "size": {"x": 40, "y": 28}}
		}, {"type": "EntityHurt", "x": 1704, "y": 168, "settings": {"damage": 1000, "name": "kill2"}}],
		"layer": [{
			"name": "background",
			"width": 87,
			"height": 20,
			"linkWithCollision": false,
			"visible": 1,
			"tilesetName": "media/tiles/biolab.png",
			"repeat": true,
			"distance": "2",
			"tilesize": 8,
			"foreground": false,
			"data": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 110, 107, 106, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 101, 97, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 110, 98, 100, 98, 109, 98, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 80, 80, 80, 80, 80, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 107, 105, 99, 100, 110, 0, 0, 0, 106, 102, 0, 0, 0, 0, 97, 98, 100], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 64, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0, 64, 0, 0, 0, 0, 0, 0, 80, 32, 80, 80, 32, 32, 80, 80, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 80, 80, 32, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 106, 107, 0, 0, 0, 107, 103, 105, 106, 0, 0, 100, 101, 109, 100], [0, 0, 32, 80, 80, 80, 32, 0, 0, 0, 0, 48, 0, 0, 0, 64, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 64, 98, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 107, 110, 0, 0, 0, 100, 97, 105], [0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 64, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 80, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 101, 97, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 106, 107], [0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 64, 0, 0, 80, 0, 80, 80, 0, 0, 0, 0, 80, 32, 80, 32, 80, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 98, 100, 109, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 110], [0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 80, 0, 0, 0, 0, 64, 64, 0, 0, 0, 0, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 110, 105, 98, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 107, 98, 100, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0], [0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 0, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 102, 98, 100, 103, 0, 0, 80, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 106, 100, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0], [0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 80, 80, 80, 80, 0, 0, 0, 0, 80, 0, 64, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 98, 100, 99, 102, 99, 0, 64, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 107, 100, 97, 48, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 80, 80, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 107, 106, 110, 102, 104, 110, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 110, 105, 101, 102, 48, 100, 0, 0, 0], [0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 106, 48, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0], [0, 0, 0, 0, 0, 32, 80, 80, 32, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 80, 32, 80, 32, 80, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 80, 80, 32, 0, 0, 0, 32, 80, 80, 80, 32, 0, 0, 0, 0, 0, 0, 110, 107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 98, 0, 0, 0, 0, 0, 0, 98, 0, 99, 0, 0, 0, 0, 0, 105, 109, 100, 101, 99, 99, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 80, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 98, 100, 102, 98, 109, 106, 107, 110, 0, 0, 0, 107, 100, 0, 80, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 110, 107, 98, 100, 102, 99, 102, 101, 0, 0, 0, 0, 100, 98, 109, 107, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 64, 64, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 80, 80, 80, 80, 80, 80, 32, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 107, 102, 0, 0, 0, 0, 0, 0, 0, 100, 102, 98, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 80, 80, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 110, 107, 98, 106, 0, 0, 0, 0]]
		}, {
			"name": "collision",
			"width": 256,
			"height": 40,
			"linkWithCollision": false,
			"visible": 0,
			"tilesetName": "media/tiles/collisiontiles-8x8.png",
			"repeat": false,
			"distance": "1",
			"tilesize": 8,
			"foreground": false,
			"data": [[1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
		}, {
			"name": "main",
			"width": 256,
			"height": 40,
			"linkWithCollision": true,
			"visible": 1,
			"tilesetName": "media/tiles/biolab.png",
			"repeat": false,
			"distance": "1",
			"tilesize": 8,
			"foreground": false,
			"data": [[2, 0, 0, 0, 0, 1, 78, 63, 78, 79, 78, 78, 77, 1, 1, 1, 1, 4, 1, 20, 5, 1, 1, 1, 4, 1, 1, 1, 1, 79, 56, 78, 77, 63, 55, 79, 1, 5, 1, 20, 19, 19, 3, 1, 5, 1, 71, 71, 1, 1, 20, 3, 1, 1, 20, 1, 4, 1, 2, 1, 5, 19, 1, 1, 3, 19, 1, 1, 1, 2, 2, 3, 1, 3, 1, 5, 4, 1, 5, 1, 3, 4, 5, 1, 3, 1, 60, 79, 57, 78, 77, 57, 78, 79, 78, 57, 78, 57, 77, 57, 57, 57, 79, 77, 79, 77, 78, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 53, 71, 20, 71, 53, 56, 19, 1, 3, 2, 4, 3, 1, 3, 1, 2, 4, 2, 3, 1, 3, 1, 7, 19, 19, 7, 3, 1, 3, 1, 4, 1, 2, 1, 4, 1, 1, 3, 1, 3, 2, 2, 4, 3, 2, 1, 4, 1, 1, 3, 1, 1, 3, 1], [1, 0, 0, 0, 0, 2, 60, 79, 59, 75, 58, 76, 78, 5, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 5, 3, 2, 3, 3, 77, 56, 79, 78, 77, 55, 78, 1, 21, 20, 3, 19, 19, 3, 2, 7, 1, 71, 71, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 19, 2, 1, 2, 19, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 61, 78, 63, 57, 78, 77, 77, 78, 77, 77, 77, 77, 57, 78, 79, 57, 77, 78, 77, 78, 77, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 70, 71, 5, 71, 70, 56, 19, 70, 54, 54, 70, 70, 70, 70, 70, 70, 54, 54, 70, 70, 70, 22, 26, 27, 27, 28, 22, 0, 0, 0, 71, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [7, 0, 0, 0, 0, 4, 59, 60, 62, 60, 62, 61, 59, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 47, 0, 20, 78, 56, 77, 79, 78, 55, 63, 4, 0, 0, 2, 19, 19, 3, 0, 0, 1, 71, 71, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 26, 27, 27, 27, 27, 27, 28, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 62, 57, 58, 79, 57, 63, 78, 76, 78, 57, 63, 78, 77, 57, 63, 57, 77, 78, 77, 63, 77, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 70, 71, 2, 71, 70, 56, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [23, 0, 0, 0, 0, 22, 4, 26, 27, 27, 27, 28, 5, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 77, 56, 60, 77, 57, 55, 78, 20, 0, 0, 22, 19, 19, 22, 0, 0, 1, 71, 71, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 61, 60, 59, 76, 58, 62, 60, 57, 60, 60, 59, 62, 58, 57, 58, 57, 63, 77, 78, 77, 79, 55, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 53, 53, 3, 53, 53, 56, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 57, 56, 57, 61, 60, 55, 58, 1, 0, 0, 26, 27, 27, 28, 0, 0, 4, 71, 71, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 59, 61, 60, 0, 0, 0, 58, 76, 61, 60, 59, 58, 60, 78, 77, 77, 77, 78, 55, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 66, 71, 3, 71, 66, 56, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 59, 18, 58, 60, 59, 18, 57, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 70, 70, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 60, 58, 77, 59, 78, 77, 60, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 70, 71, 2, 71, 70, 56, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 1], [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 69, 70, 69, 53, 69, 70, 69, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20, 1, 1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 59, 58, 60, 63, 78, 59, 55, 0, 0, 0, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 65, 71, 5, 71, 65, 56, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 71, 0, 0, 43, 43, 44, 44, 0, 0, 0, 42, 43, 44, 43, 0, 0, 0, 4, 20, 3], [25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 5, 34, 36, 36, 36, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 57, 74, 77, 78, 77, 76, 55, 0, 58, 62, 60, 62, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 77, 77, 77, 77, 78, 77, 77, 77, 78, 78, 77, 77, 77, 77, 77, 78, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 53, 71, 3, 71, 53, 56, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 71, 0, 0, 46, 0, 0, 46, 0, 0, 0, 46, 0, 0, 46, 0, 0, 0, 3, 55, 2], [25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 47, 0, 3, 53, 53, 53, 53, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 60, 63, 77, 79, 78, 55, 0, 0, 63, 59, 61, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 77, 78, 77, 78, 77, 77, 78, 77, 77, 63, 78, 77, 78, 63, 78, 63, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 19, 0, 0, 0, 19, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 65, 71, 20, 71, 65, 56, 19, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 43, 44, 0, 0, 0, 42, 43, 42, 44, 0, 0, 0, 0, 10, 11, 11, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 55, 3], [41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1, 1, 20, 1, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 57, 78, 77, 77, 77, 55, 62, 0, 0, 63, 79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 78, 77, 78, 77, 77, 78, 77, 78, 77, 63, 78, 77, 77, 77, 78, 77, 77, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 19, 70, 70, 70, 19, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 53, 53, 3, 53, 53, 56, 19, 5, 2, 4, 8, 0, 0, 0, 0, 46, 0, 0, 46, 0, 0, 0, 46, 0, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 55, 2], [22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 58, 79, 77, 78, 63, 55, 63, 79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 77, 77, 78, 77, 77, 78, 63, 78, 77, 77, 78, 78, 77, 78, 63, 78, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 19, 65, 65, 65, 19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 56, 66, 71, 2, 71, 66, 56, 19, 70, 70, 70, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 55, 3], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 60, 60, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 62, 76, 59, 60, 78, 55, 60, 73, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 70, 70, 70, 70, 70, 70, 69, 70, 70, 70, 70, 69, 70, 70, 70, 70, 69, 4, 69, 70, 70, 70, 66, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 66, 70, 69, 4, 19, 33, 18, 17, 19, 4, 69, 70, 70, 70, 70, 70, 70, 70, 70, 69, 4, 56, 70, 71, 4, 71, 70, 56, 4, 35, 35, 35, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 55, 2], [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 76, 74, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 61, 57, 76, 78, 77, 55, 62, 61, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 78, 77, 78, 77, 77, 77, 77, 77, 78, 77, 77, 63, 77, 79, 77, 79, 73, 1, 69, 54, 54, 54, 54, 69, 54, 54, 54, 54, 69, 54, 54, 54, 54, 69, 54, 54, 69, 20, 19, 54, 54, 54, 19, 3, 69, 54, 54, 69, 54, 54, 69, 54, 54, 69, 3, 56, 70, 71, 3, 71, 70, 56, 1, 71, 53, 71, 19, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 55, 2], [5, 1, 7, 6, 4, 5, 7, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 1, 2, 0, 0, 0, 0, 22, 1, 20, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 63, 78, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 57, 74, 77, 78, 77, 79, 55, 62, 57, 79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 77, 77, 77, 78, 77, 78, 63, 63, 78, 77, 77, 63, 77, 63, 76, 62, 1, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 19, 33, 17, 18, 19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 56, 68, 71, 5, 71, 68, 56, 5, 71, 18, 4, 19, 23, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 55, 3], [60, 58, 62, 59, 60, 58, 61, 62, 3, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 3, 53, 53, 3, 0, 0, 0, 0, 3, 19, 18, 7, 1, 20, 1, 3, 1, 3, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 11, 11, 11, 11, 11, 11, 12, 77, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 76, 57, 59, 77, 63, 61, 55, 58, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 61, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 78, 77, 77, 77, 78, 77, 77, 78, 77, 63, 74, 79, 76, 79, 59, 60, 1, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 26, 27, 27, 27, 28, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 56, 3, 1, 2, 1, 5, 56, 1, 3, 2, 1, 4, 1, 5, 1, 2, 3, 3, 7, 3, 4, 2, 3, 2, 4, 3, 3, 1, 7, 4, 3, 3, 1, 23, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 3], [57, 76, 77, 74, 59, 57, 76, 77, 19, 59, 58, 71, 62, 71, 59, 71, 58, 71, 60, 61, 19, 35, 35, 7, 0, 0, 0, 0, 7, 19, 17, 5, 4, 1, 20, 18, 33, 33, 4, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 1, 7, 5, 1, 19, 18, 78, 75, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 59, 77, 78, 59, 60, 55, 63, 77, 78, 77, 78, 77, 77, 77, 79, 0, 0, 0, 0, 0, 79, 63, 62, 0, 0, 78, 0, 79, 0, 79, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 77, 76, 79, 77, 77, 78, 63, 77, 63, 63, 77, 73, 60, 62, 58, 61, 5, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 18, 6, 54, 54, 54, 6, 18, 6, 54, 54, 54, 71, 53, 70, 53, 65, 53, 68, 70, 68, 70, 70, 70, 70, 70, 70, 53, 70, 66, 70, 70, 70, 53, 70, 1, 19, 0, 0, 0, 0, 0, 42, 43, 44, 43, 44, 0, 0, 0, 0, 0, 0, 3, 70, 3], [77, 77, 57, 77, 60, 77, 77, 79, 19, 59, 73, 71, 57, 71, 63, 71, 75, 71, 57, 63, 19, 17, 17, 22, 0, 0, 0, 0, 22, 26, 27, 28, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 18, 2, 17, 71, 5, 19, 4, 60, 78, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 43, 44, 0, 0, 0, 0, 0, 0, 0, 57, 61, 63, 77, 77, 76, 55, 62, 61, 77, 77, 78, 77, 77, 63, 73, 63, 77, 77, 76, 63, 75, 62, 58, 79, 77, 77, 63, 73, 63, 61, 75, 79, 77, 63, 77, 78, 77, 77, 77, 78, 77, 78, 77, 79, 63, 61, 59, 75, 58, 79, 77, 78, 77, 63, 77, 79, 75, 58, 59, 61, 60, 1, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 12, 0, 0, 0, 10, 11, 12, 0, 0, 0, 10, 11, 12, 1, 1, 3, 2, 4, 5, 1, 3, 2, 4, 3, 1, 5, 5, 4, 1, 3, 1, 2, 3, 2, 22, 0, 0, 0, 0, 0, 46, 0, 46, 0, 46, 0, 0, 0, 0, 0, 0, 1, 20, 5], [77, 77, 77, 77, 78, 77, 77, 77, 19, 77, 58, 34, 33, 33, 33, 33, 33, 34, 77, 78, 19, 56, 18, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 45, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 2, 2, 3, 5, 4, 2, 20, 2, 7, 7, 1, 23, 1, 4, 71, 55, 4, 56, 58, 63, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 46, 0, 0, 0, 0, 0, 0, 0, 58, 58, 60, 78, 77, 78, 55, 60, 63, 77, 61, 62, 74, 78, 75, 57, 79, 79, 78, 79, 61, 59, 60, 57, 74, 79, 78, 79, 62, 60, 59, 57, 58, 74, 79, 78, 77, 78, 79, 63, 77, 78, 63, 77, 73, 59, 60, 62, 58, 57, 74, 79, 78, 78, 77, 78, 57, 58, 1, 26, 27, 27, 28, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 47, 0, 0, 0, 0, 0, 0, 0, 0, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 2], [77, 63, 77, 63, 77, 63, 79, 77, 19, 78, 77, 58, 53, 53, 53, 53, 53, 57, 57, 77, 19, 56, 55, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 33, 33, 33, 33, 33, 19, 33, 33, 33, 33, 33, 33, 33, 33, 19, 71, 55, 8, 56, 60, 76, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 59, 61, 79, 77, 79, 55, 77, 78, 79, 63, 60, 79, 77, 78, 53, 53, 65, 65, 68, 65, 70, 65, 53, 65, 65, 65, 70, 65, 53, 65, 65, 53, 65, 65, 65, 68, 65, 65, 53, 65, 65, 70, 65, 65, 68, 65, 65, 53, 65, 65, 68, 65, 65, 70, 53, 20, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 11, 11, 12], [77, 77, 63, 77, 78, 77, 77, 77, 19, 77, 77, 59, 60, 77, 77, 61, 77, 77, 78, 78, 19, 56, 55, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 43, 44, 42, 43, 0, 0, 0, 0, 5, 60, 59, 58, 77, 79, 19, 63, 60, 79, 59, 62, 57, 58, 76, 19, 71, 55, 24, 56, 58, 59, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 57, 78, 77, 78, 59, 55, 62, 77, 77, 77, 63, 77, 77, 77, 71, 71, 78, 77, 77, 77, 77, 78, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 78, 77, 77, 78, 77, 77, 77, 77, 78, 77, 78, 77, 77, 77, 77, 78, 77, 63, 59, 74, 79, 78, 71, 71, 1, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 55, 2], [77, 63, 77, 77, 63, 63, 77, 77, 19, 77, 78, 77, 77, 78, 77, 59, 77, 78, 77, 77, 19, 56, 55, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 62, 57, 74, 79, 77, 19, 77, 77, 78, 77, 78, 63, 79, 77, 19, 71, 55, 24, 56, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 79, 63, 78, 60, 61, 55, 63, 77, 63, 77, 78, 77, 57, 77, 71, 71, 79, 78, 78, 77, 63, 77, 77, 63, 77, 78, 77, 79, 57, 60, 61, 74, 63, 77, 77, 78, 77, 77, 78, 79, 59, 60, 79, 77, 77, 77, 78, 77, 77, 78, 61, 60, 57, 78, 77, 71, 71, 5, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 11, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 55, 3], [70, 70, 70, 70, 70, 70, 70, 70, 4, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 4, 5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 79, 77, 78, 78, 77, 19, 77, 79, 77, 79, 77, 78, 77, 78, 19, 71, 55, 24, 56, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 57, 59, 62, 77, 77, 63, 62, 55, 77, 78, 79, 77, 78, 77, 77, 78, 71, 71, 77, 63, 77, 63, 77, 78, 77, 77, 77, 77, 77, 77, 79, 59, 58, 79, 77, 78, 77, 77, 77, 78, 77, 60, 61, 58, 76, 77, 78, 77, 63, 78, 77, 63, 79, 58, 78, 77, 78, 71, 71, 4, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 43, 42, 43, 42, 0, 0, 0, 10, 11, 11, 11, 11, 11, 11, 11, 11, 12, 1, 2, 3, 2, 7, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 6, 0, 0, 0, 0, 0, 0, 0, 44, 43, 44, 0, 0, 0, 0, 0, 0, 1, 55, 5], [77, 77, 77, 77, 78, 77, 63, 77, 60, 78, 77, 63, 77, 61, 78, 78, 77, 58, 77, 75, 60, 56, 55, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 3, 7, 2, 5, 20, 3, 1, 3, 1, 20, 1, 7, 1, 5, 1, 3, 20, 7, 23, 77, 79, 77, 77, 78, 19, 77, 77, 78, 77, 78, 79, 75, 6, 19, 71, 55, 40, 56, 59, 10, 11, 11, 11, 11, 11, 11, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 60, 57, 61, 59, 76, 77, 78, 79, 75, 74, 55, 60, 77, 78, 77, 77, 63, 73, 79, 71, 71, 78, 77, 78, 79, 77, 77, 75, 73, 63, 77, 77, 77, 77, 77, 77, 63, 77, 63, 77, 78, 76, 77, 77, 77, 77, 77, 79, 77, 77, 78, 77, 77, 78, 77, 77, 59, 59, 60, 4, 21, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 46, 0, 0, 46, 0, 0, 0, 6, 19, 70, 53, 70, 19, 1, 4, 77, 78, 77, 77, 78, 77, 77, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 19, 0, 0, 0, 0, 0, 0, 0, 46, 0, 46, 0, 0, 0, 0, 0, 0, 4, 55, 2], [63, 77, 77, 77, 77, 78, 77, 77, 79, 77, 78, 59, 78, 78, 63, 77, 77, 63, 60, 59, 61, 56, 55, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 70, 70, 70, 70, 70, 70, 70, 70, 2, 4, 5, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 2, 4, 3, 70, 70, 70, 70, 70, 70, 3, 4, 2, 55, 19, 56, 76, 62, 61, 79, 19, 57, 58, 46, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 59, 58, 60, 61, 58, 59, 61, 60, 61, 60, 4, 61, 63, 77, 77, 75, 59, 61, 78, 71, 71, 77, 78, 77, 78, 77, 79, 58, 62, 59, 60, 59, 60, 59, 60, 59, 57, 58, 77, 79, 58, 63, 77, 78, 58, 79, 57, 59, 60, 59, 63, 58, 79, 58, 59, 59, 60, 0, 0, 19, 71, 71, 19, 0, 0, 0, 0, 0, 0, 0, 6, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 27, 28, 1, 1, 1, 20, 19, 77, 63, 62, 60, 59, 79, 78, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3], [77, 77, 77, 63, 77, 78, 77, 77, 77, 77, 78, 60, 77, 77, 59, 77, 77, 78, 57, 62, 76, 56, 55, 5, 1, 10, 11, 11, 11, 12, 20, 7, 3, 10, 11, 11, 11, 12, 7, 3, 79, 77, 77, 76, 79, 58, 60, 59, 78, 78, 19, 78, 77, 77, 78, 77, 77, 78, 78, 77, 78, 77, 77, 77, 78, 19, 78, 77, 77, 63, 77, 58, 60, 22, 19, 71, 55, 8, 56, 77, 77, 76, 77, 19, 63, 61, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 61, 57, 0, 0, 62, 61, 55, 62, 74, 63, 78, 60, 62, 60, 78, 71, 71, 63, 59, 79, 77, 77, 78, 79, 60, 63, 60, 0, 0, 0, 0, 0, 58, 59, 60, 58, 59, 59, 60, 59, 58, 59, 70, 54, 54, 70, 60, 59, 60, 58, 59, 0, 0, 0, 0, 19, 71, 71, 19, 0, 0, 0, 0, 0, 0, 0, 2, 19, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 0, 46, 0, 1, 19, 77, 78, 77, 78, 60, 77, 77, 3, 1, 2, 7, 1, 2, 1, 4, 3, 1, 3, 4, 1, 6, 0, 0, 0, 10, 11, 12, 0, 0, 0, 0, 0, 6, 2, 7, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 11, 11, 12], [63, 77, 77, 77, 78, 78, 63, 78, 77, 79, 77, 77, 63, 78, 77, 78, 63, 77, 77, 78, 57, 56, 55, 59, 57, 33, 33, 33, 33, 60, 57, 4, 60, 33, 33, 33, 33, 20, 23, 20, 77, 60, 62, 58, 74, 79, 61, 78, 77, 77, 19, 77, 78, 77, 77, 63, 79, 73, 63, 77, 63, 77, 78, 77, 77, 19, 77, 78, 79, 79, 73, 63, 59, 57, 19, 71, 55, 24, 56, 74, 79, 78, 78, 19, 63, 57, 0, 0, 0, 0, 0, 44, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 5, 55, 60, 61, 60, 78, 79, 58, 77, 78, 71, 71, 62, 61, 60, 63, 62, 77, 78, 77, 78, 60, 9, 0, 0, 0, 0, 0, 0, 59, 59, 60, 57, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 71, 71, 4, 3, 6, 3, 2, 5, 3, 5, 20, 19, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 19, 77, 62, 77, 78, 77, 78, 78, 77, 77, 78, 63, 79, 77, 77, 19, 78, 77, 78, 79, 63, 7, 82, 81, 82, 7, 19, 3, 82, 81, 82, 82, 81, 3, 70, 70, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3], [77, 77, 77, 63, 78, 77, 77, 77, 77, 77, 78, 78, 78, 61, 57, 77, 77, 77, 78, 77, 8, 56, 55, 8, 58, 62, 76, 77, 60, 59, 74, 19, 62, 77, 77, 79, 57, 76, 63, 77, 78, 77, 59, 57, 63, 63, 77, 77, 77, 78, 19, 77, 77, 79, 75, 57, 61, 60, 74, 77, 75, 62, 77, 79, 77, 19, 78, 77, 77, 62, 58, 74, 79, 78, 19, 71, 55, 24, 56, 8, 78, 78, 77, 19, 61, 57, 0, 0, 0, 0, 0, 46, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 6, 4, 65, 68, 65, 68, 65, 65, 65, 68, 65, 65, 68, 65, 68, 65, 65, 65, 68, 65, 2, 5, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 71, 71, 19, 70, 5, 70, 70, 3, 70, 70, 70, 19, 5, 3, 20, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 77, 59, 78, 79, 77, 77, 62, 77, 63, 60, 59, 60, 59, 77, 19, 63, 78, 77, 63, 4, 3, 89, 90, 89, 3, 19, 1, 90, 89, 89, 90, 89, 2, 4, 71, 19, 0, 0, 0, 0, 42, 43, 43, 44, 0, 0, 0, 3, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 55, 21], [77, 63, 78, 77, 78, 63, 77, 63, 77, 78, 63, 77, 77, 78, 78, 77, 61, 78, 63, 77, 24, 56, 55, 24, 60, 61, 79, 77, 77, 63, 79, 19, 78, 78, 63, 75, 61, 79, 77, 78, 77, 78, 77, 73, 77, 77, 77, 78, 77, 77, 19, 77, 78, 77, 58, 62, 60, 58, 79, 77, 61, 60, 76, 78, 77, 19, 77, 77, 58, 59, 62, 77, 78, 63, 19, 71, 55, 24, 56, 24, 77, 77, 78, 19, 79, 76, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 2, 3, 70, 70, 70, 70, 70, 66, 70, 70, 70, 70, 66, 70, 70, 70, 70, 66, 70, 70, 3, 4, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 71, 71, 19, 53, 53, 70, 69, 5, 69, 53, 53, 19, 53, 3, 70, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 19, 78, 62, 62, 77, 77, 77, 60, 59, 77, 77, 78, 77, 79, 77, 19, 77, 79, 77, 77, 56, 7, 90, 89, 90, 7, 19, 3, 90, 90, 90, 89, 90, 7, 55, 71, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 0, 0, 0, 0, 0, 0, 0, 42, 43, 44, 43, 0, 0, 0, 0, 0, 5, 55, 3], [77, 78, 77, 78, 77, 63, 77, 77, 77, 78, 77, 77, 79, 78, 77, 63, 63, 77, 78, 78, 24, 56, 55, 24, 61, 57, 63, 77, 77, 77, 77, 19, 77, 77, 79, 62, 60, 59, 77, 77, 78, 77, 77, 77, 78, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 79, 77, 76, 77, 77, 58, 59, 79, 77, 77, 19, 77, 78, 63, 60, 76, 77, 79, 77, 19, 71, 55, 24, 56, 24, 78, 63, 79, 19, 63, 61, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 41, 4, 59, 60, 0, 0, 60, 59, 78, 59, 78, 63, 78, 77, 58, 79, 78, 77, 78, 77, 79, 78, 60, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 5, 1, 3, 5, 2, 26, 27, 27, 28, 2, 5, 4, 4, 1, 3, 2, 0, 0, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 77, 77, 77, 77, 60, 77, 78, 60, 77, 78, 62, 60, 77, 78, 19, 63, 77, 78, 77, 56, 3, 90, 89, 90, 1, 19, 1, 90, 89, 90, 90, 89, 1, 55, 53, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 22, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 46, 0, 0, 0, 0, 0, 4, 55, 70], [77, 77, 77, 77, 77, 78, 78, 77, 77, 77, 79, 77, 77, 63, 77, 77, 77, 77, 77, 77, 24, 56, 55, 24, 59, 59, 57, 77, 77, 79, 63, 19, 78, 77, 77, 58, 57, 63, 77, 77, 77, 78, 77, 77, 77, 77, 77, 77, 77, 77, 19, 61, 79, 77, 78, 77, 78, 77, 63, 79, 77, 78, 77, 77, 78, 19, 78, 77, 77, 63, 78, 79, 77, 78, 19, 71, 55, 24, 56, 40, 77, 78, 63, 19, 77, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 59, 59, 0, 0, 0, 0, 0, 60, 59, 77, 79, 78, 77, 57, 63, 75, 58, 57, 77, 78, 60, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 47, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 47, 0, 0, 0, 45, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 19, 77, 79, 77, 60, 59, 60, 77, 77, 79, 60, 59, 78, 77, 77, 19, 77, 77, 63, 77, 56, 1, 2, 1, 1, 4, 19, 4, 7, 7, 2, 1, 1, 4, 55, 71, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 55, 3], [77, 77, 63, 78, 78, 78, 77, 78, 63, 78, 77, 63, 63, 77, 63, 77, 63, 77, 77, 79, 24, 56, 55, 24, 57, 79, 63, 77, 77, 63, 75, 19, 77, 77, 78, 77, 77, 78, 77, 77, 77, 77, 77, 77, 77, 77, 78, 77, 77, 77, 19, 60, 59, 77, 78, 77, 77, 78, 77, 77, 78, 77, 77, 78, 77, 19, 77, 77, 78, 77, 77, 77, 77, 6, 19, 71, 55, 40, 56, 60, 62, 77, 78, 60, 62, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 57, 59, 58, 59, 58, 60, 59, 60, 0, 0, 0, 0, 0, 0, 0, 59, 60, 61, 60, 59, 59, 61, 59, 59, 60, 59, 60, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 77, 77, 79, 77, 78, 77, 77, 78, 77, 78, 77, 77, 63, 77, 19, 77, 78, 77, 77, 56, 71, 70, 70, 70, 71, 19, 71, 70, 70, 70, 70, 70, 71, 55, 53, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 11, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 55, 2], [77, 77, 77, 77, 77, 77, 78, 77, 77, 77, 78, 77, 77, 78, 77, 77, 78, 78, 77, 78, 40, 56, 55, 40, 61, 60, 77, 77, 77, 79, 62, 4, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 5, 4, 3, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 3, 4, 5, 70, 70, 70, 70, 70, 70, 2, 4, 5, 55, 19, 56, 62, 63, 78, 59, 19, 63, 59, 0, 0, 0, 0, 0, 0, 0, 0, 61, 62, 61, 58, 62, 58, 59, 76, 79, 77, 78, 78, 75, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 61, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 43, 43, 0, 0, 0, 1, 19, 63, 77, 77, 78, 77, 63, 77, 79, 77, 77, 63, 77, 77, 77, 19, 79, 77, 63, 77, 56, 71, 78, 77, 78, 71, 19, 71, 77, 78, 77, 78, 77, 71, 55, 71, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 55, 5], [77, 77, 78, 78, 77, 63, 77, 77, 78, 77, 77, 77, 77, 78, 78, 77, 77, 77, 78, 77, 77, 56, 55, 57, 58, 62, 77, 77, 77, 77, 57, 59, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 78, 77, 77, 77, 63, 79, 22, 19, 71, 55, 19, 56, 76, 78, 79, 76, 19, 78, 58, 0, 0, 0, 0, 0, 0, 0, 0, 57, 58, 59, 61, 57, 76, 79, 77, 78, 77, 79, 77, 78, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 46, 0, 0, 0, 4, 20, 4, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 4, 20, 4, 70, 70, 70, 70, 70, 70, 70, 70, 4, 20, 4, 70, 70, 70, 70, 70, 70, 70, 4, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 55, 3], [77, 77, 78, 77, 78, 77, 77, 78, 77, 77, 77, 77, 78, 78, 77, 63, 77, 77, 77, 77, 63, 56, 55, 60, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 63, 77, 77, 59, 79, 19, 71, 55, 19, 56, 77, 78, 77, 75, 19, 62, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 59, 59, 79, 77, 59, 61, 75, 59, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 77, 78, 77, 77, 77, 77, 77, 77, 77, 77, 77, 63, 77, 77, 19, 77, 77, 77, 77, 56, 77, 79, 77, 77, 77, 19, 79, 78, 78, 77, 79, 78, 78, 55, 63, 4, 5, 3, 20, 3, 0, 0, 0, 5, 3, 1, 5, 4, 1, 0, 0, 0, 0, 0, 43, 42, 42, 0, 0, 0, 0, 0, 0, 0, 0, 7, 4, 3], [77, 77, 78, 77, 63, 77, 77, 63, 77, 78, 77, 63, 77, 77, 77, 77, 77, 63, 63, 77, 77, 56, 55, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 78, 77, 63, 77, 78, 77, 61, 60, 19, 71, 55, 8, 56, 78, 77, 59, 58, 10, 11, 11, 11, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 59, 10, 11, 11, 11, 11, 11, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 43, 43, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 44, 42, 43, 0, 0, 0, 0, 0, 0, 0, 1, 19, 77, 77, 63, 77, 77, 78, 77, 77, 77, 63, 77, 77, 77, 77, 19, 77, 79, 77, 78, 56, 77, 78, 77, 63, 77, 19, 77, 78, 77, 79, 63, 77, 78, 55, 57, 1, 3, 1, 5, 22, 0, 0, 0, 22, 1, 20, 1, 3, 20, 0, 0, 0, 0, 0, 46, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5], [77, 77, 77, 77, 77, 63, 78, 63, 77, 77, 63, 77, 77, 77, 78, 78, 63, 77, 77, 77, 77, 56, 55, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 78, 77, 79, 77, 62, 19, 71, 55, 24, 56, 79, 74, 57, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 21, 3, 4, 5, 7, 6, 0, 0, 0, 46, 0, 46, 0, 0, 0, 0, 0, 0, 0, 20, 19, 77, 77, 63, 59, 58, 79, 79, 78, 77, 77, 77, 78, 77, 63, 19, 77, 78, 77, 77, 56, 77, 77, 77, 77, 77, 19, 78, 77, 79, 78, 77, 77, 63, 55, 78, 4, 0, 0, 71, 0, 0, 0, 0, 0, 47, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 55, 21], [77, 77, 77, 77, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 77, 77, 77, 63, 77, 63, 56, 55, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 63, 77, 77, 63, 77, 57, 58, 19, 71, 55, 24, 56, 78, 62, 60, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 11, 11, 11, 12, 0, 0, 0, 0, 3, 58, 61, 58, 59, 57, 4, 81, 82, 81, 81, 82, 81, 82, 81, 81, 82, 82, 81, 82, 4, 19, 79, 63, 57, 59, 60, 62, 77, 77, 77, 63, 77, 77, 77, 78, 19, 77, 77, 77, 77, 56, 77, 77, 77, 78, 77, 19, 77, 63, 78, 77, 77, 75, 77, 55, 57, 1, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 3, 1, 4, 55, 3], [77, 77, 77, 78, 77, 77, 77, 77, 77, 63, 77, 77, 77, 77, 63, 77, 78, 77, 63, 77, 77, 56, 55, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 78, 77, 57, 79, 61, 19, 71, 55, 24, 56, 77, 79, 57, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 62, 60, 59, 59, 58, 62, 59, 60, 60, 59, 62, 57, 59, 0, 0, 0, 0, 0, 0, 58, 61, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 19, 59, 76, 19, 4, 81, 82, 82, 81, 2, 74, 62, 59, 57, 58, 2, 89, 90, 90, 89, 89, 90, 90, 90, 89, 89, 90, 90, 90, 2, 19, 77, 77, 78, 79, 61, 76, 77, 77, 78, 78, 77, 63, 77, 77, 19, 77, 79, 78, 63, 56, 77, 63, 77, 78, 77, 19, 77, 78, 77, 63, 60, 74, 59, 55, 59, 2, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 53, 19, 53, 53, 55, 2], [77, 78, 77, 78, 77, 77, 77, 77, 78, 78, 77, 77, 63, 77, 77, 77, 77, 77, 77, 78, 77, 56, 55, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 63, 77, 77, 63, 63, 62, 60, 19, 71, 55, 40, 56, 77, 75, 60, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 60, 61, 62, 60, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 59, 76, 62, 63, 58, 78, 58, 62, 58, 76, 79, 62, 57, 0, 0, 0, 0, 0, 0, 62, 61, 61, 60, 0, 0, 0, 0, 0, 58, 62, 61, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 19, 74, 58, 19, 2, 89, 90, 89, 90, 3, 78, 61, 76, 79, 78, 3, 90, 90, 89, 89, 89, 89, 89, 89, 89, 90, 90, 90, 89, 7, 19, 77, 77, 77, 77, 77, 79, 77, 77, 77, 63, 77, 77, 78, 77, 19, 77, 77, 77, 77, 56, 77, 78, 77, 77, 77, 19, 77, 77, 75, 59, 78, 58, 76, 55, 62, 1, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 68, 19, 68, 68, 55, 3], [77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 78, 77, 77, 77, 77, 63, 77, 77, 77, 77, 77, 56, 55, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 19, 77, 77, 77, 77, 77, 77, 77, 58, 19, 71, 55, 19, 56, 79, 79, 57, 60, 57, 60, 57, 59, 58, 60, 57, 60, 60, 57, 59, 60, 58, 79, 57, 60, 58, 60, 60, 10, 11, 11, 11, 11, 11, 11, 12, 60, 57, 58, 59, 57, 62, 78, 79, 78, 77, 78, 77, 78, 78, 79, 77, 75, 57, 60, 58, 57, 60, 58, 59, 60, 57, 58, 57, 60, 59, 58, 58, 59, 60, 58, 60, 58, 59, 58, 60, 58, 57, 58, 59, 58, 60, 5, 19, 75, 78, 19, 1, 3, 7, 2, 3, 7, 59, 63, 79, 75, 59, 1, 2, 1, 20, 1, 3, 7, 1, 3, 1, 2, 7, 20, 3, 1, 19, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 77, 77, 63, 77, 19, 77, 77, 77, 77, 56, 77, 77, 77, 77, 77, 19, 78, 79, 59, 76, 59, 60, 62, 55, 62, 20, 3, 1, 4, 1, 3, 1, 20, 3, 2, 1, 1, 4, 20, 3, 1, 4, 20, 1, 2, 5, 3, 1, 4, 1, 3, 1, 70, 19, 70, 70, 55, 21]]
		}]
	};
	LevelBiolab2Resources = [new ig.Image('media/tiles/biolab.png'), new ig.Image('media/tiles/biolab.png')];
});

// biolab/levels/biolab3.js
ig.baked = true;
ig.module('biolab.levels.biolab3').requires('impact.image', 'biolab.entities.respawn-pod', 'biolab.entities.endhub', 'biolab.entities.void', 'biolab.entities.crate', 'biolab.entities.player', 'biolab.entities.grunt', 'biolab.entities.test-tube', 'biolab.entities.spewer', 'biolab.entities.blob', 'biolab.entities.spike', 'biolab.entities.trigger', 'biolab.entities.dropper', 'biolab.entities.glass-dome', 'biolab.entities.earthquake', 'biolab.entities.delay', 'biolab.entities.mover', 'biolab.entities.hurt').defines(function () {
	LevelBiolab3 = {
		"entities": [{"type": "EntityRespawnPod", "x": 468, "y": 208}, {
			"type": "EntityEndhub",
			"x": 1916,
			"y": 152,
			"settings": {"name": "endHub"}
		}, {"type": "EntityRespawnPod", "x": 1324, "y": 160}, {
			"type": "EntityRespawnPod",
			"x": 960,
			"y": 96
		}, {"type": "EntityVoid", "x": 416, "y": 240, "settings": {"name": "m2t2"}}, {
			"type": "EntityVoid",
			"x": 248,
			"y": 304,
			"settings": {"name": "m1t2"}
		}, {"type": "EntityCrate", "x": 208, "y": 304}, {
			"type": "EntityPlayer",
			"x": 24,
			"y": 282
		}, {"type": "EntityCrate", "x": 224, "y": 304}, {
			"type": "EntityGrunt",
			"x": 195,
			"y": 299
		}, {"type": "EntityGrunt", "x": 303, "y": 227}, {
			"type": "EntityVoid",
			"x": 840,
			"y": 152,
			"settings": {"name": "m3t3"}
		}, {"type": "EntityVoid", "x": 504, "y": 224, "settings": {"name": "m3t1"}}, {
			"type": "EntityTestTube",
			"x": 372,
			"y": 228
		}, {"type": "EntityVoid", "x": 928, "y": 120, "settings": {"name": "m4t1"}}, {
			"type": "EntityGrunt",
			"x": 1107,
			"y": 115
		}, {"type": "EntitySpewer", "x": 1020, "y": 184}, {
			"type": "EntityVoid",
			"x": 1160,
			"y": 192,
			"settings": {"name": "m5t2"}
		}, {"type": "EntityGrunt", "x": 1227, "y": 275}, {
			"type": "EntitySpewer",
			"x": 1524,
			"y": 120
		}, {"type": "EntityBlob", "x": 1083, "y": 251}, {
			"type": "EntitySpike",
			"x": 1568,
			"y": 159
		}, {"type": "EntityGrunt", "x": 1419, "y": 139}, {
			"type": "EntityTestTube",
			"x": 1224,
			"y": 180
		}, {
			"type": "EntityTrigger",
			"x": 320,
			"y": 284,
			"settings": {"size": {"x": 112, "y": 20}, "checks": "both", "target": {"1": "kill"}, "delay": 0}
		}, {
			"type": "EntityTrigger",
			"x": 736,
			"y": 284,
			"settings": {"size": {"x": 208, "y": 20}, "target": {"1": "kill"}, "delay": 0, "checks": "both"}
		}, {"type": "EntityDropper", "x": 1105, "y": 232}, {
			"type": "EntityGlassDome",
			"x": 1908,
			"y": 144
		}, {
			"type": "EntityEarthquake",
			"x": 2028,
			"y": 108,
			"settings": {"duration": 0.5, "strength": 10, "name": "quake1", "sound": 0}
		}, {
			"type": "EntityDelay",
			"x": 2012,
			"y": 96,
			"settings": {"name": "endDelay2", "target": {"1": "quake1"}, "delay": 3.4}
		}, {
			"type": "EntityEarthquake",
			"x": 2028,
			"y": 144,
			"settings": {"name": "quake2", "duration": 20, "strength": 5, "sound": 0}
		}, {
			"type": "EntityDelay",
			"x": 2012,
			"y": 184,
			"settings": {"name": "stage4", "target": {"1": "endHub"}, "delay": 17}
		}, {
			"type": "EntityMover",
			"x": 1152,
			"y": 160,
			"settings": {"target": {"1": "m5t1", "2": "m5t2"}}
		}, {"type": "EntityVoid", "x": 888, "y": 152, "settings": {"name": "m3t4"}}, {
			"type": "EntityTestTube",
			"x": 1004,
			"y": 180
		}, {"type": "EntityVoid", "x": 504, "y": 248, "settings": {"name": "m3t6"}}, {
			"type": "EntityVoid",
			"x": 1160,
			"y": 128,
			"settings": {"name": "m5t1"}
		}, {
			"type": "EntityMover",
			"x": 832,
			"y": 184,
			"settings": {"target": {"1": "m3t3", "2": "m3t4", "3": "m3t5", "4": "m3t6", "5": "m3t1", "6": "m3t2"}}
		}, {"type": "EntityDropper", "x": 1129, "y": 232}, {
			"type": "EntityMover",
			"x": 496,
			"y": 240,
			"settings": {"target": {"1": "m3t1", "2": "m3t2", "3": "m3t3", "4": "m3t4", "5": "m3t5", "6": "m3t6"}}
		}, {"type": "EntityVoid", "x": 888, "y": 248, "settings": {"name": "m3t5"}}, {
			"type": "EntityCrate",
			"x": 256,
			"y": 264
		}, {"type": "EntitySpike", "x": 1500, "y": 159}, {
			"type": "EntityBlob",
			"x": 703,
			"y": 187
		}, {"type": "EntityGrunt", "x": 1663, "y": 155}, {
			"type": "EntityVoid",
			"x": 840,
			"y": 224,
			"settings": {"name": "m3t2"}
		}, {"type": "EntityGrunt", "x": 1463, "y": 139}, {
			"type": "EntityMover",
			"x": 696,
			"y": 224,
			"settings": {"target": {"1": "m3t2", "2": "m3t3", "3": "m3t4", "4": "m3t5", "5": "m3t6", "6": "m3t1"}}
		}, {"type": "EntityTestTube", "x": 720, "y": 268}, {
			"type": "EntityMover",
			"x": 364,
			"y": 240,
			"settings": {"target": {"1": "m2t1", "2": "m2t2"}}
		}, {
			"type": "EntityTrigger",
			"x": 496,
			"y": 284,
			"settings": {"size": {"x": 152, "y": 20}, "checks": "both", "target": {"1": "kill"}, "delay": 0}
		}, {"type": "EntityTestTube", "x": 704, "y": 268}, {
			"type": "EntityHurt",
			"x": 568,
			"y": 352,
			"settings": {"name": "kill", "damage": 1000}
		}, {"type": "EntityVoid", "x": 328, "y": 240, "settings": {"name": "m2t1"}}, {
			"type": "EntityMover",
			"x": 764,
			"y": 248,
			"settings": {"target": {"1": "m3t6", "2": "m3t1", "3": "m3t2", "4": "m3t3", "5": "m3t4", "6": "m3t5"}}
		}, {
			"type": "EntityMover",
			"x": 920,
			"y": 152,
			"settings": {"target": {"1": "m4t1", "2": "m4t2"}}
		}, {
			"type": "EntityTrigger",
			"x": 1920,
			"y": 156,
			"settings": {
				"name": "end",
				"target": {
					"1": "endHub",
					"2": "stage2",
					"3": "endDelay2",
					"4": "endDelay3",
					"5": "stage3",
					"6": "stage4"
				},
				"size": {"x": 16, "y": 20}
			}
		}, {
			"type": "EntityMover",
			"x": 240,
			"y": 272,
			"settings": {"target": {"1": "m1t1", "2": "m1t2"}}
		}, {
			"type": "EntityDelay",
			"x": 2012,
			"y": 160,
			"settings": {"name": "stage2", "target": {"1": "endHub"}, "delay": 1}
		}, {"type": "EntityVoid", "x": 928, "y": 184, "settings": {"name": "m4t2"}}, {
			"type": "EntityDelay",
			"x": 2012,
			"y": 132,
			"settings": {"name": "endDelay3", "target": {"1": "quake2"}, "delay": 5.9}
		}, {"type": "EntityVoid", "x": 248, "y": 240, "settings": {"name": "m1t1"}}, {
			"type": "EntityDelay",
			"x": 2012,
			"y": 172,
			"settings": {"name": "stage3", "target": {"1": "endHub"}, "delay": 13.7}
		}],
		"layer": [{
			"name": "background",
			"width": 30,
			"height": 20,
			"linkWithCollision": false,
			"visible": 0,
			"tilesetName": "media/tiles/biolab.png",
			"repeat": true,
			"preRender": false,
			"distance": "2",
			"tilesize": 8,
			"foreground": false,
			"data": [[0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 80, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 80, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 64, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 64, 0, 0, 0, 48, 0, 80, 0, 0, 0, 0, 64, 0, 0, 0, 64, 0, 0], [0, 48, 0, 0, 0, 0, 0, 32, 80, 32, 0, 0, 80, 0, 0, 0, 48, 0, 48, 0, 0, 0, 0, 80, 0, 0, 0, 64, 0, 0], [0, 48, 0, 0, 80, 32, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0, 48, 0, 48, 0, 0, 0, 0, 64, 0, 0, 0, 80, 0, 0], [0, 48, 0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 64, 0, 80, 0, 48, 0, 80, 0, 0, 32, 32, 80, 32, 32, 0, 0, 0, 0], [0, 48, 0, 0, 48, 48, 0, 0, 0, 80, 0, 0, 80, 0, 64, 0, 48, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 48, 48, 0, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 48, 48, 0, 0, 0, 64, 0, 0, 0, 0, 80, 0, 48, 0, 0, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 80, 32, 0, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 0, 0, 0, 80, 0, 0, 0, 80, 0, 0, 0, 0], [0, 48, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 32, 80, 32, 0, 0, 64, 0, 0, 0, 0, 64, 0, 48, 0, 32, 80, 32, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 80, 0, 0, 0, 0, 80, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 80, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0], [0, 48, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 48, 0, 0, 64, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0]]
		}, {
			"name": "collision",
			"width": 256,
			"height": 40,
			"linkWithCollision": false,
			"visible": 1,
			"tilesetName": "",
			"repeat": false,
			"preRender": false,
			"distance": "1",
			"tilesize": 8,
			"foreground": false,
			"data": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
		}, {
			"name": "main",
			"width": 256,
			"height": 40,
			"linkWithCollision": false,
			"visible": 1,
			"tilesetName": "media/tiles/biolab.png",
			"repeat": false,
			"preRender": false,
			"distance": "1",
			"tilesize": 8,
			"foreground": false,
			"data": [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 78, 77, 77, 77, 77, 77, 78, 77, 77, 78, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 63, 77, 71, 78, 1, 1, 1, 1, 1, 1, 1, 77, 70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 77, 77, 78, 78, 77, 77, 77, 78, 77, 77, 77, 78, 77, 77, 77, 77, 77, 78, 77, 77, 77, 78, 77, 77, 78, 77, 77, 77, 77, 77, 78, 77, 79, 77, 78, 63, 77, 63, 78, 79, 77, 77, 78, 77, 71, 79, 4, 0, 0, 0, 0, 0, 4, 78, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 78, 77, 78, 77, 77, 78, 77, 77, 78, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 78, 77, 77, 77, 77, 77, 77, 78, 63, 77, 77, 78, 78, 77, 77, 77, 76, 57, 58, 61, 74, 79, 63, 79, 71, 76, 19, 0, 0, 0, 0, 0, 19, 77, 71, 77, 77, 77, 77, 77, 77, 77, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 78, 77, 77, 78, 77, 78, 77, 78, 77, 78, 78, 78, 77, 77, 78, 77, 77, 77, 78, 78, 77, 77, 77, 78, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 19, 77, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 78, 77, 78, 77, 77, 77, 77, 78, 77, 78, 77, 78, 77, 77, 63, 62, 61, 77, 79, 78, 78, 77, 77, 78, 77, 78, 77, 78, 77, 77, 78, 77, 78, 63, 77, 63, 79, 62, 61, 57, 59, 62, 74, 79, 75, 71, 62, 19, 0, 0, 0, 0, 0, 19, 78, 71, 77, 77, 79, 77, 78, 77, 78, 77, 77, 63, 77, 78, 77, 77, 79, 77, 78, 77, 78, 77, 63, 77, 78, 77, 77, 77, 78, 77, 77, 78, 77, 77, 79, 77, 77, 77, 77, 78, 77, 78, 77, 77, 77, 78, 77, 77, 78, 77, 63, 77, 77, 77, 79, 77, 77, 77, 78, 19, 77, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 78, 77, 77, 79, 77, 77, 77, 79, 77, 77, 77, 77, 79, 75, 60, 59, 79, 77, 77, 77, 78, 77, 77, 78, 79, 78, 77, 78, 77, 77, 78, 77, 77, 79, 77, 60, 58, 59, 58, 70, 68, 68, 68, 68, 70, 59, 19, 0, 0, 0, 0, 0, 19, 77, 71, 78, 77, 77, 77, 77, 77, 77, 78, 77, 78, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 79, 77, 77, 78, 77, 77, 77, 78, 77, 77, 77, 63, 77, 78, 77, 78, 77, 77, 77, 77, 63, 78, 78, 77, 77, 79, 77, 78, 77, 77, 78, 77, 77, 77, 78, 77, 78, 19, 78, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 77, 78, 77, 77, 77, 77, 78, 77, 77, 78, 63, 77, 61, 75, 57, 58, 73, 62, 74, 77, 79, 77, 78, 77, 77, 78, 77, 78, 77, 77, 79, 77, 77, 79, 75, 57, 59, 58, 58, 59, 71, 61, 59, 62, 60, 71, 61, 19, 0, 0, 0, 0, 0, 19, 58, 71, 77, 61, 77, 77, 78, 79, 77, 78, 77, 77, 77, 77, 78, 63, 77, 78, 77, 63, 78, 77, 77, 77, 78, 77, 77, 76, 77, 63, 77, 63, 77, 77, 77, 77, 77, 77, 76, 77, 79, 77, 79, 77, 77, 60, 60, 63, 77, 77, 79, 77, 78, 78, 77, 60, 61, 77, 77, 19, 77, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 77, 19, 77, 77, 77, 77, 77, 77, 20, 1, 20, 7, 5, 1, 1, 2, 1, 1, 2, 1, 7, 5, 5, 20, 1, 1, 1, 5, 1, 1, 2, 20, 7, 1, 20, 7, 1, 1, 5, 2, 1, 1, 20, 4, 62, 71, 18, 3, 7, 18, 71, 60, 19, 0, 0, 0, 0, 0, 19, 61, 71, 61, 62, 60, 63, 77, 77, 77, 77, 77, 62, 60, 79, 77, 77, 77, 77, 78, 77, 77, 77, 63, 77, 77, 60, 62, 61, 61, 57, 62, 60, 77, 79, 78, 79, 77, 79, 77, 62, 60, 62, 60, 61, 59, 61, 62, 60, 79, 78, 78, 79, 77, 79, 61, 58, 62, 79, 75, 19, 63, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 77, 19, 77, 77, 78, 78, 77, 78, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 18, 71, 20, 21, 23, 20, 71, 18, 19, 0, 0, 0, 0, 0, 19, 60, 71, 59, 60, 74, 77, 78, 63, 77, 76, 79, 61, 60, 61, 59, 60, 74, 77, 77, 63, 77, 78, 77, 78, 58, 61, 60, 59, 62, 60, 61, 60, 74, 63, 77, 78, 75, 61, 58, 61, 60, 61, 58, 60, 62, 60, 61, 60, 76, 77, 77, 73, 63, 60, 62, 61, 59, 60, 76, 19, 78, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 77, 19, 78, 77, 77, 77, 77, 78, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 26, 27, 28, 2, 1, 26, 27, 28, 4, 0, 0, 0, 0, 0, 4, 70, 71, 70, 4, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 4, 5, 3, 3, 1, 1, 2, 5, 7, 7, 3, 3, 1, 3, 3, 1, 2, 7, 5, 7, 1, 1, 2, 5, 4, 70, 2, 70, 70, 70, 70, 70, 2, 70, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 77, 19, 77, 78, 63, 77, 78, 77, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 62, 71, 59, 19, 63, 77, 77, 63, 77, 79, 61, 59, 61, 57, 76, 60, 79, 63, 77, 78, 79, 77, 76, 79, 60, 61, 60, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 60, 19, 58, 79, 57, 61, 74, 19, 79, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 77, 78, 77, 77, 78, 77, 77, 77, 77, 77, 19, 77, 19, 78, 77, 78, 63, 78, 63, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 60, 71, 77, 19, 77, 78, 77, 73, 79, 73, 79, 61, 60, 58, 61, 60, 75, 77, 77, 63, 77, 77, 75, 57, 61, 60, 57, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 23, 4, 21, 58, 62, 60, 57, 4, 63, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 77, 77, 78, 77, 77, 77, 78, 77, 78, 77, 19, 61, 19, 77, 63, 77, 77, 63, 77, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 70, 71, 70, 4, 1, 5, 2, 1, 20, 2, 7, 2, 5, 7, 1, 5, 1, 3, 20, 7, 1, 3, 2, 1, 5, 2, 20, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 5, 7, 7, 5, 20, 1, 7, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 68, 53, 68, 68, 53, 68, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 19, 77, 78, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 78, 77, 77, 19, 77, 78, 77, 78, 77, 79, 58, 60, 59, 63, 19, 57, 19, 79, 75, 62, 61, 76, 79, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 78, 71, 60, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 1, 5, 20, 1, 3, 1, 2, 3, 1, 20, 5, 1, 22, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 77, 77, 77, 77, 19, 77, 78, 77, 63, 77, 78, 78, 77, 78, 79, 77, 78, 77, 63, 77, 78, 19, 77, 63, 77, 63, 78, 77, 75, 57, 76, 79, 19, 76, 19, 62, 59, 57, 59, 63, 77, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 22, 5, 22, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 70, 54, 54, 54, 54, 70, 70, 54, 54, 54, 54, 70, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 77, 63, 77, 77, 19, 78, 79, 77, 79, 77, 77, 63, 79, 77, 77, 78, 63, 78, 77, 78, 79, 19, 68, 68, 68, 69, 70, 69, 68, 68, 68, 68, 19, 60, 19, 57, 61, 60, 79, 77, 78, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 3, 2, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 70, 71, 70, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 66, 65, 70, 70, 65, 70, 70, 66, 70, 70, 65, 70, 70, 65, 70, 70, 66, 70, 70, 70, 70, 70, 65, 19, 0, 71, 71, 0, 0, 0, 0, 0, 0, 71, 71, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 79, 19, 77, 77, 77, 77, 77, 77, 77, 77, 63, 77, 77, 77, 77, 77, 63, 63, 19, 60, 79, 63, 63, 19, 20, 1, 1, 1, 2, 1, 5, 1, 2, 5, 1, 1, 2, 7, 5, 1, 4, 1, 1, 1, 71, 1, 71, 1, 7, 2, 1, 19, 61, 19, 79, 60, 63, 77, 78, 77, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 70, 0, 6, 18, 3, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 35, 71, 35, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 68, 54, 54, 54, 54, 54, 54, 68, 54, 54, 54, 54, 54, 54, 54, 54, 68, 54, 54, 54, 54, 54, 54, 2, 0, 71, 71, 0, 0, 0, 0, 0, 0, 71, 71, 0, 7, 5, 0, 0, 0, 0, 0, 0, 0], [0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 79, 77, 19, 57, 76, 74, 19, 77, 63, 78, 77, 78, 77, 63, 77, 77, 78, 77, 77, 77, 74, 79, 75, 19, 3, 3, 79, 78, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 5, 53, 54, 70, 54, 53, 5, 0, 2, 19, 70, 19, 1, 20, 2, 1, 2, 7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 2, 33, 4, 18, 4, 18, 35, 7, 1, 20, 4, 1, 7, 20, 5, 1, 20, 1, 7, 1, 3, 1, 4, 20, 0, 0, 0, 0, 0, 4, 63, 71, 79, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 43, 42, 43, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 71, 71, 0, 9, 19, 0, 0, 0, 0, 0, 0, 0], [77, 19, 77, 78, 77, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 77, 78, 77, 78, 77, 77, 78, 77, 77, 74, 79, 76, 58, 19, 59, 57, 60, 19, 74, 79, 77, 77, 63, 78, 77, 78, 77, 77, 63, 78, 77, 79, 73, 3, 19, 4, 7, 3, 4, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 35, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 2, 33, 19, 33, 19, 36, 36, 36, 36, 36, 19, 18, 17, 34, 34, 17, 33, 18, 34, 33, 17, 18, 19, 7, 0, 0, 0, 0, 0, 3, 79, 71, 62, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 47, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 71, 71, 0, 25, 19, 0, 0, 0, 0, 0, 0, 0], [78, 19, 77, 77, 78, 77, 78, 77, 77, 77, 78, 77, 77, 71, 79, 77, 71, 78, 77, 77, 74, 79, 77, 77, 77, 77, 77, 78, 63, 79, 75, 58, 59, 60, 19, 61, 3, 7, 19, 1, 2, 1, 4, 5, 7, 2, 1, 1, 2, 5, 1, 7, 2, 1, 4, 19, 3, 17, 23, 7, 19, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 4, 1, 4, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 3, 70, 19, 70, 19, 70, 33, 35, 33, 35, 19, 17, 33, 17, 18, 4, 3, 7, 3, 3, 7, 3, 4, 1, 0, 0, 0, 0, 0, 3, 74, 71, 59, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 71, 71, 0, 25, 19, 0, 0, 0, 0, 0, 0, 0], [77, 19, 79, 77, 77, 77, 77, 78, 77, 77, 77, 79, 58, 71, 60, 59, 71, 63, 61, 79, 58, 76, 79, 63, 78, 77, 78, 77, 77, 63, 57, 60, 3, 7, 19, 3, 5, 3, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 17, 18, 4, 20, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 70, 68, 68, 68, 68, 68, 70, 0, 0, 0, 0, 71, 0, 1, 21, 19, 5, 19, 70, 1, 7, 1, 20, 4, 2, 1, 7, 1, 20, 70, 54, 70, 70, 54, 70, 20, 20, 0, 0, 0, 0, 0, 3, 62, 71, 61, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 5, 20, 20, 1, 5, 1, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 2, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 71, 71, 0, 0, 0, 0, 0, 0, 71, 71, 0, 41, 19, 0, 0, 0, 0, 0, 0, 0], [57, 19, 76, 79, 77, 78, 77, 77, 78, 77, 75, 59, 60, 71, 60, 61, 71, 59, 60, 58, 59, 61, 60, 58, 63, 77, 78, 77, 77, 77, 3, 7, 4, 3, 19, 3, 18, 17, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 19, 3, 5, 7, 3, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 71, 0, 20, 2, 19, 2, 19, 52, 2, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 47, 0, 0, 0, 0, 0, 0, 2, 61, 71, 60, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 53, 53, 69, 53, 53, 53, 69, 53, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 18, 17, 1, 0, 0, 0, 0, 0, 0, 0, 2, 36, 52, 36, 36, 35, 36, 36, 35, 36, 36, 52, 36, 36, 52, 36, 36, 35, 36, 36, 35, 36, 36, 52, 2, 0, 71, 71, 0, 0, 0, 0, 0, 0, 71, 71, 0, 7, 5, 0, 0, 0, 0, 0, 0, 0], [58, 19, 4, 1, 7, 26, 27, 27, 27, 28, 7, 1, 4, 71, 1, 3, 71, 1, 1, 7, 1, 4, 5, 26, 27, 27, 27, 28, 5, 7, 1, 5, 1, 7, 19, 7, 4, 18, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 26, 27, 27, 28, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 71, 0, 2, 5, 19, 23, 19, 52, 7, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 57, 71, 73, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 65, 70, 69, 65, 65, 65, 69, 65, 1, 3, 2, 1, 23, 1, 20, 7, 1, 2, 5, 1, 1, 1, 1, 5, 36, 36, 5, 2, 1, 20, 1, 7, 20, 5, 4, 70, 69, 70, 70, 65, 70, 70, 66, 70, 70, 69, 70, 70, 69, 70, 70, 66, 70, 70, 65, 70, 70, 69, 19, 0, 71, 71, 0, 0, 0, 0, 0, 0, 71, 71, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0], [57, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 18, 69, 54, 69, 69, 54, 69, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 3, 23, 5, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 71, 0, 1, 3, 19, 21, 19, 70, 2, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 79, 71, 77, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 5, 1, 1, 2, 1, 1, 5, 2, 1, 1, 1, 77, 55, 77, 70, 77, 58, 60, 62, 74, 79, 77, 7, 5, 20, 3, 3, 3, 21, 7, 3, 20, 4, 63, 78, 77, 77, 58, 60, 62, 76, 77, 4, 63, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 71, 71, 10, 11, 11, 11, 11, 12, 71, 71, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0], [63, 19, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 4, 26, 27, 28, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 70, 0, 22, 21, 19, 70, 19, 70, 7, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 22, 5, 22, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 3, 5, 3, 77, 76, 79, 77, 60, 61, 74, 77, 78, 55, 77, 56, 75, 62, 60, 59, 60, 77, 73, 3, 3, 21, 7, 5, 20, 3, 4, 20, 77, 77, 73, 77, 60, 62, 60, 59, 62, 74, 79, 19, 78, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 5, 20, 1, 33, 51, 51, 33, 1, 20, 5, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0], [61, 19, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 1, 6, 4, 2, 4, 3, 1, 20, 2, 7, 1, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 70, 71, 70, 7, 43, 43, 44, 0, 0, 0, 0, 0, 0, 42, 43, 44, 1, 22, 2, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 55, 70, 56, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 2, 70, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 69, 69, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [59, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 1, 20, 4, 1, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 3, 59, 19, 61, 19, 60, 61, 60, 62, 61, 62, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 1, 5, 7, 1, 2, 1, 35, 71, 35, 1, 0, 0, 46, 0, 0, 0, 0, 0, 0, 46, 0, 0, 5, 21, 19, 78, 77, 60, 59, 76, 79, 77, 63, 77, 77, 55, 77, 56, 77, 63, 77, 77, 78, 77, 77, 78, 77, 78, 77, 77, 63, 77, 78, 77, 77, 78, 77, 63, 77, 77, 78, 77, 77, 78, 78, 19, 79, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [60, 19, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 20, 4, 1, 5, 2, 1, 23, 2, 1, 7, 5, 1, 2, 7, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 2, 61, 19, 62, 19, 57, 60, 59, 61, 58, 59, 1, 0, 0, 0, 0, 4, 5, 1, 2, 1, 7, 1, 23, 5, 53, 53, 5, 53, 4, 22, 5, 22, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 19, 79, 61, 62, 61, 60, 61, 77, 77, 78, 77, 55, 77, 56, 78, 77, 75, 59, 63, 77, 79, 77, 63, 60, 63, 75, 58, 62, 60, 77, 79, 77, 77, 78, 78, 78, 77, 59, 60, 77, 77, 19, 77, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [61, 19, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, 18, 52, 35, 35, 52, 18, 7, 1, 20, 2, 18, 52, 52, 18, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 1, 60, 19, 60, 19, 63, 59, 61, 62, 60, 61, 5, 0, 0, 0, 0, 2, 70, 66, 70, 70, 53, 70, 70, 66, 70, 70, 53, 70, 70, 70, 71, 2, 2, 0, 0, 0, 0, 43, 42, 0, 0, 0, 0, 0, 0, 20, 5, 19, 73, 60, 59, 58, 58, 57, 74, 77, 78, 77, 55, 77, 56, 77, 79, 62, 57, 74, 79, 77, 77, 77, 58, 60, 62, 60, 62, 59, 60, 77, 77, 78, 77, 79, 77, 75, 60, 62, 58, 63, 19, 63, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [3, 19, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 1, 5, 7, 1, 4, 3, 0, 70, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 70, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 5, 61, 19, 77, 19, 77, 57, 60, 61, 77, 63, 2, 0, 0, 0, 0, 4, 5, 4, 20, 1, 5, 1, 1, 4, 20, 1, 1, 5, 1, 2, 71, 3, 7, 0, 0, 0, 0, 45, 45, 0, 0, 0, 0, 0, 0, 5, 3, 19, 77, 75, 60, 62, 61, 60, 77, 78, 77, 77, 55, 77, 56, 78, 77, 60, 62, 59, 58, 77, 77, 77, 77, 76, 77, 74, 77, 79, 77, 63, 78, 77, 77, 77, 77, 74, 62, 60, 62, 77, 19, 77, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [60, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 20, 63, 58, 75, 60, 20, 5, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 20, 60, 19, 79, 19, 78, 74, 79, 77, 78, 75, 1, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 5, 70, 2, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 19, 78, 77, 63, 74, 79, 77, 77, 63, 77, 63, 55, 77, 56, 77, 78, 77, 60, 62, 60, 77, 63, 77, 78, 77, 77, 77, 79, 77, 77, 77, 77, 77, 77, 78, 63, 77, 63, 79, 60, 77, 19, 78, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 4, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 70, 0, 1, 4, 1, 3, 1, 4, 3, 0, 70, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 70, 0, 2, 19, 78, 79, 61, 62, 19, 2, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 2, 63, 19, 75, 19, 77, 77, 77, 78, 63, 77, 2, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 20, 5, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 44, 43, 23, 21, 19, 63, 77, 78, 77, 77, 79, 77, 60, 61, 61, 55, 77, 56, 77, 77, 63, 78, 77, 79, 77, 77, 77, 77, 77, 77, 78, 77, 78, 77, 79, 77, 77, 78, 78, 77, 77, 77, 77, 77, 77, 19, 78, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 1, 20, 18, 35, 35, 20, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 77, 77, 79, 60, 19, 1, 0, 70, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 70, 0, 0, 0, 0, 0, 0, 3, 77, 19, 78, 19, 79, 77, 79, 77, 77, 78, 7, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 1, 3, 19, 77, 77, 77, 63, 78, 77, 77, 77, 62, 59, 55, 77, 56, 78, 77, 77, 77, 77, 78, 77, 77, 78, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 77, 77, 78, 77, 77, 78, 77, 19, 77, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 2, 19, 62, 79, 63, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 33, 33, 33, 33, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 78, 19, 77, 19, 77, 78, 77, 77, 78, 77, 1, 0, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 2, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 55, 70, 56, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 2, 70, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 1, 19, 59, 75, 79, 19, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 79, 63, 78, 78, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 3, 1, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 70, 2, 70, 2, 70, 70, 70, 70, 70, 70, 4, 1, 5, 2, 1, 1, 1, 4, 1, 7, 2, 20, 1, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 1, 7, 1, 2, 23, 21, 3, 77, 77, 77, 77, 77, 78, 77, 77, 77, 77, 55, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 5, 19, 58, 57, 76, 19, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 60, 58, 77, 77, 19, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 78, 79, 19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 77, 19, 77, 19, 78, 77, 78, 77, 78, 77, 77, 79, 60, 61, 59, 61, 60, 19, 63, 77, 60, 79, 75, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 18, 2, 4, 3, 5, 3, 2, 63, 61, 60, 77, 63, 77, 77, 77, 78, 78, 55, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 1, 19, 60, 62, 79, 19, 1, 81, 81, 82, 81, 81, 82, 82, 81, 82, 81, 81, 82, 81, 82, 2, 19, 62, 60, 63, 78, 19, 1, 81, 82, 81, 82, 81, 81, 82, 82, 82, 81, 81, 82, 82, 81, 81, 82, 82, 81, 82, 5, 19, 77, 78, 19, 23, 2, 5, 1, 4, 2, 82, 82, 81, 81, 82, 82, 81, 81, 82, 82, 82, 81, 81, 82, 82, 82, 81, 82, 81, 81, 82, 82, 82, 82, 81, 82, 20, 77, 19, 78, 19, 77, 77, 78, 78, 77, 78, 63, 77, 58, 57, 62, 60, 63, 19, 77, 62, 61, 60, 59, 19, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 35, 3, 5, 17, 18, 3, 19, 60, 62, 61, 75, 77, 78, 77, 78, 77, 77, 55, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 2, 4, 33, 33, 33, 4, 7, 89, 90, 89, 89, 89, 90, 89, 90, 90, 89, 90, 89, 90, 90, 7, 19, 76, 62, 79, 77, 19, 2, 90, 90, 89, 89, 90, 89, 89, 90, 89, 89, 90, 90, 90, 89, 89, 90, 89, 90, 90, 3, 19, 79, 77, 19, 77, 79, 73, 63, 19, 5, 89, 90, 89, 90, 90, 89, 89, 90, 90, 89, 89, 90, 89, 90, 89, 89, 90, 89, 89, 90, 90, 89, 90, 90, 90, 89, 5, 79, 19, 77, 19, 77, 77, 78, 77, 79, 77, 77, 63, 77, 74, 79, 77, 77, 4, 3, 7, 2, 3, 3, 4, 7, 1, 20, 5, 1, 2, 7, 1, 1, 7, 5, 1, 2, 1, 7, 1, 1, 2, 3, 21, 3, 5, 3, 19, 74, 79, 77, 77, 77, 77, 78, 77, 77, 77, 55, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 4, 1, 3, 1, 3, 7, 4, 3, 1, 7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 71, 0, 5, 19, 62, 76, 77, 19, 5, 89, 89, 89, 90, 89, 89, 90, 89, 89, 89, 89, 90, 89, 89, 5, 19, 61, 75, 77, 78, 19, 1, 90, 89, 89, 90, 89, 89, 90, 90, 89, 90, 89, 90, 89, 89, 90, 89, 90, 89, 89, 2, 19, 76, 79, 19, 57, 62, 61, 74, 19, 5, 90, 90, 90, 89, 89, 90, 90, 89, 90, 90, 89, 90, 90, 89, 89, 90, 90, 89, 90, 89, 89, 89, 90, 89, 90, 90, 1, 77, 4, 78, 4, 78, 77, 63, 77, 78, 77, 78, 78, 77, 78, 77, 77, 63, 19, 60, 62, 61, 58, 77, 19, 77, 79, 57, 60, 58, 60, 62, 60, 79, 60, 73, 77, 78, 74, 60, 61, 58, 62, 61, 63, 77, 78, 77, 19, 78, 77, 78, 77, 79, 78, 77, 77, 78, 77, 55, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [60, 19, 35, 17, 18, 18, 17, 19, 17, 17, 18, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 70, 0, 1, 19, 61, 79, 78, 19, 1, 1, 1, 2, 5, 4, 1, 5, 2, 7, 1, 1, 2, 5, 1, 1, 19, 58, 79, 62, 77, 19, 1, 1, 7, 5, 3, 3, 1, 5, 2, 7, 4, 3, 1, 3, 5, 7, 1, 2, 5, 1, 1, 19, 63, 75, 19, 59, 60, 62, 58, 19, 20, 3, 2, 5, 7, 1, 1, 2, 1, 5, 7, 23, 2, 5, 1, 5, 23, 1, 7, 3, 5, 1, 1, 20, 5, 1, 2, 1, 77, 77, 79, 77, 77, 77, 77, 79, 77, 77, 78, 77, 63, 77, 77, 78, 77, 19, 77, 77, 78, 77, 63, 19, 63, 77, 74, 59, 58, 61, 60, 62, 60, 62, 63, 77, 77, 77, 59, 62, 60, 75, 79, 77, 77, 63, 77, 19, 77, 77, 77, 78, 77, 77, 78, 77, 77, 77, 55, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [59, 19, 60, 61, 60, 79, 58, 19, 60, 79, 58, 1, 1, 7, 2, 5, 1, 4, 5, 1, 7, 7, 3, 1, 2, 1, 5, 2, 1, 3, 7, 1, 5, 1, 19, 63, 78, 77, 19, 78, 77, 63, 78, 77, 79, 60, 61, 76, 62, 61, 76, 79, 78, 77, 77, 19, 63, 63, 77, 77, 19, 77, 77, 79, 77, 74, 58, 62, 60, 57, 76, 79, 60, 62, 58, 79, 75, 76, 57, 63, 78, 77, 19, 77, 63, 19, 77, 63, 78, 79, 19, 77, 63, 77, 63, 78, 79, 75, 59, 60, 62, 76, 79, 77, 63, 62, 61, 59, 58, 60, 76, 79, 77, 78, 77, 78, 78, 79, 77, 77, 78, 77, 77, 77, 78, 77, 77, 78, 77, 77, 77, 77, 78, 77, 77, 77, 19, 78, 77, 63, 78, 77, 19, 77, 77, 63, 75, 77, 60, 61, 60, 61, 60, 77, 77, 63, 77, 78, 77, 77, 78, 77, 78, 77, 77, 77, 19, 77, 77, 77, 77, 78, 77, 77, 77, 78, 77, 55, 0, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 19, 0, 0, 55, 56, 0, 0, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
		}]
	};
	LevelBiolab3Resources = [new ig.Image('media/tiles/biolab.png'), new ig.Image('media/tiles/biolab.png')];
});

// biolab/biolab.js
ig.baked = true;
ig.module('biolab.biolab').requires('plugins.impact-splash-loader', 'impact.game', 'impact.collision-map', 'impact.background-map', 'impact.font', 'biolab.camera', 'biolab.entities.player', 'biolab.entities.blob', 'biolab.entities.grunt', 'biolab.entities.dropper', 'biolab.entities.spike', 'biolab.entities.crate', 'biolab.entities.mine', 'biolab.entities.spewer', 'biolab.entities.earthquake', 'biolab.entities.mover', 'biolab.entities.debris', 'biolab.entities.delay', 'biolab.entities.void', 'biolab.entities.hurt', 'biolab.entities.levelchange', 'biolab.entities.respawn-pod', 'biolab.entities.test-tube', 'biolab.entities.glass-dome', 'biolab.entities.endhub', 'biolab.levels.biolab1', 'biolab.levels.biolab2', 'biolab.levels.biolab3').defines(function () {
	BiolabGame = ig.Game.extend({
		clearColor: '#0d0c0b',
		gravity: 240,
		player: null,
		mode: 0,
		lastCheckpoint: null,
		playerSpawnPos: {x: 0, y: 0},
		deathCount: 0,
		tubeCount: 0,
		tubeTotal: 0,
		levelTime: null,
		levelTimeText: '0',
		musicBiochemie: new ig.Sound('media/music/biochemie.ogg', false),
		font: new ig.Font('media/04b03.font.png'),
		camera: null,
		lastTick: 0.016,
		realTime: 0,
		showFPS: false,
		init: function () {
			var as = new ig.AnimationSheet('media/tiles/biolab.png', 8, 8);
			this.backgroundAnims = {
				'media/tiles/biolab.png': {
					80: new ig.Animation(as, 0.13, [80, 81, 82, 83, 84, 85, 86, 87]),
					81: new ig.Animation(as, 0.17, [84, 83, 82, 81, 80, 87, 86, 85]),
					88: new ig.Animation(as, 0.23, [88, 89, 90, 91, 92, 93, 94, 95]),
					89: new ig.Animation(as, 0.19, [95, 94, 93, 92, 91, 90, 89, 88])
				}
			};
			this.camera = new Camera(ig.system.width / 4, ig.system.height / 3, 5);
			this.camera.trap.size.x = ig.system.width / 10;
			this.camera.trap.size.y = ig.system.height / 3;
			this.camera.lookAhead.x = ig.ua.mobile ? ig.system.width / 6 : 0;
			ig.music.volume = 0.9;
			ig.music.add(this.musicBiochemie);
			ig.music.play();
			this.loadLevel(LevelBiolab1);
			this.realTime = Date.now();
			this.lastTick = 0.016;
		},
		loadLevel: function (level) {
			this.parent(level);
			this.player = this.getEntitiesByType(EntityPlayer)[0];
			this.lastCheckpoint = null;
			this.playerSpawnPos = {x: this.player.pos.x, y: this.player.pos.y};
			this.deathCount = 0;
			this.tubeCount = 0;
			this.tubeTotal = this.getEntitiesByType(EntityTestTube).length;
			this.levelTime = new ig.Timer();
			this.mode = BiolabGame.MODE.GAME;
			this.camera.max.x = this.collisionMap.width * this.collisionMap.tilesize - ig.system.width;
			this.camera.max.y = this.collisionMap.height * this.collisionMap.tilesize - ig.system.height;
			this.camera.set(this.player);
			if (ig.ua.mobile) {
				for (var i = 0; i < this.backgroundMaps.length; i++) {
					this.backgroundMaps[i].preRender = true;
				}
			}
		},
		endLevel: function (nextLevel) {
			this.nextLevel = nextLevel;
			this.levelTimeText = this.levelTime.delta().round(2).toString();
			this.mode = BiolabGame.MODE.STATS;
		},
		end: function () {
			ig.system.setGame(BiolabCredits);
		},
		respawnPlayerAtLastCheckpoint: function (x, y) {
			var pos = this.playerSpawnPos;
			if (this.lastCheckpoint) {
				pos = this.lastCheckpoint.getSpawnPos()
				this.lastCheckpoint.currentAnim = this.lastCheckpoint.anims.respawn.rewind();
			}
			this.player = this.spawnEntity(EntityPlayer, pos.x, pos.y);
			this.player.currentAnim = this.player.anims.spawn;
			this.deathCount++;
		},
		update: function () {
			this.camera.follow(this.player);
			this.parent();
		},
		draw: function () {
			this.parent();
			this.camera.draw();
			if (this.showFPS) {
				this.font.draw((1 / this.lastTick).round(), 4, 4);
			}
		},
		run: function () {
			var now = Date.now();
			this.lastTick = this.lastTick * 0.9 + ((now - this.realTime) / 1000) * 0.1;
			this.realTime = now;
			if (ig.input.pressed('fps')) {
				this.showFPS = !this.showFPS;
			}
			if (this.mode == BiolabGame.MODE.GAME) {
				this.update();
				this.draw();
			}
			else if (this.mode == BiolabGame.MODE.STATS) {
				this.showStats();
			}
		},
		showStats: function () {
			if (ig.input.pressed('shoot') || ig.input.pressed('jump')) {
				this.loadLevel(this.nextLevel);
				return;
			}
			var mv = ig.ua.mobile ? 20 : 0;
			ig.system.clear(this.clearColor);
			this.font.draw('Level Complete!', ig.system.width / 2, 20, ig.Font.ALIGN.CENTER);
			this.font.draw('Time:', 98 - mv, 56, ig.Font.ALIGN.RIGHT);
			this.font.draw(this.levelTimeText + 's', 104 - mv, 56);
			this.font.draw('Tubes Collected:', 98 - mv, 68, ig.Font.ALIGN.RIGHT);
			this.font.draw(this.tubeCount + '/' + this.tubeTotal, 104 - mv, 68);
			this.font.draw('Deaths:', 98 - mv, 80, ig.Font.ALIGN.RIGHT);
			this.font.draw(this.deathCount.toString(), 104 - mv, 80);
			this.font.draw('Press X or C to Proceed', ig.system.width / 2, 140, ig.Font.ALIGN.CENTER);
		}
	});
	BiolabGame.MODE = {GAME: 1, STATS: 2};
	BiolabTitle = ig.Class.extend({
		introTimer: null,
		noise: null,
		sound: new ig.Sound('media/sounds/intro.ogg', false),
		biolab: new ig.Image('media/title-biolab.png'),
		disaster: new ig.Image('media/title-disaster.png'),
		player: new ig.Image('media/title-player.png'),
		font: new ig.Font('media/04b03.font.png'),
		init: function () {
			if (!BiolabTitle.initialized) {
				ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
				ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
				ig.input.bind(ig.KEY.X, 'jump');
				ig.input.bind(ig.KEY.C, 'shoot');
				ig.input.bind(ig.KEY.F, 'fps');
				if (ig.ua.mobile) {
					ig.input.bindTouch('#buttonFPS', 'fps');
					ig.input.bindTouch('#buttonLeft', 'left');
					ig.input.bindTouch('#buttonRight', 'right');
					ig.input.bindTouch('#buttonShoot', 'shoot');
					ig.input.bindTouch('#buttonJump', 'jump');
				}
				BiolabTitle.initialized = true;
			}
			this.introTimer = new ig.Timer(1);
		},
		run: function () {
			if (ig.input.pressed('shoot') || ig.input.pressed('jump')) {
				ig.system.setGame(BiolabGame);
				return;
			}
			var d = this.introTimer.delta();
			if (!this.soundPlayed && d > -0.3) {
				this.soundPlayed = true;
				this.sound.play();
			}
			if (ig.ua.mobile) {
				ig.system.clear('#0d0c0b');
				this.biolab.draw((d * d * -d).limit(0, 1).map(1, 0, -160, 12), 6);
				this.disaster.draw((d * d * -d).limit(0, 1).map(1, 0, 300, 12), 46);
				this.player.draw((d * d * -d).limit(0, 1).map(0.5, 0, 240, 70), 56);
				if (d > 0 && (d % 1 < 0.5 || d > 2)) {
					this.font.draw('Press Button to Play', 80, 140, ig.Font.ALIGN.CENTER);
				}
			}
			else {
				ig.system.clear('#0d0c0b');
				this.biolab.draw((d * d * -d).limit(0, 1).map(1, 0, -160, 44), 26);
				this.disaster.draw((d * d * -d).limit(0, 1).map(1, 0, 300, 44), 70);
				this.player.draw((d * d * -d).limit(0, 1).map(0.5, 0, 240, 166), 56);
				if (d > 0 && (d % 1 < 0.5 || d > 2)) {
					this.font.draw('Press X or C to Play', 120, 140, ig.Font.ALIGN.CENTER);
				}
			}
		}
	});
	BiolabTitle.initialized = false;
	BiolabCredits = ig.Class.extend({
		introTimer: null,
		font: new ig.Font('media/04b03.font.png'),
		lineHeight: 12,
		scroll: 0,
		scrollSpeed: 10,
		credits: ['          Thanks for Playing!', '', '', 'Concept, Graphics & Programming', '    Dominic Szablewski', '', 'Music', '    Andreas Loesch', '', 'Beta Testing', '    Sebastian Gerhard', '    Benjamin Hartmann', '    Jos Hirth', '    David Jacovangelo', '    Tim Juraschka', '    Christopher Klink', '    Mike Neumann', '', '', '', '', 'Made with IMPACT - http://impactjs.org/'],
		init: function () {
			this.timer = new ig.Timer();
		},
		run: function () {
			var d = this.timer.delta();
			var color = Math.round(d.map(0, 3, 255, 0)).limit(0, 255);
			ig.system.clear('rgb(' + color + ',' + color + ',' + color + ')');
			if ((d > 3 && ig.input.pressed('shoot') || ig.input.pressed('jump')) || (ig.system.height - this.scroll + (this.credits.length + 2) * this.lineHeight < 0)) {
				ig.system.setGame(BiolabTitle);
				return;
			}
			var mv = ig.ua.mobile ? 0 : 32;
			if (d > 4) {
				this.scroll += ig.system.tick * this.scrollSpeed;
				for (var i = 0; i < this.credits.length; i++) {
					var y = ig.system.height - this.scroll + i * this.lineHeight;
					this.font.draw(this.credits[i], mv, y);
				}
			}
		}
	});
	ig.Sound.use = [ig.Sound.FORMAT.OGG, ig.Sound.FORMAT.MP3];
	ig.System.drawMode = ig.System.DRAW.SMOOTH;
	BiolabGame.start = function () {
		if (ig.ua.iPad) {
			ig.Sound.enabled = false;
			ig.main('#canvas', BiolabTitle, 60, 240, 160, 2, ig.ImpactSplashLoader);
		}
		else if (ig.ua.iPhone4) {
			ig.Sound.enabled = false;
			ig.main('#canvas', BiolabTitle, 60, 160, 160, 4, ig.ImpactSplashLoader);
		}
		else if (ig.ua.mobile) {
			ig.Sound.enabled = false;
			ig.main('#canvas', BiolabTitle, 60, 160, 160, 2, ig.ImpactSplashLoader);
		}
		else {
			ig.main('#canvas', BiolabTitle, 60, 240, 160, 3, ig.ImpactSplashLoader);
		}
	};
});