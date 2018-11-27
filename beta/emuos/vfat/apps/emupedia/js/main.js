// noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {

	'use strict';

	// region Variables

	var $TKEYBOARD = $('.toggle-keyboard');

	var $KEYBOARD = $('.keyboard');

	var $STATE	= $('.STATE');
	var $RAM	= $('.ram');

	var $AX		= $('.AX');
	var $BX		= $('.BX');
	var $CX		= $('.CX');
	var $DX		= $('.DX');

	var $AH		= $('.AH');
	var $AL		= $('.AL');
	var $BH		= $('.BH');
	var $BL		= $('.BL');
	var $CH		= $('.CH');
	var $CL		= $('.CL');
	var $DH		= $('.DH');
	var $DL		= $('.DL');

	var $CS		= $('.CS');
	var $DS		= $('.DS');
	var $ES		= $('.ES');
	var $SS		= $('.SS');

	var $SI		= $('.SI');
	var $DI		= $('.DI');
	var $BP		= $('.BP');
	var $SP		= $('.SP');

	var $IP		= $('.IP');

	var $F		= $('.F');

	var $FLAGS	= $('.FLAGS');

	var $CF		= $('.CF');
	var $PF		= $('.PF');
	var $AF		= $('.AF');
	var $ZF		= $('.ZF');
	var $SF		= $('.SF');
	var $TF		= $('.TF');
	var $IF		= $('.IF');
	var $DF		= $('.DF');
	var $OF		= $('.OF');

	var cpu		= null;

	// endregion

	// region Functions

	function dumpASCII(buffer) {
		return buffer.map(function(b) {
			return b >= 32 && b < 128 ? String.fromCharCode(b) : '.';
		}).join('');
	}

	function dumpBuffer(buffer, radix, padding) {
		return buffer.map(function(b) {
			// noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			return b.toString(radix).padStart(padding, '0');
		}).join(' ').toUpperCase();
	}

	function dumpHexView(table, buffer, radix) {
		// var len = buffer.length / 16;
		var len = 30;
		var offset = 0;

		var fragment = document.createDocumentFragment();

		for (var i = 0; i < len; i++) {
			var buf = buffer.slice(i * 16, (i + 1) * 16);
			// var row = fragment.insertRow(-1);
			var row = document.createElement('TR');
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);

			cell1.innerHTML = offset.toString(radix).padStart(8, '0').toUpperCase();
			cell2.innerHTML = dumpBuffer(buf, radix, 2);
			cell3.innerHTML = dumpASCII(buf);

			fragment.appendChild(row);

			offset += 16
		}

		table.tBodies[0].appendChild(fragment);
	}

	function printState(state) {
		if (state) {
			$STATE.innerHTML = dumpBuffer(Array.from(new Uint16Array(state.S16)), 16, 4).replace(' ', '&nbsp;');
			dumpHexView($RAM, Array.from(new Uint8Array(state.RAM8)), 16);

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$AX.innerHTML = state.R.AX.toString(16).padStart(4, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$BX.innerHTML = state.R.BX.toString(16).padStart(4, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$CX.innerHTML = state.R.CX.toString(16).padStart(4, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$DX.innerHTML = state.R.DX.toString(16).padStart(4, '0').toUpperCase();

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$AH.innerHTML = state.R.AH.toString(16).padStart(2, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$AL.innerHTML = state.R.AL.toString(16).padStart(2, '0').toUpperCase();

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$BH.innerHTML = state.R.BH.toString(16).padStart(2, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$BL.innerHTML = state.R.BL.toString(16).padStart(2, '0').toUpperCase();

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$CH.innerHTML = state.R.CH.toString(16).padStart(2, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$CL.innerHTML = state.R.CL.toString(16).padStart(2, '0').toUpperCase();

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$DH.innerHTML = state.R.DH.toString(16).padStart(2, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$DL.innerHTML = state.R.DL.toString(16).padStart(2, '0').toUpperCase();

			// noinspection JSUnresolvedFunction
			$CS.innerHTML = state.R.CS.toString(16).padStart(4, '0').toUpperCase();
			// noinspection JSUnresolvedFunction
			$DS.innerHTML = state.R.DS.toString(16).padStart(4, '0').toUpperCase();
			// noinspection JSUnresolvedFunction
			$ES.innerHTML = state.R.ES.toString(16).padStart(4, '0').toUpperCase();
			// noinspection JSUnresolvedFunction
			$SS.innerHTML = state.R.SS.toString(16).padStart(4, '0').toUpperCase();

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$SI.innerHTML = state.R.SI.toString(16).padStart(4, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$DI.innerHTML = state.R.DI.toString(16).padStart(4, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$BP.innerHTML = state.R.BP.toString(16).padStart(4, '0').toUpperCase();
			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$SP.innerHTML = state.R.SP.toString(16).padStart(4, '0').toUpperCase();

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$IP.innerHTML = state.R.IP.toString(16).padStart(4, '0').toUpperCase();

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$F.innerHTML = state.R.F.toString(16).padStart(4, '0').toUpperCase();

			//noinspection JSCheckFunctionSignatures,JSUnresolvedFunction
			$FLAGS.innerHTML = state.R.F.toString(2).padStart(16, '0').toUpperCase().split('').join('&nbsp;');

			$CF.innerHTML = state.F.CF;
			$PF.innerHTML = state.F.PF;
			$AF.innerHTML = state.F.AF;
			$ZF.innerHTML = state.F.ZF;
			$SF.innerHTML = state.F.SF;
			$TF.innerHTML = state.F.TF;
			$IF.innerHTML = state.F.IF;
			$DF.innerHTML = state.F.DF;
			$OF.innerHTML = state.F.OF;
		}
	}

	// endregion

	// region Events

	// noinspection NodeModulesDependencies
	$.on($TKEYBOARD, 'click', function(e) {
		global.console.log(e);
		$KEYBOARD.style.display = $KEYBOARD.style.display === 'block' ? 'none' : 'block';
	});

	// endregion

	global.cpuscript = 'i8086/cpu-es5.js';

	if (global.SYSTEM_FEATURE_WORKERS) {
		cpu = new Worker('js/worker.js');

		cpu.onmessage = function(e) {
			// global.console.log('cpu => browser');
			// global.console.log(e);
			// global.console.log(e.data);

			if (typeof e.data.state !== 'undefined') {
				if (e.data.state) {
					printState(e.data.state);
				} else {
					global.console.log(e.data);
				}
			} else {
				global.console.log(e.data);
			}
		};

		// noinspection JSUndefinedPropertyAssignment
		cpu.onmessageerror = function() {
			global.console.log('cpu.onmessageerror()');
		};

		cpu.onerror = function() {
			global.console.log('cpu.onerror()');
		};

		// noinspection JSDeprecatedSymbols
		cpu.postMessage({cpu: global.cpuscript});
		// cpu.postMessage({state: null});
	} else if (global.SYSTEM_FEATURE_TYPED_ARRAYS) {
		global.update = function(state) {
			if (state) {
				printState(state);
			}
		};

		importScripts('js/worker.js');
	} else {
		global.update = function(state) {
			printState(state);
		};

		if (!global.SYSTEM_FEATURE_ES5GETSET) {
			global.cpuscript = 'i8086/cpu-es3.js';
		}

		// TODO: IE 9.0 / Opera 9.6.4 / KMeleon <= 1.6.0 / Firefox < 4.0 no support for Typed Arrays, Polyfill very slow
		if (!global.isNetscape && !(global.isIE && parseInt(global.SYSTEM_INFO_BROWSER_VERSION.split('.')[0]) <= 9) && !(global.isOperaPresto && parseInt(global.SYSTEM_INFO_BROWSER_VERSION.split('.')[0]) <= 9) && !(global.isKMeleon && parseInt(global.SYSTEM_INFO_BROWSER_VERSION.split('.')[0]) <= 1) && !(global.isFirefox && parseInt(global.SYSTEM_INFO_BROWSER_VERSION.split('.')[0]) < 4)) {
			importScripts('js/typedarray.js', function() {
				importScripts('js/worker.js');
			});
		} else {
			alert('BROWSER NOT SUPPORTED!');
			global.console.log('BROWSER NOT SUPPORTED!');
		}
	}

}(this));