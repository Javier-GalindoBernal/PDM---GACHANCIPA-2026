/* Utilidades de formato y gráficos propios en SVG (sin librerías). Los colores salen de variables CSS,
   por lo que cambian solos con el modo día / noche. */
(function () {
  "use strict";
  var U = window.U = {};
  U.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  U.f = function (n, d) { return n == null || isNaN(n) ? "—" : Number(n).toFixed(d == null ? 1 : d); };
  U.p = function (n, d) { return n == null || isNaN(n) ? "—" : U.f(n, d) + "%"; };
  U.n = function (v) {
    if (v == null || isNaN(v)) return "—";
    v = Number(v);
    return Number.isInteger(v) ? String(v) : String(parseFloat(v.toFixed(2)));
  };
  U.SEM = {
    cumplida: { et: "Cumplida", k: "cum", regla: "≥ 100 %" },
    en_avance: { et: "En avance", k: "ava", regla: "20 % a 99 %" },
    rezagada: { et: "Rezagada", k: "rez", regla: "< 20 %" },
    no_programada: { et: "No programada", k: "np", regla: "sin programación al corte" }
  };
  U.SEMORD = ["cumplida", "en_avance", "rezagada", "no_programada"];
  U.chip = function (s) {
    var d = U.SEM[s] || { et: s };
    return '<span class="chip s-' + U.esc(s) + '">' + U.esc(d.et) + "</span>";
  };

  /* micro-gráfico de barras (SVG fijo, sin montaje): vals, {hi, aria, max} */
  U.spark = function (vals, o) {
    o = o || {};
    var n = vals.length, W = 120, H = 34, gp = 3, bw = (W - gp * (n - 1)) / n, mx = Math.max.apply(null, vals.concat([o.max || 0])) || 1;
    var s = '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" role="img" aria-label="' + U.esc(o.aria || "Micro-gráfico") + '">';
    vals.forEach(function (v, i) {
      var hh = Math.max(2, (H - 2) * v / mx);
      s += '<rect class="' + (o.hi === i ? "sp-hi" : "sp-b") + '" x="' + (i * (bw + gp)).toFixed(2) + '" y="' + (H - hh).toFixed(2) + '" width="' + bw.toFixed(2) + '" height="' + hh.toFixed(2) + '" rx="1.5"/>';
    });
    return s + "</svg>";
  };

  /* tooltip accesible: ratón y teclado (foco), se cierra con Escape */
  var tip = null;
  function tipEl() {
    if (!tip) { tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true; document.body.appendChild(tip); }
    return tip;
  }
  function hideTip() { if (tip) tip.hidden = true; }
  function showTip(t) {
    var x = t && t.closest ? t.closest("[data-tip]") : null;
    if (!x) { hideTip(); return; }
    var e = tipEl(); e.textContent = x.getAttribute("data-tip"); e.hidden = false;
    var r = x.getBoundingClientRect(), w = e.offsetWidth, hh = e.offsetHeight;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), document.documentElement.clientWidth - w - 8);
    var top = r.top - hh - 8; if (top < 8) top = r.bottom + 8;
    e.style.left = left + "px"; e.style.top = top + "px";
  }
  document.addEventListener("mouseover", function (ev) { showTip(ev.target); });
  document.addEventListener("focusin", function (ev) { showTip(ev.target); });
  document.addEventListener("focusout", hideTip);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") hideTip(); });
  window.addEventListener("scroll", hideTip, { passive: true });

  var reg = [];
  var NS = "http://www.w3.org/2000/svg";

  function trunc(s, max) { s = String(s); return s.length > max ? s.slice(0, max - 1) + "…" : s; }

  function tablaDatos(cab, filas, cap) {
    var h = '<details class="dtab"><summary>Ver los datos del gráfico en tabla</summary><div class="tw"><table><caption class="sr">' + U.esc(cap) + "</caption><thead><tr>";
    cab.forEach(function (c, i) { h += '<th scope="col"' + (i ? ' class="n"' : "") + ">" + U.esc(c) + "</th>"; });
    h += "</tr></thead><tbody>";
    filas.forEach(function (r) {
      h += "<tr>";
      r.forEach(function (c, i) { h += i === 0 ? '<th scope="row">' + U.esc(c) + "</th>" : '<td class="n">' + U.esc(c) + "</td>"; });
      h += "</tr>";
    });
    return h + "</tbody></table></div></details>";
  }

  /* Registro: devuelve el marcador HTML; mount() dibuja con el ancho real del contenedor. */
  function put(kind, spec, tabla) {
    reg.push({ kind: kind, spec: spec });
    return '<div class="cv" data-i="' + (reg.length - 1) + '"></div>' + (tabla || "");
  }

  var C = window.Charts = {};
  C.reset = function () { reg = []; };

  /* barras horizontales de un valor (0..max) */
  C.hbar = function (spec) {
    var rows = spec.items.map(function (i) { return [i.label, U.p(i.value)]; });
    return put("hbar", spec, tablaDatos(["Elemento", spec.unidad || "Indicador"], rows, spec.aria));
  };
  /* barras agrupadas 2025 / 2026 */
  C.gbar = function (spec) {
    var rows = spec.items.map(function (i) { return [i.label, U.p(i.a), U.p(i.b)]; });
    return put("gbar", spec, tablaDatos(["Elemento", spec.la, spec.lb], rows, spec.aria));
  };
  /* barras apiladas de semáforo */
  C.stack = function (spec) {
    var rows = spec.items.map(function (i) {
      return [i.label].concat(U.SEMORD.map(function (k) { return String(i.sem[k] || 0); }));
    });
    return put("stack", spec, tablaDatos(["Elemento", "Cumplida", "En avance", "Rezagada", "No programada"], rows, spec.aria));
  };
  /* anillo de semáforo */
  C.donut = function (spec) {
    return put("donut", spec, "");
  };
  /* mapa de calor filas x estado: rows [{label, cells:[{v, href}] en el orden SEMORD}] */
  C.heat = function (spec) {
    var rows = spec.rows.map(function (r) { return [r.label].concat(r.cells.map(function (c) { return String(c.v); })); });
    return put("heat", spec, tablaDatos([spec.cab || "Elemento", "Cumplida", "En avance", "Rezagada", "No programada"], rows, spec.aria));
  };
  /* anillo de un porcentaje */
  C.ring = function (spec) { return put("ring", spec, ""); };

  function el(w, h, aria) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 " + w + " " + h);
    s.setAttribute("width", w); s.setAttribute("height", h);
    s.setAttribute("class", "chart"); s.setAttribute("role", "img");
    s.setAttribute("aria-label", aria || "Gráfico");
    s.style.maxWidth = "100%"; s.style.height = "auto";
    return s;
  }

  function axis(w, x0, bw, top, h, max, ticks) {
    var s = "";
    ticks.forEach(function (t) {
      var x = x0 + bw * t / max;
      s += '<line class="ax" x1="' + x + '" x2="' + x + '" y1="' + top + '" y2="' + h + '"' + (t === 100 ? ' stroke-dasharray="4 3" style="stroke:var(--mut)"' : "") + "/>";
      s += '<text class="mut" x="' + x + '" y="' + (top - 5) + '" text-anchor="middle" font-size="11">' + t + "%</text>";
    });
    return s;
  }

  function dibujar(kind, spec, w) {
    var h, s, i, it, y, g = "";
    if (kind === "hbar" || kind === "gbar" || kind === "stack") {
      var wide = w >= 560, lblW = wide ? Math.min(250, Math.round(w * 0.34)) : 0, padR = kind === "stack" ? 64 : 58;
      var bw = Math.max(80, w - lblW - padR), x0 = lblW, top = 20;
      var n = spec.items.length;
      var per = kind === "gbar" ? 12 : 14, rowH = wide ? (kind === "gbar" ? 46 : 44) : (kind === "gbar" ? 58 : 46);
      h = top + n * rowH + 6;
      var max = spec.max || 100;
      if (kind !== "stack") g += axis(w, x0, bw, top, h - 4, max, max === 100 ? [0, 25, 50, 75, 100] : [0, 50, 100, 150, 200]);
      spec.items.forEach(function (it, idx) {
        var y0 = top + idx * rowH, lab = wide ? trunc(it.label, Math.floor(lblW / 6.2)) : it.label;
        var inner = "";
        if (wide) inner += '<text class="lbl" x="0" y="' + (y0 + rowH / 2 + 4) + '">' + U.esc(lab) + "</text>";
        else inner += '<text class="lbl" x="0" y="' + (y0 + 14) + '">' + U.esc(trunc(lab, Math.floor(w / 6.4))) + "</text>";
        var by = wide ? y0 + (rowH - (kind === "gbar" ? per * 2 + 3 : per)) / 2 : y0 + 20;
        if (kind === "hbar") {
          var wv = Math.max(2, bw * Math.min(it.value, max) / max);
          inner += '<rect class="f-grid" x="' + x0 + '" y="' + by + '" width="' + bw + '" height="' + per + '" rx="6"/>';
          inner += '<rect class="bar f-26" x="' + x0 + '" y="' + by + '" width="' + wv + '" height="' + per + '" rx="6"/>';
          inner += '<text class="val" x="' + (x0 + wv + 6) + '" y="' + (by + per - 2) + '">' + U.p(it.value) + "</text>";
        } else if (kind === "gbar") {
          var wa = Math.max(2, bw * Math.min(it.a, max) / max), wb = Math.max(2, bw * Math.min(it.b, max) / max);
          inner += '<rect class="f-grid" x="' + x0 + '" y="' + by + '" width="' + bw + '" height="' + per + '" rx="6"/>';
          inner += '<rect class="bar f-25" x="' + x0 + '" y="' + by + '" width="' + wa + '" height="' + per + '" rx="6"/>';
          inner += '<text class="val mut" x="' + (x0 + wa + 6) + '" y="' + (by + per - 2) + '" font-size="12">' + U.p(it.a) + "</text>";
          inner += '<rect class="f-grid" x="' + x0 + '" y="' + (by + per + 3) + '" width="' + bw + '" height="' + per + '" rx="6"/>';
          inner += '<rect class="bar f-26" x="' + x0 + '" y="' + (by + per + 3) + '" width="' + wb + '" height="' + per + '" rx="6"/>';
          inner += '<text class="val" x="' + (x0 + wb + 6) + '" y="' + (by + per * 2 + 1) + '" font-size="12">' + U.p(it.b) + "</text>";
        } else {
          var tot = 0, acc = x0; U.SEMORD.forEach(function (k) { tot += it.sem[k] || 0; });
          U.SEMORD.forEach(function (k) {
            var v = it.sem[k] || 0; if (!v) return;
            var ww = bw * v / tot;
            inner += '<rect class="bar f-' + U.SEM[k].k + '" x="' + acc + '" y="' + by + '" width="' + Math.max(ww - 2, 1) + '" height="' + per + '" rx="4"/>';
            if (ww > 24) inner += '<text class="on-' + U.SEM[k].k + '" x="' + (acc + ww / 2) + '" y="' + (by + per - 3) + '" text-anchor="middle" font-size="12" font-weight="700">' + v + "</text>";
            acc += ww;
          });
          inner += '<text class="val mut" x="' + (x0 + bw + 8) + '" y="' + (by + per - 2) + '">' + tot + " metas</text>";
        }
        var tx = it.label + (kind === "gbar" ? ": " + spec.la + " " + U.p(it.a) + ", " + spec.lb + " " + U.p(it.b) : kind === "hbar" ? ": " + U.p(it.value) : ": " + U.SEMORD.map(function (k) { return U.SEM[k].et + " " + (it.sem[k] || 0); }).join(", "));
        var at = ' data-tip="' + U.esc(tx) + '" aria-label="' + U.esc(tx) + '"';
        g += it.href ? '<a href="' + U.esc(it.href) + '"' + at + '><rect x="0" y="' + y0 + '" width="' + w + '" height="' + rowH + '" fill="transparent"/>' + inner + "</a>" : "<g" + at + ' role="img">' + inner + "</g>";
      });
      s = el(w, h, spec.aria); s.innerHTML = g; return s;
    }
    if (kind === "heat") {
      var wide2 = w >= 420, lw = wide2 ? Math.min(230, Math.round(w * 0.4)) : Math.min(124, Math.round(w * 0.32));
      var gap = 5, cw = (w - lw - gap * 3) / 4, rh = 44, th = 30, mx = 1;
      spec.rows.forEach(function (r) { r.cells.forEach(function (c) { if (c.v > mx) mx = c.v; }); });
      h = th + spec.rows.length * (rh + gap);
      g = "";
      U.SEMORD.forEach(function (k, ci) {
        g += '<text class="mut" x="' + (lw + ci * (cw + gap) + cw / 2) + '" y="' + (th - 10) + '" text-anchor="middle" font-size="11.5" font-weight="600">' + (cw >= 76 ? U.SEM[k].et : ({ cumplida: "Cumpl.", en_avance: "Avance", rezagada: "Rezag.", no_programada: "No prog." })[k]) + "</text>";
      });
      spec.rows.forEach(function (r, ri) {
        var y0 = th + ri * (rh + gap);
        g += '<text class="lbl" x="0" y="' + (y0 + rh / 2 + 4) + '">' + U.esc(trunc(r.label, Math.floor(lw / 6.4))) + "</text>";
        r.cells.forEach(function (c, ci) {
          var x0 = lw + ci * (cw + gap), k = U.SEM[U.SEMORD[ci]].k;
          var tx3 = r.label + " · " + U.SEM[U.SEMORD[ci]].et + ": " + c.v + (c.v === 1 ? " meta" : " metas");
          var pc = Math.round(10 + 30 * c.v / mx);
          var cell = c.v > 0
            ? '<rect class="hc" x="' + x0 + '" y="' + y0 + '" width="' + cw + '" height="' + rh + '" rx="10" fill="var(--b-' + k + ')" style="fill:color-mix(in srgb,var(--c-' + k + ') ' + pc + '%,var(--surf))"/><text class="hn" x="' + (x0 + cw / 2) + '" y="' + (y0 + rh / 2 + 5) + '" text-anchor="middle">' + c.v + "</text>"
            : '<rect class="hc0" x="' + x0 + '" y="' + y0 + '" width="' + cw + '" height="' + rh + '" rx="10"/><text class="hz" x="' + (x0 + cw / 2) + '" y="' + (y0 + rh / 2 + 5) + '" text-anchor="middle">0</text>';
          g += c.v > 0 && c.href ? '<a href="' + U.esc(c.href) + '" data-tip="' + U.esc(tx3) + '" aria-label="' + U.esc(tx3 + ". Ver en el explorador") + '">' + cell + "</a>" : '<g data-tip="' + U.esc(tx3) + '" role="img" aria-label="' + U.esc(tx3) + '">' + cell + "</g>";
        });
      });
      s = el(w, h, spec.aria); s.innerHTML = g; return s;
    }
    if (kind === "donut") {
      var D = Math.min(w, 200), r = D / 2 - 18, cx = D / 2, circ = 2 * Math.PI * r, tot2 = 0, off = 0;
      U.SEMORD.forEach(function (k) { tot2 += spec.sem[k] || 0; });
      g = '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" class="" stroke="var(--grid)" stroke-width="22"/>';
      U.SEMORD.forEach(function (k) {
        var v = spec.sem[k] || 0; if (!v) return;
        var len = circ * v / tot2;
        var tx2 = U.SEM[k].et + ": " + v + " metas", cir = '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="var(--c-' + U.SEM[k].k + ')" stroke-width="22" stroke-dasharray="' + (len - 2) + " " + (circ - len + 2) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 ' + cx + " " + cx + ')"/>';
        g += spec.hrefs && spec.hrefs[k] ? '<a href="' + U.esc(spec.hrefs[k]) + '" data-tip="' + U.esc(tx2) + '" aria-label="' + U.esc(tx2 + ". Ver en el explorador") + '">' + cir + "</a>" : '<g data-tip="' + U.esc(tx2) + '">' + cir + "</g>";
        off += len;
      });
      g += '<text x="' + cx + '" y="' + (cx - 2) + '" text-anchor="middle" font-size="30" font-weight="800" style="font-family:var(--f-tit)">' + tot2 + "</text>";
      g += '<text class="mut" x="' + cx + '" y="' + (cx + 18) + '" text-anchor="middle" font-size="12">' + (spec.centro || "metas") + "</text>";
      s = el(D, D, spec.aria); s.innerHTML = g; return s;
    }
    if (kind === "ring") {
      var Dm = Math.min(w, spec.size || 150), rr = Dm / 2 - 12, c0 = Dm / 2, cc = 2 * Math.PI * rr, vv = Math.max(0, Math.min(100, spec.value || 0));
      g = '<circle cx="' + c0 + '" cy="' + c0 + '" r="' + rr + '" fill="none" stroke="var(--grid)" stroke-width="12"/>' +
        '<circle cx="' + c0 + '" cy="' + c0 + '" r="' + rr + '" fill="none" stroke="var(--a26)" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (cc * vv / 100) + " " + cc + '" transform="rotate(-90 ' + c0 + " " + c0 + ')"/>' +
        '<text class="ring-n" x="' + c0 + '" y="' + (c0 + 8) + '" text-anchor="middle" font-size="26" font-weight="800" style="font-family:var(--f-tit)">' + U.p(spec.value) + "</text>";
      s = el(Dm, Dm, spec.aria); s.innerHTML = g; return s;
    }
  }

  C.mount = function (root) {
    (root || document).querySelectorAll(".cv").forEach(function (box) {
      var r = reg[+box.dataset.i]; if (!r) return;
      var w = Math.floor(box.getBoundingClientRect().width) || 320;
      box.textContent = "";
      var svg = dibujar(r.kind, r.spec, w);
      if (svg) {
        if (r.kind === "donut" || r.kind === "ring") { box.style.display = "flex"; box.style.justifyContent = "center"; }
        box.appendChild(svg);
      }
    });
  };
  var ult = 0, tmr;
  window.addEventListener("resize", function () {
    clearTimeout(tmr);
    tmr = setTimeout(function () { var w = document.documentElement.clientWidth; if (w !== ult) { ult = w; C.mount(); } }, 120);
  });
})();
