// region Polyfills

// IE 11.228.17134.0
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}

// IE 11.228.17134.0
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}

		return this.substring(this_len - search.length, this_len) === search;
	};
}

// IE 11.228.17134.0
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

// IE 11.228.17134.0
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

// IE 11.228.17134.0
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
		function clamp(val, length) {
			val = (val|0) || 0;

			if (val < 0) {
				return Math.max(val + length, 0);
			}

			return Math.min(val, length);
		}

		ArrayBuffer.prototype.slice = function (from, to) {
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
	// IE 10?
	if (!Int8Array.from) {
		Int8Array.from = function (obj, func, thisObj) {
			func = func || function (elem) {
				return elem;
			};

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
	// IE 10?
	if (!Uint8Array.from) {
		Uint8Array.from = function (obj, func, thisObj) {
			func = func || function (elem) {
				return elem;
			};

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
	}

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
		// noinspection JSUnresolvedVariable
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

// IE 11.228.17134.0
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
		// noinspection JSValidateTypes
		console = {
			log: function() {
			},
			table: function() {
			}
		};
	} else if (typeof postMessage !== 'undefined') {
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

	'use strict';

	var cpu = null;

	function load(cpuscript) {
		if (typeof cpuscript === 'undefined') {
			cpuscript = global.cpuscript;
		}

		global.console.log('Running in worker!');
		// synchronous load
		importScripts(cpuscript);

		return init();
	}

	function init() {
		cpu = new CPU();
		cpu.start();
		cpu.dumpState();

		if (typeof global.update === 'function') {
			global.update(cpu);
		}

		return cpu;
	}

	if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document) {
		global.console.log('Running in page!');
		// asynchronous load
		// noinspection JSCheckFunctionSignatures
		importScripts(cpuscript, init);
	}

	onmessage = function(e) {
		// global.console.log('browser => cpu');
		// global.console.log(JSON.parse(JSON.stringify(e)));
		// global.console.log(e.data);

		if (typeof e.data === 'object') {
			if (typeof e.data.cpu !== 'undefined') {
				return postMessage({state: load(e.data.cpu)});
			}

			if (typeof e.data.state !== 'undefined') {
				return postMessage({state: cpu});
			}
		} else {
			return postMessage('ok');
		}
	};

}(this));