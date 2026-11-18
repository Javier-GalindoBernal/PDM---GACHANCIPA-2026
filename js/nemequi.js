/* NEMEQUI · interfaz del agente virtual del portal de seguimiento al PDM de Gachancipá.
   Botón flotante, bienvenida con video, panel de chat, preguntas frecuentes y contenido de la página #/ayuda.
   Usa window.NemequiMotor.responder(texto, contexto) (js/motor.js). Sin red, sin librerías. Si algo falla, el tablero sigue funcionando. */
(function () {
  "use strict";
  var W = window, doc = document;
  function safe(fn, d) { try { return fn(); } catch (e) { return d === undefined ? null : d; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function reducido() { return !!(W.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function movil() { return W.innerWidth <= 720; }
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }

  var AVATAR = "assets/nemequi_avatar.jpg", POSTER = "assets/nemequi_poster.jpg", VIDEO = "assets/nemequi.mp4", VOZ = "assets/nemequi_voz.m4a", VOZ_MP3 = "assets/nemequi_voz.mp3";
  var K_HIST = "pdm_nq_hist", K_MEM = "pdm_nq_mem", K_BIEN = "pdm_nq_bienvenida", K_SES = "pdm_nq_saludo";
  var SALUDO = "Hola, soy NEMEQUI, la guía virtual del portal de seguimiento al Plan de Desarrollo Municipal de Gachancipá. Estoy aquí para ayudarte a leer el tablero: qué significan los colores, cómo se calcula el indicador y dónde encontrar cada informe. Pregúntame lo que necesites; las cifras que te comparto salen de los datos oficiales del corte.";
  var CATS = [["comprender", "Entender el tablero"], ["funcionamiento", "Cómo funciona el portal"], ["datos", "Cifras del corte"], ["metodologia", "Metodología"], ["fuentes", "Fuentes de los datos"], ["navegacion", "Moverse por el portal"], ["limites", "Alcances y límites de NEMEQUI"]];
  var RUTAS_FILTRO = { resumen: 1, ejes: 1, secretarias: 1, logros: 1, alertas: 1 };

  /* ------------------------- motor y catálogo ------------------------- */
  function motor() { var M = W.NemequiMotor; return M && safe(function () { return M.listo(); }, false) ? M : null; }
  function canon(f) { return /^¿/.test(f) ? f : (/[?¿]$/.test(f) ? f : f.charAt(0).toUpperCase() + f.slice(1)); }
  var CAT = null;
  /* Preguntas del banco por categoría, con su respuesta tal como la da el motor. Para cada intención se elige la
     formulación cuya respuesta cae en esa misma intención. */
  function catalogo() {
    if (CAT) return CAT;
    var M = motor(), B = W.NEMEQUI_BANCO; if (!M || !B) return (CAT = []);
    var por = {};
    B.intenciones.forEach(function (it) {
      if (it.categoria === "conversacion") return;
      var elegida = null, r0 = null;
      for (var i = 0; i < it.formulaciones.length && !elegida; i++) {
        var q = canon(it.formulaciones[i]), r = safe(function () { return M.responder(q, { mem: {}, hash: "" }); });
        if (!r) continue; if (!r0) r0 = { q: q, r: r };
        if (r.intencion === it.id) elegida = { q: q, r: r };
      }
      var e = elegida || r0; if (!e) return;
      (por[it.categoria] = por[it.categoria] || []).push({ id: it.id, q: e.q, r: e.r });
    });
    CAT = CATS.map(function (c) { return { id: c[0], nombre: c[1], items: por[c[0]] || [] }; }).filter(function (c) { return c.items.length; });
    return CAT;
  }

  /* ------------------------- utilidades de respuesta ------------------------- */
  function etiquetaHash(h) {
    var a = safe(function () { return doc.querySelector('.nav a[href="' + h + '"]'); });
    if (a) return a.textContent.trim();
    if (/^#\/ejes\/\d+/.test(h)) return "Eje " + h.split("/")[2].split("?")[0];
    if (/^#\/secretarias\//.test(h)) return "Ficha de la secretaría";
    if (/^#\/metas/.test(h)) return "Explorador de metas";
    return "la sección indicada";
  }
  function textoHtml(t) { return esc(t).replace(/\n/g, "<br>"); }
  function nombresFiltro(f) {
    var D = W.PDM, p = [];
    if (f.sec) { var s = D.secretarias.filter(function (x) { return x.carpeta === f.sec; })[0]; p.push(s ? s.corto : f.sec); }
    if (f.eje) p.push("Eje " + f.eje);
    if (f.est) p.push(({ cumplida: "cumplidas", en_avance: "en avance", rezagada: "rezagadas", no_programada: "no programadas" })[f.est] || f.est);
    return p.join(" · ");
  }
  function filtroDe(r) {
    var e = r && r.entidades; if (!e || r.tipo !== "datos" || (e.metas && e.metas.length)) return null;
    var f = { sec: (e.secretarias || [])[0] || "", eje: (e.ejes || [])[0] ? String(e.ejes[0]) : "", est: (e.estados || [])[0] || "" };
    return f.sec || f.eje || f.est ? f : null;
  }
  /* de la respuesta del motor al mensaje que se muestra y se guarda */
  function aMensaje(r) {
    var m = { r: "b", t: r.texto || "", tipo: r.tipo || "", enl: [], acc: [], filtro: filtroDe(r) }, vistos = {};
    (r.enlaces || []).forEach(function (e) {
      var u = e.hash || e.href; if (!u || vistos[u]) return; vistos[u] = 1; m.enl.push({ t: e.texto || etiquetaHash(u), u: u, hash: !!e.hash });
    });
    (r.acciones || []).forEach(function (a) {
      if (a.tipo === "ir" && a.hash) { if (!vistos[a.hash]) { vistos[a.hash] = 1; m.acc.push({ k: "ir", u: a.hash, t: "Ir a " + etiquetaHash(a.hash) }); } }
      else if (a.tipo === "abrir" && a.href) { if (W.PDM && W.PDM.tablero) m.acc.push({ k: "abrir", u: a.href, t: "Abrir el tablero de una sola página" }); }
      else if (a.tipo === "imprimir") m.acc.push({ k: "imprimir", t: "Imprimir esta página" });
      else if (a.tipo === "limpiar_filtros") m.acc.push({ k: "limpiar", t: "Limpiar los filtros" });
    });
    m.sug = (r.sugerencias || []).slice(0, 3);
    return m;
  }

  /* =========================================================================================
     INTERFAZ
     ========================================================================================= */
  var S = { abierto: false, bienvenida: false, voz: false, ctx: { mem: {}, hash: "", filtros: {} }, hist: [], chips: "ctx", fab: null, panel: null, wel: null, ant: null };

  function guardarHist() {
    safe(function () { sessionStorage.setItem(K_HIST, JSON.stringify(S.hist.slice(-40))); });
    safe(function () { sessionStorage.setItem(K_MEM, JSON.stringify(S.ctx.mem || {})); });
  }
  function cargarHist() {
    var h = safe(function () { return JSON.parse(sessionStorage.getItem(K_HIST) || "[]"); }, []);
    if (h && h.length) S.hist = h;
    var m = safe(function () { return JSON.parse(sessionStorage.getItem(K_MEM) || "{}"); }, {});
    if (m && typeof m === "object") S.ctx.mem = m;
  }

  function construir() {
    var fab = doc.createElement("button");
    fab.type = "button"; fab.id = "nq-fab"; fab.className = "nq-fab";
    fab.setAttribute("aria-haspopup", "dialog"); fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-controls", "nq-panel");
    fab.setAttribute("aria-label", "Pregúntale a NEMEQUI, asistente del tablero");
    fab.innerHTML = '<span class="nq-fab-l" aria-hidden="true">Pregúntale a NEMEQUI</span><span class="nq-fab-i"><img src="' + AVATAR + '" alt="" width="60" height="60"></span>';
    doc.body.appendChild(fab);

    var panel = doc.createElement("section");
    panel.id = "nq-panel"; panel.className = "nq-panel"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-labelledby", "nq-tit");
    panel.innerHTML =
      '<header class="nq-h"><img class="nq-hav" src="' + AVATAR + '" alt="" width="44" height="44">' +
      '<div class="nq-ht"><h2 id="nq-tit">NEMEQUI · Asistente del tablero</h2><p id="nq-ctx" class="nq-ctx"></p></div>' +
      '<div class="nq-hb">' +
      '<button type="button" class="nq-ib" id="nq-b-faq" aria-expanded="false" aria-controls="nq-faq" aria-label="Preguntas frecuentes" title="Preguntas frecuentes">' + ic("help") + "</button>" +
      '<button type="button" class="nq-ib" id="nq-b-saludo" aria-pressed="false" aria-label="Escuchar el saludo de NEMEQUI" title="Escucha a NEMEQUI">' + ic("play") + "</button>" +
      '<button type="button" class="nq-ib" id="nq-b-voz" aria-pressed="false" aria-label="Leer las respuestas en voz alta (desactivado)" title="Lectura en voz alta">' + ic("speaker") + "</button>" +
      '<button type="button" class="nq-ib" id="nq-b-lim" aria-label="Limpiar la conversación" title="Limpiar la conversación">' + ic("trash") + "</button>" +
      '<button type="button" class="nq-ib" id="nq-b-x" aria-label="Cerrar el asistente" title="Cerrar (Esc)">' + ic("x") + "</button></div></header>" +
      '<div class="nq-body"><div id="nq-log" class="nq-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversación con NEMEQUI" tabindex="-1"></div>' +
      '<section id="nq-faq" class="nq-faq" hidden aria-labelledby="nq-faq-t"><div class="nq-faq-h"><h3 id="nq-faq-t">Preguntas frecuentes</h3><button type="button" class="nq-txt" id="nq-faq-x">Volver a la conversación</button></div>' +
      '<div id="nq-faq-c" class="nq-faq-c"></div><div id="nq-faq-l" class="nq-faq-l"></div></section></div>' +
      '<div class="nq-f"><div id="nq-chips" class="nq-chips" role="group" aria-label="Preguntas sugeridas"></div>' +
      '<form id="nq-form" class="nq-form" autocomplete="off"><label class="sr" for="nq-in">Escribe tu pregunta para NEMEQUI</label>' +
      '<textarea id="nq-in" rows="1" maxlength="400" placeholder="Escribe tu pregunta…" enterkeyhint="send"></textarea>' +
      '<button type="submit" class="nq-send" aria-label="Enviar la pregunta">' + ic("send") + "</button></form>" +
      '<p class="nq-note">NEMEQUI responde con los datos oficiales del corte ' + esc(W.PDM.corte.texto) + ". No emite juicios sobre las secretarías.</p></div>";
    doc.body.appendChild(panel);

    var wel = doc.createElement("div");
    wel.id = "nq-wel"; wel.className = "nq-wel-w"; wel.hidden = true;
    wel.innerHTML =
      '<div class="nq-wel" role="dialog" aria-modal="true" aria-labelledby="nq-wel-t">' +
      '<button type="button" class="nq-ib nq-wel-x" id="nq-wel-x" aria-label="Cerrar el video y conversar con NEMEQUI" title="Cerrar el video">' + ic("x") + "</button>" +
      '<div class="nq-vid"><video id="nq-video" preload="auto" playsinline disablepictureinpicture disableremoteplayback controlslist="nodownload noplaybackrate noremoteplayback" poster="' + POSTER + '" aria-label="Video de NEMEQUI (10 segundos, con audio)"><source src="' + VIDEO + '" type="video/mp4">Su navegador no reproduce video; lea el saludo escrito.</video></div>' +
      '<div class="nq-wb"><div class="nq-wt"><h2 id="nq-wel-t">Hola, soy NEMEQUI</h2>' +
      '<details class="nq-tr"><summary>Leer el saludo en texto</summary><p>' + esc(SALUDO) + '</p><p class="mini">Texto de apoyo escrito para este portal; no es la transcripción literal del audio del video.</p></details></div>' +
      '<div class="nq-wa"><button type="button" class="btn" id="nq-wel-chat">' + ic("x") + '<span>Cerrar el video y conversar</span></button></div></div>' +
      '<label class="nq-chk"><input type="checkbox" id="nq-wel-no"><span>No mostrar el video al abrir el agente</span></label></div>';
    doc.body.appendChild(wel);
    S.fab = fab; S.panel = panel; S.wel = wel;
  }

  /* ------------------------- mensajes ------------------------- */
  function htmlMsg(m, i) {
    if (m.r === "u") return '<div class="nq-m nq-u"><div class="nq-bub"><span class="sr">Tú: </span>' + esc(m.t) + "</div></div>";
    var h = '<div class="nq-m nq-b" data-i="' + i + '"><img class="nq-av" src="' + AVATAR + '" alt="" width="32" height="32"><div class="nq-bub"><span class="sr">NEMEQUI: </span><div class="nq-tx">' + textoHtml(m.t) + "</div>";
    var bt = [];
    (m.enl || []).forEach(function (e) {
      bt.push(e.hash ? '<a class="nq-lk" href="' + esc(e.u) + '" data-nav="1">' + ic("chev") + esc(e.t) + "</a>" : '<a class="nq-lk" href="' + esc(e.u) + '" target="_blank" rel="noopener">' + ic("file") + esc(e.t) + '<span class="sr"> (se abre en otra pestaña)</span></a>');
    });
    (m.acc || []).forEach(function (a, j) {
      if (a.k === "ir") bt.push('<a class="nq-ac" href="' + esc(a.u) + '" data-nav="1">' + ic("grid") + esc(a.t) + "</a>");
      else if (a.k === "abrir") bt.push('<a class="nq-ac" href="' + esc(a.u) + '" target="_blank" rel="noopener">' + ic("grid") + esc(a.t) + '<span class="sr"> (se abre en otra pestaña)</span></a>');
      else bt.push('<button type="button" class="nq-ac" data-a="' + a.k + '">' + ic(a.k === "imprimir" ? "print" : "filter") + esc(a.t) + "</button>");
    });
    if (m.filtro) bt.push('<button type="button" class="nq-ac" data-a="filtro">' + ic("filter") + "Aplicar filtro: " + esc(nombresFiltro(m.filtro)) + "</button>");
    if (bt.length) h += '<div class="nq-acts">' + bt.join("") + "</div>";
    h += '<div class="nq-tools"><button type="button" class="nq-cp" data-a="copiar" aria-label="Copiar esta respuesta" title="Copiar respuesta">' + ic("copy") + "<span>Copiar</span></button></div></div></div>";
    return h;
  }
  function pintarLog() {
    var log = $("#nq-log"); if (!log) return;
    var h = "";
    if (!S.hist.length) {
      var ini = safe(function () { return motor().sugerirInicio(); });
      h += htmlMsg({ r: "b", t: ini ? ini.texto : "Hola, soy NEMEQUI. Puedo ayudarte a entender el tablero.", enl: [], acc: [] }, -1);
    } else S.hist.forEach(function (m, i) { h += htmlMsg(m, i); });
    log.innerHTML = h;
    bajar();
  }
  function bajar() { var log = $("#nq-log"); if (log) log.scrollTop = log.scrollHeight; }
  function agregar(m) {
    S.hist.push(m); var log = $("#nq-log"); if (!log) return;
    if (S.hist.length === 1) log.innerHTML = "";
    log.insertAdjacentHTML("beforeend", htmlMsg(m, S.hist.length - 1)); bajar(); guardarHist();
  }

  /* ------------------------- sugerencias ------------------------- */
  function contextuales() {
    var M = motor(); if (!M) return [];
    return safe(function () { return M.sugerirPagina(location.hash).slice(0, 3); }, []);
  }
  function pintarChips(lista, modo) {
    var c = $("#nq-chips"); if (!c) return;
    S.chips = modo || "ctx";
    var et = modo === "auto" ? "Coincidencias" : (modo === "resp" ? "Podrías preguntar" : "Para esta página");
    c.innerHTML = lista && lista.length ? '<span class="nq-chl">' + et + "</span>" + lista.map(function (q) { return '<button type="button" class="nq-chip" data-q="' + esc(q) + '">' + esc(q) + "</button>"; }).join("") : "";
  }
  function actualizarContexto() {
    S.ctx.hash = location.hash || "";
    S.ctx.filtros = safe(function () { return W.Filtros.estado(); }, {}) || {};
    var t = $("#pageTitle"), c = $("#nq-ctx");
    if (c) c.textContent = "Estás en: " + (t ? t.textContent : "el portal");
  }

  /* ------------------------- envío y respuesta ------------------------- */
  var MSG_FALLO = "En este momento no puedo consultar mi base de conocimiento. El tablero sigue disponible: prueba el buscador de metas o la página «Ayuda y preguntas frecuentes».";
  var GEN = 0;
  function responder(texto) {
    var M = motor();
    if (!M) return { r: "b", t: MSG_FALLO, enl: [{ t: "Ayuda y preguntas frecuentes", u: "#/ayuda", hash: true }], acc: [], sug: [] };
    actualizarContexto();
    var r = safe(function () { return M.responder(texto, S.ctx); });
    if (!r) return { r: "b", t: "No logré procesar esa pregunta. ¿Puedes reformularla con otras palabras? También puedes elegir una de las preguntas frecuentes.", enl: [], acc: [], sug: contextuales() };
    return aMensaje(r);
  }
  function enviar(texto) {
    texto = String(texto || "").replace(/\s+/g, " ").trim(); if (!texto) return;
    var inp = $("#nq-in"); if (inp) { inp.value = ""; ajustar(inp); }
    cerrarFaq();
    agregar({ r: "u", t: texto });
    var m = responder(texto);
    pintarChips([], "ctx");
    var log = $("#nq-log");
    var gen = GEN, typing = doc.createElement("div"); typing.className = "nq-m nq-b nq-typing"; typing.setAttribute("aria-hidden", "true");
    typing.innerHTML = '<img class="nq-av" src="' + AVATAR + '" alt="" width="32" height="32"><div class="nq-bub"><span class="nq-dots"><i></i><i></i><i></i></span><span class="nq-tl">NEMEQUI está escribiendo…</span></div>';
    log.appendChild(typing); bajar();
    var espera = reducido() ? 120 : 450;
    setTimeout(function () {
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      if (gen !== GEN) return;
      agregar(m);
      pintarChips(m.sug && m.sug.length ? m.sug : contextuales(), m.sug && m.sug.length ? "resp" : "ctx");
      hablar(m.t);
    }, espera);
  }

  /* ------------------------- voz ------------------------- */
  function elegirVoz() {
    var vs = safe(function () { return speechSynthesis.getVoices(); }, []) || [], pref = ["es-CO", "es-419", "es-MX", "es-US", "es-ES"], i, j;
    for (i = 0; i < pref.length; i++) for (j = 0; j < vs.length; j++) if (vs[j].lang && vs[j].lang.replace("_", "-").toLowerCase() === pref[i].toLowerCase()) return vs[j];
    for (j = 0; j < vs.length; j++) if (/^es/i.test(vs[j].lang || "")) return vs[j];
    return null;
  }
  function hablar(t) {
    if (!S.voz || !W.speechSynthesis) return;
    safe(function () {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(t).replace(/[«»]/g, ""));
      var v = elegirVoz(); u.lang = v ? v.lang : "es-CO"; if (v) u.voice = v; u.rate = 1;
      speechSynthesis.speak(u);
    });
  }
  function alternarVoz() {
    S.voz = !S.voz; var b = $("#nq-b-voz");
    b.setAttribute("aria-pressed", String(S.voz));
    b.setAttribute("aria-label", "Leer las respuestas en voz alta (" + (S.voz ? "activado" : "desactivado") + ")");
    b.classList.toggle("on", S.voz);
    if (!S.voz) safe(function () { speechSynthesis.cancel(); });
    anunciar(S.voz ? "Lectura en voz alta activada" : "Lectura en voz alta desactivada");
  }
  function anunciar(t) { if (W.App && App.anunciar) App.anunciar(t); }

  /* ------------------------- preguntas frecuentes (dentro del panel) ------------------------- */
  var faqCat = "pagina";
  function pintarFaq() {
    var cats = catalogo(), c = $("#nq-faq-c"), l = $("#nq-faq-l"); if (!c) return;
    var tabs = [["pagina", "En esta página"]].concat(cats.map(function (x) { return [x.id, x.nombre]; }));
    c.innerHTML = tabs.map(function (t) { return '<button type="button" class="nq-tab" data-c="' + t[0] + '" aria-pressed="' + (t[0] === faqCat) + '">' + esc(t[1]) + "</button>"; }).join("");
    var lista = faqCat === "pagina" ? contextuales().concat(safe(function () { return motor().sugerirPagina(location.hash).slice(3); }, []) || []) : (cats.filter(function (x) { return x.id === faqCat; })[0] || { items: [] }).items.map(function (i) { return i.q; });
    l.innerHTML = lista.length ? '<ul class="nq-fl">' + lista.map(function (q) { return '<li><button type="button" class="nq-fq" data-q="' + esc(q) + '">' + esc(q) + "</button></li>"; }).join("") + "</ul>" : '<p class="mini">Aún no hay preguntas en esta categoría.</p>';
  }
  function abrirFaq() { var f = $("#nq-faq"); f.hidden = false; $("#nq-b-faq").setAttribute("aria-expanded", "true"); pintarFaq(); var t = f.querySelector(".nq-tab[aria-pressed=true]") || f.querySelector("button"); t && t.focus(); }
  function cerrarFaq(foco) { var f = $("#nq-faq"); if (!f || f.hidden) return; f.hidden = true; $("#nq-b-faq").setAttribute("aria-expanded", "false"); if (foco) $("#nq-in").focus(); }

  /* ------------------------- apertura y cierre ------------------------- */
  function fondoInerte(on) {
    ["#app", ".govbar"].forEach(function (q) { var e = $(q); if (e) { if (on) e.setAttribute("inert", ""); else e.removeAttribute("inert"); } });
  }
  function abrir(opts) {
    opts = opts || {};
    if (S.bienvenida) cerrarBienvenida(false);
    if (S.abierto) { if (opts.pregunta) enviar(opts.pregunta); else $("#nq-in").focus(); return; }
    S.ant = opts.desde || doc.activeElement; S.abierto = true;
    actualizarContexto(); pintarLog();
    pintarChips(contextuales(), "ctx");
    S.panel.hidden = false; S.panel.classList.remove("in"); void S.panel.offsetWidth; S.panel.classList.add("in");
    S.panel.setAttribute("aria-modal", String(movil()));
    S.fab.setAttribute("aria-expanded", "true"); doc.body.classList.add("nq-open");
    if (movil()) fondoInerte(true);
    $("#nq-in").focus();
    if (opts.pregunta) enviar(opts.pregunta);
  }
  function cerrar(sinFoco) {
    if (!S.abierto) return;
    S.abierto = false; S.panel.hidden = true; fondoInerte(false);
    S.fab.setAttribute("aria-expanded", "false"); doc.body.classList.remove("nq-open");
    safe(function () { speechSynthesis.cancel(); });
    if (!sinFoco) { var d = (S.ant && doc.contains(S.ant) && S.ant !== doc.body) ? S.ant : S.fab; if (d.offsetParent === null && d !== S.fab) d = S.fab; d.focus(); }
  }
  function abrirBienvenida() {
    if (S.bienvenida || S.abierto) return;
    S.bienvenida = true; S.ant = doc.activeElement; S.wel.hidden = false;
    safe(function () { sessionStorage.setItem(K_SES, "1"); });
    fondoInerte(true); S.fab.setAttribute("inert", "");
    var b = $("#nq-wel-chat"); b && b.focus();
    /* el video empieza apenas se abre (el clic en el agente permite el sonido), una sola vez y sin controles */
    var vv = $("#nq-video");
    if (vv) safe(function () {
      vv.loop = false; vv.muted = false; vv.currentTime = 0;
      var pr = vv.play();
      /* si el navegador bloqueara el sonido, arranca igual (en silencio) en vez de quedarse detenido */
      if (pr && pr.catch) pr.catch(function () { safe(function () { vv.muted = true; vv.play(); }); });
    });
  }
  function cerrarBienvenida(devolverFoco) {
    try { pararVoz(); var _v = document.getElementById('nq-video'); if (_v && !_v.paused) _v.pause(); } catch (e) {}
    if (!S.bienvenida) return;
    var v = $("#nq-video"); safe(function () { v.pause(); v.currentTime = 0; });
    if ($("#nq-wel-no").checked) safe(function () { localStorage.setItem(K_BIEN, "no"); });
    S.bienvenida = false; S.wel.hidden = true; fondoInerte(false); S.fab.removeAttribute("inert");
    resetPlay();
    if (devolverFoco !== false) S.fab.focus();
  }
  /* Voz de NEMEQUI (audio del video): solo suena cuando la persona lo pide */
  var audioVoz = null;
  function vozAudio() {
    if (audioVoz) return audioVoz;
    audioVoz = new Audio();
    audioVoz.preload = "none";
    audioVoz.src = (audioVoz.canPlayType && audioVoz.canPlayType('audio/mp4; codecs="mp4a.40.2"')) ? VOZ : VOZ_MP3;
    audioVoz.addEventListener("ended", vozEstado); audioVoz.addEventListener("pause", vozEstado); audioVoz.addEventListener("play", vozEstado);
    return audioVoz;
  }
  function vozEstado() {
    var on = !!audioVoz && !audioVoz.paused && !audioVoz.ended;
    var b1 = $("#nq-v-voz"), b2 = $("#nq-b-saludo");
    if (b1) { b1.setAttribute("aria-pressed", String(on)); b1.querySelector("span").textContent = on ? "Detener la voz" : "Escucha a NEMEQUI"; }
    if (b2) { b2.setAttribute("aria-pressed", String(on)); b2.setAttribute("aria-label", on ? "Detener la voz de NEMEQUI" : "Escuchar el saludo de NEMEQUI"); }
  }
  function alternarVoz() {
    safe(function () {
      var a = vozAudio(), v = $("#nq-video");
      if (!a.paused) { a.pause(); a.currentTime = 0; vozEstado(); return; }
      if (v && !v.paused) v.pause();
      a.currentTime = 0;
      var pr = a.play(); if (pr && pr.catch) pr.catch(function () { anunciar("No se pudo reproducir el audio en este navegador."); });
    });
  }
  function pararVoz() { if (audioVoz && !audioVoz.paused) { audioVoz.pause(); audioVoz.currentTime = 0; vozEstado(); } }
  function resetPlay() { var p = $("#nq-v-play"); if (p) { p.querySelector("span").textContent = "Reproducir saludo"; p.querySelector("use").setAttribute("href", "#i-play"); } }

  /* ------------------------- foco atrapado ------------------------- */
  function enfocables(c) {
    return Array.prototype.filter.call(c.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select,summary,video[controls],[tabindex]:not([tabindex="-1"])'), function (e) {
      if (e.closest("[hidden]") || e.closest("details:not([open])") && e.tagName !== "SUMMARY" && !e.closest("summary")) return false;
      return e.offsetParent !== null || e === doc.activeElement;
    });
  }
  function atrapar(e, cont) {
    var f = enfocables(cont); if (!f.length) return;
    var a = doc.activeElement, i = f.indexOf(a);
    if (e.shiftKey && (i <= 0 || !cont.contains(a))) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === f.length - 1 || !cont.contains(a))) { e.preventDefault(); f[0].focus(); }
  }

  function ajustar(t) { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 112) + "px"; }
  function copiar(texto, btn) {
    function ok() { var s = btn.querySelector("span"); if (s) { s.textContent = "Copiado"; setTimeout(function () { s.textContent = "Copiar"; }, 1600); } anunciar("Respuesta copiada"); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texto).then(ok, function () { viejo(); }); } else viejo();
    function viejo() {
      safe(function () { var a = doc.createElement("textarea"); a.value = texto; a.setAttribute("readonly", ""); a.style.cssText = "position:fixed;opacity:0"; doc.body.appendChild(a); a.select(); doc.execCommand("copy"); doc.body.removeChild(a); ok(); });
    }
  }

  function enlazar() {
    S.fab.addEventListener("click", function () { var no = safe(function () { return localStorage.getItem(K_BIEN); }); if (no === "no") abrir({ desde: S.fab }); else abrirBienvenida(); });
    $("#nq-b-x").addEventListener("click", function () { cerrar(); });
    $("#nq-b-faq").addEventListener("click", function () { var f = $("#nq-faq"); if (f.hidden) abrirFaq(); else cerrarFaq(true); });
    $("#nq-faq-x").addEventListener("click", function () { cerrarFaq(true); });
    $("#nq-b-voz").addEventListener("click", alternarVoz);
    if (!W.speechSynthesis) $("#nq-b-voz").hidden = true;
    $("#nq-b-lim").addEventListener("click", function () {
      GEN++; $$(".nq-typing").forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); }); S.hist = []; S.ctx.mem = {}; safe(function () { speechSynthesis.cancel(); }); guardarHist(); cerrarFaq(); pintarLog(); pintarChips(contextuales(), "ctx"); anunciar("Conversación limpiada"); $("#nq-in").focus();
    });
    var f = $("#nq-form"), inp = $("#nq-in");
    f.addEventListener("submit", function (e) { e.preventDefault(); enviar(inp.value); });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); enviar(inp.value); } });
    inp.addEventListener("input", function () {
      ajustar(inp);
      var v = inp.value.trim(), M = motor();
      if (v.length >= 2 && M) { var a = safe(function () { return M.autocompletar(v, 3); }, []); if (a && a.length) { pintarChips(a, "auto"); return; } }
      if (S.chips === "auto") pintarChips(contextuales(), "ctx");
    });
    S.panel.addEventListener("click", function (e) {
      var q = e.target.closest("[data-q]"); if (q) { enviar(q.getAttribute("data-q")); return; }
      var t = e.target.closest(".nq-tab"); if (t) { faqCat = t.getAttribute("data-c"); pintarFaq(); var nt = $('.nq-tab[data-c="' + faqCat + '"]'); nt && nt.focus(); return; }
      var n = e.target.closest("a[data-nav]"); if (n && movil()) { setTimeout(function () { cerrar(true); }, 0); return; }
      var a = e.target.closest("[data-a]"); if (!a) return;
      var k = a.getAttribute("data-a"), msg = S.hist[+a.closest(".nq-m").getAttribute("data-i")] || {};
      if (k === "copiar") copiar(msg.t || "", a);
      else if (k === "imprimir") { if (movil()) cerrar(true); setTimeout(function () { W.print(); }, 120); }
      else if (k === "limpiar") { safe(function () { W.Filtros.limpiar(); }); refrescar(); anunciar("Filtros limpiados"); }
      else if (k === "filtro" && msg.filtro) {
        safe(function () { W.Filtros.aplicar(msg.filtro); });
        var ruta = (location.hash.replace(/^#\/?/, "").split(/[/?]/)[0]) || "";
        if (RUTAS_FILTRO[ruta]) refrescar(); else location.hash = "#/resumen";
        anunciar("Filtro aplicado: " + nombresFiltro(msg.filtro)); if (movil()) cerrar(true);
      }
    });
    function refrescar() { if (W.App && App.refrescar) { var r = (location.hash.replace(/^#\/?/, "").split(/[/?]/)[0]) || ""; if (RUTAS_FILTRO[r]) App.refrescar(); else location.hash = "#/resumen"; } }
    /* video de NEMEQUI: al cerrarlo la persona queda en el agente (panel de chat) */
    var v = $("#nq-video");
    function videoAChat() { cerrarBienvenida(false); abrir({ desde: S.fab }); }
    $("#nq-wel-x").addEventListener("click", videoAChat);
    $("#nq-wel-chat").addEventListener("click", videoAChat);
    S.wel.addEventListener("click", function (e) { if (e.target === S.wel) videoAChat(); });
    v.addEventListener("play", pararVoz);
    var bs = $("#nq-b-saludo"); if (bs) bs.addEventListener("click", alternarVoz);
    doc.addEventListener("keydown", function (e) {
      if (S.bienvenida) { if (e.key === "Escape") { e.preventDefault(); videoAChat(); } else if (e.key === "Tab") atrapar(e, $(".nq-wel", S.wel)); return; }
      if (S.abierto) { if (e.key === "Escape") { e.preventDefault(); cerrar(); } else if (e.key === "Tab") atrapar(e, S.panel); }
    });
    W.addEventListener("hashchange", function () { setTimeout(function () { actualizarContexto(); if (S.abierto && S.chips === "ctx") pintarChips(contextuales(), "ctx"); }, 160); });
    W.addEventListener("resize", function () { if (S.abierto) { S.panel.setAttribute("aria-modal", String(movil())); fondoInerte(movil()); } });
    W.addEventListener("pagehide", function () { safe(function () { speechSynthesis.cancel(); }); });
  }

  /* =========================================================================================
     PÁGINA #/ayuda
     ========================================================================================= */
  function ayuda() {
    var C = catalogo(), U = W.U, total = 0;
    C.forEach(function (c) { total += c.items.length; });
    var D = W.PDM;
    var guia = [
      ["home", "Empieza por el resumen", "El resumen ejecutivo muestra el indicador institucional, el avance 2025 y 2026 al corte y cuántas metas hay en cada estado. Cada tarjeta lleva al detalle.", "#/resumen"],
      ["filter", "Acota con los filtros", "Elige secretaría, eje o estado: el resumen, los ejes, las secretarías, los logros y las alertas se recalculan. Los chips muestran lo activo y «Limpiar» lo quita.", "#/resumen"],
      ["table", "Explora las metas", "El explorador permite buscar por texto o código, ordenar y entrar a la ficha de cada meta. El enlace del navegador conserva los filtros para compartirlo.", "#/metas"],
      ["file", "Descarga los informes", "Los informes por secretaría y el informe general están en Word y PDF, con el mismo corte que el tablero.", "#/informes"],
      ["book", "Conoce la metodología", "Allí están las fuentes, cómo se calcula el indicador y qué significa cada estado.", "#/metodologia"]
    ];
    var estados = (U && U.SEMORD ? U.SEMORD : []).map(function (k) {
      var d = { cumplida: "100 % o más del avance programado", en_avance: "entre 20 % y 99 %", rezagada: "menos de 20 %", no_programada: "sin programación al corte; no penaliza el indicador" }[k];
      return '<li><span class="chip s-' + k + '">' + esc(U.SEM[k].et) + "</span><span>" + esc(d) + "</span></li>";
    }).join("");
    var h = '<section class="card ay-hero"><div class="ay-h1"><img src="' + AVATAR + '" alt="" width="72" height="72"><div><h2>Cómo usar el tablero</h2>' +
      '<p>Esta página reúne las preguntas más habituales sobre el portal, con la respuesta que daría NEMEQUI. Las cifras salen de los datos oficiales del corte ' + esc(D.corte.texto) + ".</p></div></div>" +
      '<div class="ay-act"><button type="button" class="btn" data-ay-nq>' + ic("help") + "Preguntar a NEMEQUI</button></div></section>" +
      '<section class="ay-guia" aria-label="Guía rápida">' + guia.map(function (g, i) { return '<a class="card ay-g" href="' + g[3] + '"><span class="ay-n">' + (i + 1) + '</span><span class="kic">' + ic(g[0]) + "</span><b>" + esc(g[1]) + "</b><span>" + esc(g[2]) + "</span></a>"; }).join("") + "</section>" +
      '<section class="card mt" aria-labelledby="ay-est"><h2 id="ay-est">Qué significan los colores</h2><ul class="ay-est">' + estados + "</ul></section>" +
      '<section class="card mt" aria-labelledby="ay-bus-t"><h2 id="ay-bus-t">Preguntas frecuentes</h2><p class="sub">' + total + " preguntas en " + C.length + " categorías. Despliega una pregunta para ver la respuesta.</p>" +
      '<form class="ay-bus" role="search" aria-label="Buscar en las preguntas frecuentes"><label class="sr" for="ay-q">Buscar una pregunta o una palabra</label>' + ic("search") + '<input id="ay-q" type="search" placeholder="Buscar en las preguntas (por ejemplo: semáforo, filtros, informes)" autocomplete="off"></form>' +
      '<p id="ay-n" class="mini" role="status" aria-live="polite"></p><div id="ay-vacio" class="ay-vacio" hidden><p>No encontré preguntas con esas palabras.</p><button type="button" class="btn sec" id="ay-ask">' + ic("help") + 'Preguntar a NEMEQUI</button></div>' +
      '<div id="ay-cats">' + C.map(function (c) {
        return '<section class="ay-cat" data-cat="' + c.id + '" aria-labelledby="ay-c-' + c.id + '"><h3 id="ay-c-' + c.id + '">' + esc(c.nombre) + ' <span class="tag">' + c.items.length + "</span></h3>" + c.items.map(function (it) {
          var m = aMensaje(it.r);
          return '<details class="ay-q" data-t="' + esc(norm(it.q + " " + it.r.texto)) + '"><summary>' + esc(it.q) + '</summary><div class="ay-a"><p>' + textoHtml(it.r.texto) + "</p>" +
            (m.enl.length || m.acc.length ? '<p class="ay-l">' + m.enl.map(function (e) { return e.hash ? '<a class="nq-lk" href="' + esc(e.u) + '">' + esc(e.t) + "</a>" : '<a class="nq-lk" href="' + esc(e.u) + '" target="_blank" rel="noopener">' + esc(e.t) + "</a>"; }).join("") + "</p>" : "") +
            '<button type="button" class="btn min sec" data-ay-q="' + esc(it.q) + '">Preguntar a NEMEQUI</button></div></details>';
        }).join("") + "</section>";
      }).join("") + "</div></section>";
    return {
      html: h,
      init: function (raiz) {
        var q = $("#ay-q", raiz), cnt = $("#ay-n", raiz), vac = $("#ay-vacio", raiz), items = [].slice.call(raiz.querySelectorAll(".ay-q"));
        function filtrar() {
          var t = norm(q.value), toks = t ? t.split(" ") : [], vis = 0;
          items.forEach(function (d) { var ok = toks.every(function (w) { return d.getAttribute("data-t").indexOf(w) >= 0; }); d.hidden = !ok; if (ok) vis++; if (toks.length && ok && vis <= 6) d.open = true; else if (!toks.length) d.open = false; });
          [].forEach.call(raiz.querySelectorAll(".ay-cat"), function (c) { c.hidden = !c.querySelector(".ay-q:not([hidden])"); });
          vac.hidden = vis > 0; cnt.textContent = toks.length ? vis + " de " + items.length + " preguntas coinciden." : "";
        }
        q.addEventListener("input", filtrar);
        q.form.addEventListener("submit", function (e) { e.preventDefault(); });
        raiz.addEventListener("click", function (e) {
          var b = e.target.closest("[data-ay-q]"); if (b) { N.preguntar(b.getAttribute("data-ay-q"), b); return; }
          if (e.target.closest("[data-ay-nq]")) N.abrir(e.target.closest("[data-ay-nq]"));
          if (e.target.closest("#ay-ask")) N.preguntar(q.value.trim(), e.target.closest("#ay-ask"));
        });
      }
    };
  }

  /* ------------------------- API pública e inicio ------------------------- */
  var N = W.Nemequi = {
    abrir: function (desde) { if (S.fab) abrir({ desde: desde && desde.nodeType ? desde : null }); },
    cerrar: function () { cerrar(); },
    preguntar: function (q, desde) { if (S.fab) abrir({ pregunta: q, desde: desde && desde.nodeType ? desde : null }); },
    bienvenida: function () { if (S.fab) abrirBienvenida(); },
    catalogo: catalogo, ayuda: function () { return safe(ayuda); },
    listo: function () { return !!S.fab; }
  };

  function iniciar() {
    try {
      if (!W.PDM) return;
      construir(); cargarHist(); enlazar(); actualizarContexto();
      /* el video no se abre solo: empieza con sonido cuando la persona hace clic en el agente */
    } catch (e) { if (W.console) console.error("NEMEQUI no pudo iniciar", e); }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
