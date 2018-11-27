// noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
	'use strict';

	// TODO: Benchmark DataView vs TypedArrays performance

	var CPU = function() {
		global.console.log('CPU i8086 initialised!');

		var self = this;

		self.BB = new ArrayBuffer(28 + 1024 * 1024); // 28 bytes for registers + 1048576 bytes for ram
		self.B = new DataView(self.BB);
		self.B8 = new Uint8Array(self.BB);
		self.B16 = new Uint16Array(self.BB);
		self.B32 = new Uint32Array(self.BB);

		self.BS = self.BB.slice(0, 28);
		self.S = new DataView(self.BS);
		self.S8 = new Uint8Array(self.BS);
		self.S16 = new Uint16Array(self.BS);
		self.S32 = new Uint32Array(self.BS);

		self.BRAM = self.BB.slice(28);
		self.RAM = new DataView(self.BRAM);
		self.RAM8 = new Uint8Array(self.BRAM);
		self.RAM16 = new Uint16Array(self.BRAM);
		self.RAM32 = new Uint32Array(self.BRAM);

		self.R = {
			INDEX: {
				AL: 0x00,
				AH: 0x01,
				BL: 0x02,
				BH: 0x03,
				CL: 0x04,
				CH: 0x05,
				DL: 0x06,
				DH: 0x07,
				AX: 0x00,
				BX: 0x02,
				CX: 0x04,
				DX: 0x06,
				CS: 0x08,
				DS: 0x0A,
				ES: 0x0C,
				SS: 0x0E,
				SI: 0x10,
				DI: 0x12,
				BP: 0x14,
				SP: 0x16,
				IP: 0x18,
				F:	0x1A
			},
			get AL() {
				return self.S.getUint8(this.INDEX.AL);
			},
			set AL(val) {
				self.S.setUint8(this.INDEX.AL, val);
			},
			get AH() {
				return self.S.getUint8(this.INDEX.AH);
			},
			set AH(val) {
				self.S.setUint8(this.INDEX.AH, val);
			},
			get BL() {
				return self.S.getUint8(this.INDEX.BL);
			},
			set BL(val) {
				self.S.setUint8(this.INDEX.BL, val);
			},
			get BH() {
				return self.S.getUint8(this.INDEX.BH);
			},
			set BH(val) {
				self.S.setUint8(this.INDEX.BH, val);
			},
			get CL() {
				return self.S.getUint8(this.INDEX.CL);
			},
			set CL(val) {
				self.S.setUint8(this.INDEX.CL, val);
			},
			get CH() {
				return self.S.getUint8(this.INDEX.CH);
			},
			set CH(val) {
				self.S.setUint8(this.INDEX.CH, val);
			},
			get DL() {
				return self.S.getUint8(this.INDEX.DL);
			},
			set DL(val) {
				self.S.setUint8(this.INDEX.DL, val);
			},
			get DH() {
				return self.S.getUint8(this.INDEX.DH);
			},
			set DH(val) {
				self.S.setUint8(this.INDEX.DH, val);
			},
			get AX() {
				return self.S.getUint16(this.INDEX.AX, true);
			},
			set AX(val) {
				self.S.setUint16(this.INDEX.AX, val, true);
			},
			get BX() {
				return self.S.getUint16(this.INDEX.BX, true);
			},
			set BX(val) {
				self.S.setUint16(this.INDEX.BX, val, true);
			},
			get CX() {
				return self.S.getUint16(this.INDEX.CX, true);
			},
			set CX(val) {
				self.S.setUint16(this.INDEX.CX, val, true);
			},
			get DX() {
				return self.S.getUint16(this.INDEX.DX, true);
			},
			set DX(val) {
				self.S.setUint16(this.INDEX.DX, val, true);
			},
			get CS() {
				return self.S.getUint16(this.INDEX.CS, true);
			},
			set CS(val) {
				self.S.setUint16(this.INDEX.CS, val, true);
			},
			get DS() {
				return self.S.getUint16(this.INDEX.DS, true);
			},
			set DS(val) {
				self.S.setUint16(this.INDEX.DS, val, true);
			},
			get ES() {
				return self.S.getUint16(this.INDEX.ES, true);
			},
			set ES(val) {
				self.S.setUint16(this.INDEX.ES, val, true);
			},
			get SS() {
				return self.S.getUint16(this.INDEX.SS, true);
			},
			set SS(val) {
				self.S.setUint16(this.INDEX.SS, val, true);
			},
			get SI() {
				return self.S.getUint16(this.INDEX.SI, true);
			},
			set SI(val) {
				self.S.setUint16(this.INDEX.SI, val, true);
			},
			get DI() {
				return self.S.getUint16(this.INDEX.DI, true);
			},
			set DI(val) {
				self.S.setUint16(this.INDEX.DI, val, true);
			},
			get BP() {
				return self.S.getUint16(this.INDEX.BP, true);
			},
			set BP(val) {
				self.S.setUint16(this.INDEX.BP, val, true);
			},
			get SP() {
				return self.S.getUint16(this.INDEX.SP, true);
			},
			set SP(val) {
				self.S.setUint16(this.INDEX.SP, val, true);
			},
			get IP() {
				return self.S.getUint16(this.INDEX.IP, true);
			},
			set IP(val) {
				self.S.setUint16(this.INDEX.IP, val, true);
			},
			get F() {
				return self.S.getUint16(this.INDEX.F, true);
			},
			set F(val) {
				self.S.setUint16(this.INDEX.F, val, true);
			}
		};
		self.R8 = {
			INDEX: {
				AL: 0x00,
				AH: 0x01,
				BL: 0x02,
				BH: 0x03,
				CL: 0x04,
				CH: 0x05,
				DL: 0x06,
				DH: 0x07
			},
			get AL() {
				return self.S8[this.INDEX.AL];
			},
			set AL(val) {
				self.S8[this.INDEX.AL] = val;
			},
			get AH() {
				return self.S8[this.INDEX.AH];
			},
			set AH(val) {
				self.S8[this.INDEX.AH] = val;
			},
			get BL() {
				return self.S8[this.INDEX.BL];
			},
			set BL(val) {
				self.S8[this.INDEX.BL] = val;
			},
			get BH() {
				return self.S8[this.INDEX.BH];
			},
			set BH(val) {
				self.S8[this.INDEX.BH] = val;
			},
			get CL() {
				return self.S8[this.INDEX.CL];
			},
			set CL(val) {
				self.S8[this.INDEX.CL] = val;
			},
			get CH() {
				return self.S8[this.INDEX.CH];
			},
			set CH(val) {
				self.S8[this.INDEX.CH] = val;
			},
			get DL() {
				return self.S8[this.INDEX.DL];
			},
			set DL(val) {
				self.S8[this.INDEX.DL] = val;
			},
			get DH() {
				return self.S8[this.INDEX.DH];
			},
			set DH(val) {
				self.S8[this.INDEX.DH] = val;
			}
		};
		self.R16 = {
			INDEX: {
				AX: 0x00,
				BX: 0x01,
				CX: 0x02,
				DX: 0x03,
				CS: 0x04,
				DS: 0x05,
				ES: 0x06,
				SS: 0x07,
				SI: 0x08,
				DI: 0x09,
				BP: 0x0A,
				SP: 0x0B,
				IP: 0x0C,
				F:	0x0D
			},
			get AX() {
				return self.S16[this.INDEX.AX];
			},
			set AX(val) {
				self.S16[this.INDEX.AX] = val;
			},
			get BX() {
				return self.S16[this.INDEX.BX];
			},
			set BX(val) {
				self.S16[this.INDEX.BX] = val;
			},
			get CX() {
				return self.S16[this.INDEX.CX];
			},
			set CX(val) {
				self.S16[this.INDEX.CX] = val;
			},
			get DX() {
				return self.S16[this.INDEX.DX];
			},
			set DX(val) {
				self.S16[this.INDEX.DX] = val;
			},
			get CS() {
				return self.S16[this.INDEX.CS];
			},
			set CS(val) {
				self.S16[this.INDEX.CS] = val;
			},
			get DS() {
				return self.S16[this.INDEX.DS];
			},
			set DS(val) {
				self.S16[this.INDEX.DS] = val;
			},
			get ES() {
				return self.S16[this.INDEX.ES];
			},
			set ES(val) {
				self.S16[this.INDEX.ES] = val;
			},
			get SS() {
				return self.S16[this.INDEX.SS];
			},
			set SS(val) {
				self.S16[this.INDEX.SS] = val;
			},
			get SI() {
				return self.S16[this.INDEX.SI];
			},
			set SI(val) {
				self.S16[this.INDEX.SI] = val;
			},
			get DI() {
				return self.S16[this.INDEX.DI];
			},
			set DI(val) {
				self.S16[this.INDEX.DI] = val;
			},
			get BP() {
				return self.S16[this.INDEX.BP];
			},
			set BP(val) {
				self.S16[this.INDEX.BP] = val;
			},
			get SP() {
				return self.S16[this.INDEX.SP];
			},
			set SP(val) {
				self.S16[this.INDEX.SP] = val;
			},
			get IP() {
				return self.S16[this.INDEX.IP];
			},
			set IP(val) {
				self.S16[this.INDEX.IP] = val;
			},
			get F() {
				return self.S16[this.INDEX.F];
			},
			set F(val) {
				self.S16[this.INDEX.F] = val;
			}
		};

		self.F = {
			INDEX: {
				CF:		0x00, // bit 0: Carry Flag
				BIT1:	0x01, // bit 1: reserved, always set
				PF:		0x02, // bit 2: Parity Flag
				BIT3:	0x03, // bit 3: reserved, always clear
				AF:		0x04, // bit 4: Auxiliary Carry Flag (aka Arithmetic flag)
				BIT5:	0x05, // bit 5: reserved, always clear
				ZF:		0x06, // bit 6: Zero Flag
				SF:		0x07, // bit 7: Sign Flag
				TF:		0x08, // bit 8: Trap Flag
				IF:		0x09, // bit 9: Interrupt Flag
				DF:		0x0A, // bit 10: Direction Flag
				OF:		0x0B, // bit 11: Overflow Flag
				BIT12:	0x0C, // bit 12: reserved, always set
				BIT13:	0x0D, // bit 13: reserved, always set
				BIT14:	0x0E, // bit 14: reserved, always set
				BIT15:	0x0F  // bit 15: reserved, always set
			},
			MASK: {
				CF:		0x0001,
				BIT1:	0x0002,
				PF:		0x0004,
				BIT3:	0x0008,
				AF:		0x0010,
				BIT5:	0x0020,
				ZF:		0x0040,
				SF:		0x0080,
				TF:		0x0100,
				IF:		0x0200,
				DF:		0x0400,
				OF:		0x0800,
				BIT12:	0x1000,
				BIT13:	0x2000,
				BIT14:	0x4000,
				BIT15:	0x8000
			},
			get CF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.CF) >>> this.INDEX.CF;
			},
			set CF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.CF) : (self.R.F & ~this.MASK.CF), true);
			},
			get BIT1() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.BIT1) >>> this.INDEX.BIT1;
			},
			set BIT1(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.BIT1) : (self.R.F & ~this.MASK.BIT1), true);
			},
			get PF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.PF) >>> this.INDEX.PF;
			},
			set PF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.PF) : (self.R.F & ~this.MASK.PF), true);
			},
			get BIT3() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.BIT3) >>> this.INDEX.BIT3;
			},
			set BIT3(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.BIT3) : (self.R.F & ~this.MASK.BIT3), true);
			},
			get AF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.AF) >>> this.INDEX.AF;
			},
			set AF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.AF) : (self.R.F & ~this.MASK.AF), true);
			},
			get BIT5() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.BIT5) >>> this.INDEX.BIT5;
			},
			set BIT5(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.BIT5) : (self.R.F & ~this.MASK.BIT5), true);
			},
			get ZF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.ZF) >>> this.INDEX.ZF;
			},
			set ZF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.ZF) : (self.R.F & ~this.MASK.ZF), true);
			},
			get SF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.SF) >>> this.INDEX.SF;
			},
			set SF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.SF) : (self.R.F & ~this.MASK.SF), true);
			},
			get TF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.TF) >>> this.INDEX.TF;
			},
			set TF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.TF) : (self.R.F & ~this.MASK.TF), true);
			},
			get IF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.IF) >>> this.INDEX.IF;
			},
			set IF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.IF) : (self.R.F & ~this.MASK.IF), true);
			},
			get DF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.DF) >>> this.INDEX.DF;
			},
			set DF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.DF) : (self.R.F & ~this.MASK.DF), true);
			},
			get OF() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.OF) >>> this.INDEX.OF;
			},
			set OF(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.OF) : (self.R.F & ~this.MASK.OF), true);
			},
			get BIT12() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.BIT12) >>> this.INDEX.BIT12;
			},
			set BIT12(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.BIT12) : (self.R.F & ~this.MASK.BIT12), true);
			},
			get BIT13() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.BIT13) >>> this.INDEX.BIT13;
			},
			set BIT13(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.BIT13) : (self.R.F & ~this.MASK.BIT13), true);
			},
			get BIT14() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.BIT14) >>> this.INDEX.BIT14;
			},
			set BIT14(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.BIT14) : (self.R.F & ~this.MASK.BIT14), true);
			},
			get BIT15() {
				return (self.S.getUint16(self.R.INDEX.F, true) & this.MASK.BIT15) >>> this.INDEX.BIT15;
			},
			set BIT15(val) {
				self.S.setUint16(self.R.INDEX.F, val ? (self.R.F | this.MASK.BIT15) : (self.R.F & ~this.MASK.BIT15), true);
			}
		};
	};

	CPU.prototype.dumpState = function() {
		console.table([{
			Register: 'AX',
			Value: this.R.AX.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'BX',
			Value: this.R.BX.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'CX',
			Value: this.R.CX.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'DX',
			Value: this.R.DX.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'CS',
			Value: this.R.CS.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'DS',
			Value: this.R.DS.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'ES',
			Value: this.R.ES.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'SS',
			Value: this.R.SS.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'SI',
			Value: this.R.SI.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'DI',
			Value: this.R.DI.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'BP',
			Value: this.R.BP.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'SP',
			Value: this.R.SP.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'IP',
			Value: this.R.IP.toString(16).padStart(4, '0').toUpperCase()
		} , {
			Register: 'Flags',
			Value: this.R.F.toString(16).padStart(4, '0').toUpperCase()
		}]);
	};

	CPU.prototype.start = function() {
		var self = this;

		self.R.AX = 0x1111;
		self.R.BX = 0x2222;
		self.R.CX = 0x3333;
		self.R.DX = 0x4444;
		self.R.CS = 0x5555;
		self.R.DS = 0x6666;
		self.R.ES = 0x7777;
		self.R.SS = 0x8888;
		self.R.SI = 0x9999;
		self.R.DI = 0xAAAA;
		self.R.BP = 0xBBBB;
		self.R.SP = 0xCCCC;
		self.R.IP = 0xDDDD;
		self.R.F = 0xF002; // starting value for flags

		self.RAM8 = Uint8Array.from({length: 1024 * 1024}, function(v, k) { return k; });
	};

	if (typeof global.CPU === 'undefined') {
		global.CPU = CPU;
	}

})(this);