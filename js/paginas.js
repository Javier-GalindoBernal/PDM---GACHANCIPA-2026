/* Páginas del portal. Cada una devuelve {title, crumbs, html, init}. Todas las cifras salen de window.PDM. */
(function () {
  "use strict";
  var D = window.PDM, h = U.esc, P = window.Paginas = {};
  var secBy = {}, ejeBy = {}, metaBy = {};
  D.secretarias.forEach(function (s) { secBy[s.carpeta] = s; });
  D.ejes.forEach(function (e) { ejeBy[e.id] = e; });
  D.metas.forEach(function (m) { metaBy[m.id] = m; });
  var CORTE = D.corte;
  var natural = function (a, b) { var x = parseInt(a, 10), y = parseInt(b, 10); return x === y ? String(a).localeCompare(String(b)) : x - y; };
  var ICON = function (n) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  var hrefMeta = function (m) { return "#/meta/" + m.car + "/" + encodeURIComponent(m.cod); };
  var secCorto = function (c) { return secBy[c] ? secBy[c].corto : c; };
  /* contenedor desplazable accesible; con hint=true avisa en móvil que hay más columnas */
  function tw(inner, cap, hint) {
    return '<div class="tw" tabindex="0" role="region" aria-label="' + h(cap) + '">' + inner + "</div>";
  }

  function leyenda(sem) {
    return '<div class="leg">' + U.SEMORD.map(function (k) {
      return '<span><i class="dot-' + U.SEM[k].k + '"></i>' + U.SEM[k].et + " (" + (sem[k] || 0) + ")</span>";
    }).join("") + "</div>";
  }
  function stackBar(sem) {
    var t = 0; U.SEMORD.forEach(function (k) { t += sem[k] || 0; });
    return '<div class="stack" role="img" aria-label="' + U.SEMORD.map(function (k) { return U.SEM[k].et + " " + (sem[k] || 0); }).join(", ") + '">' +
      U.SEMORD.map(function (k) { return (sem[k] ? '<i class="dot-' + U.SEM[k].k + '" style="width:' + (100 * sem[k] / t) + '%"></i>' : ""); }).join("") + "</div>";
  }
  /* ring: porcentaje 0..100 para el anillo (opcional); txt=true escribe el % dentro; el número real siempre va escrito en .v */
  function bajan(L) { var n = L.filter(function (x) { return x.a2026 < x.a2025; }).length; return "Frente a " + CORTE.anterior + ", " + n + " de " + L.length + " secretarías bajan su avance al corte " + CORTE.vigencia; }
  var RK = { "k-cum": "cum", "k-ava": "ava", "k-rez": "rez", "k-np": "np" };
  function kpi(v, l, n, k, ring, txt) {
    var rg = ring == null ? "" : '<span class="kz">' + U.ring(ring, { size: 52, k: RK[k] || "b1", text: txt ? U.p(ring, 0) : null, fs: 12 }) + "</span>";
    return '<div class="card kpi ' + (k || "") + '"><span class="kr"><span class="v num">' + v + "</span>" + rg + '</span><span class="l">' + l + "</span>" + (n ? '<span class="n">' + n + "</span>" : "") + "</div>";
  }
  /* leyenda y valores del comparativo 2025 / 2026 (círculo = vigencia anterior, cuadrado = vigencia actual) */
  function bltxt(a, b) {
    return '<div class="mini bl-t"><span><i class="dot-25"></i>' + CORTE.anterior + " <b>" + U.p(a) + '</b></span><span><i class="dot-26"></i>' + CORTE.vigencia + " <b>" + U.p(b) + '</b></span></div>';
  }
  function leyVig() {
    return '<div class="leg"><span><i class="dot-25"></i>' + CORTE.anterior + '</span><span><i class="dot-26"></i>' + CORTE.vigencia + " al corte</span></div>";
  }
  /* mosaico: un bloque por estado, con tamaño proporcional al número de metas */
  function mosaico(C, tot, hrefs) {
    return '<div class="tree" role="group" aria-label="Mosaico de metas por estado; el tamaño de cada bloque es proporcional al número de metas">' + U.SEMORD.filter(function (k) { return C[k]; }).map(function (k) {
      var tx = U.SEM[k].et + ": " + C[k] + (C[k] === 1 ? " meta" : " metas") + " (" + U.p(100 * C[k] / tot, 0) + ")";
      return '<a class="tl tl-' + U.SEM[k].k + '" style="flex-grow:' + C[k] + '" href="' + h(hrefs[k]) + '" data-tip="' + h(tx) + '" aria-label="' + h(tx + ". Ver en el explorador") + '"><span class="tn">' + C[k] + '</span><span class="tt">' + U.SEM[k].et + " · " + U.p(100 * C[k] / tot, 0) + "</span></a>";
    }).join("") + "</div>";
  }
  function notaCorte() {
    return '<p class="muted">Corte ' + h(CORTE.texto) + " (" + h(CORTE.trimestre) + " de " + CORTE.vigencia + "). Las metas no programadas al corte no penalizan el indicador.</p>";
  }

  /* tabla de metas reutilizable. cols: cod, meta, sec, eje, a25, a26, ind, est, pa, ea, pp */
  var CAB = {
    cod: ["Código", ""], meta: ["Meta", ""], sec: ["Secretaría", ""], eje: ["Eje", "n"], a25: ["Avance 2025", "n"],
    a26: ["Avance 2026 al corte", "n"], ind: ["Indicador", "n"], est: ["Estado", ""], pa: ["Programado acumulado", "n"],
    ea: ["Ejecutado acumulado", "n"], pp: ["Programado posterior 2026", "n"]
  };
  function tablaMetas(rows, cols, cap, extra) {
    if (!rows.length) return '<p class="vacio">No hay metas en esta lista.</p>';
    var s = '<table class="rc"><caption' + (extra && extra.capVisible ? "" : ' class="sr"') + ">" + h(cap) + "</caption><thead><tr>";
    cols.forEach(function (c) { s += '<th scope="col"' + (CAB[c][1] ? ' class="n"' : "") + ">" + CAB[c][0] + "</th>"; });
    s += "</tr></thead><tbody>";
    rows.forEach(function (m) {
      s += "<tr>";
      cols.forEach(function (c) {
        var v;
        switch (c) {
          case "cod": v = '<td data-l=""><a class="cod" href="' + hrefMeta(m) + '">' + h(m.cod) + "</a></td>"; break;
          case "meta": v = '<td class="cell-meta" data-l="">' + h(m.m) + marcasHtml(m) + "</td>"; break;
          case "sec": v = '<td data-l="Secretaría">' + h(secCorto(m.car)) + "</td>"; break;
          case "eje": v = '<td class="n" data-l="Eje"><a href="#/ejes/' + m.eje + '">' + m.eje + "</a></td>"; break;
          case "a25": v = '<td class="n" data-l="Avance 2025">' + (m.p25 > 0 ? U.p(m.a25) : "—") + "</td>"; break;
          case "a26": v = '<td class="n" data-l="Avance 2026 al corte">' + (m.p26 > 0 ? U.p(m.a26) : "—") + "</td>"; break;
          case "ind": v = '<td class="n" data-l="Indicador">' + mbar(m) + (m.s === "no_programada" ? "—" : U.p(m.ind)) + "</td>"; break;
          case "est": v = '<td data-l="Estado">' + U.chip(m.s) + "</td>"; break;
          case "pa": v = '<td class="n" data-l="Programado acumulado">' + U.n(m.pa) + "</td>"; break;
          case "ea": v = '<td class="n" data-l="Ejecutado acumulado">' + U.n(m.ea) + "</td>"; break;
          case "pp": v = '<td class="n" data-l="Programado posterior 2026">' + U.n(m.pp) + "</td>"; break;
        }
        s += v;
      });
      s += "</tr>";
    });
    s += "</tbody></table>";
    return tw(s, cap);
  }
  /* mini-barra del indicador (decorativa: el número va escrito al lado), con el color del estado de la meta */
  function mbar(m) {
    return m.s === "no_programada" ? "" : '<span class="mbar" aria-hidden="true"><i class="k-' + U.SEM[m.s].k + '" style="width:' + Math.max(2, Math.min(Math.max(m.ind, 0), 100)) + '%"></i></span>';
  }
  var MARCA = {
    compartida: "Meta compartida", verificacion: "En verificación con la secretaría", arrastre: "Sin programación 2026 al corte (arrastre 2025)",
    sobreejecucion: "Ejecución superior a lo programado", fraccionaria: "Escala del Plan Indicativo en verificación"
  };
  function marcasHtml(m) {
    return m.mk && m.mk.length ? "<div>" + m.mk.map(function (k) { return '<span class="tag">' + h(MARCA[k] || k) + "</span>"; }).join("") + "</div>" : "";
  }
  function selSec(id, valor, todas) {
    return '<select id="' + id + '">' + (todas ? '<option value="">Todas las secretarías</option>' : "") +
      D.secretarias.map(function (s) { return '<option value="' + h(s.carpeta) + '"' + (s.carpeta === valor ? " selected" : "") + ">" + h(s.corto) + "</option>"; }).join("") + "</select>";
  }
  function btnInf(a, tipo, etq) {
    if (!a) return '<span class="btn min" aria-disabled="true" role="link">' + etq + " no disponible</span>";
    return '<a class="btn min' + (tipo === "pdf" ? " sec" : "") + '" href="' + h(a.ruta) + '" ' + (tipo === "docx" ? "download " : 'target="_blank" rel="noopener" ') + 'aria-label="Descargar ' + etq + " (" + U.n(a.kb) + ' KB)">' + ICON("down") + etq + " · " + U.n(a.kb) + " KB</a>";
  }

  /* ============== filtros globales (solo durante la sesión de la pestaña; no se conservan al volver otro día) ============== */
  var FK = "pdm_filtros", F = { sec: "", eje: "", est: "" };
  try { var g0 = JSON.parse(sessionStorage.getItem(FK) || "{}"); if (g0.sec && secBy[g0.sec]) F.sec = g0.sec; if (g0.eje && ejeBy[+g0.eje]) F.eje = String(+g0.eje); if (g0.est && U.SEM[g0.est]) F.est = g0.est; } catch (e) { }
  function guardarF() { try { sessionStorage.setItem(FK, JSON.stringify(F)); } catch (e) { } }
  function hay() { return !!(F.sec || F.eje || F.est); }
  function filtradasG() { return D.metas.filter(function (m) { return (!F.sec || m.car === F.sec) && (!F.eje || String(m.eje) === F.eje) && (!F.est || m.s === F.est); }); }
  /* conteos por estado: ignoran el filtro de Estado (si no, al filtrar por «cumplidas» los demás estados aparecerían en cero) */
  function filtradasSinEst() { return D.metas.filter(function (m) { return (!F.sec || m.car === F.sec) && (!F.eje || String(m.eje) === F.eje); }); }
  /* enlace al explorador con los filtros vigentes, sobreescribiendo los indicados */
  function hrefEx(over) {
    var f = { sec: F.sec, eje: F.eje, est: F.est }, p = [], k;
    for (k in over) f[k] = over[k];
    ["sec", "eje", "est"].forEach(function (c) { if (f[c]) p.push(c + "=" + encodeURIComponent(f[c])); });
    return "#/metas" + (p.length ? "?" + p.join("&") : "");
  }
  var ejeCorto = function (e) { var n = e.nombre.replace(/^Gachancipá\s+(con\s+)?/i, ""); return e.id + ". " + n.charAt(0).toUpperCase() + n.slice(1); };
  function cuenta(rows) { var c = { cumplida: 0, en_avance: 0, rezagada: 0, no_programada: 0 }; rows.forEach(function (m) { c[m.s]++; }); return c; }
  function trunc(t, n) { t = String(t); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t; }
  var fbAbierto = null;
  window.Filtros = {
    barra: function () {
      var M = filtradasG(), act = [];
      if (F.sec) act.push(["sec", "Secretaría", secCorto(F.sec)]);
      if (F.eje) act.push(["eje", "Eje", F.eje + ". " + ejeBy[+F.eje].nombre]);
      if (F.est) act.push(["est", "Estado", U.SEM[F.est].et]);
      var mqm = window.matchMedia && matchMedia("(max-width:720px)").matches;
      var abierto = fbAbierto === null ? !mqm : fbAbierto;
      return '<section class="fbar card" aria-label="Filtros globales"><details id="fb-d"' + (abierto ? " open" : "") + '><summary><span class="row">' + ICON("filter") + "Filtros" + (act.length ? ' <span class="tag">' + act.length + " activo" + (act.length > 1 ? "s" : "") + "</span>" : "") + '</span></summary><div class="fb-ctl">' +
        '<div class="fld"><label for="g-sec">Secretaría</label>' + selSec("g-sec", F.sec, true) + "</div>" +
        '<div class="fld"><label for="g-eje">Eje estratégico</label><select id="g-eje"><option value="">Todos los ejes</option>' + D.ejes.map(function (e) { return '<option value="' + e.id + '"' + (String(e.id) === F.eje ? " selected" : "") + ">" + e.id + ". " + h(e.nombre) + "</option>"; }).join("") + "</select></div>" +
        '<div class="fld"><label for="g-est">Estado</label><select id="g-est"><option value="">Todos los estados</option>' + U.SEMORD.map(function (k) { return '<option value="' + k + '"' + (k === F.est ? " selected" : "") + ">" + U.SEM[k].et + "</option>"; }).join("") + "</select></div>" +
        "</div></details>" +
        (act.length ? '<p class="fb-aviso" role="status"><strong>Vista filtrada:</strong> los conteos de metas no son el total del Plan, y el indicador institucional no cambia con el filtro. <button class="btn sec min" type="button" id="vf-total">Ver el total</button></p>' : "") +
        '<div class="fb-act"><ul class="fchips" aria-label="Filtros activos">' + act.map(function (a) { return '<li><button class="fchip" type="button" data-k="' + a[0] + '" aria-label="Quitar el filtro ' + h(a[1] + ": " + a[2]) + '"><span>' + h(a[1]) + ": <b>" + h(a[2]) + "</b></span>" + ICON("x") + "</button></li>"; }).join("") + '</ul><span class="mini" id="fb-n">' + (act.length ? M.length + " de " + D.metas.length + " metas coinciden" : "Sin filtros: se muestran las " + D.metas.length + " metas") + '</span><button class="btn sec min fb-clear" type="button" id="g-clear"' + (act.length ? "" : " disabled") + ">" + ICON("x") + "Limpiar</button></div></section>";
    },
    ligar: function (root, cambio) {
      var d = root.querySelector("#fb-d");
      if (d) d.addEventListener("toggle", function () { fbAbierto = d.open; });
      [["g-sec", "sec"], ["g-eje", "eje"], ["g-est", "est"]].forEach(function (p) {
        root.querySelector("#" + p[0]).addEventListener("change", function () { F[p[1]] = this.value; guardarF(); cambio(p[0]); });
      });
      root.querySelector("#g-clear").addEventListener("click", function () { F.sec = F.eje = F.est = ""; guardarF(); cambio("g-sec"); });
      var vt = root.querySelector("#vf-total"); if (vt) vt.addEventListener("click", function () { F.sec = F.eje = F.est = ""; guardarF(); cambio("g-sec"); });
      var vb = root.querySelector("#vf-limpiar"); if (vb) vb.addEventListener("click", function () { F.sec = F.eje = F.est = ""; guardarF(); cambio("g-sec"); });
      root.querySelectorAll(".fchip").forEach(function (b) { b.addEventListener("click", function () { F[b.dataset.k] = ""; guardarF(); cambio("g-" + b.dataset.k); }); });
    },
    texto: function () { return filtradasG().length + " de " + D.metas.length + " metas coinciden con los filtros."; },
    /* API para el agente virtual: leer, aplicar y limpiar filtros sin duplicar la lógica */
    estado: function () { return { sec: F.sec, eje: F.eje, est: F.est }; },
    limpiar: function () { F.sec = F.eje = F.est = ""; guardarF(); },
    aplicar: function (o) {
      o = o || {};
      F.sec = o.sec && secBy[o.sec] ? o.sec : "";
      F.eje = o.eje && ejeBy[+o.eje] ? String(+o.eje) : "";
      F.est = o.est && U.SEM[o.est] ? o.est : "";
      guardarF();
    }
  };
  function vacioFiltros() {
    return '<section class="card vacio"><svg class="ic big" aria-hidden="true"><use href="#i-search"/></svg><h2>Ninguna meta coincide con estos filtros</h2><p>La combinación de secretaría, eje y estado no tiene metas. Pruebe quitar uno de los filtros.</p><p><button class="btn" type="button" id="vf-limpiar">Limpiar filtros</button></p></section>';
  }

  /* ======================= componentes del tablero ======================= */
  /* o.gauge: medidor del indicador (0..100); o.ring: anillo (0..100) con color o.rk; o.rt: escribir el % dentro del anillo. El número real va siempre en .v */
  function kpi2(o) {
    var viz = o.gauge != null ? U.gauge(o.gauge, { k: "b1" }) : o.ring != null ? U.ring(o.ring, { size: 56, k: o.rk || "b1", text: o.rt ? U.p(o.ring, 0) : null, fs: 13 }) : "";
    return '<a class="card kpi2 ' + (o.k || "") + '" href="' + h(o.href) + '"><span class="kh"><span class="kic">' + ICON(o.ic) + '</span><span class="l">' + o.l + '</span></span><span class="kr"><span class="v num">' + o.v + "</span>" + (viz ? '<span class="kz">' + viz + "</span>" : "") + "</span>" +
      (o.n ? '<span class="n">' + o.n + "</span>" : "") + (o.sp ? '<span class="sp">' + o.sp + "</span>" : "") + "</a>";
  }
  function rank(items) {
    return '<ol class="rank">' + items.map(function (it, i) {
      return '<li><a href="' + h(it.href) + '" data-tip="' + h(it.label + ": " + U.p(it.value)) + '"><span class="pos">' + (i + 1) + '</span><span class="nm">' + h(it.label) + '</span><span class="bar" aria-hidden="true"><i style="width:' + Math.min(Math.max(it.value, 0), 100) + '%"></i></span><span class="vl num">' + U.p(it.value) + "</span></a></li>";
    }).join("") + "</ol>";
  }
  function listaMetas(rows, vacio) {
    if (!rows.length) return '<p class="vacio mini">' + vacio + "</p>";
    return '<ul class="mlist">' + rows.map(function (m) {
      return '<li><a href="' + hrefMeta(m) + '"><span class="cd s-' + m.s + '">' + h(m.cod) + '</span><span class="tx">' + h(trunc(m.m, 118)) + "<small>" + h(secCorto(m.car)) + " · Eje " + m.eje + '</small></span><span class="vl num">' + (m.s === "no_programada" ? "—" : U.p(m.ind)) + "</span></a></li>";
    }).join("") + "</ul>";
  }
  /* filas del mapa de calor: def = [{label, href: fn(k) -> enlace, filtro: fn(m)}] */
  function heatRows(defs, M) {
    return defs.map(function (d) {
      var sub = M.filter(d.filtro), c = cuenta(sub);
      return { label: d.label, cells: U.SEMORD.map(function (k) { return { v: c[k], href: d.href(k) }; }) };
    });
  }
  function banner(t, extra) {
    return '<section class="banner"><div><p class="eyebrow">Corte ' + h(CORTE.texto) + " · " + h(CORTE.trimestre) + " de " + CORTE.vigencia + "</p><h2>" + t + "</h2></div><p class=\"b-tx\">" + extra + "</p></section>";
  }

  /* ============================ RESUMEN ============================ */
  function oficial() {
    var I = D.inst;
    if (F.sec && F.eje) return null;
    if (F.sec) { var s = secBy[F.sec]; return { ind: s.ind, a25: s.a2025, a26: s.a2026, t: s.corto, n: "Indicador oficial de la secretaría" }; }
    if (F.eje) { var e = ejeBy[+F.eje]; return { ind: e.ind, a25: e.a2025, a26: e.a2026, t: "eje " + e.id, n: "Indicador oficial del eje" }; }
    return { ind: I.ind, a25: I.a2025, a26: I.a2026, t: "institucional", n: "Media simple de las " + I.n_sec + " secretarías" };
  }
  P.resumen = function () {
    var I = D.inst, M = filtradasG(), MS = filtradasSinEst(), C = cuenta(MS), tot = MS.length, hi = F.eje ? F.eje - 1 : undefined;
    var ban = banner("Centro de mando del Plan de Desarrollo Municipal", I.metas + " metas · " + I.n_sec + " secretarías · " + D.ejes.length + " ejes estratégicos. Las metas no programadas al corte no penalizan el indicador.");
    var base = { title: "Resumen ejecutivo", crumbs: [["Inicio", null]], filtros: true };
    if (!M.length && !tot) { base.html = ban + vacioFiltros(); return base; }
    var of = oficial(), etq = of ? of.t : "";
    /* minigráfico de columnas: una columna por eje (categorías, no tiempo) con rótulo visible; el eje filtrado queda resaltado */
    var spCap = function (n) { return '<span class="sp-cap">Una columna por eje, del 1 al ' + n + (hi != null ? " · resaltado: eje " + (hi + 1) : "") + "</span>"; };
    var spTips = function (vals, pct) { return vals.map(function (v, i) { return "Eje " + D.ejes[i].id + ": " + (pct ? U.p(v) : v); }); };
    var sparkE = function (vals, nom) { var tp = spTips(vals, true); return U.spark(vals, { max: 100, hi: hi, tips: tp, aria: nom + " por eje estratégico (referencia oficial). " + tp.join("; ") }) + spCap(vals.length); };
    var sparkN = function (vals, nom) { var tp = spTips(vals, false); return U.spark(vals, { hi: hi, tips: tp, aria: nom + " por eje estratégico. " + tp.join("; ") }) + spCap(vals.length); };
    var dv = of ? U.delta(of.a25, of.a26) : null;
    var k1 = kpi2({ href: "#/ejes", ic: "trend", k: "k-main", l: "Indicador " + (of ? etq : "del filtro"), v: of ? U.p(of.ind) : "—", gauge: of ? of.ind : null, n: of ? of.n + ". Compara lo ejecutado con lo programado al corte." : "Sin indicador oficial para la combinación de secretaría y eje; se muestran los conteos de metas.", sp: sparkE(D.ejes.map(function (e) { return e.ind; }), "Indicador") });
    var k2 = kpi2({ href: "#/ejes", ic: "layers", l: "Avance de la vigencia " + CORTE.anterior, v: of ? U.p(of.a25) : "—", ring: of ? of.a25 : null, rk: "b5", n: "Plan Indicativo, vigencia cerrada", sp: sparkE(D.ejes.map(function (e) { return e.a2025; }), "Avance " + CORTE.anterior) });
    var k3 = kpi2({ href: "#/ejes", ic: "check", l: "Avance " + CORTE.vigencia + " al corte", v: of ? U.p(of.a26) : "—", ring: of ? of.a26 : null, rk: "b2", n: h(CORTE.trimestre) + " · " + h(CORTE.texto) + (dv ? ' <span class="delta" role="img" aria-label="' + h(dv.w + " frente a " + CORTE.anterior) + '">' + dv.ar + " " + dv.t + " frente a " + CORTE.anterior + "</span>" : ""), sp: sparkE(D.ejes.map(function (e) { return e.a2026; }), "Avance " + CORTE.vigencia + " al corte") });
    var ST = { cumplida: ["check", "k-cum", "al 100 % o más"], en_avance: ["trend", "k-ava", "entre 20 % y 99 %"], rezagada: ["alert", "k-rez", "para acompañar con las secretarías"], no_programada: ["pause", "k-np", "sin programación al corte; no penalizan"] };
    var ks = U.SEMORD.map(function (k) {
      return kpi2({ href: hrefEx({ est: k }), ic: ST[k][0], k: ST[k][1], l: { cumplida: "Metas cumplidas", en_avance: "Metas en avance", rezagada: "Metas rezagadas", no_programada: "Metas no programadas" }[k], v: C[k], ring: 100 * C[k] / tot, rk: U.SEM[k].k, rt: true, n: "de " + tot + '<span class="n-x"> registros · ' + ST[k][2] + "</span>", sp: sparkN(porEje(MS, k), "Metas " + U.SEM[k].et.toLowerCase()) });
    }).join("");
    var kp = '<div class="kpis mt" role="group" aria-label="Indicadores clave del corte">' + k1 + k2 + k3 + ks + "</div>";

    var hrefs = {}; U.SEMORD.forEach(function (k) { hrefs[k] = hrefEx({ est: k }); });
    var dn = '<section class="card ac ac-sem"><div class="sec-h"><div><h2>' + C.cumplida + " de " + tot + ' metas ya cumplieron lo programado</h2><p class="sub">Semáforo de metas al corte. Haga clic en un sector o en un bloque para ver esas metas.</p></div></div><div class="donut-wrap"><div style="width:200px">' +
      Charts.donut({ sem: C, hrefs: hrefs, aria: "Anillo del semáforo: " + U.SEMORD.map(function (s) { return U.SEM[s].et + " " + C[s]; }).join(", ") }) + "</div>" + mosaico(C, tot, hrefs) + '</div><details class="dtab"><summary>Ver los datos del gráfico en tabla</summary><div class="tw"><table class="legtab"><caption class="sr">Convenciones del semáforo</caption><thead><tr><th scope="col">Estado</th><th scope="col" class="n">Metas</th><th scope="col">Regla</th></tr></thead><tbody>' +
      U.SEMORD.map(function (s) { return '<tr><th scope="row" style="font-weight:600;text-align:left"><a class="chip s-' + s + '" href="' + h(hrefs[s]) + '">' + U.SEM[s].et + '</a></th><td class="num n"><b>' + C[s] + "</b></td><td class='mini'>" + U.SEM[s].regla + "</td></tr>"; }).join("") + "</tbody></table></div></details>"
      + "</section>";
    var secs = D.secretarias.filter(function (s) { return M.some(function (m) { return m.car === s.carpeta; }); }).sort(function (a, b) { return b.ind - a.ind; });
    var rk = '<section class="card ac ac-t"><div class="sec-h"><div><h2>' + (!F.sec && !F.eje && !F.est && secs.length === D.secretarias.length && secs.length > 1 ? "Ranking de secretarías: " + h(secs[0].corto) + " lidera con " + U.p(secs[0].ind) : "Indicador por secretaría (vista filtrada)") + '</h2><p class="sub">Por indicador al corte; la marca vertical al final de cada barra es la meta del 100 %. Cada secretaría responde por metas distintas.</p></div><a class="lnk" href="#/secretarias">Ver todas</a></div>' +
      rank(secs.map(function (s) { return { label: s.corto, value: s.ind, href: "#/secretarias/" + s.carpeta }; })) + "</section>";

    var ejs = D.ejes.filter(function (e) { return M.some(function (m) { return m.eje === e.id; }); });
    var hm = '<section class="card ac ac-i"><div class="sec-h"><div><h2>Mapa de calor: ejes por estado</h2><p class="sub">Número de metas. Clic en una celda para verlas.</p></div></div>' +
      Charts.heat({ cab: "Eje estratégico", aria: "Mapa de calor de metas por eje estratégico y estado", rows: heatRows(ejs.map(function (e) { return { label: ejeCorto(e), filtro: function (m) { return m.eje === e.id; }, href: function (k) { return hrefEx({ eje: String(e.id), est: k }); } }; }), filtradasSinEst()) }) + "</section>";
    var gb = '<section class="card ac ac-ci"><div class="sec-h"><div><h2>Avance por eje: ' + CORTE.anterior + " y " + CORTE.vigencia + '</h2><p class="sub">Vigencia anterior frente a la actual al corte; el chip de la derecha es la diferencia entre las dos cifras.</p></div></div>' + leyVig() +
      Charts.gbar({ la: String(CORTE.anterior), lb: CORTE.vigencia + " al corte", aria: "Avance por eje, vigencias " + CORTE.anterior + " y " + CORTE.vigencia, items: ejs.map(function (e) { return { label: ejeCorto(e), a: e.a2025, b: e.a2026, href: "#/ejes/" + e.id }; }) }) + "</section>";

    var rez = M.filter(function (m) { return m.s === "rezagada"; }).sort(function (a, b) { return a.ind - b.ind; });
    var certs = {}; D.cert.certificables.forEach(function (i) { certs[i] = 1; });
    var cum = M.filter(function (m) { return m.s === "cumplida"; }).sort(function (a, b) { return (certs[b.id] ? 1 : 0) - (certs[a.id] ? 1 : 0) || natural(a.cod, b.cod); });
    var at = '<section class="card ac ac-r"><div class="sec-h"><div><h2>Atención del corte</h2><p class="sub">Metas rezagadas para acompañar con las secretarías.</p></div>' + (rez.length ? '<a class="lnk" href="' + h(hrefEx({ est: "rezagada" })) + '">Ver las ' + rez.length + "</a>" : "") + "</div>" + listaMetas(rez.slice(0, 6), "Sin metas rezagadas con los filtros actuales.") + "</section>";
    var lg = '<section class="card ac ac-cum"><div class="sec-h"><div><h2>Logros del corte</h2><p class="sub">Metas con ejecución igual o superior a lo programado.</p></div>' + (cum.length ? '<a class="lnk" href="#/logros">Ver las ' + cum.length + "</a>" : "") + "</div>" + listaMetas(cum.slice(0, 6), "Sin metas cumplidas con los filtros actuales.") + "</section>";

    var nt = '<p class="nota mt2"><b>Cómo leer las cifras.</b> El indicador compara lo ejecutado con lo programado hasta el corte. Las metas que no tienen programación hasta el corte no penalizan el resultado y se muestran como «No programada». El indicador institucional es la media simple de los indicadores de las nueve secretarías; el de una secretaría y el de un eje son la media de sus metas programadas al corte. Por eso un eje (media por meta) puede superar al indicador institucional, en el que Desarrollo Institucional y Hacienda, con pocas metas, pesan lo mismo que las demás. Con filtros activos, los conteos corresponden a las metas filtradas y el indicador solo se muestra cuando existe una cifra oficial (institucional, por secretaría o por eje). Las diferencias de dato se verifican con cada secretaría.</p>';
    var rapidos = [["ejes", "layers", "Avance por eje", "Los 10 ejes con sus metas y secretarías."], ["secretarias", "building", "Secretarías", "Comparativo y ficha de cada una."], ["metas", "table", "Explorador de metas", "Busque y filtre las " + I.metas + " metas."], ["alertas", "alert", "Alertas", "Metas por acompañar y cronograma."], ["informes", "file", "Informes", "Descargas en Word y PDF."], ["metodologia", "book", "Metodología", "Cómo se calcula cada cifra."]];
    var ql = '<div class="grid g3 mt">' + rapidos.map(function (r) {
      return '<a class="card lcard" href="#/' + r[0] + '"><div class="row">' + ICON(r[1]) + "<h3>" + r[2] + "</h3></div><p class='muted' style='margin:0'>" + r[3] + "</p></a>";
    }).join("") + "</div>";
    base.html = ban + kp + '<div class="grid g2 mt">' + dn + rk + '</div><div class="grid g2 mt">' + hm + gb + '</div><div class="grid g2 mt">' + at + lg + "</div>" + nt + ql;
    return base;
  };
  function porEje(rows, k) { return D.ejes.map(function (e) { return rows.filter(function (m) { return m.eje === e.id && (!k || m.s === k); }).length; }); }

  /* ============================ EJES ============================ */
  P.ejes = function (ctx) {
    if (ctx.parts[1]) return ejeDetalle(+ctx.parts[1]);
    var M = filtradasG(), E = D.ejes.filter(function (e) { return M.some(function (m) { return m.eje === e.id; }); });
    if (!E.length) return { title: "Avance por eje estratégico", crumbs: [["Inicio", "#/resumen"], ["Avance por eje", null]], html: vacioFiltros(), filtros: true };
    var cards = E.map(function (e) {
      return '<a class="card lcard c' + ((e.id - 1) % 5 + 1) + '" href="#/ejes/' + e.id + '" aria-label="Eje ' + e.id + ", " + h(e.nombre) + ", indicador " + U.p(e.ind) + '"><div class="row"><span class="eje-n">' + e.id + "</span><h3>" + h(e.nombre) + "</h3></div>" +
        '<div class="row sb2"><span class="ind num">' + U.p(e.ind) + '</span><span class="mini">' + e.metas + " metas · " + e.secretarias.length + " secretaría" + (e.secretarias.length > 1 ? "s" : "") + "</span></div>" +
        U.bullet(e.a2025, e.a2026) + bltxt(e.a2025, e.a2026) + stackBar(e.sem) +
        '<div class="mini">' + e.sem.cumplida + " cumplidas · " + e.sem.en_avance + " en avance · " + e.sem.rezagada + " rezagadas · " + e.sem.no_programada + " no programadas</div></a>";
    }).join("");
    var html = '<p class="muted">Los diez ejes estratégicos del Plan. El indicador del eje es el promedio de los indicadores de sus metas programadas al corte.</p><div class="grid g-aut mt">' + cards + "</div>" +
      '<section class="card mt2 ac ac-ci"><h2>Avance 2025 y 2026 por eje</h2><p class="sub">Avance de la vigencia anterior frente al de la vigencia actual al corte; el chip de la derecha es la diferencia entre las dos cifras.</p>' + leyVig() +
      Charts.gbar({ la: String(CORTE.anterior), lb: CORTE.vigencia + " al corte", aria: "Avance por eje, vigencias " + CORTE.anterior + " y " + CORTE.vigencia, items: E.map(function (e) { return { label: ejeCorto(e), a: e.a2025, b: e.a2026, href: "#/ejes/" + e.id }; }) }) + "</section>" +
      '<section class="mt2"><div class="tw"><table><caption>Resumen por eje estratégico</caption><thead><tr><th scope="col">Eje</th><th scope="col" class="n">Metas</th><th scope="col" class="n">Indicador</th><th scope="col" class="n">2025</th><th scope="col" class="n">2026 al corte</th><th scope="col" class="n">Cumplidas</th><th scope="col" class="n">En avance</th><th scope="col" class="n">Rezagadas</th><th scope="col" class="n">No prog.</th></tr></thead><tbody>' +
      E.map(function (e) { return '<tr><th scope="row"><a href="#/ejes/' + e.id + '">' + e.id + ". " + h(e.nombre) + '</a></th><td class="n">' + e.metas + '</td><td class="n">' + U.p(e.ind) + '</td><td class="n">' + U.p(e.a2025) + '</td><td class="n">' + U.p(e.a2026) + '</td><td class="n">' + e.sem.cumplida + '</td><td class="n">' + e.sem.en_avance + '</td><td class="n">' + e.sem.rezagada + '</td><td class="n">' + e.sem.no_programada + "</td></tr>"; }).join("") +
      "</tbody></table></div></section>";
    return { title: "Avance por eje estratégico", crumbs: [["Inicio", "#/resumen"], ["Avance por eje", null]], html: html, filtros: true };
  };
  function ejeDetalle(id) {
    var e = ejeBy[id]; if (!e) return P.noEncontrada();
    var rows = D.metas.filter(function (m) { return m.eje === id; }).sort(function (a, b) { return natural(a.cod, b.cod); });
    var ant = ejeBy[id - 1], sig = ejeBy[id + 1];
    var rez = e.rezagadas.length ? '<p class="nota mt"><b>Metas rezagadas del eje (' + e.rezagadas.length + ").</b> Son metas con programación al corte y avance inferior al 20 %; se acompañan con la secretaría responsable: " +
      e.rezagadas.map(function (r) { return '<a href="#/meta/' + r.carpeta + "/" + encodeURIComponent(r.codigo) + '">meta ' + h(r.codigo) + " (" + U.p(r.indicador) + ")</a>"; }).join(", ") + ".</p>" : '<p class="nota verde mt">Este eje no tiene metas rezagadas al corte.</p>';
    var html = '<p class="muted">' + h(e.oficial) + "</p>" +
      '<div class="grid g4 mt">' + kpi(U.p(e.ind), "Indicador del eje", e.prog + " metas programadas al corte", "", e.ind) + kpi(U.p(e.a2025), "Avance " + CORTE.anterior, "", "k-a25", e.a2025) + kpi(U.p(e.a2026), "Avance " + CORTE.vigencia + " al corte", "", "k-a26", e.a2026) + kpi(e.metas, "Metas del eje", e.secretarias.length + " secretaría" + (e.secretarias.length > 1 ? "s" : "")) + "</div>" +
      '<div class="grid g2 mt"><section class="card"><h2>Estado de las metas del eje</h2><div class="donut-wrap"><div style="width:190px">' + Charts.donut({ sem: e.sem, aria: "Semáforo del eje " + id }) + "</div>" + leyenda(e.sem) + '</div></section><section class="card"><h2>Secretarías que concurren</h2><p class="sub">Responsables de las metas del eje.</p><ul style="margin:0;padding-left:18px">' +
      e.secretarias.map(function (n) { var c = D.secretarias.filter(function (s) { return s.nombre === n || s.corto === n; })[0]; return "<li>" + (c ? '<a href="#/secretarias/' + c.carpeta + '">' + h(n) + "</a>" : h(n)) + "</li>"; }).join("") + "</ul></section></div>" + rez +
      '<section class="mt2"><h2>Metas del eje</h2><p class="muted">Cada fila lleva al detalle de la meta.</p>' + tablaMetas(rows, ["cod", "meta", "sec", "a25", "a26", "ind", "est"], "Metas del eje " + id + ": " + e.nombre) + "</section>" +
      '<nav class="row sb2 mt2" aria-label="Eje anterior y siguiente">' + (ant ? '<a class="btn sec" href="#/ejes/' + ant.id + '">« Eje ' + ant.id + "</a>" : "<span></span>") + (sig ? '<a class="btn sec" href="#/ejes/' + sig.id + '">Eje ' + sig.id + " »</a>" : "") + "</nav>";
    return { title: "Eje " + id + ". " + e.nombre, crumbs: [["Inicio", "#/resumen"], ["Avance por eje", "#/ejes"], ["Eje " + id, null]], html: html };
  }

  /* ============================ SECRETARÍAS ============================ */
  P.secretarias = function (ctx) {
    if (ctx.parts[1]) return secDetalle(ctx.parts[1]);
    var M = filtradasG(), S = D.secretarias.filter(function (s) { return M.some(function (m) { return m.car === s.carpeta; }); });
    if (!S.length) return { title: "Secretarías", crumbs: [["Inicio", "#/resumen"], ["Secretarías", null]], html: vacioFiltros(), filtros: true };
    var Ss = S.slice().sort(function (a, b) { return b.ind - a.ind; });
    var cards = S.map(function (s, i) {
      var c = i % 5 + 1;
      return '<a class="card lcard c' + c + '" href="#/secretarias/' + s.carpeta + '"><div class="lc-h">' + U.ring(s.ind, { size: 68, sw: 8, k: "b1", text: U.p(s.ind), fs: 13, aria: "Indicador de " + s.corto + ": " + U.p(s.ind) }) + '<div><h3>' + h(s.corto) + '</h3><span class="mini">' + s.metas + " metas</span></div></div>" +
        stackBar(s.sem) + '<div class="mini">' + s.sem.cumplida + " cumplidas · " + s.sem.en_avance + " en avance · " + s.sem.rezagada + " rezagadas · " + s.sem.no_programada + " no prog.</div></a>";
    }).join("");
    var html = '<p class="muted">Comparativo de las nueve secretarías. Cada una responde por metas distintas; el indicador resume su avance acumulado al corte.</p>' +
      '<div class="grid g2 mt"><section class="card ac ac-t"><h2>' + h(Ss[0].corto) + ' lidera con ' + U.p(Ss[0].ind) + '; ' + h(Ss[Ss.length - 1].corto) + ' cierra con ' + U.p(Ss[Ss.length - 1].ind) + '</h2><p class="sub">Indicador por secretaría, de mayor a menor; la línea punteada marca la meta del 100 %.</p>' + Charts.hbar({ aria: "Indicador por secretaría", items: Ss.map(function (s) { return { label: s.corto, value: s.ind, href: "#/secretarias/" + s.carpeta }; }) }) + "</section>" +
      '<section class="card ac ac-ci"><h2>' + bajan(S) + '</h2><p class="sub">El chip de la derecha es la diferencia entre las dos cifras.</p>' + leyVig() +
      Charts.gbar({ la: String(CORTE.anterior), lb: CORTE.vigencia + " al corte", aria: "Avance por secretaría, vigencias " + CORTE.anterior + " y " + CORTE.vigencia, items: Ss.map(function (s) { return { label: s.corto, a: s.a2025, b: s.a2026, href: "#/secretarias/" + s.carpeta }; }) }) + "</section></div>" +
      '<section class="card mt ac ac-i"><div class="sec-h"><div><h2>Mapa de calor: dónde se concentran las metas, por secretaría y estado</h2><p class="sub">Número de metas. Clic en una celda para verlas en el explorador.</p></div></div>' + Charts.heat({ cab: "Secretaría", aria: "Mapa de calor de metas por secretaría y estado", rows: heatRows(S.map(function (s) { return { label: s.corto, filtro: function (m) { return m.car === s.carpeta; }, href: function (k) { return hrefEx({ sec: s.carpeta, est: k }); } }; }), filtradasSinEst()) }) + "</section>" +
      '<div class="grid g-aut mt2">' + cards + "</div>" +
      '<section class="mt2"><div class="tw"><table><caption>Comparativo de secretarías</caption><thead><tr><th scope="col">Secretaría</th><th scope="col" class="n">Metas</th><th scope="col" class="n">2025</th><th scope="col" class="n">2026 al corte</th><th scope="col" class="n">Indicador</th><th scope="col" class="n">Cumpl.</th><th scope="col" class="n">En avance</th><th scope="col" class="n">Rezag.</th><th scope="col" class="n">No prog.</th></tr></thead><tbody>' +
      S.map(function (s) { return '<tr><th scope="row"><a href="#/secretarias/' + s.carpeta + '">' + h(s.nombre) + '</a></th><td class="n">' + s.metas + '</td><td class="n">' + U.p(s.a2025) + '</td><td class="n">' + U.p(s.a2026) + '</td><td class="n"><b>' + U.p(s.ind) + '</b></td><td class="n">' + s.sem.cumplida + '</td><td class="n">' + s.sem.en_avance + '</td><td class="n">' + s.sem.rezagada + '</td><td class="n">' + s.sem.no_programada + "</td></tr>"; }).join("") + "</tbody></table></div></section>";
    return { title: "Secretarías", crumbs: [["Inicio", "#/resumen"], ["Secretarías", null]], html: html, filtros: true };
  };
  function secDetalle(car) {
    var s = secBy[car]; if (!s) return P.noEncontrada();
    var rows = D.metas.filter(function (m) { return m.car === car; }).sort(function (a, b) { return natural(a.cod, b.cod); });
    var prog = rows.filter(function (m) { return m.s !== "no_programada"; }).sort(function (a, b) { return a.ind - b.ind; });
    var inf = s.informe || {};
    var html = '<p class="muted">' + h(s.nombre) + "</p>" +
      '<div class="grid g4 mt">' + kpi(U.p(s.ind), "Indicador de la secretaría", "Indicador institucional: " + U.p(D.inst.ind), "", s.ind) + kpi(U.p(s.a2025), "Avance " + CORTE.anterior, "", "k-a25", s.a2025) + kpi(U.p(s.a2026), "Avance " + CORTE.vigencia + " al corte", "", "k-a26", s.a2026) + kpi(s.metas, "Metas a cargo", "reporte de la secretaría, corte " + h(CORTE.texto)) + "</div>" +
      '<div class="grid g2 mt"><section class="card"><h2>Estado de sus metas</h2><div class="donut-wrap"><div style="width:190px">' + Charts.donut({ sem: s.sem, aria: "Semáforo de " + s.corto }) + "</div>" + leyenda(s.sem) + "</div></section>" +
      '<section class="card"><h2>Informe de seguimiento</h2><p class="sub">Informe de la secretaría con corte ' + h(CORTE.texto) + ".</p>" + (D.informes ? '<div class="row">' + btnInf(inf.docx, "docx", "Word") + btnInf(inf.pdf, "pdf", "PDF") + "</div>" : '<p class="muted">El catálogo de informes no está disponible por ahora.</p>') +
      '<div class="mt"><a class="btn sec" href="#/metas?sec=' + encodeURIComponent(car) + '">' + ICON("table") + "Ver sus metas en el explorador</a></div></section></div>" +
      '<section class="card mt ac ac-t"><h2>Indicador por meta programada</h2><p class="sub">De menor a mayor avance; el valor se limita visualmente al 100 %. El color y el rótulo de cada barra indican el estado de la meta. Las metas no programadas al corte no se grafican.</p>' + leyenda(s.sem) + '<div style="max-height:460px;overflow:auto;padding-right:6px">' +
      Charts.hbar({ aria: "Indicador por meta de " + s.corto, items: prog.map(function (m) { return { label: "Meta " + m.cod + " · " + m.m, value: m.ind, href: hrefMeta(m), k: U.SEM[m.s].k, et: U.SEM[m.s].et }; }) }) + "</div></section>" +
      '<section class="mt2"><h2>Metas de la secretaría</h2>' + tablaMetas(rows, ["cod", "meta", "eje", "a25", "a26", "ind", "est"], "Metas de " + s.corto) + "</section>";
    return { title: s.corto, crumbs: [["Inicio", "#/resumen"], ["Secretarías", "#/secretarias"], [s.corto, null]], html: html };
  }

  /* ============================ EXPLORADOR ============================ */
  var EX = { q: "", sec: "", eje: "", est: "", vig: "", sort: "cod", dir: 1, page: 1 };
  var PAGE = 25;
  var VIG = { "": "Todas", p25: "Con programación 2025", p26: "Con programación 2026 al corte", s26: "Sin programación 2026 al corte", pos: "Con programación posterior al corte" };
  var norm = function (t) { return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  function filtradas() {
    var q = norm(EX.q).trim(), toks = q ? q.split(/\s+/) : [];
    var r = D.metas.filter(function (m) {
      if (EX.sec && m.car !== EX.sec) return false;
      if (EX.eje && String(m.eje) !== EX.eje) return false;
      if (EX.est && m.s !== EX.est) return false;
      if (EX.vig === "p25" && !(m.p25 > 0)) return false;
      if (EX.vig === "p26" && !(m.p26 > 0)) return false;
      if (EX.vig === "s26" && m.p26 > 0) return false;
      if (EX.vig === "pos" && !(m.pp > 0)) return false;
      if (toks.length) { var t = norm(m.cod + " " + m.m + " " + secCorto(m.car)); for (var i = 0; i < toks.length; i++) if (t.indexOf(toks[i]) < 0) return false; }
      return true;
    });
    var k = EX.sort, d = EX.dir;
    var get = { cod: function (m) { return parseInt(m.cod, 10); }, meta: function (m) { return norm(m.m); }, sec: function (m) { return norm(secCorto(m.car)); }, eje: function (m) { return m.eje; }, a25: function (m) { return m.p25 > 0 ? m.a25 : -1; }, a26: function (m) { return m.p26 > 0 ? m.a26 : -1; }, ind: function (m) { return m.s === "no_programada" ? -1 : m.ind; }, est: function (m) { return U.SEMORD.indexOf(m.s); } }[k] || function (m) { return parseInt(m.cod, 10); };
    r.sort(function (a, b) { var x = get(a), y = get(b); var c = x < y ? -1 : x > y ? 1 : 0; return c ? c * d : natural(a.cod, b.cod) || a.car.localeCompare(b.car); });
    return r;
  }
  function qsEx() {
    var p = []; ["q", "sec", "eje", "est", "vig"].forEach(function (k) { if (EX[k]) p.push(k + "=" + encodeURIComponent(EX[k])); });
    return p.length ? "?" + p.join("&") : "";
  }
  function csv(rows) {
    var cab = ["Código", "Meta", "Secretaría", "Eje", "Programado 2025", "Ejecutado 2025", "Avance 2025 (%)", "Programado 2026 al corte", "Ejecutado 2026 al corte", "Avance 2026 al corte (%)", "Programado posterior 2026", "Programado acumulado", "Ejecutado acumulado", "Indicador (%)", "Estado"];
    var q = function (v) { v = String(v == null ? "" : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var out = [cab.map(q).join(",")];
    rows.forEach(function (m) { out.push([m.cod, m.m, (secBy[m.car] || {}).nombre, m.eje, m.p25, m.e25, m.a25, m.p26, m.e26, m.a26, m.pp, m.pa, m.ea, m.ind, U.SEM[m.s].et].map(q).join(",")); });
    return "﻿" + out.join("\r\n");
  }
  P.metas = function (ctx) {
    var q = ctx.query;
    if (q.sec !== undefined || q.eje !== undefined || q.est !== undefined) { F.sec = secBy[q.sec] ? q.sec : ""; F.eje = ejeBy[+q.eje] ? String(+q.eje) : ""; F.est = U.SEM[q.est] ? q.est : ""; guardarF(); }
    EX = { q: q.q || "", sec: F.sec, eje: F.eje, est: F.est, vig: q.vig || "", sort: EX.sort || "cod", dir: EX.dir || 1, page: 1 };
    var html = '<p class="muted">Las ' + D.metas.length + " filas de meta (una por secretaría responsable). Busque por texto o código, filtre, ordene y exporte lo filtrado.</p>" +
      '<section class="card mt" aria-label="Filtros"><details class="fil" id="fil" open><summary>Filtrar y buscar</summary><form class="filtros" id="exf" onsubmit="return false">' +
      '<div class="fld"><label for="f-q">Buscar por texto o código</label><input id="f-q" type="search" value="' + h(EX.q) + '" placeholder="Ej.: 14, vivienda, Policía" autocomplete="off"></div>' +
      '<div class="fld"><label for="f-sec">Secretaría</label>' + selSec("f-sec", EX.sec, true) + "</div>" +
      '<div class="fld"><label for="f-eje">Eje estratégico</label><select id="f-eje"><option value="">Todos los ejes</option>' + D.ejes.map(function (e) { return '<option value="' + e.id + '"' + (String(e.id) === EX.eje ? " selected" : "") + ">" + e.id + ". " + h(e.nombre) + "</option>"; }).join("") + "</select></div>" +
      '<div class="fld"><label for="f-est">Estado</label><select id="f-est"><option value="">Todos los estados</option>' + U.SEMORD.map(function (k) { return '<option value="' + k + '"' + (k === EX.est ? " selected" : "") + ">" + U.SEM[k].et + "</option>"; }).join("") + "</select></div>" +
      '<div class="fld"><label for="f-vig">Vigencia</label><select id="f-vig">' + Object.keys(VIG).map(function (k) { return '<option value="' + k + '"' + (k === EX.vig ? " selected" : "") + ">" + VIG[k] + "</option>"; }).join("") + "</select></div>" +
      '<div class="fld ord-m"><label for="f-ord">Ordenar por</label><select id="f-ord">' + [["cod", "Código"], ["meta", "Meta"], ["sec", "Secretaría"], ["eje", "Eje"], ["a25", "Avance 2025"], ["a26", "Avance 2026 al corte"], ["ind", "Indicador"], ["est", "Estado"]].map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === EX.sort ? " selected" : "") + ">" + c[1] + "</option>"; }).join("") + "</select></div>" +
      '</form></details><div class="row mt"><button class="btn sec" type="button" id="f-limpiar">' + ICON("x") + 'Limpiar filtros</button><button class="btn" type="button" id="f-csv">' + ICON("down") + 'Exportar CSV de lo filtrado</button><span class="muted" id="f-cont" role="status" aria-live="polite"></span></div></section>' +
      '<div class="mt" id="ex-tabla"></div>';
    return {
      title: "Explorador de metas", crumbs: [["Inicio", "#/resumen"], ["Explorador de metas", null]], html: html, init: function (root) {
        var tb = root.querySelector("#ex-tabla");
        function pintar(foco) {
          var r = filtradas(), tot = r.length, pags = Math.max(1, Math.ceil(tot / PAGE));
          if (EX.page > pags) EX.page = pags;
          var ini = (EX.page - 1) * PAGE, vis = r.slice(ini, ini + PAGE);
          var cols = [["cod", "Código"], ["meta", "Meta"], ["sec", "Secretaría"], ["eje", "Eje"], ["a25", "Avance 2025"], ["a26", "Avance 2026 al corte"], ["ind", "Indicador"], ["est", "Estado"]];
          var s = '<div class="tw"><table class="rc"><caption class="sr">Metas del Plan de Desarrollo Municipal, ' + tot + " resultados</caption><thead><tr>";
          cols.forEach(function (c) { var act = EX.sort === c[0]; s += '<th scope="col" class="' + (["eje", "a25", "a26", "ind"].indexOf(c[0]) >= 0 ? "n" : "") + '" aria-sort="' + (act ? (EX.dir > 0 ? "ascending" : "descending") : "none") + '"><button class="ord" type="button" data-s="' + c[0] + '">' + c[1] + "</button></th>"; });
          s += "</tr></thead><tbody>";
          if (!vis.length) s += '<tr><td colspan="8" class="vacio">Ninguna meta coincide con los filtros. Pruebe con otro texto o limpie los filtros.</td></tr>';
          vis.forEach(function (m) {
            s += '<tr><td data-l=""><a class="cod" href="' + hrefMeta(m) + '">' + h(m.cod) + '</a></td><td class="cell-meta" data-l="">' + h(m.m) + marcasHtml(m) + '</td><td data-l="Secretaría">' + h(secCorto(m.car)) + '</td><td class="n" data-l="Eje"><a href="#/ejes/' + m.eje + '">' + m.eje + '</a></td><td class="n" data-l="Avance 2025">' + (m.p25 > 0 ? U.p(m.a25) : "—") + '</td><td class="n" data-l="Avance 2026 al corte">' + (m.p26 > 0 ? U.p(m.a26) : "—") + '</td><td class="n" data-l="Indicador">' + mbar(m) + (m.s === "no_programada" ? "—" : U.p(m.ind)) + '</td><td data-l="Estado">' + U.chip(m.s) + "</td></tr>";
          });
          s += "</tbody></table></div>";
          s += '<nav class="pag" aria-label="Paginación"><span class="muted">' + (tot ? "Mostrando " + (ini + 1) + "–" + (ini + vis.length) + " de " + tot : "Sin resultados") + '</span><span class="row"><button class="btn sec" type="button" data-p="-1"' + (EX.page <= 1 ? " disabled" : "") + '>« Anterior</button><span>Página ' + EX.page + " de " + pags + '</span><button class="btn sec" type="button" data-p="1"' + (EX.page >= pags ? " disabled" : "") + ">Siguiente »</button></span></nav>";
          tb.innerHTML = s;
          root.querySelector("#f-cont").textContent = tot + " de " + D.metas.length + " metas";
          if (foco) { var b = tb.querySelector('button[data-s="' + foco + '"]'); if (b) b.focus(); }
          try { history.replaceState(null, "", "#/metas" + qsEx()); } catch (e) { }
        }
        var fil = root.querySelector("#fil"), mqm = window.matchMedia ? matchMedia("(max-width:720px)") : null;
        function plegar() { fil.open = !(mqm && mqm.matches); }
        plegar(); if (mqm && mqm.addEventListener) mqm.addEventListener("change", plegar);
        root.querySelector("#f-ord").addEventListener("change", function () { EX.sort = this.value; EX.dir = 1; EX.page = 1; pintar(); });
        var t; function reaplicar() { EX.q = root.querySelector("#f-q").value; EX.sec = root.querySelector("#f-sec").value; EX.eje = root.querySelector("#f-eje").value; EX.est = root.querySelector("#f-est").value; EX.vig = root.querySelector("#f-vig").value; EX.page = 1; F.sec = EX.sec; F.eje = EX.eje; F.est = EX.est; guardarF(); pintar(); }
        root.querySelector("#f-q").addEventListener("input", function () { clearTimeout(t); t = setTimeout(reaplicar, 180); });
        ["#f-sec", "#f-eje", "#f-est", "#f-vig"].forEach(function (id) { root.querySelector(id).addEventListener("change", reaplicar); });
        root.querySelector("#f-limpiar").addEventListener("click", function () { ["#f-q", "#f-sec", "#f-eje", "#f-est", "#f-vig"].forEach(function (id) { root.querySelector(id).value = ""; }); reaplicar(); });
        root.querySelector("#f-csv").addEventListener("click", function () {
          var rows = filtradas(), blob = new Blob([csv(rows)], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
          a.href = URL.createObjectURL(blob); a.download = "metas_PDM_Gachancipa_corte_" + CORTE.iso + ".csv"; document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
          App.anunciar("Se exportaron " + rows.length + " metas en CSV.");
        });
        tb.addEventListener("click", function (ev) {
          var b = ev.target.closest("button"); if (!b) return;
          if (b.dataset.s) { if (EX.sort === b.dataset.s) EX.dir = -EX.dir; else { EX.sort = b.dataset.s; EX.dir = 1; } EX.page = 1; pintar(b.dataset.s); }
          else if (b.dataset.p) { EX.page += +b.dataset.p; pintar(); tb.scrollIntoView({ block: "start" }); }
        });
        pintar();
      }
    };
  };

  /* ============================ DETALLE DE META ============================ */
  P.meta = function (ctx) {
    var m = metaBy[ctx.parts[1] + "|" + decodeURIComponent(ctx.parts[2] || "")]; if (!m) return P.noEncontrada();
    var s = secBy[m.car], e = ejeBy[m.eje];
    var comp = D.compartidas.filter(function (c) { return c.codigo === m.cod; })[0];
    var otras = comp ? comp.registros.filter(function (r) { return r.carpeta !== m.car; }) : [];
    var formula = m.s === "no_programada" ? "Sin programación acumulada al corte: la meta no entra en el promedio ni penaliza el indicador." : "Indicador = ejecutado acumulado ÷ programado acumulado = " + U.n(m.ea) + " ÷ " + U.n(m.pa) + " = " + U.p(m.ind) + ".";
    var html = '<div class="card"><div class="row sb2"><span class="row">' + U.chip(m.s) + '<span class="tag">Meta ' + h(m.cod) + '</span></span><a class="btn sec" href="#/metas">' + ICON("table") + "Volver al explorador</a></div>" +
      '<h2 style="margin-top:10px;font-size:1.15rem">' + h(m.m) + "</h2>" +
      '<p class="muted">' + '<a href="#/secretarias/' + m.car + '">' + h(s.nombre) + '</a> · <a href="#/ejes/' + e.id + '">Eje ' + e.id + ". " + h(e.nombre) + "</a></p>" + marcasHtml(m) + "</div>" +
      '<section class="card mt"><h2>' + CORTE.anterior + " y " + CORTE.vigencia + " (acumulado al corte)</h2><p class='sub'>" + h(formula) + "</p>" +
      '<dl class="dl"><div><dt>Programado ' + CORTE.anterior + "</dt><dd>" + U.n(m.p25) + "</dd></div><div><dt>Ejecutado " + CORTE.anterior + "</dt><dd>" + U.n(m.e25) + "</dd></div><div><dt>Avance " + CORTE.anterior + "</dt><dd>" + (m.p25 > 0 ? U.p(m.a25) : "—") + "</dd></div>" +
      "<div><dt>Programado " + CORTE.vigencia + " al corte</dt><dd>" + U.n(m.p26) + "</dd></div><div><dt>Ejecutado " + CORTE.vigencia + " al corte</dt><dd>" + U.n(m.e26) + "</dd></div><div><dt>Avance " + CORTE.vigencia + " al corte</dt><dd>" + (m.p26 > 0 ? U.p(m.a26) : "—") + "</dd></div>" +
      "<div><dt>Programado acumulado</dt><dd>" + U.n(m.pa) + "</dd></div><div><dt>Ejecutado acumulado</dt><dd>" + U.n(m.ea) + "</dd></div><div><dt>Indicador de avance</dt><dd>" + (m.s === "no_programada" ? "—" : U.p(m.ind)) + "</dd></div>" +
      "<div><dt>Programado posterior al corte (" + CORTE.vigencia + ")</dt><dd>" + U.n(m.pp) + "</dd></div></dl>" +
      '<p class="mini mt">Fuente: reporte de la ' + h(s.nombre) + ", corte " + h(CORTE.texto) + " y Plan Indicativo.</p></section>";
    if (m.mk.indexOf("verificacion") >= 0) html += '<p class="nota mt"><b>Dato en verificación.</b> La escala de programación entre vigencias de esta meta se verifica con la secretaría antes de interpretar su indicador.</p>';
    if (m.mk.indexOf("arrastre") >= 0) html += '<p class="nota mt"><b>Lectura de la meta.</b> ' + h(notaArrastre(m)) + "</p>";
    if (otras.length) html += '<section class="card mt"><h2>Meta compartida</h2><p class="sub">Esta meta también figura en otras secretarías; cada una reporta su propio avance.</p><div class="tw"><table><caption class="sr">Valores de la meta compartida por secretaría</caption><thead><tr><th scope="col">Secretaría</th><th scope="col">Estado</th><th scope="col" class="n">Indicador</th></tr></thead><tbody>' +
      comp.registros.map(function (r) { return "<tr><th scope='row'>" + (r.carpeta === m.car ? "<b>" + h(secCorto(r.carpeta)) + " (esta)</b>" : '<a href="#/meta/' + r.carpeta + "/" + encodeURIComponent(m.cod) + '">' + h(secCorto(r.carpeta)) + "</a>") + "</th><td>" + U.chip(r.semaforo) + '</td><td class="n">' + U.p(r.indicador) + "</td></tr>"; }).join("") + "</tbody></table></div></section>";
    return { title: "Meta " + m.cod, crumbs: [["Inicio", "#/resumen"], ["Explorador de metas", "#/metas"], ["Meta " + m.cod, null]], html: html };
  };

  /* mosaico de puntos: un cuadrado por meta cumplida, agrupado y coloreado por eje; el código de la meta va escrito dentro */
  function waffle(rows) {
    var vistos = {}, uni = rows.filter(function (m) { if (vistos[m.cod]) return false; vistos[m.cod] = 1; return true; }).sort(function (a, b) { return natural(a.cod, b.cod); });
    if (!uni.length) return "";
    var filas = D.ejes.map(function (e) {
      var ms = uni.filter(function (m) { return m.eje === e.id; }); if (!ms.length) return "";
      var c = (e.id - 1) % 5 + 1;
      return '<div class="wf-row"><div class="wf-h"><span class="eje-n c' + c + '">' + e.id + "</span><b>" + h(ejeCorto(e)) + '</b><span class="mini">' + ms.length + (ms.length === 1 ? " meta" : " metas") + '</span></div><div class="wf">' + ms.map(function (m) {
        var tx = "Meta " + m.cod + " · " + secCorto(m.car) + " · eje " + e.id + " · cumplida";
        return '<a class="wf-q c' + c + '" href="' + hrefMeta(m) + '" data-tip="' + h(tx) + '" aria-label="' + h(tx) + '">' + h(m.cod) + "</a>";
      }).join("") + "</div></div>";
    }).join("");
    return '<section class="card mt2 ac ac-cum"><h2>Cada cuadrado es una meta cumplida</h2><p class="sub">Todas están cumplidas (verde). Se agrupan por eje estratégico: la insignia y la franja inferior de cada cuadrado indican el eje, y el cuadrado lleva el código de la meta y abre su detalle. Las metas compartidas se cuentan una vez.</p>' + filas + "</section>";
  }

  /* ============================ LOGROS ============================ */
  P.logros = function () {
    var ok = {}; filtradasG().forEach(function (m) { ok[m.id] = 1; });
    var C = D.cert, cert = C.certificables.map(function (i) { return metaBy[i]; }).filter(function (m) { return ok[m.id]; }), pend = C.pendientes.map(function (i) { return metaBy[i]; }).filter(function (m) { return ok[m.id]; });
    var ord = function (a) { return a.slice().sort(function (x, y) { return natural(x.cod, y.cod) || x.car.localeCompare(y.car); }); };
    var uni = {}; pend.forEach(function (m) { uni[m.cod] = 1; });
    var html = '<p class="muted">Metas con ejecución igual o superior a lo programado al corte (indicador de 100 % o más).</p>' +
      '<div class="grid g3 mt">' + kpi(cert.length + pend.length, "Metas cumplidas al corte", "registros de meta al " + h(CORTE.texto), "k-cum", 100, true) + kpi(cert.length, "Certificables", "sin programación posterior en " + CORTE.vigencia, "k-cum", cert.length + pend.length ? 100 * cert.length / (cert.length + pend.length) : 0, true) + kpi(Object.keys(uni).length, "Al 100 % con programación posterior", pend.length + " registros; se certifican al cierre de la vigencia", "k-ava", cert.length + pend.length ? 100 * pend.length / (cert.length + pend.length) : 0, true) + "</div>" + waffle(cert.concat(pend)) +
      '<p class="nota verde mt"><b>Certificables.</b> Cumplieron lo programado y no tienen programación en ' + h(CORTE.posteriores) + '; nada queda por ejecutar frente a lo programado en 2025-2026. <b>Con programación posterior.</b> Van al 100 % al corte y se certifican cuando concluya el período que aún está programado. Las metas compartidas se cuentan una vez por meta en el inventario de certificación. Los filtros del encabezado aplican a estas listas.</p>' +
      '<section class="mt2"><h2>Certificables (' + cert.length + ')</h2>' + tablaMetas(ord(cert), ["cod", "meta", "sec", "eje", "ind"], "Metas certificables") + '</section>' +
      '<section class="mt2"><h2>Al 100 % con programación posterior (' + pend.length + ' registros)</h2>' + tablaMetas(ord(pend), ["cod", "meta", "sec", "eje", "ind", "pp"], "Metas al 100 por ciento con programación posterior") + '</section>';
    return { title: "Logros y metas cumplidas", crumbs: [["Inicio", "#/resumen"], ["Logros y metas cumplidas", null]], html: html, filtros: true };
  };

  /* ============================ ALERTAS ============================ */
  P.alertas = function () {
    var M = filtradasG(), rez = M.filter(function (m) { return m.s === "rezagada"; }).sort(function (a, b) { return a.ind - b.ind; });
    var np = M.filter(function (m) { return m.s === "no_programada"; }).sort(function (a, b) { return natural(a.cod, b.cod); });
    var html = '<p class="muted">Metas que conviene acompañar con las secretarías y aclaraciones de cronograma. Esta página orienta la gestión; no califica a ninguna dependencia.</p>' +
      '<div class="grid g3 mt">' + kpi(rez.length, "Metas rezagadas", "programadas al corte con avance menor al 20 %", "k-rez", M.length ? 100 * rez.length / M.length : 0, true) + kpi(cuenta(M).en_avance, "Metas en avance", "entre 20 % y 99 %", "k-ava", M.length ? 100 * cuenta(M).en_avance / M.length : 0, true) + kpi(np.length, "No programadas al corte", "sin programación al corte; no penalizan", "k-np", M.length ? 100 * np.length / M.length : 0, true) + "</div>" +
      (rez.length ? '<section class="card mt2 ac ac-r"><h2>Rezagadas: qué tan lejos están de la meta</h2><p class="sub">De menor a mayor indicador; la línea punteada marca la meta del 100 %. Haga clic en una barra para ver la meta.</p><div style="max-height:460px;overflow:auto;padding-right:6px">' + Charts.hbar({ aria: "Indicador de las metas rezagadas frente a la meta del 100 por ciento", items: rez.map(function (m) { return { label: "Meta " + m.cod + " · " + m.m, value: m.ind, href: hrefMeta(m), k: "rez", et: U.SEM.rezagada.et }; }) }) + "</div></section>" : "") +
      '<section class="mt2"><h2>Metas rezagadas (' + rez.length + ')</h2><p class="muted">Con programación al corte y avance inferior al 20 %. Se recomienda revisar con cada secretaría los soportes de ejecución y la programación vigente.</p>' + tablaMetas(rez, ["cod", "meta", "sec", "eje", "pa", "ea", "ind"], "Metas rezagadas") + "</section>" +
      '<section class="mt2"><h2>Metas en avance con menor indicador</h2><div class="row"><div class="fld"><label for="al-um">Mostrar metas en avance con indicador menor a</label><select id="al-um"><option value="40">40 %</option><option value="50" selected>50 %</option><option value="60">60 %</option><option value="80">80 %</option></select></div><span class="muted" id="al-n" role="status" aria-live="polite"></span></div><div id="t-bajo" class="mt"></div></section>' +
      '<section class="mt2"><h2>No programadas al corte (' + np.length + ')</h2><p class="nota">Metas sin programación acumulada al corte (ni en ' + CORTE.anterior + ' ni en ' + CORTE.vigencia + ' hasta el ' + h(CORTE.trimestre) + ') y sin programación en ' + h(CORTE.posteriores) + ". No entran en el promedio ni penalizan, y no indican incumplimiento. Su programación, si la hay, corresponde a otras vigencias.</p><div class='mt'>" + tablaMetas(np, ["cod", "meta", "sec", "eje", "pp"], "Metas no programadas al corte") + "</div></section>";
    return {
      title: "Alertas", crumbs: [["Inicio", "#/resumen"], ["Alertas", null]], html: html, filtros: true, init: function (root) {
        function pintar() {
          var u = +root.querySelector("#al-um").value;
          var r = M.filter(function (m) { return m.s === "en_avance" && m.ind < u; }).sort(function (a, b) { return a.ind - b.ind; });
          root.querySelector("#al-n").textContent = r.length + " metas";
          root.querySelector("#t-bajo").innerHTML = tablaMetas(r, ["cod", "meta", "sec", "eje", "pa", "ea", "ind"], "Metas en avance con indicador menor a " + u + " por ciento");
        }
        root.querySelector("#al-um").addEventListener("change", pintar); pintar();
      }
    };
  };

  /* ============================ COMPARTIDAS Y CALIDAD ============================ */
  /* texto de arrastre según el tipo oficial y la programación posterior real de la meta */
  function notaArrastre(m) {
    if (m.at === "ejecucion_sin_programacion") return "Se registra ejecución en " + CORTE.vigencia + " sin programación al corte; se verifica con la secretaría.";
    if (m.at === "rezago_heredado" && !(m.pp > 0)) return "El resultado corresponde a lo registrado en " + CORTE.anterior + "; no hay programación " + CORTE.vigencia + " hasta el corte ni en " + CORTE.posteriores + ".";
    if (m.pp > 0) return "Sin programación " + CORTE.vigencia + " al corte; su programación está en " + CORTE.posteriores + ".";
    return "Sin programación " + CORTE.vigencia + " al corte ni en " + CORTE.posteriores + "; el resultado corresponde a lo registrado en " + CORTE.anterior + ".";
  }
  var TIPO = { cumplida_por_2025: "Cumplida con lo registrado en 2025", rezago_heredado: "Avance de 2025 que se mantiene", ejecucion_sin_programacion: "Ejecución registrada sin programación al corte" };
  P.compartidas = function () {
    var Q = D.calidad;
    var nom = function (cod) { var m = D.metas.filter(function (x) { return x.cod === cod; })[0]; return m ? m.m : ""; };
    var comp = D.compartidas.map(function (c) {
      return '<details class="card" style="padding:12px 16px"><summary style="cursor:pointer;min-height:44px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><b>Meta ' + h(c.codigo) + "</b><span class='muted' style='flex:1;min-width:200px'>" + h(nom(c.codigo)) + "</span>" +
        (c.difiere ? '<span class="tag">Valores distintos por secretaría</span>' : '<span class="tag">Valores iguales</span>') + "</summary>" +
        '<div class="tw mt"><table><caption class="sr">Valores de la meta ' + h(c.codigo) + " por secretaría</caption><thead><tr><th scope='col'>Secretaría</th><th scope='col'>Estado</th><th scope='col' class='n'>Indicador</th><th scope='col' class='n'>Avance 2025</th><th scope='col' class='n'>Avance 2026</th><th scope='col' class='n'>Prog. 2026 al corte</th><th scope='col' class='n'>Ejec. 2026 al corte</th></tr></thead><tbody>" +
        c.registros.map(function (r) { return "<tr><th scope='row'><a href='#/meta/" + r.carpeta + "/" + encodeURIComponent(c.codigo) + "'>" + h(secCorto(r.carpeta)) + "</a></th><td>" + U.chip(r.semaforo) + "</td><td class='n'>" + U.p(r.indicador) + "</td><td class='n'>" + U.p(r.avance_2025) + "</td><td class='n'>" + U.p(r.avance_2026) + "</td><td class='n'>" + U.n(r.prog_2026_corte) + "</td><td class='n'>" + U.n(r.ejec_2026_corte) + "</td></tr>"; }).join("") +
        "</tbody></table></div>" + (c.difiere ? '<p class="mini mt">Cada secretaría reporta el avance de su propia parte; la diferencia entre valores se verifica con las secretarías para confirmar si corresponde a aportes distintos.</p>' : "") + "</details>";
    }).join("");
    var ver = Q.verificacion.map(function (v) {
      var m = metaBy[v.carpeta + "|" + v.codigo];
      return '<p class="nota"><b>Meta <a href="' + (m ? hrefMeta(m) : "#/metas") + '">' + h(v.codigo) + "</a> (" + h(secCorto(v.carpeta)) + ").</b> " + h(m ? m.m : "") + " Los valores programados de 2025 y de 2026 al corte vienen en escalas distintas (programado 2025: " + U.n(v.prog_2025) + "; programado 2026 al corte: " + U.n(v.prog_2026_corte) + "). Se verifica con la secretaría la escala de programación antes de interpretar el indicador.</p>";
    }).join("");
    var arr = Q.arrastre.map(function (a) { var m = metaBy[a.carpeta + "|" + a.codigo]; return m ? Object.assign({}, m, { _t: TIPO[a.tipo] || a.tipo }) : null; }).filter(Boolean);
    var html = '<p class="muted">Aclaraciones sobre cómo se leen algunas metas. Son observaciones de calidad del dato que se resuelven con las secretarías; no restan mérito a la gestión.</p>' +
      '<div class="grid g3 mt">' + kpi(Q.registros, "Registros de meta", "una fila por secretaría responsable") + kpi(Q.unicas, "Metas únicas", "por código de meta") + kpi(D.compartidas.length, "Metas compartidas", "figuran en más de una secretaría") + "</div>" +
      '<section class="mt2"><h2>Metas compartidas</h2><p class="muted">Cuando una meta es responsabilidad de más de una secretaría aparece una vez por cada una; por eso los registros (' + Q.registros + ") son más que las metas únicas (" + Q.unicas + "). Despliegue cada meta para ver los valores por secretaría.</p><div class='grid' style='gap:10px'>" + comp + "</div></section>" +
      '<section class="mt2"><h2>Meta en verificación</h2>' + ver + "</section>" +
      '<section class="mt2"><h2>Arrastre de 2025 (' + arr.length + ')</h2><p class="muted">Metas sin programación ' + CORTE.vigencia + ' al corte. Algunas se cumplieron con lo registrado en ' + CORTE.anterior + ' y su programación restante está en ' + h(CORTE.posteriores) + '; otras no tienen programación posterior y su resultado corresponde a lo registrado en ' + CORTE.anterior + ', o registran ejecución sin programación. La columna «Lectura» indica cada caso; se listan para que su lectura sea transparente.</p>' +
      '<div class="tw"><table><caption class="sr">Metas con arrastre de 2025</caption><thead><tr><th scope="col">Código</th><th scope="col">Meta</th><th scope="col">Secretaría</th><th scope="col">Lectura</th><th scope="col" class="n">Indicador</th><th scope="col">Estado</th></tr></thead><tbody>' +
      arr.map(function (m) { return '<tr><td><a class="cod" href="' + hrefMeta(m) + '">' + h(m.cod) + '</a></td><td class="cell-meta">' + h(m.m) + "</td><td>" + h(secCorto(m.car)) + "</td><td>" + h(m._t) + '</td><td class="n">' + U.p(m.ind) + "</td><td>" + U.chip(m.s) + "</td></tr>"; }).join("") + "</tbody></table></div></section>" +
      '<section class="mt2"><h2>Otras observaciones de dato</h2><ul>' +
      "<li><b>Ejecución superior a lo programado (" + Q.sobreejecucion.length + "):</b> " + Q.sobreejecucion.map(function (s) { return '<a href="#/meta/' + s.carpeta + "/" + encodeURIComponent(s.codigo) + '">meta ' + h(s.codigo) + "</a> (" + h(secCorto(s.carpeta)) + ")"; }).join(", ") + ". Se verifica con la secretaría que el ejecutado corresponda al período.</li>" +
      "<li><b>Valores fraccionarios en el Plan Indicativo (" + Q.fraccionarios.length + "):</b> metas " + Q.fraccionarios.map(function (f) { return h(f.codigo); }).join(" y ") + ". Se confirma la escala de registro con la secretaría.</li>" +
      "<li><b>Metas sin programación en 2025:</b> " + Q.prog_2025_cero + " metas no tienen programación en la vigencia " + CORTE.anterior + "; su avance de ese año no se calcula.</li>" +
      (Q.omitidas.length ? "<li><b>Registros sin código (" + Q.omitidas.length + "):</b> una fila de " + h(secCorto(Q.omitidas[0].carpeta)) + " no trae código de meta y no se incluye en el conteo; se aclara con la secretaría.</li>" : "") + "</ul></section>";
    return { title: "Metas compartidas y calidad de dato", crumbs: [["Inicio", "#/resumen"], ["Metas compartidas y calidad de dato", null]], html: html };
  };

  /* ============================ INFORMES ============================ */
  var ANIO = null;
  P.informes = function () {
    var M = D.informes;
    if (!M) return { title: "Informes", crumbs: [["Inicio", "#/resumen"], ["Informes", null]], html: '<p class="nota">El catálogo de informes (informes/manifest.json) no está disponible en este momento. Los archivos permanecen en la carpeta informes/.</p>' };
    var gens = M.general || [], anios = gens.map(function (g) { return g.anio; });
    if (ANIO == null || anios.indexOf(ANIO) < 0) ANIO = anios.indexOf(CORTE.vigencia) >= 0 ? CORTE.vigencia : anios[0];
    var html = '<p class="muted">Descargue los informes en Word o PDF. Corte ' + h(CORTE.texto) + ".</p>" +
      '<section class="card mt"><div class="row sb2"><h2>Informes generales</h2><div class="seg" role="group" aria-label="Año del informe general">' + anios.map(function (a) { return '<button type="button" data-a="' + a + '" aria-pressed="' + (a === ANIO ? "true" : "false") + '">' + a + "</button>"; }).join("") + '</div></div><div id="inf-gen" class="mt"></div></section>' +
      '<section class="card mt"><h2>Informes por secretaría</h2><p class="sub">Informe de seguimiento de cada secretaría, vigencia ' + CORTE.vigencia + ".</p>" +
      D.secretarias.map(function (s) { var a = s.informe || {}; return '<div class="dl-item"><div class="tt"><b>' + h(s.nombre) + '</b><span class="mini">Indicador ' + U.p(s.ind) + " · " + s.metas + ' metas · <a href="#/secretarias/' + s.carpeta + '">ver ficha</a></span></div><div class="row">' + btnInf(a.docx, "docx", "Word") + btnInf(a.pdf, "pdf", "PDF") + "</div></div>"; }).join("") + "</section>";
    return {
      title: "Informes", crumbs: [["Inicio", "#/resumen"], ["Informes", null]], html: html, init: function (root) {
        function pintar() {
          var g = gens.filter(function (x) { return x.anio === ANIO; })[0], box = root.querySelector("#inf-gen"), s = "";
          root.querySelectorAll(".seg button").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.a === ANIO)); });
          if (g && g.estado === "disponible" && g.informes.length) s = g.informes.map(function (i) { return '<div class="dl-item"><div class="tt"><b>' + h(i.titulo) + '</b><span class="mini">' + h(i.descripcion || "") + '</span></div><div class="row">' + btnInf(i.archivos.docx, "docx", "Word") + btnInf(i.archivos.pdf, "pdf", "PDF") + "</div></div>"; }).join("");
          else s = '<div class="dl-item"><div class="tt"><b>Informe general ' + ANIO + '</b><span class="mini">' + h((g && g.nota) || "Aún no disponible.") + '</span></div><div class="row"><span class="btn min" aria-disabled="true" role="link">Word · pendiente</span><span class="btn min" aria-disabled="true" role="link">PDF · pendiente</span></div></div>';
          box.innerHTML = s;
        }
        root.querySelector(".seg").addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (!b) return; ANIO = +b.dataset.a; pintar(); });
        pintar();
      }
    };
  };

  /* ============================ METODOLOGÍA ============================ */
  P.metodologia = function () {
    var ej = metaBy["secretaria-educacion|14"] || D.metas[0];
    var gl = [["Meta", "Compromiso del Plan con una cantidad a lograr en una vigencia."], ["Programado", "Cantidad prevista para el período en el plan indicativo."], ["Ejecutado", "Cantidad reportada por la secretaría como lograda."], ["Indicador de avance", "Ejecutado acumulado dividido por programado acumulado al corte, en porcentaje."], ["Corte", "Fecha hasta la cual se acumula la información (" + CORTE.texto + ")."], ["Vigencia", "Año de ejecución del Plan; el portal compara " + CORTE.anterior + " (cerrada) y " + CORTE.vigencia + " (al corte)."], ["Meta compartida", "Meta que figura en más de una secretaría; cada una reporta su parte."], ["Meta no programada al corte", "Meta sin programación acumulada hasta el corte; no entra en el promedio."], ["Eje estratégico", "Agrupación temática de las metas del Plan (" + D.ejes.length + " ejes)."]];
    var html = '<div class="grid g2">' +
      '<section class="card"><h2>¿Qué mide el indicador?</h2><p>Compara lo ejecutado con lo programado, acumulado hasta el corte, siguiendo la metodología del Departamento Nacional de Planeación (DNP). Para cada meta:</p><p class="nota"><b>Indicador = ejecutado acumulado ÷ programado acumulado × 100</b>, sumando la vigencia ' + CORTE.anterior + " completa y la vigencia " + CORTE.vigencia + " hasta el corte.</p>" +
      '<p>Ejemplo con la meta ' + h(ej.cod) + " (" + h(secCorto(ej.car)) + "): " + U.n(ej.ea) + " ÷ " + U.n(ej.pa) + " = " + U.p(ej.ind) + ".</p><p>El indicador de una secretaría o de un eje es la media de los indicadores de sus metas programadas al corte.</p><p class=\"nota\"><b>Indicador institucional (" + U.p(D.inst.ind) + ").</b> Es la media simple de los indicadores de las " + D.inst.n_sec + " secretarías: cada secretaría pesa igual, sin importar su número de metas. Por eso un eje, que promedia metas, puede mostrar un valor superior al institucional: las secretarías con pocas metas programadas, como Desarrollo Institucional y Hacienda, pesan lo mismo que las demás en el resultado institucional.</p></section>" +
      '<section class="card"><h2>Semáforo oficial</h2><div class="tw"><table><caption class="sr">Reglas del semáforo</caption><thead><tr><th scope="col">Estado</th><th scope="col">Regla</th></tr></thead><tbody>' + U.SEMORD.map(function (k) { return "<tr><td>" + U.chip(k) + "</td><td>" + U.SEM[k].regla + "</td></tr>"; }).join("") + '</tbody></table></div><p class="mini mt">El umbral rojo (menos del 20 %) aplica solo a metas con programación al corte. Una meta no programada no penaliza.</p></section></div>' +
      '<section class="card mt"><h2>Vigencias y corte</h2><ul><li><b>' + CORTE.anterior + ":</b> avance anual cerrado, tomado del " + h(D.fuentes.anterior) + ", enlazado por código de meta.</li><li><b>" + CORTE.vigencia + ":</b> avance acumulado desde enero hasta el corte (" + h(CORTE.texto) + ", " + h(CORTE.trimestre) + "), de los reportes de cada secretaría. No incluye lo programado para " + h(CORTE.posteriores) + ".</li><li>El corte se actualiza cada mes y el portal se regenera con las cifras oficiales.</li></ul></section>" +
      '<section class="card mt"><h2>Metas compartidas</h2><p>Algunas metas son responsabilidad de más de una secretaría. Cada una reporta su parte, por lo que la meta aparece una vez por secretaría (' + D.calidad.registros + " registros para " + D.calidad.unicas + ' metas únicas). Las diferencias de valores se verifican con las secretarías. Ver <a href="#/compartidas">Metas compartidas y calidad de dato</a>.</p></section>' +
      '<section class="card mt"><h2>Glosario</h2><dl class="glos">' + gl.map(function (g) { return "<dt>" + h(g[0]) + "</dt><dd>" + h(g[1]) + "</dd>"; }).join("") + "</dl></section>" +
      '<section class="card mt"><h2>Fuentes de las cifras</h2><p>Las cifras provienen de los reportes de cada secretaría con corte ' + h(CORTE.texto) + " y del Plan Indicativo; este portal no recalcula nada.</p>" +
      '<details class="dtab"><summary>Verificación técnica (huellas de los datos)</summary><p class="mini">Las huellas permiten comprobar que las cifras publicadas corresponden a las entradas oficiales del corte.</p>' +
      tw('<table><caption class="sr">Huellas de las cifras oficiales</caption><thead><tr><th scope="col">Conjunto de cifras</th><th scope="col">Huella</th></tr></thead><tbody>' +
      Object.keys(D.huellas).map(function (k) { return "<tr><th scope='row'>" + h(k) + "</th><td><code>" + h(D.huellas[k]) + "</code></td></tr>"; }).join("") + "</tbody></table>", "Huellas de las cifras oficiales", true) + "</details>" +
      '<p class="mini mt">Corte ' + h(CORTE.texto) + " · portal generado el " + h(CORTE.generado) + ".</p>" + (D.tablero ? '<p><a href="tablero.html">Tablero de control de una sola página</a></p>' : "") + "</section>" +
      '<section class="card mt"><h2>Créditos</h2><p>Elaborado por el profesional Javier Galindo Bernal — Administrador Público, Especialista en Big Data y Analítica de Datos. Secretaría de Planeación y Servicios Públicos de Gachancipá, Cundinamarca · 2026.</p><p class="mini">Identidad visual basada en el sistema GOV.CO. <a href="https://gachancipa-cundinamarca.gov.co/" target="_blank" rel="noopener noreferrer">Sede electrónica de la Alcaldía de Gachancipá<span class="sr"> (se abre en otra pestaña)</span></a>.</p></section>';
    return { title: "Metodología y fuentes", crumbs: [["Inicio", "#/resumen"], ["Metodología y fuentes", null]], html: html };
  };

  /* ============================ Ayuda y preguntas frecuentes ============================ */
  P.ayuda = function () {
    var N = window.Nemequi, a = N && N.ayuda ? N.ayuda() : null;
    var html = a ? a.html : '<section class="card vacio"><h2>La ayuda no está disponible en este momento</h2><p>El asistente NEMEQUI no pudo cargarse. El tablero sigue funcionando con normalidad; la metodología está en <a href="#/metodologia">Metodología y fuentes</a>.</p></section>';
    return { title: "Cómo usar el tablero", crumbs: [["Inicio", "#/resumen"], ["Ayuda y preguntas frecuentes", null]], html: html, init: a ? a.init : null };
  };

  /* ============================ 404 ============================ */
  P.noEncontrada = function () {
    return { title: "Página no encontrada", crumbs: [["Inicio", "#/resumen"], ["No encontrada", null]], html: '<div class="card vacio"><h2>No encontramos esa página</h2><p>La dirección no corresponde a una página del portal o a una meta registrada.</p><p><a class="btn" href="#/resumen">Ir al resumen ejecutivo</a></p></div>' };
  };
})();
