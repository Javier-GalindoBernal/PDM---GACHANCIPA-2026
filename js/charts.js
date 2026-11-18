/* Utilidades de formato y gráficos propios en SVG/CSS (sin librerías). Los colores salen de variables CSS (--b1..--b6, semáforo),
   por lo que cambian solos con el modo día / noche. Animación de entrada una sola vez (clase .anim → .in con IntersectionObserver);
   con «reducir movimiento», al filtrar, al redimensionar y al imprimir el gráfico se ve directamente en su estado final. */
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

  /* ---------- degradados: una familia por clave (b1..b6 o cum/ava/rez/np); ids únicos por gráfico ---------- */
  var UID = 0;
  function uid() { return "g" + (++UID); }
  var VARS = { cum: ["--c-cum", "--c-cum-g"], ava: ["--c-ava", "--c-ava-g"], rez: ["--c-rez", "--c-rez-g"], np: ["--c-np", "--c-np-g"] };
  function vr(k) { return VARS[k] || ["--" + k, "--" + k + "g"]; }
  function grad(id, k) {
    var v = vr(k);
    return '<linearGradient id="' + id + "-" + k + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(' + v[0] + ')"/><stop offset="1" style="stop-color:var(' + v[1] + ')"/></linearGradient>';
  }
  function fillG(id, k) { return "fill:url(#" + id + "-" + k + ")"; }
  var clamp = function (v) { return Math.max(0, Math.min(100, Number(v) || 0)); };
  var FALTAN = function (v) { return v < 100 ? ". Faltan " + U.f(100 - v, 1) + " puntos para la meta de 100 %" : ". Alcanza o supera la meta de 100 %"; };

  /* variación entre dos cifras ya mostradas (se restan tal como se ven, con un decimal); flecha + signo + texto, nunca solo color */
  U.delta = function (a, b) {
    if (a == null || b == null || isNaN(a) || isNaN(b)) return null;
    var x = Number(U.f(a, 1)), y = Number(U.f(b, 1)), d = Math.round((y - x) * 10) / 10;
    if (d > 0) return { ar: "▲", t: "+" + U.f(d, 1) + " pts", w: "aumentó " + U.f(d, 1) + " puntos" };
    if (d < 0) return { ar: "▼", t: "−" + U.f(-d, 1) + " pts", w: "disminuyó " + U.f(-d, 1) + " puntos" };
    return { ar: "=", t: "sin cambio", w: "sin cambio" };
  };

  /* ---------- micro-gráfico de columnas (HTML/CSS): una columna por categoría (p. ej. por eje estratégico), SIN línea que una los puntos,
     para que no se lea como una tendencia en el tiempo. vals, {hi (columna resaltada), aria, max, tips[]} ---------- */
  U.spark = function (vals, o) {
    o = o || {};
    var n = vals.length, mx = Math.max.apply(null, vals.concat([o.max || 0])) || 1, hasHi = o.hi != null && o.hi >= 0 && o.hi < n;
    if (!n) return "";
    return '<span class="spark anim' + (hasHi ? " dim" : "") + '" role="img" aria-label="' + U.esc(o.aria || "Micro-gráfico de columnas") + '">' + vals.map(function (v, i) {
      var pc = Math.min(100, Math.max(0, Number(v) || 0) / mx * 100);
      return "<i" + (hasHi && i === o.hi ? ' class="hi"' : "") + ' style="--h:' + pc.toFixed(1) + "%;--i:" + i + '"' + (o.tips && o.tips[i] ? ' data-tip="' + U.esc(o.tips[i]) + '"' : "") + "></i>";
    }).join("") + "</span>";
  };

  /* ---------- anillo de progreso (SVG fijo): v 0..100, {size, k, text, aria} ---------- */
  U.ring = function (v, o) {
    o = o || {};
    var S = o.size || 56, sw = o.sw || Math.max(6, Math.round(S / 8)), r = (S - sw) / 2 - 1, c = S / 2, id = uid(), k = o.k || "b1", vv = clamp(v);
    var arc = vv > 0.4 ? '<circle class="arc" cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="url(#' + id + "-" + k + ')" stroke-width="' + sw + '" stroke-linecap="round" pathLength="100" stroke-dasharray="' + vv + ' 100" transform="rotate(-90 ' + c + " " + c + ')"/>' : "";
    return '<svg class="ring anim" viewBox="0 0 ' + S + " " + S + '" width="' + S + '" height="' + S + '" ' + (o.aria ? 'role="img" aria-label="' + U.esc(o.aria) + '"' : 'aria-hidden="true"') + "><defs>" + grad(id, k) + '</defs><circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="var(--grid)" stroke-width="' + sw + '"/>' + arc +
      '<line class="meta-t" x1="' + c + '" x2="' + c + '" y1="' + (c - r - sw / 2 - 1) + '" y2="' + (c - r + sw / 2 + 1) + '"/>' +
      (o.text != null ? '<text class="ring-n" x="' + c + '" y="' + c + '" dy=".35em" text-anchor="middle" font-size="' + (o.fs || Math.round(S * 0.24)) + '" font-weight="800" style="font-family:var(--f-tit)">' + U.esc(o.text) + "</text>" : "") + "</svg>";
  };

  /* ---------- medidor semicircular (SVG fijo): v 0..100 con marca fija de la meta 100 % ---------- */
  U.gauge = function (v, o) {
    o = o || {};
    var id = uid(), k = o.k || "b1", vv = clamp(v), d = "M20 100 A80 80 0 0 1 180 100";
    return '<svg class="gauge anim" viewBox="0 0 200 126" ' + (o.aria ? 'role="img" aria-label="' + U.esc(o.aria) + '"' : 'aria-hidden="true"') + '><defs>' + grad(id, k) + '</defs><path d="' + d + '" fill="none" stroke="var(--grid)" stroke-width="16" stroke-linecap="round"/>' +
      (vv > 0.4 ? '<path class="arc" d="' + d + '" fill="none" stroke="url(#' + id + "-" + k + ')" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="' + vv + ' 100"/>' : "") +
      '<line class="meta-t" x1="166" x2="194" y1="100" y2="100"/><text class="mut" x="20" y="120" text-anchor="middle" font-size="12">0 %</text><text class="gm" x="180" y="120" text-anchor="middle" font-size="12" font-weight="700">Meta 100 %</text>' +
      (o.text != null ? '<text class="gv" x="100" y="92" text-anchor="middle" font-size="30" font-weight="800" style="font-family:var(--f-tit)">' + U.esc(o.text) + "</text>" : "") + "</svg>";
  };

  /* ---------- gráfico de bala (HTML): dos barras finas apiladas (vigencia anterior arriba, actual abajo) sobre pista neutra; marca y rótulo de la meta 100 % ---------- */
  U.bullet = function (a, b) {
    var wa = Math.max(1.5, clamp(a)), wb = Math.max(1.5, clamp(b));
    return '<div class="bl anim" role="img" aria-label="Avance ' + U.p(a) + " en la vigencia anterior y " + U.p(b) + ' en la vigencia actual al corte; meta 100 %"><div class="bl-r"><i class="bl-a" style="width:' + wa + '%"></i></div><div class="bl-r"><i class="bl-b" style="width:' + wb + '%"></i></div><i class="bl-m"></i><span class="bl-ml" aria-hidden="true">Meta 100 %</span></div>';
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

  /* parte una etiqueta en hasta 2 líneas por palabras (sin recortar a pocos caracteres); si aún no cabe, recorta solo el final de la 2.ª */
  function partir(s, max) {
    s = String(s); if (s.length <= max) return [s];
    var ws = s.split(" "), a = "", i = 0;
    while (i < ws.length && (a ? a + " " : "").length + ws[i].length <= max) { a += (a ? " " : "") + ws[i]; i++; }
    if (!a) { a = ws[0].slice(0, max - 1) + "…"; i = 1; }
    return [a, trunc(ws.slice(i).join(" "), max)].filter(Boolean);
  }
  /* etiqueta de barra: «Meta 90 · Descripción larga» se dibuja como código en negrita + hasta 2 líneas de descripción; el texto completo siempre está en el tooltip, el aria-label y la tabla de datos */
  function etqLineas(label, max) {
    var m = /^(Meta [^·]+?) · (.+)$/.exec(String(label));
    return m ? { cod: m[1], ls: [m[1]].concat(partir(m[2], max)) } : { cod: null, ls: partir(label, max) };
  }

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

  /* barras horizontales tipo «lollipop»: un valor (0..max) con marca de la meta 100 %. item.k fija el color de semáforo */
  C.hbar = function (spec) {
    var conEt = spec.items.some(function (i) { return i.et; });
    var rows = spec.items.map(function (i) { return conEt ? [i.label, U.p(i.value), i.et || ""] : [i.label, U.p(i.value)]; });
    return put("hbar", spec, tablaDatos(conEt ? ["Elemento", spec.unidad || "Indicador", "Estado"] : ["Elemento", spec.unidad || "Indicador"], rows, spec.aria));
  };
  /* comparativo 2025 / 2026 con variación */
  C.gbar = function (spec) {
    var rows = spec.items.map(function (i) { var d = U.delta(i.a, i.b); return [i.label, U.p(i.a), U.p(i.b), d ? d.ar + " " + d.t : "—"]; });
    return put("gbar", spec, tablaDatos(["Elemento", spec.la, spec.lb, "Variación"], rows, spec.aria));
  };
  /* barras apiladas de semáforo */
  C.stack = function (spec) {
    var rows = spec.items.map(function (i) {
      return [i.label].concat(U.SEMORD.map(function (k) { return String(i.sem[k] || 0); }));
    });
    return put("stack", spec, tablaDatos(["Elemento", "Cumplida", "En avance", "Rezagada", "No programada"], rows, spec.aria));
  };
  /* dona de semáforo con el total al centro */
  C.donut = function (spec) {
    return put("donut", spec, "");
  };
  /* mapa de calor filas x estado: rows [{label, cells:[{v, href}] en el orden SEMORD}] */
  C.heat = function (spec) {
    var rows = spec.rows.map(function (r) { return [r.label].concat(r.cells.map(function (c) { return String(c.v); })); });
    return put("heat", spec, '<p class="mini heat-nota">Cuanto más intenso es el color de una celda, más metas tiene en ese estado.</p>' + tablaDatos([spec.cab || "Elemento", "Cumplida", "En avance", "Rezagada", "No programada"], rows, spec.aria));
  };
  /* anillo de un porcentaje */
  C.ring = function (spec) { return put("ring", spec, ""); };

  function el(w, h, aria) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 " + w + " " + h);
    s.setAttribute("width", w); s.setAttribute("height", h);
    s.setAttribute("class", "chart anim"); s.setAttribute("role", "img");
    s.setAttribute("aria-label", aria || "Gráfico");
    s.style.maxWidth = "100%"; s.style.height = "auto";
    return s;
  }

  /* líneas guía; la de 100 % es la META y se rotula siempre */
  function axis(x0, bw, top, h, max, ticks) {
    var s = "";
    ticks.forEach(function (t) {
      var x = x0 + bw * t / max;
      if (t === 100) {
        s += '<line class="ax-meta" x1="' + x + '" x2="' + x + '" y1="' + (top - 2) + '" y2="' + h + '"/><text class="meta-l" x="' + x + '" y="' + (top - 9) + '" text-anchor="middle" font-size="11.5" font-weight="700">Meta 100 %</text>';
      } else {
        s += '<line class="ax" x1="' + x + '" x2="' + x + '" y1="' + top + '" y2="' + h + '"/><text class="mut" x="' + x + '" y="' + (top - 9) + '" text-anchor="middle" font-size="11">' + t + "%</text>";
      }
    });
    return s;
  }

  function dibujar(kind, spec, w) {
    var h, s, g = "", id = uid(), used = {};
    function defs() { return "<defs>" + Object.keys(used).map(function (k) { return grad(id, k); }).join("") + "</defs>"; }
    if (kind === "hbar" || kind === "gbar" || kind === "stack") {
      var wide = w >= 560, lblW = wide ? Math.min(250, Math.round(w * 0.34)) : 0, padR = kind === "stack" ? 72 : kind === "gbar" ? (wide ? 152 : 66) : (spec.items.some(function (i) { return i.et; }) && wide ? 150 : 66);
      var bw = Math.max(80, w - lblW - padR), x0 = lblW, top = 28, n = spec.items.length;
      var LH = 14, mcw = wide ? Math.floor(lblW / 6.2) : Math.floor(w / 6.4), maxL = 1;
      if (kind === "hbar") spec.items.forEach(function (it) { it._e = etqLineas(it.label, mcw); if (it._e.ls.length > maxL) maxL = it._e.ls.length; });
      var rowH = kind === "hbar" ? (wide ? Math.max(46, LH * maxL + 18) : Math.max(54, LH * maxL + 32)) : wide ? (kind === "gbar" ? 54 : 46) : (kind === "gbar" ? 68 : 54);
      h = top + n * rowH + 6;
      var max = spec.max || 100;
      if (kind !== "stack") g += axis(x0, bw, top, h - 4, max, max === 100 ? [0, 25, 50, 75, 100] : [0, 50, 100, 150, 200]);
      spec.items.forEach(function (it, idx) {
        var y0 = top + idx * rowH, d = Math.min(idx * 40, 600), dl = it.a != null && it.b != null ? U.delta(it.a, it.b) : null, cw = dl ? Math.round((dl.ar + " " + dl.t).length * 6.6 + 20) : 0;
        var maxc = wide ? Math.floor(lblW / 6.2) : Math.floor((w - (kind === "gbar" ? cw + 12 : it.et ? 96 : 0)) / 6.4), inner = "";
        var cy = wide ? y0 + rowH / 2 : y0 + (kind === "gbar" ? 34 : 36);
        if (kind === "hbar") {
          var ls = it._e.ls, y1 = wide ? cy - ls.length * LH / 2 + 11 : y0 + 12;
          if (!wide) cy = y0 + ls.length * LH + 14;
          inner += '<text class="lbl" x="0" y="' + y1.toFixed(1) + '">' + ls.map(function (t, i) { return '<tspan x="0"' + (i ? ' dy="' + LH + '"' : "") + (i === 0 && it._e.cod ? ' font-weight="700"' : "") + ">" + U.esc(t) + "</tspan>"; }).join("") + "</text>";
        } else inner += '<text class="lbl" x="0" y="' + (wide ? y0 + rowH / 2 + 4 : y0 + 14) + '">' + U.esc(trunc(it.label, maxc)) + "</text>";
        var delay = "--d:" + d + "ms", tx;
        if (kind === "hbar") {
          var k = it.k || (it.value >= 100 ? "cum" : "b1"), wv = Math.max(3, bw * Math.min(Math.max(it.value, 0), max) / max); used[k] = 1;
          inner += '<rect class="f-grid" x="' + x0 + '" y="' + (cy - 5) + '" width="' + bw + '" height="10" rx="5"/>';
          inner += '<rect class="bar k-' + k + '" x="' + x0 + '" y="' + (cy - 5) + '" width="' + wv.toFixed(1) + '" height="10" rx="5" style="' + fillG(id, k) + ";" + delay + '"/>';
          var zero = Number(U.f(it.value, 1)) === 0;
          inner += '<circle class="fade dotend k-' + k + (zero ? " zero" : "") + '" cx="' + (x0 + wv).toFixed(1) + '" cy="' + cy + '" r="8" style="' + (zero ? "fill:var(--surf);stroke:var(" + vr(k)[0] + ")" : "fill:var(" + vr(k)[1] + ")") + ";" + delay + '"/>';
          inner += '<text class="val fade" x="' + (x0 + wv + 16).toFixed(1) + '" y="' + (cy + 4) + '" style="' + delay + '">' + U.p(it.value) + (zero ? " de avance" : "") + (it.et && wide ? '<tspan class="et" font-weight="500"> · ' + U.esc(it.et) + "</tspan>" : "") + "</text>";
          if (it.et && !wide) inner += '<text class="mut et fade" x="' + w + '" y="' + (y0 + 14) + '" text-anchor="end" font-size="11.5" style="' + delay + '">' + U.esc(it.et) + "</text>";
          tx = it.label + ": " + U.p(it.value) + (it.et ? " (" + it.et + ")" : "") + FALTAN(it.value);
        } else if (kind === "gbar") {
          var wa = Math.max(3, bw * Math.min(Math.max(it.a, 0), max) / max), wb = Math.max(3, bw * Math.min(Math.max(it.b, 0), max) / max), c1 = cy - (wide ? 7 : 0), c2 = c1 + 15; used.b5 = 1; used.b2 = 1;
          inner += '<rect class="f-grid" x="' + x0 + '" y="' + (c1 - 5) + '" width="' + bw + '" height="10" rx="5"/><rect class="bar" x="' + x0 + '" y="' + (c1 - 5) + '" width="' + wa.toFixed(1) + '" height="10" rx="5" style="' + fillG(id, "b5") + ";" + delay + '"/>';
          inner += '<text class="val mut fade" x="' + (x0 + wa + 8).toFixed(1) + '" y="' + (c1 + 4) + '" font-size="12" style="' + delay + '">' + U.p(it.a) + "</text>";
          inner += '<rect class="f-grid" x="' + x0 + '" y="' + (c2 - 5) + '" width="' + bw + '" height="10" rx="5"/><rect class="bar" x="' + x0 + '" y="' + (c2 - 5) + '" width="' + wb.toFixed(1) + '" height="10" rx="5" style="' + fillG(id, "b2") + ";" + delay + '"/>';
          inner += '<text class="val fade" x="' + (x0 + wb + 8).toFixed(1) + '" y="' + (c2 + 4) + '" font-size="12" style="' + delay + '">' + U.p(it.b) + "</text>";
          if (dl) {
            var cx = wide ? w - cw : w - cw, cyy = wide ? (c1 + c2) / 2 - 10 : y0 + 1;
            inner += '<g class="dchip fade" style="' + delay + '"><rect class="dc" x="' + cx + '" y="' + cyy + '" width="' + cw + '" height="20" rx="10"/><text class="dct" x="' + (cx + cw / 2) + '" y="' + (cyy + 14) + '" text-anchor="middle" font-size="11.5">' + dl.ar + " " + dl.t + "</text></g>";
          }
          tx = it.label + ": " + spec.la + " " + U.p(it.a) + ", " + spec.lb + " " + U.p(it.b) + (dl ? ". Variación: " + dl.w : "");
        } else {
          var tot = 0, acc = x0; U.SEMORD.forEach(function (kk) { tot += it.sem[kk] || 0; });
          U.SEMORD.forEach(function (kk) {
            var v = it.sem[kk] || 0; if (!v) return;
            var ww = bw * v / tot;
            inner += '<rect class="bar f-' + U.SEM[kk].k + " k-" + U.SEM[kk].k + '" x="' + acc.toFixed(1) + '" y="' + (cy - 8) + '" width="' + Math.max(ww - 2, 1).toFixed(1) + '" height="16" rx="6" style="' + delay + '"/>';
            if (ww > 24) inner += '<text class="on-' + U.SEM[kk].k + ' fade" x="' + (acc + ww / 2).toFixed(1) + '" y="' + (cy + 4.5) + '" text-anchor="middle" font-size="12" font-weight="700" style="' + delay + '">' + v + "</text>";
            acc += ww;
          });
          inner += '<text class="val mut" x="' + (x0 + bw + 10) + '" y="' + (cy + 4) + '">' + tot + " metas</text>";
          tx = it.label + ": " + U.SEMORD.map(function (kk) { return U.SEM[kk].et + " " + (it.sem[kk] || 0); }).join(", ");
        }
        var at = ' data-tip="' + U.esc(tx) + '" aria-label="' + U.esc(tx) + '"';
        g += it.href ? '<a href="' + U.esc(it.href) + '"' + at + '><rect x="0" y="' + y0 + '" width="' + w + '" height="' + rowH + '" fill="transparent"/>' + inner + "</a>" : "<g" + at + ' role="img">' + inner + "</g>";
      });
      s = el(w, h, spec.aria); s.innerHTML = defs() + g; return s;
    }
    if (kind === "heat") {
      /* escritorio: etiqueta a la izquierda en hasta 2 líneas; móvil (< 420 px): etiqueta completa encima de cada fila */
      var wide2 = w >= 420, lw = wide2 ? Math.min(300, Math.round(w * 0.42)) : 0, lh = wide2 ? 0 : 17;
      var gap = 5, cw2 = (w - lw - gap * 3) / 4, rh = 44, th = 30, mxs = [1, 1, 1, 1];
      spec.rows.forEach(function (r) { r.cells.forEach(function (c, ci) { if (c.v > mxs[ci]) mxs[ci] = c.v; }); });
      h = th + spec.rows.length * (rh + lh + gap) + 2;
      U.SEMORD.forEach(function (k, ci) {
        g += '<text class="mut" x="' + (lw + ci * (cw2 + gap) + cw2 / 2) + '" y="' + (th - 10) + '" text-anchor="middle" font-size="11.5" font-weight="600">' + (cw2 >= 76 ? U.SEM[k].et : ({ cumplida: "Cumpl.", en_avance: "Avance", rezagada: "Rezag.", no_programada: "No prog." })[k]) + "</text>";
      });
      spec.rows.forEach(function (r, ri) {
        var y0 = th + ri * (rh + lh + gap), yc = y0 + lh;
        if (wide2) {
          var ls = partir(r.label, Math.floor(lw / 6.3)), yb = yc + rh / 2 + (ls.length > 1 ? -2 : 4);
          g += '<text class="lbl" x="0" y="' + yb + '">' + ls.map(function (t, i) { return '<tspan x="0"' + (i ? ' dy="14"' : "") + ">" + U.esc(t) + "</tspan>"; }).join("") + "</text>";
        } else {
          g += '<text class="lbl" x="0" y="' + (y0 + 12) + '">' + U.esc(trunc(r.label, Math.floor(w / 6.1))) + "</text>";
        }
        r.cells.forEach(function (c, ci) {
          var x0 = lw + ci * (cw2 + gap), k = U.SEM[U.SEMORD[ci]].k, st = "--d:" + Math.min(ri * 40 + ci * 30, 600) + "ms";
          var tx3 = r.label + " · " + U.SEM[U.SEMORD[ci]].et + ": " + c.v + (c.v === 1 ? " meta" : " metas");
          var cell = c.v > 0
            ? '<rect class="hc" x="' + x0 + '" y="' + yc + '" width="' + cw2 + '" height="' + rh + '" rx="10" fill="var(--b-' + k + ')" style="--p:' + (c.v / mxs[ci]).toFixed(3) + ';fill:color-mix(in srgb,var(--c-' + k + ') calc(8% + var(--p)*var(--hmax)),var(--surf))"/><text class="hn" x="' + (x0 + cw2 / 2) + '" y="' + (yc + rh / 2 + 5) + '" text-anchor="middle">' + c.v + "</text>"
            : '<rect class="hc0" x="' + x0 + '" y="' + yc + '" width="' + cw2 + '" height="' + rh + '" rx="10"/><text class="hz" x="' + (x0 + cw2 / 2) + '" y="' + (yc + rh / 2 + 5) + '" text-anchor="middle">0</text>';
          g += c.v > 0 && c.href ? '<a class="fade" style="' + st + '" href="' + U.esc(c.href) + '" data-tip="' + U.esc(tx3) + '" aria-label="' + U.esc(tx3 + ". Ver en el explorador") + '">' + cell + "</a>" : '<g class="fade" style="' + st + '" data-tip="' + U.esc(tx3) + '" role="img" aria-label="' + U.esc(tx3) + '">' + cell + "</g>";
        });
      });
      s = el(w, h, spec.aria); s.innerHTML = g; return s;
    }
    if (kind === "donut") {
      var D = Math.min(w, 200), sw = 18, r = D / 2 - sw / 2 - 6, cx0 = D / 2, tot2 = 0, off = 0, nz = 0;
      U.SEMORD.forEach(function (k) { tot2 += spec.sem[k] || 0; if (spec.sem[k]) nz++; });
      g = '<circle cx="' + cx0 + '" cy="' + cx0 + '" r="' + r + '" fill="none" stroke="var(--grid)" stroke-width="' + sw + '"/>';
      U.SEMORD.forEach(function (k, idx) {
        var v = spec.sem[k] || 0; if (!v) return;
        var pct = 100 * v / tot2, len = Math.max(pct - (nz > 1 ? 0.9 : 0), 0.6); used[U.SEM[k].k] = 1;
        var tx2 = U.SEM[k].et + ": " + v + " metas", cir = '<circle class="arc seg" cx="' + cx0 + '" cy="' + cx0 + '" r="' + r + '" fill="none" style="stroke:url(#' + id + "-" + U.SEM[k].k + ");--d:" + idx * 120 + 'ms" stroke-width="' + sw + '" pathLength="100" stroke-dasharray="' + len.toFixed(2) + ' 100" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 ' + cx0 + " " + cx0 + ')"/>';
        g += spec.hrefs && spec.hrefs[k] ? '<a href="' + U.esc(spec.hrefs[k]) + '" data-tip="' + U.esc(tx2) + '" aria-label="' + U.esc(tx2 + ". Ver en el explorador") + '">' + cir + "</a>" : '<g data-tip="' + U.esc(tx2) + '">' + cir + "</g>";
        off += pct;
      });
      g += '<text x="' + cx0 + '" y="' + (cx0 - 4) + '" text-anchor="middle" font-size="32" font-weight="800" style="font-family:var(--f-tit)">' + tot2 + "</text>";
      g += '<text class="mut" x="' + cx0 + '" y="' + (cx0 + 15) + '" text-anchor="middle" font-size="12">' + (spec.centro || "metas") + "</text>";
      if (tot2 && spec.sem.cumplida != null) g += '<text class="d-cum" x="' + cx0 + '" y="' + (cx0 + 33) + '" text-anchor="middle" font-size="12" font-weight="700">' + U.p(100 * spec.sem.cumplida / tot2, 0) + " cumplidas</text>";
      s = el(D, D, spec.aria); s.innerHTML = defs() + g; return s;
    }
    if (kind === "ring") {
      var t = document.createElement("template");
      t.innerHTML = U.ring(spec.value, { size: Math.min(w, spec.size || 150), sw: 14, k: spec.k || "b1", text: U.p(spec.value), aria: spec.aria, fs: 26 });
      return t.content.firstChild;
    }
  }

  /* arma la animación de entrada: una sola vez por elemento visible; sin movimiento, al filtrar o al redimensionar queda el estado final */
  var RED = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  C.armar = function (root, anim) {
    var els = [].slice.call((root || document).querySelectorAll(".anim"));
    if (!anim || RED() || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.remove("anim"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
    els.forEach(function (e) { io.observe(e); });
  };
  /* contadores de los indicadores: el texto real vive en el DOM (y se ve tal cual si el elemento no llega a mostrarse, al imprimir o sin JS);
     al hacerse visible el contador sube de 0 al valor y al terminar se reescribe exactamente el texto original */
  C.contar = function (root) {
    if (RED() || !("IntersectionObserver" in window) || !window.requestAnimationFrame) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        io.unobserve(x.target);
        var v = x.target, tx = v.textContent.trim(), m = /^(\D*?)(\d+(?:\.\d+)?)(\D*)$/.exec(tx);
        if (!m) return;
        var dec = (m[2].split(".")[1] || "").length, fin = parseFloat(m[2]), f = function (n) { return m[1] + n.toFixed(dec) + m[3]; };
        v.innerHTML = '<span class="sr">' + U.esc(tx) + '</span><span aria-hidden="true">' + f(0) + "</span>";
        var vis = v.lastChild, t0 = null;
        window.addEventListener("beforeprint", function () { v.textContent = tx; });
        (function paso(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.max(0, Math.min(1, (ts - t0) / 800)), e = 1 - Math.pow(1 - p, 3);
          if (p < 1) { vis.textContent = f(fin * e); requestAnimationFrame(paso); } else v.textContent = tx;
        })(performance.now());
      });
    }, { threshold: 0.25 });
    (root || document).querySelectorAll(".kpi .v,.kpi2 .v").forEach(function (v) { io.observe(v); });
  };

  C.mount = function (root, anim) {
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
    C.armar(root, anim === true);
  };
  var ult = 0, tmr;
  window.addEventListener("resize", function () {
    clearTimeout(tmr);
    tmr = setTimeout(function () { var w = document.documentElement.clientWidth; if (w !== ult) { ult = w; C.mount(); } }, 120);
  });
})();
