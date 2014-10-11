function encode(sym) {
    var nat = <HTMLInputElement>document.getElementById("nat");
    if (nat.checked) {
        return sym;
    } else {
        return [0, 1, 3, 2, 6, 7, 5, 4][sym];
    }
}

function decode(code) {
    var nat = <HTMLInputElement>document.getElementById("nat");
    if (nat.checked) {
        return code;
    } else {
        return [0, 1, 3, 2, 7, 6, 4, 5][code];
    }
}

function do_qpsk() {
    var c = <HTMLCanvasElement>document.getElementById("c");
    var ctx = c.getContext("2d");
    var mag = 100;
    ctx.clearRect(0, 0, 800, 800);

    var sigma_input = <HTMLInputElement>document.getElementById("sigma");
    var sigma = Math.sqrt(0.5 / Math.pow(10, Number(sigma_input.value) / 10));
    //ctx.globalAlpha = 0.6;

    var err = 0;
    for (var i = 0; i < 10000; i++) {
        var u0 = Math.random(), u1 = Math.random(), u2 = Math.random();
        var tx_code = Math.floor(u0 * 8);
        var tx_sym = decode(tx_code);

        var si = Math.cos(Math.PI * tx_sym / 4);
        var sq = Math.sin(Math.PI * tx_sym / 4);
        var sig_sq_mlu1_m2 = sigma * Math.sqrt(-2 * Math.log(u1));
        var piu2_2 = 2 * Math.PI * u2;
        var ni = sig_sq_mlu1_m2 * Math.cos(piu2_2);
        var nq = sig_sq_mlu1_m2 * Math.sin(piu2_2);
        var zi = si + ni;
        var zq = sq + nq;

        var ri = Math.cos(Math.PI / 8);
        var rq = Math.sin(Math.PI / 8);

        var di = zi * ri - zq * rq, dq = zi * rq + zq * ri;

        var rri = Math.cos(Math.PI / 4);
        var rrq = Math.sin(Math.PI / 4);
        var rrri = Math.cos(-Math.PI / 4);
        var rrrq = Math.sin(-Math.PI / 4);
        var cwi = di * rri - dq * rrq, cwq = di * rrq + dq * rri;

        var rx_sym;
        if (di > 0 && dq > 0) {
            if (cwi > 0) {
                ctx.fillStyle = "darkred";
                rx_sym = 0;
            } else {
                ctx.fillStyle = "red"
				rx_sym = 1;
            }
        } else if (di > 0 && dq < 0) {
            if (cwq > 0) {
                ctx.fillStyle = "darkblue";
                rx_sym = 7;
            } else {
                ctx.fillStyle = "blue"
				rx_sym = 6;
            }
        } else if (di < 0 && dq > 0) {
            if (cwq > 0) {
                ctx.fillStyle = "darkgreen";
                rx_sym = 2;
            } else {
                ctx.fillStyle = "lightgreen"
				rx_sym = 3;
            }
        } else {
            if (cwi > 0) {
                ctx.fillStyle = "gray";
                rx_sym = 5;
            } else {
                ctx.fillStyle = "black"
				rx_sym = 4;
            }
        }

        var rx_code = encode(rx_sym);

        if (tx_sym == rx_sym) {
            ctx.fillRect(150 + mag * zi, 200 + mag * zq, 1, 1);
        } else {
            var d = rx_code ^ tx_code;
            var dist = ((d >> 2) & 1) + ((d >> 1) & 1) + (d & 1);
            err += dist;
            ctx.fillRect(150 + mag * zi, 200 + mag * zq, 3 + 3 * dist, 3 + 3 * dist);
        }
    }

    var pb = <HTMLInputElement>document.getElementById("pb");
    pb.value = (Math.LN10 * Math.log(err / 30000.0)).toPrecision(20);
} 

setInterval(do_qpsk, 50);