// region Polyfills

if (!('head' in document)) {
	// noinspection JSValidateTypes
	document.head = document.getElementsByTagName('head')[0];
}

// IE 11.345.17134.0
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}

// IE 11.345.17134.0
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}

		return this.substring(this_len - search.length, this_len) === search;
	};
}

// IE 11.345.17134.0
if (!String.prototype.repeat) {
	String.prototype.repeat = function(count) {
		'use strict';

		if (this === null) {
			throw new TypeError('can\'t convert ' + this + ' to object');
		}

		var str = '' + this;

		count = +count;

		if (count !== count) {
			count = 0;
		}

		if (count < 0) {
			throw new RangeError('repeat count must be non-negative');
		}

		if (count === Infinity) {
			throw new RangeError('repeat count must be less than infinity');
		}

		count = Math.floor(count);

		if (str.length === 0 || count === 0) {
			return '';
		}

		if (str.length * count >= 1 << 28) {
			throw new RangeError('repeat count must not overflow maximum string size');
		}
		var rpt = '';

		for (var i = 0; i < count; i++) {
			rpt += str;
		}

		return rpt;
	}
}

// IE 11.345.17134.0
if (!String.prototype.padStart) {
	String.prototype.padStart = function padStart(targetLength, padString) {
		targetLength = targetLength >> 0;
		padString = String((typeof padString !== 'undefined' ? padString : ' '));

		if (this.length > targetLength) {
			return String(this);
		} else {
			targetLength = targetLength - this.length;

			if (targetLength > padString.length) {
				// noinspection JSValidateTypes
				padString += padString.repeat(targetLength/padString.length);
			}

			return padString.slice(0, targetLength) + String(this);
		}
	};
}

// IE 11.345.17134.0
if (!Array.from) {
	Array.from = (function() {
		var toStr = Object.prototype.toString;
		var isCallable = function (fn) {
			return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
		};
		var toInteger = function (value) {
			var number = Number(value);
			if (isNaN(number)) { return 0; }
			if (number === 0 || !isFinite(number)) { return number; }
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		var maxSafeInteger = Math.pow(2, 53) - 1;
		var toLength = function (value) {
			var len = toInteger(value);
			return Math.min(Math.max(len, 0), maxSafeInteger);
		};

		// The length property of the from method is 1.
		return function from(arrayLike/*, mapFn, thisArg */) {
			// 1. Let C be the this value.
			var C = this;

			// 2. Let items be ToObject(arrayLike).
			var items = Object(arrayLike);

			// 3. ReturnIfAbrupt(items).
			if (arrayLike == null) {
				throw new TypeError('Array.from requires an array-like object - not null or undefined');
			}

			// 4. If mapfn is undefined, then let mapping be false.
			var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
			var T;
			if (typeof mapFn !== 'undefined') {
				// 5. else
				// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
				if (!isCallable(mapFn)) {
					throw new TypeError('Array.from: when provided, the second argument must be a function');
				}

				// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
				if (arguments.length > 2) {
					T = arguments[2];
				}
			}

			// 10. Let lenValue be Get(items, "length").
			// 11. Let len be ToLength(lenValue).
			var len = toLength(items.length);

			// 13. If IsConstructor(C) is true, then
			// 13. a. Let A be the result of calling the [[Construct]] internal method
			// of C with an argument list containing the single item len.
			// 14. a. Else, Let A be ArrayCreate(len).
			var A = isCallable(C) ? Object(new C(len)) : new Array(len);

			// 16. Let k be 0.
			var k = 0;
			// 17. Repeat, while k < len… (also steps a - h)
			var kValue;
			while (k < len) {
				kValue = items[k];
				if (mapFn) {
					// noinspection JSValidateTypes
					A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
				} else {
					A[k] = kValue;
				}
				k += 1;
			}
			// 18. Let putStatus be Put(A, "length", len, true).
			A.length = len;
			// 20. Return A.
			return A;
		};
	}());
}

// IE 11.345.17134.0
if (!Array.prototype.fill) {
	Object.defineProperty(Array.prototype, 'fill', {
		value: function(value) {

			// Steps 1-2.
			if (this == null) {
				throw new TypeError('this is null or not defined');
			}

			var O = Object(this);

			// Steps 3-5.
			var len = O.length >>> 0;

			// Steps 6-7.
			var start = arguments[1];
			var relativeStart = start >> 0;

			// Step 8.
			var k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);

			// Steps 9-10.
			var end = arguments[2];
			var relativeEnd = end === undefined ? len : end >> 0;

			// Step 11.
			var final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);

			// Step 12.
			while (k < final) {
				O[k] = value;
				k++;
			}

			// Step 13.
			return O;
		}
	});
}

