var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Coding = (function () {
    function Coding(encoder) {
        this._enc = encoder;
        this._dec = [];
        var loop = encoder.length;
        for (var i = 0; i < loop; i++) {
            this._dec[this._enc[i]] = i;
        }
    }
    Coding.prototype.encode = function (index) {
        return this._enc[index];
    };
    Coding.prototype.decode = function (code) {
        return this._dec[code];
    };
    return Coding;
})();
;
var GrayCoding = (function (_super) {
    __extends(GrayCoding, _super);
    function GrayCoding(bitWidth) {
        var encoder = [];
        var loop = (1 << bitWidth);
        for (var i = 0; i < loop; i++) {
            encoder[i] = i ^ (i >> 1);
        }
        _super.call(this, encoder);
    }
    return GrayCoding;
})(Coding);
;
var NaturalBinaryCoding = (function (_super) {
    __extends(NaturalBinaryCoding, _super);
    function NaturalBinaryCoding() {
        _super.call(this, []);
    }
    NaturalBinaryCoding.prototype.encode = function (index) {
        return index;
    };
    NaturalBinaryCoding.prototype.decode = function (code) {
        return code;
    };
    return NaturalBinaryCoding;
})(Coding);
;
var Complex = (function () {
    function Complex(r, i) {
        this.real = r;
        this.imag = i;
    }
    Complex.polar = function (r, theta) {
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
    };
    /* destructive */
    Complex.prototype.add = function (other) {
        this.real += other.real;
        this.imag += other.imag;
        return this;
    };
    /* destructive */
    Complex.prototype.sub = function (other) {
        this.real -= other.real;
        this.imag -= other.imag;
        return this;
    };
    /* destructive */
    Complex.prototype.mul = function (other) {
        var treal = this.real, timag = this.imag;
        var oreal = other.real, oimag = other.imag;
        this.real = treal * oreal - timag * oimag;
        this.imag = treal * oimag + timag * oreal;
        return this;
    };
    Complex.prototype.clone = function () {
        return new Complex(this.real, this.imag);
    };
    return Complex;
})();
var PskModulator = (function () {
    function PskModulator(m) {
        this._unit = 2 * Math.PI / m;
    }
    PskModulator.prototype.modulate = function (sym) {
        return Complex.polar(1, sym * this._unit);
    };
    return PskModulator;
})();
var Psk2Demodulator = (function () {
    function Psk2Demodulator() {
    }
    Psk2Demodulator.prototype.demodulate = function (vect) {
        return vect.real > 0 ? 0 : 1;
    };
    return Psk2Demodulator;
})();
var Psk3Demodulator = (function () {
    function Psk3Demodulator() {
        this._cw = Complex.polar(1, -Math.PI / 6);
        this._ccw = Complex.polar(1, Math.PI / 6);
    }
    Psk3Demodulator.prototype.demodulate = function (vect) {
        if (vect.imag > 0) {
            var ccw = vect.clone().mul(this._ccw);
            if (ccw.real < 0) {
                return 1;
            }
        }
        else {
            var cw = vect.clone().mul(this._cw);
            if (cw.real < 0) {
                return 2;
            }
        }
        return 0;
    };
    return Psk3Demodulator;
})();
var Psk4Demodulator = (function () {
    function Psk4Demodulator() {
        this._rot = Complex.polar(1, Math.PI / 4);
    }
    Psk4Demodulator.prototype.demodulate = function (vect) {
        vect = vect.clone();
        vect.mul(this._rot);
        if (vect.real > 0) {
            return vect.imag > 0 ? 0 : 3;
        }
        else {
            return vect.imag > 0 ? 1 : 2;
        }
    };
    return Psk4Demodulator;
})();
var Psk5Demodulator = (function () {
    function Psk5Demodulator() {
        this._cw1_5 = Complex.polar(1, -Math.PI / 5);
        this._cw2_5 = Complex.polar(1, -Math.PI * 2 / 5);
        this._ccw1_5 = Complex.polar(1, Math.PI / 5);
        this._ccw2_5 = Complex.polar(1, Math.PI * 2 / 5);
    }
    Psk5Demodulator.prototype.demodulate = function (vect) {
        if (vect.imag > 0) {
            var u1_5 = vect.clone().mul(this._cw1_5);
            if (u1_5.imag > 0) {
                return u1_5.mul(this._cw2_5).imag > 0 ? 2 : 1;
            }
        }
        else {
            var l1_5 = vect.clone().mul(this._ccw1_5);
            if (l1_5.imag < 0) {
                return l1_5.mul(this._ccw2_5).imag > 0 ? 4 : 3;
            }
        }
        return 0;
    };
    return Psk5Demodulator;
})();
var Psk6Demodulator = (function () {
    function Psk6Demodulator() {
        this._cw = Complex.polar(1, -Math.PI / 6);
        this._ccw = Complex.polar(1, Math.PI / 6);
    }
    Psk6Demodulator.prototype.demodulate = function (vect) {
        var pow2 = vect.clone().mul(vect);
        var pow3realpos = pow2.clone().mul(vect).real > 0;
        if (pow2.imag > 0) {
            if (pow2.mul(this._ccw).real < 0) {
                return pow3realpos ? 4 : 1;
            }
        }
        else {
            if (pow2.mul(this._cw).real < 0) {
                return pow3realpos ? 2 : 5;
            }
        }
        return pow3realpos ? 0 : 3;
    };
    return Psk6Demodulator;
})();
var Psk7Demodulator = (function () {
    function Psk7Demodulator() {
        this._cw1_7 = Complex.polar(1, -Math.PI / 7);
        this._cw2_7 = Complex.polar(1, -Math.PI * 2 / 7);
        this._cw3_7 = Complex.polar(1, -Math.PI * 3 / 7);
        this._ccw1_7 = Complex.polar(1, Math.PI / 7);
        this._ccw2_7 = Complex.polar(1, Math.PI * 2 / 7);
        this._ccw3_7 = Complex.polar(1, Math.PI * 3 / 7);
    }
    Psk7Demodulator.prototype.demodulate = function (vect) {
        if (vect.imag > 0) {
            var u3_7 = vect.clone().mul(this._cw3_7);
            if (u3_7.imag > 0) {
                return u3_7.mul(this._cw2_7).imag > 0 ? 3 : 2;
            }
            else {
                if (u3_7.mul(this._ccw2_7).imag > 0) {
                    return 1;
                }
            }
        }
        else {
            var l3_7 = vect.clone().mul(this._ccw3_7);
            if (l3_7.imag < 0) {
                return l3_7.mul(this._ccw2_7).imag > 0 ? 5 : 4;
            }
            else {
                if (l3_7.mul(this._cw2_7).imag < 0) {
                    return 6;
                }
            }
        }
        return 0;
    };
    return Psk7Demodulator;
})();
var Psk8Demodulator = (function () {
    function Psk8Demodulator() {
        this.rotate4 = Complex.polar(1, Math.PI / 4);
        this.rotate8 = Complex.polar(1, Math.PI / 8);
    }
    Psk8Demodulator.prototype.demodulate = function (vect) {
        vect = vect.clone();
        vect.mul(this.rotate8);
        var quad_i = vect.real, quad_q = vect.imag;
        vect.mul(this.rotate4);
        var half_i = vect.real, half_q = vect.imag;
        if (quad_i > 0) {
            if (quad_q > 0) {
                return half_i > 0 ? 0 : 1;
            }
            else {
                return half_q > 0 ? 7 : 6;
            }
        }
        else {
            if (quad_q > 0) {
                return half_q > 0 ? 2 : 3;
            }
            else {
                return half_i > 0 ? 5 : 4;
            }
        }
    };
    return Psk8Demodulator;
})();
var BasebandGenerator = (function () {
    function BasebandGenerator(m) {
        this._m = m;
    }
    BasebandGenerator.prototype.generate = function (u0) {
        return Math.floor(u0 * this._m);
    };
    return BasebandGenerator;
})();
var AwgnGenerator = (function () {
    function AwgnGenerator(sigma) {
        this._pi2 = Math.PI * 2;
        this._sigma = sigma;
    }
    AwgnGenerator.prototype.generate = function (u1, u2) {
        var a = this._sigma * Math.sqrt(-2 * Math.log(u1));
        var t = this._pi2 * u2;
        return new Complex(a * Math.cos(t), a * Math.sin(t));
    };
    return AwgnGenerator;
})();
var Symbol = (function () {
    function Symbol() {
    }
    return Symbol;
})();
var CanvasView = (function () {
    function CanvasView() {
        this._canvas = document.getElementById('c');
        this._cctx = this._canvas.getContext('2d');
        this._shadow = document.createElement('canvas');
        this._shadow.width = this._canvas.width;
        this._shadow.height = this._canvas.height;
        this.context = this._shadow.getContext('2d');
    }
    CanvasView.prototype.show = function () {
        this._cctx.drawImage(this._shadow, 0, 0);
    };
    return CanvasView;
})();
var SimulatorFacade = (function () {
    function SimulatorFacade() {
        this.canvas = new CanvasView;
        this.coding = new GrayCoding(3);
        this.baseband = new BasebandGenerator(8);
        this.awgn = new AwgnGenerator(0.223);
        this.modulator = new PskModulator(8);
        this.demodulator = new Psk8Demodulator();
        this.listen();
    }
    SimulatorFacade.prototype.listen = function () {
        var that = this;
        var inputCoding = document.getElementById('nat');
        var inputCnr = document.getElementById('sigma');
        var inputMpsk = document.getElementById('mpsk');
        function applyCoding() {
            if (inputCoding.checked) {
                that.coding = new NaturalBinaryCoding;
            }
            else {
                var m = Math.floor(Number(inputMpsk.value));
                var bitWidth = Math.ceil(Math.LOG2E * Math.log(m));
                that.coding = new GrayCoding(bitWidth);
            }
        }
        function applyMpsk() {
            var m = Math.floor(Number(inputMpsk.value));
            that.modulator = new PskModulator(m);
            if (m == 2) {
                that.demodulator = new Psk2Demodulator();
            }
            else if (m == 3) {
                that.demodulator = new Psk3Demodulator();
            }
            else if (m == 4) {
                that.demodulator = new Psk4Demodulator();
            }
            else if (m == 5) {
                that.demodulator = new Psk5Demodulator();
            }
            else if (m == 6) {
                that.demodulator = new Psk6Demodulator();
            }
            else if (m == 7) {
                that.demodulator = new Psk7Demodulator();
            }
            else {
                that.demodulator = new Psk8Demodulator();
            }
            that.baseband = new BasebandGenerator(m);
            applyCoding();
        }
        inputCoding.addEventListener('change', applyCoding);
        inputMpsk.addEventListener('change', applyMpsk);
        inputCnr.addEventListener('change', function () {
            var cnrdb = Number(inputCnr.value) / 10;
            var cnr = Math.pow(10, cnrdb);
            var sigma = Math.sqrt(0.5 / cnr);
            that.awgn = new AwgnGenerator(sigma);
        });
    };
    return SimulatorFacade;
})();
var Main = (function () {
    function Main() {
        this._facade = new SimulatorFacade;
    }
    Main.prototype.animate_psk8 = function () {
        var that = this;
        (function loop() {
            requestAnimationFrame(function () {
                that.do_psk8();
            });
            setTimeout(loop, 1000 / 15);
        })();
    };
    Main.prototype.do_psk8 = function () {
        var mag = 100;
        var bufsize = 500;
        var ctx = this._facade.canvas.context;
        var bb = this._facade.baseband;
        var coding = this._facade.coding;
        var mod = this._facade.modulator;
        var demod = this._facade.demodulator;
        var awgn = this._facade.awgn;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 400, 400);
        var err = 0;
        var symbols = new Array(bufsize);
        for (var i = 0; i < 20; i++) {
            for (var j = 0; j < bufsize; j++) {
                symbols[j] = new Symbol();
                var symbol = symbols[j];
                var u0 = Math.random();
                var u1 = Math.random();
                var u2 = Math.random();
                symbol.tx_sym = bb.generate(u0);
                symbol.tx_code = coding.encode(symbol.tx_sym);
                symbol.vect = mod.modulate(symbol.tx_sym);
                symbol.vect.add(awgn.generate(u1, u2));
                symbol.rx_sym = demod.demodulate(symbol.vect);
                symbol.rx_code = coding.encode(symbol.rx_sym);
            }
            for (var k = 0; k < 64; k++) {
                var r = ((k & 0x1) << 7) + ((k & 0x8) << 3) + 63;
                var g = ((k & 0x2) << 6) + ((k & 0x10) << 2) + 63;
                var b = ((k & 0x4) << 5) + ((k & 0x20) << 1) + 63;
                ctx.fillStyle = 'rgb(' + [r, g, b].join(',') + ')';
                for (var j = 0; j < bufsize; j++) {
                    var symbol = symbols[j];
                    if (symbol.tx_code != k)
                        continue;
                    if (symbol.tx_code == symbol.rx_code) {
                        var x = 150 + Math.round(mag * symbol.vect.real);
                        var y = 200 - Math.round(mag * symbol.vect.imag);
                        ctx.fillRect(x, y, 1, 1);
                    }
                    else {
                        var d = symbol.rx_code ^ symbol.tx_code;
                        var dist = ((d >> 2) & 1) + ((d >> 1) & 1) + (d & 1);
                        err += dist;
                        var x = 150 + Math.round(mag * symbol.vect.real);
                        var y = 200 - Math.round(mag * symbol.vect.imag);
                        ctx.fillRect(x, y, 3 + 3 * dist, 3 + 3 * dist);
                    }
                }
            }
        }
        this._facade.canvas.show();
    };
    return Main;
})();
new Main().animate_psk8();
