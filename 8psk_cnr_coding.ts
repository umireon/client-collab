class Coding {
  private _enc: number[];
  private _dec: number[];

  constructor(encoder: number[]) {
    this._enc = encoder;

    this._dec = [];
    var loop = encoder.length;
    for (var i = 0; i < loop; i++) {
      this._dec[this._enc[i]] = i;
    }
  }

  public encode(index: number): number {
    return this._enc[index];
  }

  public decode(code: number): number {
    return this._dec[code];
  }
};

class GrayCoding extends Coding {
  constructor(bitWidth: number) {
    var encoder: number[] = [];
    var loop = (1 << bitWidth);
    for (var i = 0; i < loop; i++) {
      encoder[i] = i ^ (i >> 1);
    }
    super(encoder);
  }
};

class NaturalBinaryCoding extends Coding {
  constructor() {
    super([]);
  }

  public encode(index: number): number {
    return index;
  }

  public decode(code: number): number {
    return code;
  }
};

class Complex {
  public static polar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  public real: number;
  public imag: number;

  constructor(r: number, i: number) {
    this.real = r;
    this.imag = i;
  }

  /* destructive */
  public add(other: Complex): Complex {
    this.real += other.real;
    this.imag += other.imag;
    return this;
  }

  /* destructive */
  public sub(other: Complex): Complex {
    this.real -= other.real;
    this.imag -= other.imag;
    return this;
  }

  /* destructive */
  public mul(other: Complex): Complex {
    var treal = this.real, timag = this.imag;
    var oreal = other.real, oimag = other.imag;
    this.real = treal * oreal - timag * oimag;
    this.imag = treal * oimag + timag * oreal;
    return this;
  }

  public clone(): Complex {
    return new Complex(this.real, this.imag);
  }
}

class PskModulator {
  private _unit: number;

  constructor(m: number) {
    this._unit = 2 * Math.PI / m;
  }

  modulate(sym: number): Complex {
    return Complex.polar(1, sym * this._unit);
  }
}

class Psk8Demodulator {
  private rotate4 = Complex.polar(1, Math.PI / 4)
    private rotate8 = Complex.polar(1, Math.PI / 8)

    demodulate(vect: Complex): number {
      vect = vect.clone();
      vect.mul(this.rotate8);
      var quad_i = vect.real, quad_q = vect.imag;
      vect.mul(this.rotate4);
      var half_i = vect.real, half_q = vect.imag;

      if (quad_i > 0 && quad_q > 0) {
        return half_i > 0 ? 0 : 1;
      } else if (quad_i > 0 && quad_q < 0) {
        return half_q > 0 ? 7 : 6;
      } else if (quad_i < 0 && quad_q > 0) {
        return half_q > 0 ? 2 : 3;
      } else {
        return half_i > 0 ? 5 : 4;
      }
    }
}

class BasebandGenerator {
  private _m: number;

  constructor(m: number) {
    this._m = m;
  }

  generate(u0: number): number {
    return Math.floor(u0 * this._m);
  }
}

class AwgnGenerator {
  private _pi2 = Math.PI * 2;
  private _sigma: number;

  constructor(sigma: number) {
    this._sigma = sigma;
  }

  generate(u1: number, u2: number): Complex {
    var a = this._sigma * Math.sqrt(-2 * Math.log(u1));
    var t = this._pi2 * u2;
    return new Complex(a * Math.cos(t), a * Math.sin(t));
  }
}

class Symbol {
  public tx_code: number;
  public tx_sym: number;
  public rx_code: number;
  public rx_sym: number;
  public vect: Complex;
}

class CanvasView {
  private _canvas: HTMLCanvasElement;
  private _cctx: CanvasRenderingContext2D;
  private _shadow: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;

  constructor() {
    this._canvas = <HTMLCanvasElement>document.getElementById('c');
    this._cctx = <CanvasRenderingContext2D>this._canvas.getContext('2d');

    this._shadow = <HTMLCanvasElement>document.createElement('canvas');
    this._shadow.width = this._canvas.width;
    this._shadow.height = this._canvas.height;
    this.context = <CanvasRenderingContext2D>this._shadow.getContext('2d');
  }

  public show() {
    this._cctx.drawImage(this._shadow, 0, 0);
  }
}

class SimulatorFacade {
  public coding: Coding;
  public baseband: BasebandGenerator;
  public awgn: AwgnGenerator;
  public modulator: PskModulator;
  public demodulator: Psk8Demodulator;
  public canvas = new CanvasView;

  constructor() {
    this.coding = new GrayCoding(3);
    this.baseband = new BasebandGenerator(8);
    this.awgn = new AwgnGenerator(0.223);
    this.modulator = new PskModulator(8);
    this.demodulator = new Psk8Demodulator();
    this.listen();
  }

  private listen() {
    var that = this;
    var inputCoding = <HTMLInputElement>document.getElementById('nat');
    var inputCnr = <HTMLInputElement>document.getElementById('sigma');
    var inputMpsk = <HTMLInputElement>document.getElementById('mpsk');

    function applyCoding() {
      if (inputCoding.checked) {
        that.coding = new NaturalBinaryCoding;
      } else {
        var m = Math.floor(Number(inputMpsk.value));
        var bitWidth = Math.ceil(Math.LOG2E * Math.log(m));
        that.coding = new GrayCoding(bitWidth);
      }
    }
    inputCoding.addEventListener('change', applyCoding);

    inputCnr.addEventListener('change', function() {
      var cnrdb = Number(inputCnr.value) / 10;
      var cnr = Math.pow(10, cnrdb);
      var sigma = Math.sqrt(0.5 / cnr);
      that.awgn = new AwgnGenerator(sigma);
    });

    inputMpsk.addEventListener('change', function() {
      var m = Math.floor(Number(inputMpsk.value));
      that.modulator = new PskModulator(m);
      that.baseband = new BasebandGenerator(m);
      applyCoding();
    });
  }
}

class Main {
  private _facade = new SimulatorFacade;

  animate_psk8() {
    var that = this;
    (function loop() {
      requestAnimationFrame(function() {that.do_psk8();});
      setTimeout(loop, 1000 / 15);
    })();
  }

  do_psk8(): void {
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
    var symbols: Symbol[] = new Array(bufsize);

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
        var r = ((k & 0x1) << 7) + ((k &  0x8) << 3) + 63;
        var g = ((k & 0x2) << 6) + ((k & 0x10) << 2) + 63;
        var b = ((k & 0x4) << 5) + ((k & 0x20) << 1) + 63;
        ctx.fillStyle = 'rgb(' + [r,g,b].join(',') + ')';

        for (var j = 0; j < bufsize; j++) {
          var symbol = symbols[j];

          if (symbol.tx_code != k) continue;

          if (symbol.tx_code == symbol.rx_code) {
            var x = 150 + Math.round(mag * symbol.vect.real);
            var y = 200 - Math.round(mag * symbol.vect.imag);
            ctx.fillRect(x, y, 1, 1);
          } else {
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
  }
}

new Main().animate_psk8();