// IE 7/8
if (!Object.keys) {
	Object.keys = (function() {
		'use strict';
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function(obj) {
			if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [], prop, i;

			for (prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
}

// region Typed Array

if (typeof ArrayBuffer !== 'undefined') {
	if (!ArrayBuffer.prototype.slice) {
		ArrayBuffer.prototype.slice = function (from, to) {
			function clamp(val, length) {
				val = (val|0) || 0;

				if (val < 0) {
					return Math.max(val + length, 0);
				}

				return Math.min(val, length);
			}

			var length = this.byteLength;
			var begin = clamp(from, length);
			var end = length;

			if (to !== undefined) {
				end = clamp(to, length);
			}

			if (begin > end) {
				return new ArrayBuffer(0);
			}

			var num = end - begin;
			var target = new ArrayBuffer(num);
			var targetArray = new Uint8Array(target);

			var sourceArray = new Uint8Array(this, begin, num);
			targetArray.set(sourceArray);

			return target;
		};
	}
}

if (typeof Int8Array !== 'undefined') {
	// IE 11.345.17134.0
	if (!Int8Array.prototype.from) {
		Object.defineProperty(Int8Array.prototype, 'from', {
			value: function (obj, func, thisObj) {
				// noinspection JSUnresolvedVariable
				var typedArrayClass = Int8Array.__proto__;

				if (typeof this !== 'function') {
					//throw new TypeError('# is not a constructor');
				}
				// noinspection JSUnresolvedVariable
				if (this.__proto__ !== typedArrayClass) {
					throw new TypeError('this is not a typed array.');
				}

				func = func || function (elem) {
					return elem;
				};

				if (typeof func !== 'function') {
					throw new TypeError('specified argument is not a function');
				}

				obj = Object(obj);

				if (!obj['length']) {
					return new this(0);
				}

				var copy_data = [];

				for (var i = 0; i < obj.length; i++) {
					copy_data.push(obj[i]);
				}

				copy_data = copy_data.map(func, thisObj);

				var typed_array = new this(copy_data.length);

				for (var j = 0; j < typed_array.length; j++) {
					typed_array[j] = copy_data[j];
				}

				return typed_array;
			}
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Int8Array.prototype.fill) {
		Object.defineProperty(Int8Array.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Int8Array.prototype.slice) {
		Object.defineProperty(Int8Array.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}
}

if (typeof Uint8Array !== 'undefined') {
	// Safari 5.1.7 (7534.57.2)
	if (!Uint8Array.prototype.fill) {
		Object.defineProperty(Uint8Array.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Uint8Array.prototype.slice) {
		Object.defineProperty(Uint8Array.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}

	// IE 11.0.9600.16663 | Safari 5.1.7 (7534.57.2)
	if (typeof Uint8ClampedArray === 'undefined') {
		// noinspection JSUnresolvedVariable,JSValidateTypes
		Uint8ClampedArray = Uint8Array;
	}
}

if (typeof Uint8ClampedArray !== 'undefined') {
	// Safari 5.1.7 (7534.57.2)
	if (!Uint8ClampedArray.prototype.fill) {
		Object.defineProperty(Uint8ClampedArray.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Uint8ClampedArray.prototype.slice) {
		Object.defineProperty(Uint8ClampedArray.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}
}

if (typeof Int16Array !== 'undefined') {
	// Safari 5.1.7 (7534.57.2)
	if (!Int16Array.prototype.fill) {
		Object.defineProperty(Int16Array.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Int16Array.prototype.slice) {
		Object.defineProperty(Int16Array.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}
}

if (typeof Uint16Array !== 'undefined') {
	// Safari 5.1.7 (7534.57.2)
	if (!Uint16Array.prototype.fill) {
		Object.defineProperty(Uint16Array.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Uint16Array.prototype.slice) {
		Object.defineProperty(Uint16Array.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}
}

if (typeof Int32Array !== 'undefined') {
	// Safari 5.1.7 (7534.57.2)
	if (!Int32Array.prototype.fill) {
		Object.defineProperty(Int32Array.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Int32Array.prototype.slice) {
		Object.defineProperty(Int32Array.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}
}

if (typeof Uint32Array !== 'undefined') {
	// Safari 5.1.7 (7534.57.2)
	if (!Uint32Array.prototype.fill) {
		Object.defineProperty(Uint32Array.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Uint32Array.prototype.slice) {
		Object.defineProperty(Uint32Array.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}
}

if (typeof Float32Array !== 'undefined') {
	// Safari 5.1.7 (7534.57.2)
	if (!Float32Array.prototype.fill) {
		Object.defineProperty(Float32Array.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Float32Array.prototype.slice) {
		Object.defineProperty(Float32Array.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}
}

if (typeof Float64Array !== 'undefined') {
	// Safari 5.1.7 (7534.57.2)
	if (!Float64Array.prototype.fill) {
		Object.defineProperty(Float64Array.prototype, 'fill', {
			value: Array.prototype.fill
		});
	}

	// Safari 5.1.7 (7534.57.2)
	if (!Float64Array.prototype.slice) {
		Object.defineProperty(Float64Array.prototype, 'slice', {
			value: Array.prototype.slice
		});
	}
}

// endregion

// IE 11.345.17134.0
if (typeof console !== 'undefined') {
	if (!console.table) {
		console.table = function(arr) {
			var i, obj, keys, arr_len = arr.length;

			for (i = 0; i < arr_len; i++) {
				obj = arr[i];
				keys = Object.keys(obj);
				console.log(obj[keys[0]] + ': ' + obj[keys[1]]);
			}
		};
	}
} else {
	if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document) {
		// Browser
		// noinspection JSValidateTypes
		console = {
			log: function() {
			},
			table: function() {
			}
		};
	} else if (typeof postMessage !== 'undefined') {
		// Worker
		// Safari 5.1.7 (7534.57.2)
		// noinspection JSValidateTypes
		console = {
			log: function (str) {
				//noinspection JSCheckFunctionSignatures
				postMessage(str);
			},
			table: function (arr) {
				var i, obj, keys, arr_len = arr.length;

				for (i = 0; i < arr_len; i++) {
					obj = arr[i];
					keys = Object.keys(obj);
					console.log(obj[keys[0]] + ': ' + obj[keys[1]]);
				}
			}
		};
	}
}

// endregion

// noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
	// region System

	// noinspection JSUnusedLocalSymbols
	var platform							= typeof navigator.platform !== 'undefined' ? navigator.platform : '';
	var browser								= typeof navigator.userAgent !== 'undefined' ? navigator.userAgent : '';
	var version								= typeof navigator.appVersion !== 'undefined' ? navigator.appVersion : '';
	var vendor								= typeof navigator.vendor !== 'undefined' ? navigator.vendor : '';
	// noinspection JSUnresolvedVariable,JSUnusedLocalSymbols
	var oscpu								= typeof navigator.oscpu !== 'undefined' ? navigator.oscpu : '';

	// global.console.log(browser);
	// global.console.log(navigator);

	global.isEdge							= browser.indexOf('Edge') !== -1;
	global.isIE								= !global.isEdge && (browser.indexOf('MSIE') !== -1 || browser.indexOf('Trident') !== -1);
	global.isNetscape						= browser.indexOf('Navigator') !== -1;
	global.isKMeleon						= browser.indexOf('K-Meleon') !== -1;
	global.isPaleMoon						= browser.indexOf('PaleMoon') !== -1;
	global.isFirefox						= !global.isNetscape && !global.isPaleMoon && browser.indexOf('Firefox') !== -1;
	global.isChrome							= browser.indexOf('Chrome') !== -1 || vendor === 'Google Inc.';
	global.isOperaPresto					= browser.indexOf('Opera') !== -1;
	global.isOperaBlink						= browser.indexOf('OPR') !== -1;
	global.isOpera							= global.isOperaPresto || global.isOperaBlink;
	global.isSafari							= browser.indexOf('Safari') !== -1 || vendor === 'Apple Computer, Inc.';
	global.isOther							= !(global.isSafari && global.isEdge && global.isIE && global.isChrome && global.isOpera);

	global.isWindows						= version.indexOf('Win') !== -1;
	global.isMacOS							= version.indexOf('Mac') !== -1;
	global.isUNIX							= version.indexOf('X11') !== -1;
	global.isLinux							= version.indexOf('Linux') !== -1;

	global.is64								= (browser.indexOf('WOW64') !== -1 || browser.indexOf('Win64') !== -1 || browser.indexOf('amd64') !== -1 || browser.indexOf('x86_64')) !== -1;
	global.is32								= !global.is64 ? ((browser.indexOf('WOW32') !== -1 || browser.indexOf('Win32') !== -1 || browser.indexOf('i386') !== -1 || browser.indexOf('i686')) !== -1) : true;

	global.isMobile							= browser.indexOf('Mobi') !== -1;
	global.isDesktop						= !global.isMobile;

	global.isBrowser						= !!(typeof window === 'object' && typeof navigator === 'object' && window.document);
	global.isWorker							= typeof importScripts === 'function' && typeof postMessage === 'function' && !global.isBrowser;
	global.isNode							= typeof process === "object" && typeof require === "function" && !global.isBrowser && !global.isWorker;
	global.isShell							= !(global.isBrowser && global.isWorker && global.isNode);

	var audio								= document.createElement('audio');
	var canvas2D							= document.createElement('canvas');
	var context2D							= typeof canvas2D !== 'undefined' ? (typeof canvas2D.getContext === 'function' ? canvas2D.getContext('2d') : false) : false;
	var canvasWEBGL							= null;
	var	contextWEBGL						= false;
	var canvasWEBGL2						= null;
	var	contextWEBGL2						= false;

	if (context2D) {
		try {
			//TODO: try to cache results to prevent Error: WebGL warning: Exceeded 16 live WebGL contexts for this principal, losing the least recently used one.
			canvasWEBGL						= document.createElement('canvas');
			contextWEBGL					= typeof canvasWEBGL !== 'undefined' ? (typeof canvasWEBGL.getContext === 'function' ? (canvasWEBGL.getContext('webgl') || canvasWEBGL.getContext('experimental-webgl')) : false) : false;

			if (contextWEBGL) {
				canvasWEBGL2				= document.createElement('canvas');
				contextWEBGL2				= typeof canvasWEBGL2 !== 'undefined' ? (typeof canvasWEBGL2.getContext === 'function' ? (canvasWEBGL2.getContext('webgl2') || canvasWEBGL2.getContext('experimental-webgl2')) : false) : false;
			}
		} catch (e) {}
	}

	global.SYSTEM_FEATURE_WORKERS				= !!global.Worker;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_SHARED_WORKERS		= !!global.SharedWorker;
	global.SYSTEM_FEATURE_TYPED_ARRAYS			= typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined' ? typeof Int8Array !== 'undefined' && typeof Uint8Array !== 'undefined' && typeof Uint8ClampedArray !== 'undefined' && typeof Int16Array !== 'undefined' && typeof Uint16Array !== 'undefined' && typeof Int32Array !== 'undefined' && typeof Uint32Array !== 'undefined' && typeof Float32Array !== 'undefined' && typeof Float64Array !== 'undefined': false;
	global.SYSTEM_FEATURE_BIGINTS				= typeof BigInt !== 'undefined' ? typeof BigInt64Array !== 'undefined' && typeof BigUint64Array !== 'undefined' : false;
	// noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
	global.SYSTEM_FEATURE_SIMD					= typeof SIMD !== 'undefined' ? typeof SIMD.Bool16x8 !== 'undefined' && typeof SIMD.Bool32x4 !== 'undefined' && typeof SIMD.Bool8x16 !== 'undefined' && typeof SIMD.Float32x4 !== 'undefined' && typeof SIMD.Int16x8 !== 'undefined' && typeof SIMD.Int32x4 !== 'undefined' && typeof SIMD.Int8x16 !== 'undefined' && typeof SIMD.Uint32x4 !== 'undefined' && typeof SIMD.Uint8x16 !== 'undefined' : false;
	global.SYSTEM_FEATURE_ASMJS					= (function() {
		try {
			(function MyAsmModule() {
				'use asm';

				function dummy(){}

				return {dummy: dummy};
			})();
			return true;
		} catch(e) {}
		return false;
	})();
	global.SYSTEM_FEATURE_WEBASSEMBLY			= (function() {
		try {
			// noinspection JSUnresolvedVariable
			if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
				// noinspection JSUnresolvedVariable
				var module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
				// noinspection JSUnresolvedVariable
				if (module instanceof WebAssembly.Module) {
					// noinspection JSUnresolvedVariable,JSUnresolvedFunction
					return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
				}
			}
		} catch (e) {}

		return false;
	})();
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_FULLSCREEN			= !document.documentElement.requestFullscreen ? true : !!document.documentElement.webkitRequestFullScreen || !!document.documentElement.mozRequestFullScreen || !!document.documentElement.msRequestFullscreen;
	global.SYSTEM_FEATURE_POINTER_LOCK			= 'pointerLockElement' in document ? true : 'oPointerLockElement' in document || 'msPointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_ANIMATION_FRAME		= !!global.requestAnimationFrame ? true : !!global.webkitRequestAnimationFrame || !!global.mozRequestAnimationFrame || !!global.msRequestAnimationFrame || !!global.oRequestAnimationFrame;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_PERFORMANCE			= !!global.performance ? true : !!global.webkitPerformance || !!global.mozPerformance || !!global.msPerformance || !!global.oPerformance;
	global.SYSTEM_FEATURE_TIMERS				= SYSTEM_FEATURE_ANIMATION_FRAME && SYSTEM_FEATURE_PERFORMANCE;
	global.SYSTEM_FEATURE_CANVAS				= !!(context2D && context2D instanceof CanvasRenderingContext2D);
	global.SYSTEM_FEATURE_WEBGL					= !!(contextWEBGL && contextWEBGL instanceof WebGLRenderingContext);
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_WEBGL2				= !!(contextWEBGL2 && contextWEBGL2 instanceof WebGL2RenderingContext);
	global.SYSTEM_FEATURE_WEBVR					= 'getVRDisplays' in navigator ? true : 'mozGetVRDevices' in navigator;
	// noinspection JSUnusedGlobalSymbols
	global.SYSTEM_FEATURE_HTML5AUDIO			= (function() {
		try {
			// noinspection JSUnresolvedVariable
			return !!(audio.canPlayType && audio.canPlayType('audio/mpeg;').replace(/no/, ''));
		} catch(e) {
			return false;
		}
	})();
	// noinspection JSUnusedGlobalSymbols
	global.SYSTEM_FEATURE_WEBAUDIO				= (function() {
		try {
			// noinspection JSUnresolvedVariable
			var context = AudioContext || webkitAudioContext || mozAudioContext || oAudioContext || msAudioContext;
			new context();

			return true;
		} catch(e) {
			return false;
		}
	})();
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_WEBMIDI				= !!navigator.requestMIDIAccess;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_WEBSPEECH_RECOGNITION	= 'SpeechRecognition' in global ? true : 'webkitSpeechRecognition' in global || 'mozSpeechRecognition' in global || 'oSpeechRecognition' in global || 'msSpeechRecognition' in global;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_WEBSPEECH_SYNTHESIS	= 'speechSynthesis' in global ? true : 'webkitSpeechSynthesis' in global || 'mozSpeechSynthesis' in global || 'oSpeechSynthesis' in global || 'msSpeechSynthesis' in global;
	global.SYSTEM_FEATURE_WEBSPEECH				= SYSTEM_FEATURE_WEBSPEECH_RECOGNITION && SYSTEM_FEATURE_WEBSPEECH_SYNTHESIS;
	// noinspection JSUnusedGlobalSymbols
	// TODO: implement check for keyboard events support assume it's there already for now
	global.SYSTEM_FEATURE_KEYBOARD				= true;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_POINTER_EVENTS		= !!global.PointerEvent ? true : !!global.webkitPointerEvent || !!global.mozPointerEvent || !!global.msPointerEvent || !!global.oPointerEvent;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_GAMEPADS				= !!navigator.getGamepads ? true : !!navigator.webkitGetGamepads || !!navigator.mozGetGamepads || !!navigator.msGetGamepads || !!navigator.oGetGamepads;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_WEBSOCKETS			= (function() {
		var protocol = 'https:' === location.protocol ? 'wss' : 'ws';

		if ('WebSocket' in global && global.WebSocket.CLOSING === 2) {
			if ('binaryType' in WebSocket.prototype) {
				return true;
			} else {
				try {
					return !!(new WebSocket(protocol + '://.').binaryType);
				} catch (e) {
					return false;
				}
			}
		}
	})();
	global.SYSTEM_FEATURE_SESSION_STORAGE		= (function() {
		var mod = 'test';

		try {
			sessionStorage.setItem(mod, mod);
			sessionStorage.removeItem(mod);
			return true;
		} catch (e) {
			return false;
		}
	})();
	global.SYSTEM_FEATURE_LOCAL_STORAGE			= (function() {
		var mod = 'test';

		if (typeof localStorage !== 'undefined') {
			if (typeof localStorage.setItem === 'function' && typeof localStorage.removeItem === 'function') {
				try {
					localStorage.setItem(mod, mod);
					localStorage.removeItem(mod);
					return true;
				} catch (e) {
					return false;
				}
			}
		}

		return false;
	})();
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_INDEXED_DB			= !!global.indexedDB ? true : !!global.webkitIndexedDB || !!global.mozIndexedDB || !!global.moz_indexedDB || !!global.oIndexedDB || !!global.msIndexedDB;
	global.SYSTEM_FEATURE_WEBSQL				= !!global.openDatabase;
	global.SYSTEM_FEATURE_ORIENTATION			= !!global.DeviceOrientationEvent;
	global.SYSTEM_FEATURE_GEOLOCATION			= !!navigator.geolocation;
	global.SYSTEM_FEATURE_MOTION				= !!global.DeviceMotionEvent;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_GYROSCOPE				= !!global.Gyroscope;
	global.SYSTEM_FEATURE_PROXIMITY				= 'ProximitySensor' in global;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_AMBIENTLIGHT			= !!global.AmbientLightSensor;
	global.SYSTEM_FEATURE_VIBRATION				= 'vibrate' in navigator;
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_BATTERY				= !!navigator.getBattery ? true : !!navigator.battery || !!navigator.mozBattery;
	// TODO: implement check for Generic Sensor API

	global.SYSTEM_FEATURE_ES3_BASE64			= 'btoa' in global && 'atob' in global;
	global.SYSTEM_FEATURE_ES3					= SYSTEM_FEATURE_ES3_BASE64;

	global.SYSTEM_FEATURE_ES5_STRICT_MODE		= (function() {'use strict'; return !this; })();
	global.SYSTEM_FEATURE_ES5_XHR				= (function() {
		if (typeof global.XMLHttpRequest === 'function') {
			var req = new global.XMLHttpRequest();

			if (typeof req.open === 'function') {
				req.open('GET', global.location.href, false);

				try {
					req.responseType = 'document';
				} catch(e) {
					return true;
				}
			}
		}

		return false;
	})();
	global.SYSTEM_FEATURE_ES5_JSON				= 'JSON' in global && 'parse' in JSON && 'stringify' in JSON;
	global.SYSTEM_FEATURE_ES5_SYNTAX			= (function() {
		var value, obj, stringAccess, getter, setter, reservedWords, zeroWidthChars;

		try {
			stringAccess = eval('"foobar"[3] === "b"');
			getter = eval('({ get x(){ return 1 } }).x === 1');
			eval('({ set x(v){ value = v; } }).x = 1');
			// noinspection JSUnusedAssignment
			setter = value === 1;
			eval('obj = ({ if: 1 })');
			// noinspection JSUnusedAssignment
			reservedWords = obj['if'] === 1;
			zeroWidthChars = eval('_\u200c\u200d = true');

			return stringAccess && getter && setter && reservedWords && zeroWidthChars;
		} catch (e) {
			return false;
		}
	})();
	global.SYSTEM_FEATURE_ES5_UNDEFINED			= (function() {
		var result, originalUndefined;

		try {
			originalUndefined = undefined;
			// noinspection JSUndeclaredVariable,JSValidateTypes
			undefined = 12345;
			result = typeof undefined === 'undefined';
			// noinspection JSUndeclaredVariable
			undefined = originalUndefined;
		} catch (e) {
			return true;
		}

		return result;
	})();
	global.SYSTEM_FEATURE_ES5_ARRAY				= !!(Array.prototype && Array.prototype.every && Array.prototype.filter && Array.prototype.forEach && Array.prototype.indexOf && Array.prototype.lastIndexOf && Array.prototype.map && Array.prototype.some && Array.prototype.reduce && Array.prototype.reduceRight && Array.isArray);
	global.SYSTEM_FEATURE_ES5_DATE				= (function() {
		var isoDate = '2013-04-12T06:06:37.307Z', canParseISODate = false;

		try {
			canParseISODate = !!Date.parse(isoDate);
		} catch (e) {}

		return !!(Date.now && Date.prototype && Date.prototype.toISOString && Date.prototype.toJSON && canParseISODate);
	})();
	global.SYSTEM_FEATURE_ES5_FUNCTION			= !!(Function.prototype && Function.prototype.bind);
	global.SYSTEM_FEATURE_ES5_OBJECT			= !!(Object.keys && Object.create && Object.getPrototypeOf && Object.getOwnPropertyNames && Object.isSealed && Object.isFrozen && Object.isExtensible && Object.getOwnPropertyDescriptor && Object.defineProperty && Object.defineProperties && Object.seal && Object.freeze && Object.preventExtensions);
	global.SYSTEM_FEATURE_ES5_STRING			= !!(String.prototype && String.prototype.trim);
	global.SYSTEM_FEATURE_ES5_GETSET			= (function() {
		var value, getter, setter;

		try {
			getter = eval('({ get x(){ return 1 } }).x === 1');
			eval('({ set x(v){ value = v; } }).x = 1');
			// noinspection JSUnusedAssignment
			setter = value === 1;

			return getter && setter;
		} catch (e) {
			return false;
		}
	})();
	global.SYSTEM_FEATURE_ES5					= !!(SYSTEM_FEATURE_ES3 && SYSTEM_FEATURE_ES5_STRICT_MODE && SYSTEM_FEATURE_ES5_XHR && SYSTEM_FEATURE_ES5_JSON && SYSTEM_FEATURE_ES5_SYNTAX && SYSTEM_FEATURE_ES5_UNDEFINED && SYSTEM_FEATURE_ES5_ARRAY && SYSTEM_FEATURE_ES5_DATE && SYSTEM_FEATURE_ES5_FUNCTION && SYSTEM_FEATURE_ES5_OBJECT && SYSTEM_FEATURE_ES5_STRING);

	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_ES6_NUMBER			= !!(Number.isFinite && Number.isInteger && Number.isSafeInteger && Number.isNaN && Number.parseInt && Number.parseFloat && Number.isInteger(Number.MAX_SAFE_INTEGER) && Number.isInteger(Number.MIN_SAFE_INTEGER) && Number.isFinite(Number.EPSILON));
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_ES6_MATH				= !!(Math && Math.clz32 && Math.cbrt && Math.imul && Math.sign && Math.log10 && Math.log2 && Math.log1p && Math.expm1 && Math.cosh && Math.sinh && Math.tanh && Math.acosh && Math.asinh && Math.atanh && Math.hypot && Math.trunc && Math.fround);
	global.SYSTEM_FEATURE_ES6_ARRAY				= !!(Array.prototype && Array.prototype.copyWithin && Array.prototype.fill && Array.prototype.find && Array.prototype.findIndex && Array.prototype.keys && Array.prototype.entries && Array.prototype.values && Array.from && Array.of);
	global.SYSTEM_FEATURE_ES6_FUNCTION			= (function() {
		try {
			eval('()=>{}');
		} catch (e) {
			return false;
		}
		return true;
	})();
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_ES6_OBJECT			= !!(Object.assign && Object.is && Object.setPrototypeOf);
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_ES6_CLASS				= (function() {
		try {
			eval('class C{}');
		} catch (e) {
			return false;
		}
		return true;
	})();
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_ES6_STRING			= !!(String.fromCodePoint && String.raw && String.prototype.codePointAt && String.prototype.repeat && String.prototype.startsWith && String.prototype.endsWith && (String.prototype.includes || String.prototype.contains));
	// noinspection JSUnresolvedVariable
	global.SYSTEM_FEATURE_ES6_COLLECTIONS		= !!(global.Map && global.Set && global.WeakMap && global.WeakSet);
	global.SYSTEM_FEATURE_ES6_GENERATORS		= (function() {
		try {
			new Function('function* test() {}')();
		} catch (e) {
			return false;
		}
		return true;
	})();
	global.SYSTEM_FEATURE_ES6_PROMISES			= (function() {
		return 'Promise' in global && 'resolve' in global.Promise && 'reject' in global.Promise && 'all' in global.Promise && 'race' in global.Promise && (function() {
			var resolve;
			// noinspection JSIgnoredPromiseFromCall
			new global.Promise(function(r) { resolve = r; });
			return typeof resolve === 'function';
		}());
	})();
	global.SYSTEM_FEATURE_ES6					= !!(SYSTEM_FEATURE_ES5 && SYSTEM_FEATURE_ES6_NUMBER && SYSTEM_FEATURE_ES6_MATH && SYSTEM_FEATURE_ES6_ARRAY && SYSTEM_FEATURE_ES6_FUNCTION && SYSTEM_FEATURE_ES6_OBJECT && SYSTEM_FEATURE_ES6_CLASS && SYSTEM_FEATURE_ES6_STRING && SYSTEM_FEATURE_ES6_COLLECTIONS && SYSTEM_FEATURE_ES6_GENERATORS && SYSTEM_FEATURE_ES6_PROMISES);

	global.SYSTEM_INFO_OS						= global.isWindows ? 'Windows' : (global.isLinux ? 'Linux' : (global.isUNIX ? 'UNIX' : (global.isMacOS ? 'Mac OS' : undefined)));
	global.SYSTEM_INFO_OS_VERSION				= (function() {
		var offset, version = undefined;

		if ((offset = browser.indexOf('Windows NT')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 11);

			if (version.startsWith('5.0')) {
				// noinspection JSValidateTypes
				version = '2000';
			} else if (version.startsWith('5.1')) {
				// noinspection JSValidateTypes
				version = 'XP';
			} else if (version.startsWith('5.2')) {
				// noinspection JSValidateTypes
				version = 'Server';
			} else if (version.startsWith('6.0')) {
				// noinspection JSValidateTypes
				version = 'Vista';
			} else if (version.startsWith('6.1')) {
				// noinspection JSValidateTypes
				version = '7';
			} else if (version.startsWith('6.2')) {
				// noinspection JSValidateTypes
				version = '8';
			} else if (version.startsWith('6.3')) {
				// noinspection JSValidateTypes
				version = '8.1';
			} else if (version.startsWith('10.0')) {
				// noinspection JSValidateTypes
				version = '10';
			}
		}

		if ((offset = browser.indexOf('Win 9x')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 7);

			if (version.startsWith('4.90')) {
				// noinspection JSValidateTypes
				version = 'Millennium';
			}
		}

		if (version) {
			if ((offset = version.indexOf(';')) !== -1) {
				version = version.substring(0, offset);
			}

			if ((offset = version.indexOf(' ')) !== -1) {
				version = version.substring(0, offset);
			}

			if ((offset = version.indexOf(')')) !== -1) {
				version = version.substring(0, offset);
			}
		}

		return version;
	})();

	global.SYSTEM_INFO_ENVIRONMENT				= global.isBrowser ? 'Browser' : (global.isWorker ? 'Worker' : (global.isNode ? 'Node' : 'Shell'));
	global.SYSTEM_INFO_BROWSER					= global.isEdge ? 'Microsoft Edge' : (global.isIE ? 'Microsoft Internet Explorer' : (global.isNetscape ? 'Netscape Navigator' : (global.isKMeleon ? 'K-Meleon' : (global.isPaleMoon ? 'PaleMoon' : (global.isFirefox ? 'Mozilla Firefox' : (global.isOpera ? 'Opera' : (global.isChrome ? 'Google Chrome' : (global.isSafari ? 'Apple Safari' : undefined))))))));
	global.SYSTEM_INFO_BROWSER_VERSION			= (function() {
		var offset, version = undefined;

		if ((offset = browser.indexOf('Opera')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 6);

			if ((offset = browser.indexOf('Version')) !== -1) {
				// noinspection JSValidateTypes
				version = browser.substring(offset + 8);
			}
		} else if ((offset = browser.indexOf('OPR')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 4);
		} else if ((offset = browser.indexOf('Edge')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 5);
		} else if ((offset = browser.indexOf('MSIE')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 5);
		} else if ((offset = browser.indexOf('Trident') !== -1)) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 5);

			if ((offset = browser.indexOf('rv:')) !== -1) {
				// noinspection JSValidateTypes
				version = browser.substring(offset + 3);
			}
		} else if ((offset = browser.indexOf('Chrome')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 7);
		} else if ((offset = browser.indexOf('Safari')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 7);

			if ((offset = browser.indexOf('Version')) !== -1) {
				// noinspection JSValidateTypes
				version = browser.substring(offset + 8);
			}
		} else if ((offset = browser.indexOf('K-Meleon')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 9);
		} else if ((offset = browser.indexOf('Navigator')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 10);
		} else if ((offset = browser.indexOf('PaleMoon')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 9);
		} else if ((offset = browser.indexOf('Firefox')) !== -1) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 8);
		} else if ((browser.lastIndexOf(' ') + 1) < (offset = browser.lastIndexOf('/'))) {
			// noinspection JSValidateTypes
			version = browser.substring(offset + 1);
		}

		if (version) {
			if ((offset = version.indexOf(';')) !== -1) {
				version = version.substring(0, offset);
			}

			if ((offset = version.indexOf(' ')) !== -1) {
				version = version.substring(0, offset);
			}

			if ((offset = version.indexOf(')')) !== -1) {
				version = version.substring(0, offset);
			}
		}

		return version;
	})();

	global.SYSTEM_INFO_CPU_LITTLE_ENDIAN		= (SYSTEM_FEATURE_TYPED_ARRAYS ? (function() {
		var buffer = new ArrayBuffer(2);
		new DataView(buffer).setUint16(0, 256, true);

		return new Uint16Array(buffer)[0] === 256;
	})() : true);
	// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
	global.SYSTEM_INFO_CPU_BIG_ENDIAN			= typeof SYSTEM_INFO_CPU_LITTLE_ENDIAN !== 'undefined' ? !SYSTEM_INFO_CPU_LITTLE_ENDIAN : false;
	// noinspection JSUnusedGlobalSymbols
	global.SYSTEM_INFO_CPU_ENDIANNESS			= typeof SYSTEM_INFO_CPU_LITTLE_ENDIAN !== 'undefined' ? (SYSTEM_INFO_CPU_LITTLE_ENDIAN ? 'Little-endian' : 'Big-endian') : 'Little-endian';
	// noinspection JSUnusedGlobalSymbols
	global.SYSTEM_INFO_CPU_CORES				= !navigator.hardwareConcurrency ? '≥ 1' : navigator.hardwareConcurrency;
	// noinspection JSUnusedGlobalSymbols
	global.SYSTEM_INFO_CPU_ARCH					= is64 ? '64-bit' : '32-bit';
	// noinspection JSUnresolvedVariable
	global.SYSTEM_INFO_RAM						= !navigator.deviceMemory ? '≤ 1GB' : '≥' + navigator.deviceMemory + 'GB';
	// noinspection JSUnusedGlobalSymbols
	global.SYSTEM_INFO_VIDEO_ACCELERATION		= SYSTEM_FEATURE_WEBGL || SYSTEM_FEATURE_WEBGL2 ? '3D' : (SYSTEM_FEATURE_CANVAS ? '2D' : false);
	// noinspection JSUnusedGlobalSymbols
	global.SYSTEM_INFO_GPU						= (function() {
		if (contextWEBGL) {
			if (typeof contextWEBGL.getSupportedExtensions === 'function') {
				if (contextWEBGL.getSupportedExtensions().indexOf('WEBGL_debug_renderer_info') !== -1) {
					var dbgRenderInfo = contextWEBGL.getExtension('WEBGL_debug_renderer_info');

					if (typeof dbgRenderInfo.UNMASKED_RENDERER_WEBGL !== 'undefined') {
						return contextWEBGL.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
					}
				}
			}
		}

		return undefined;
	})();

	// endregion

	// region Functions

	// Poor's man requirejs :)
	if (!global.importScripts) {
		global.importScripts = function (url, callback) {
			if (url) {
				// noinspection JSUnresolvedFunction
				if (!url.startsWith('js/')) {
					url = 'js/' + url;
				}

				// noinspection JSUnresolvedFunction
				if (!url.endsWith('.js')) {
					url += '.js';
				}

				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = url;

				callback = typeof callback === 'function' ? callback : function() {};

				if (script.addEventListener) {
					script.addEventListener('load', callback, false);
				} else if (script.readyState) {
					script.onreadystatechange = function() {
						if (script.readyState === 'loaded') {
							callback();
						}
					};
				}

				// Polyfilled
				document.head.appendChild(script);
			}
		}
	}

	// Poor's man requirejs :)
	if (!global.importStyles) {
		global.importStyles = function(url, callback) {
			if (url) {
				// noinspection JSUnresolvedFunction
				if (!url.startsWith('css/')) {
					url = 'css/' + url;
				}

				// noinspection JSUnresolvedFunction
				if (!url.endsWith('.css')) {
					url += '.css';
				}

				var style = document.createElement('link');
				style.type = 'text/css';
				style.rel = 'stylesheet';
				style.href = url;

				callback = typeof callback === 'function' ? callback : function() {};

				if (style.addEventListener) {
					style.addEventListener('load', callback, false);
				} else if (style.readyState) {
					style.onreadystatechange = function() {
						if (style.readyState === 'loaded') {
							callback();
						}
					};
				}

				// Polyfilled
				document.head.appendChild(style);
			}
		}
	}

	function dumpSystem() {
		var dump = [{
			Feature: 'SYSTEM_INFO_OS',
			Value: SYSTEM_INFO_OS + ' ' + SYSTEM_INFO_OS_VERSION
		} , {
			Feature: 'SYSTEM_INFO_ENVIRONMENT',
			Value: SYSTEM_INFO_ENVIRONMENT
		} , {
			Feature: 'SYSTEM_INFO_BROWSER',
			Value: SYSTEM_INFO_BROWSER + ' ' + SYSTEM_INFO_BROWSER_VERSION + ' (' + SYSTEM_INFO_CPU_ARCH + ')'
		} , {
			Feature: 'SYSTEM_INFO_CPU_ENDIANNESS',
			Value: SYSTEM_INFO_CPU_ENDIANNESS
		} , {
			Feature: 'SYSTEM_INFO_CPU_CORES',
			Value: SYSTEM_INFO_CPU_CORES
		} , {
			Feature: 'SYSTEM_INFO_CPU_ARCH',
			Value: SYSTEM_INFO_CPU_ARCH
		} , {
			Feature: 'SYSTEM_INFO_RAM',
			Value: SYSTEM_INFO_RAM
		} , {
			Feature: 'SYSTEM_INFO_GPU',
			Value: SYSTEM_INFO_GPU
		} , {
			Feature: 'SYSTEM_INFO_VIDEO_ACCELERATION',
			Value: SYSTEM_INFO_VIDEO_ACCELERATION
		} , {
			Feature: 'SYSTEM_FEATURE_ES3_BASE64',
			Value: SYSTEM_FEATURE_ES3_BASE64 ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES3',
			Value: SYSTEM_FEATURE_ES3 ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_STRICT_MODE',
			Value: SYSTEM_FEATURE_ES5_STRICT_MODE ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_XHR',
			Value: SYSTEM_FEATURE_ES5_XHR ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_JSON',
			Value: SYSTEM_FEATURE_ES5_JSON ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_SYNTAX',
			Value: SYSTEM_FEATURE_ES5_SYNTAX ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_UNDEFINED',
			Value: SYSTEM_FEATURE_ES5_UNDEFINED ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_ARRAY',
			Value: SYSTEM_FEATURE_ES5_ARRAY ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_DATE',
			Value: SYSTEM_FEATURE_ES5_DATE ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_FUNCTION',
			Value: SYSTEM_FEATURE_ES5_FUNCTION ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_OBJECT',
			Value: SYSTEM_FEATURE_ES5_OBJECT ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_STRING',
			Value: SYSTEM_FEATURE_ES5_STRING ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5_GETSET',
			Value: SYSTEM_FEATURE_ES5_GETSET ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES5',
			Value: SYSTEM_FEATURE_ES5 ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_NUMBER',
			Value: SYSTEM_FEATURE_ES6_NUMBER ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_MATH',
			Value: SYSTEM_FEATURE_ES6_MATH ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_ARRAY',
			Value: SYSTEM_FEATURE_ES6_ARRAY ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_FUNCTION',
			Value: SYSTEM_FEATURE_ES6_FUNCTION ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_OBJECT',
			Value: SYSTEM_FEATURE_ES6_OBJECT ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_STRING',
			Value: SYSTEM_FEATURE_ES6_STRING ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_COLLECTIONS',
			Value: SYSTEM_FEATURE_ES6_COLLECTIONS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_GENERATORS',
			Value: SYSTEM_FEATURE_ES6_GENERATORS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_PROMISES',
			Value: SYSTEM_FEATURE_ES6_PROMISES ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6_CLASS',
			Value: SYSTEM_FEATURE_ES6_CLASS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ES6',
			Value: SYSTEM_FEATURE_ES6 ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WORKERS',
			Value: SYSTEM_FEATURE_WORKERS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_SHARED_WORKERS',
			Value: SYSTEM_FEATURE_SHARED_WORKERS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_TYPED_ARRAYS',
			Value: SYSTEM_FEATURE_TYPED_ARRAYS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_BIGINTS',
			Value: SYSTEM_FEATURE_BIGINTS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_SIMD',
			Value: SYSTEM_FEATURE_SIMD ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ASMJS',
			Value: SYSTEM_FEATURE_ASMJS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WEBASSEMBLY',
			Value: SYSTEM_FEATURE_WEBASSEMBLY ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_FULLSCREEN',
			Value: SYSTEM_FEATURE_FULLSCREEN ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_POINTER_LOCK',
			Value: SYSTEM_FEATURE_POINTER_LOCK ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_TIMERS',
			Value: SYSTEM_FEATURE_TIMERS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_CANVAS',
			Value: SYSTEM_FEATURE_CANVAS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WEBGL',
			Value: SYSTEM_FEATURE_WEBGL ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WEBGL2',
			Value: SYSTEM_FEATURE_WEBGL2 ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WEBVR',
			Value: SYSTEM_FEATURE_WEBVR ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_HTML5AUDIO',
			Value: SYSTEM_FEATURE_HTML5AUDIO ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WEBAUDIO',
			Value: SYSTEM_FEATURE_WEBAUDIO ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WEBMIDI',
			Value: SYSTEM_FEATURE_WEBMIDI ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_KEYBOARD',
			Value: SYSTEM_FEATURE_KEYBOARD ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_POINTER_EVENTS',
			Value: SYSTEM_FEATURE_POINTER_EVENTS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_GAMEPADS',
			Value: SYSTEM_FEATURE_GAMEPADS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WEBSOCKETS',
			Value: SYSTEM_FEATURE_WEBSOCKETS ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_SESSION_STORAGE',
			Value: SYSTEM_FEATURE_SESSION_STORAGE ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_LOCAL_STORAGE',
			Value: SYSTEM_FEATURE_LOCAL_STORAGE ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_INDEXED_DB',
			Value: SYSTEM_FEATURE_INDEXED_DB ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_WEBSQL',
			Value: SYSTEM_FEATURE_WEBSQL ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_GEOLOCATION',
			Value: SYSTEM_FEATURE_GEOLOCATION ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_ORIENTATION',
			Value: SYSTEM_FEATURE_ORIENTATION ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_MOTION',
			Value: SYSTEM_FEATURE_MOTION ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_GYROSCOPE',
			Value: SYSTEM_FEATURE_GYROSCOPE ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_PROXIMITY',
			Value: SYSTEM_FEATURE_PROXIMITY ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_AMBIENTLIGHT',
			Value: SYSTEM_FEATURE_AMBIENTLIGHT ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_VIBRATION',
			Value: SYSTEM_FEATURE_VIBRATION ? 'TRUE' : 'FALSE'
		} , {
			Feature: 'SYSTEM_FEATURE_BATTERY',
			Value: SYSTEM_FEATURE_BATTERY ? 'TRUE' : 'FALSE'
		}];

		//Microsoft Edge 17.17134 (64-bit) cannot list more than 50 items in a table
		if (isEdge) {
			var chunks = function(array, size) {
				var results = [];

				while (array.length) {
					results.push(array.splice(0, size));
				}

				return results;
			};

			dump = chunks(dump, 50);

			for (var d in dump) {
				global.console.table(dump[d]);
			}
		} else {
			global.console.table(dump);
		}
	}

	// endregion

	dumpSystem();

	onerror = function(message, url, lineNumber) {
		global.console.log('Error: ' + message + ' in ' + url + ' at line ' + lineNumber);
	};
} (this));