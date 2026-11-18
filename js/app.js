/* Enrutador por hash (#/pagina), menú lateral, tema día/noche, búsqueda global y accesibilidad. */
(function () {
  "use strict";
  var D = window.PDM, h = U.esc;
  var doc = document, root = doc.documentElement;
  var $ = function (s) { return doc.querySelector(s); };
  var main = $("#main"), titulo = $("#pageTitle"), crumbs = $("#crumbs");
  var RUTAS = { resumen: "resumen", ejes: "ejes", secretarias: "secretarias", metas: "metas", meta: "metas", logros: "logros", alertas: "alertas", compartidas: "compartidas", informes: "informes", metodologia: "metodologia", ayuda: "ayuda" };
  var App = window.App = {};
  var primera = true;

  function safe(fn) { try { return fn(); } catch (e) { return null; } }
  function guardar(k, v) { safe(function () { localStorage.setItem(k, v); }); }

  App.anunciar = function (t) { var l = $("#live"); l.textContent = ""; setTimeout(function () { l.textContent = t; }, 40); };

  /* ---------- tema ---------- */
  function aplicarTema(t, persistir) {
    root.setAttribute("data-theme", t);
    if (persistir) guardar("pdm_tema", t);
    var b = $("#themeBtn");
    b.setAttribute("aria-label", t === "dark" ? "Cambiar a modo día" : "Cambiar a modo noche");
    b.setAttribute("aria-pressed", String(t === "dark"));
    $("#themeIc use").setAttribute("href", t === "dark" ? "#i-sun" : "#i-moon");
  }
  $("#themeBtn").addEventListener("click", function () {
    var t = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    aplicarTema(t, true); App.anunciar(t === "dark" ? "Modo noche activado" : "Modo día activado");
  });
  aplicarTema(root.getAttribute("data-theme") || "light", false);
  if (window.matchMedia) {
    var mq = matchMedia("(prefers-color-scheme: dark)");
    var cambio = function (e) { var g = safe(function () { return localStorage.getItem("pdm_tema"); }); if (g !== "dark" && g !== "light") aplicarTema(e.matches ? "dark" : "light", false); };
    if (mq.addEventListener) mq.addEventListener("change", cambio);
  }

  /* ---------- menú ---------- */
  var sb = $("#sb"), back = $("#sbBack"), burger = $("#burger"), col = $("#colBtn");
  function esMovil() { return window.innerWidth < 1024; }
  var FUERA = [".govbar", ".top", "#main", ".foot"];
  function fuera(inerte) { FUERA.forEach(function (q) { var e = $(q); if (e) { if (inerte) e.setAttribute("inert", ""); else e.removeAttribute("inert"); } }); }
  function abrirMenu(a, foco) {
    doc.body.classList.toggle("menu-open", a);
    back.hidden = !a; burger.setAttribute("aria-expanded", String(a));
    if (esMovil()) {
      if (a) {
        sb.removeAttribute("inert"); sb.setAttribute("role", "dialog"); sb.setAttribute("aria-modal", "true"); fuera(true);
        var c = sb.querySelector('a[aria-current="page"]') || sb.querySelector("a"); c && c.focus();
      } else {
        fuera(false); sb.setAttribute("inert", ""); sb.removeAttribute("role"); sb.removeAttribute("aria-modal");
        if (foco) burger.focus();
      }
    } else { fuera(false); sb.removeAttribute("role"); sb.removeAttribute("aria-modal"); }
  }
  function sincronizarMenu() { if (esMovil()) { if (!doc.body.classList.contains("menu-open")) sb.setAttribute("inert", ""); } else { sb.removeAttribute("inert"); doc.body.classList.remove("menu-open"); back.hidden = true; burger.setAttribute("aria-expanded", "false"); fuera(false); sb.removeAttribute("role"); sb.removeAttribute("aria-modal"); } }
  burger.addEventListener("click", function () { abrirMenu(!doc.body.classList.contains("menu-open"), true); });
  back.addEventListener("click", function () { abrirMenu(false, true); });
  $("#sbClose").addEventListener("click", function () { abrirMenu(false, true); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) abrirMenu(false, true); });
  col.addEventListener("click", function () {
    var min = root.getAttribute("data-menu") === "min";
    if (min) root.removeAttribute("data-menu"); else root.setAttribute("data-menu", "min");
    guardar("pdm_menu", min ? "max" : "min");
    col.setAttribute("aria-pressed", String(!min)); col.setAttribute("aria-label", min ? "Contraer el menú" : "Expandir el menú");
    col.querySelector("span").textContent = min ? "Contraer menú" : "Expandir menú";
    setTimeout(function () { Charts.mount(); }, 260);
  });
  (function () { var min = root.getAttribute("data-menu") === "min"; col.setAttribute("aria-pressed", String(min)); if (min) { col.setAttribute("aria-label", "Expandir el menú"); col.querySelector("span").textContent = "Expandir menú"; } })();
  window.addEventListener("resize", sincronizarMenu); sincronizarMenu();
  $("#sbCorte").innerHTML = "<b>Corte " + h(D.corte.texto) + "</b>Datos oficiales · generado " + h(D.corte.generado);
  // etiquetas emergentes cuando el menú está contraído
  doc.querySelectorAll(".nav a").forEach(function (a) { a.setAttribute("title", a.textContent.trim()); });

  /* ---------- búsqueda global ---------- */
  $("#gsearch").addEventListener("submit", function (e) {
    e.preventDefault(); var q = $("#gq").value.trim();
    location.hash = "#/metas" + (q ? "?q=" + encodeURIComponent(q) : "");
  });

  /* ---------- enlace de salto: no toca el hash ---------- */
  $(".skip").addEventListener("click", function (e) { e.preventDefault(); main.focus(); main.scrollIntoView(); });

  /* ---------- impresión ---------- */
  $("#printBtn").addEventListener("click", function () { window.print(); });
  /* el papel es blanco: al imprimir se fuerza la paleta de día y después se restaura el tema elegido (los gráficos usan variables CSS, no hace falta redibujar) */
  var temaPrevio = null;
  function aPapel() { if (temaPrevio === null) { temaPrevio = root.getAttribute("data-theme") || "light"; root.setAttribute("data-theme", "light"); } }
  function dePapel() { if (temaPrevio !== null) { root.setAttribute("data-theme", temaPrevio); temaPrevio = null; } }
  window.addEventListener("beforeprint", aPapel);
  window.addEventListener("afterprint", dePapel);
  if (window.matchMedia) { var mp = matchMedia("print"), cp = function (e) { if (e.matches) aPapel(); else dePapel(); }; if (mp.addEventListener) mp.addEventListener("change", cp); else if (mp.addListener) mp.addListener(cp); }

  /* ---------- enrutador ---------- */
  function dec(t) { try { return decodeURIComponent(t); } catch (e) { return t; } }
  function parsear() {
    var raw = (location.hash || "").replace(/^#\/?/, ""), qs = {}, i = raw.indexOf("?");
    if (i >= 0) { raw.slice(i + 1).split("&").forEach(function (p) { if (!p) return; var kv = p.split("="); qs[dec(kv[0])] = dec((kv[1] || "").replace(/\+/g, " ")); }); raw = raw.slice(0, i); }
    var parts = raw.split("/").filter(Boolean);
    return { parts: parts, query: qs, ruta: parts[0] || "" };
  }
  function pintarMigas(c) {
    crumbs.innerHTML = "<ol>" + c.map(function (x, i) { return "<li" + (i === c.length - 1 ? ' aria-current="page"' : "") + ">" + (x[1] ? '<a href="' + h(x[1]) + '">' + h(x[0]) + "</a>" : h(x[0])) + "</li>"; }).join("") + "</ol>";
  }
  function marcarMenu(ruta) {
    doc.querySelectorAll(".nav a").forEach(function (a) {
      if (a.dataset.r === ruta) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  /* contenedores con desplazamiento horizontal: foco por teclado, nombre accesible y aviso en móvil */
  function accesibles(raiz) {
    raiz.querySelectorAll(".tw").forEach(function (w) {
      var t = w.querySelector("table"); if (!t) return;
      if (!w.hasAttribute("tabindex")) w.setAttribute("tabindex", "0");
      if (!w.hasAttribute("role")) w.setAttribute("role", "region");
      if (!w.hasAttribute("aria-label")) { var c = t.querySelector("caption"); w.setAttribute("aria-label", c ? c.textContent.trim() : "Tabla"); }
      var p = w.previousElementSibling;
      if (!t.classList.contains("rc") && !(p && p.classList.contains("swipe"))) {
        var n = doc.createElement("p"); n.className = "mini swipe"; n.setAttribute("aria-hidden", "true"); n.textContent = "Deslice hacia los lados para ver más columnas →"; w.parentNode.insertBefore(n, w);
      }
    });
  }
  var SKEL = '<div class="skel" aria-hidden="true"><div class="sk sk-ban"></div><div class="sk-row"><div class="sk sk-k"></div><div class="sk sk-k"></div><div class="sk sk-k"></div></div><div class="sk-row two"><div class="sk sk-c"></div><div class="sk sk-c"></div></div></div>';
  var tk = 0, prev = null;
  function reducido() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function render(opts) {
    opts = opts && opts.keep ? opts : {};
    var ctx = parsear();
    if (!ctx.ruta) { location.replace("#/resumen"); return; }
    var clave = RUTAS[ctx.ruta], pg, mi = ++tk;
    Charts.reset();
    try {
      pg = clave ? window.Paginas[ctx.ruta](ctx) : window.Paginas.noEncontrada();
      if (!pg) pg = window.Paginas.noEncontrada();
    } catch (err) {
      if (window.console) console.error(err);
      pg = { title: "Error al mostrar la página", crumbs: [["Inicio", "#/resumen"]], html: '<div class="card vacio"><h2>No se pudo mostrar esta página</h2><p><a class="btn" href="#/resumen">Volver al resumen</a></p></div>' };
    }
    titulo.textContent = pg.title;
    pintarMigas(pg.crumbs);
    doc.title = pg.title + " · Seguimiento al PDM · Alcaldía de Gachancipá";
    marcarMenu(clave || "");
    main.setAttribute("data-p", clave || "");
    function pintar() {
      if (mi !== tk) return;
      main.removeAttribute("aria-busy");
      main.innerHTML = (pg.filtros ? window.Filtros.barra() : "") + pg.html;
      if (pg.filtros) window.Filtros.ligar(main, function (foco) { App.refrescar(foco); });
      if (pg.init) pg.init(main);
      Charts.mount(main, !opts.keep);
      if (!opts.keep) Charts.contar(main);
      accesibles(main);
      if (!opts.keep) { main.classList.remove("enter"); void main.offsetWidth; main.classList.add("enter"); }
      if (esMovil()) abrirMenu(false);
      if (opts.keep) {
        var f = opts.foco && doc.getElementById(opts.foco); if (f) f.focus({ preventScroll: true });
        App.anunciar(window.Filtros.texto());
      } else if (!primera) { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); titulo.focus({ preventScroll: true }); App.anunciar(pg.title); }
      primera = false;
    }
    /* esqueleto breve al cambiar de página (no en la primera carga ni al filtrar) */
    if (!primera && !opts.keep && prev !== clave && !reducido()) { main.setAttribute("aria-busy", "true"); main.innerHTML = SKEL; setTimeout(pintar, 90); }
    else pintar();
    prev = clave;
  }
  App.refrescar = function (foco) { render({ keep: true, foco: foco }); };
  window.addEventListener("hashchange", function () { render(); });
  render();
})();
