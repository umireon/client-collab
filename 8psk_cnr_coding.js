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
var Psk8Demodulator = (function () {
    function Psk8Demodulator() {
        this.rotate4 = Complex.polar(1, Math.PI / 4);
        this.rotate8 = Complex.polar(1, Math.PI / 8);
    }
    Psk8Demodulator.prototype.demodulate = function (vect) {
        vect.mul(this.rotate8);
        var quad_i = vect.real, quad_q = vect.imag;
        vect.mul(this.rotate4);
        var half_i = vect.real, half_q = vect.imag;
        if (quad_i > 0 && quad_q > 0) {
            return half_i > 0 ? 0 : 1;
        }
        else if (quad_i > 0 && quad_q < 0) {
            return half_q > 0 ? 7 : 6;
        }
        else if (quad_i < 0 && quad_q > 0) {
            return half_q > 0 ? 2 : 3;
        }
        else {
            return half_i > 0 ? 5 : 4;
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
        this.listenOnCoding();
        this.listenOnCnr();
        this.listenOnMpsk();
    }
    SimulatorFacade.prototype.listenOnCoding = function () {
        var that = this;
        var inputCoding = document.getElementById('nat');
        inputCoding.addEventListener('change', function () {
            if (inputCoding.checked) {
                that.coding = new NaturalBinaryCoding;
            }
            else {
                that.coding = new GrayCoding(3);
            }
        });
    };
    SimulatorFacade.prototype.listenOnCnr = function () {
        var that = this;
        var inputCnr = document.getElementById('sigma');
        inputCnr.addEventListener('change', function () {
            var cnrdb = Number(inputCnr.value) / 10;
            var cnr = Math.pow(10, cnrdb);
            var sigma = Math.sqrt(0.5 / cnr);
            that.awgn = new AwgnGenerator(sigma);
        });
    };
    SimulatorFacade.prototype.listenOnMpsk = function () {
        var that = this;
        var inputMpsk = document.getElementById('mpsk');
        inputMpsk.addEventListener('change', function () {
            var m = Math.floor(Number(inputMpsk.value));
            that.modulator = new PskModulator(m);
            that.baseband = new BasebandGenerator(m);
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
                symbol.tx_code = bb.generate(u0);
                symbol.tx_sym = coding.decode(symbol.tx_code);
                symbol.vect = mod.modulate(symbol.tx_sym);
                symbol.vect.add(awgn.generate(u1, u2));
                symbol.rx_sym = demod.demodulate(symbol.vect);
                symbol.rx_code = coding.encode(symbol.rx_sym);
            }
            //for (var k = 0; k < 8; k++) {
            //  ctx.fillStyle = ['darkred', 'red', 'darkred', 'darkgreen', 'lightgreen', 'black', 'gray', 'blue', 'darkblue'][k];
            ctx.fillStyle = 'black';
            for (var j = 0; j < bufsize; j++) {
                var symbol = symbols[j];
                //    if (symbol.rx_code != k) continue;
                //if (symbol.tx_code == symbol.rx_code) {
                var x = 150 - Math.round(mag * symbol.vect.real);
                var y = 200 - Math.round(mag * symbol.vect.imag);
                ctx.fillRect(x, y, 1, 1);
            }
        }
        this._facade.canvas.show();
    };
    return Main;
})();
new Main().animate_psk8();
