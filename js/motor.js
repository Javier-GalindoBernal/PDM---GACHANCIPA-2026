/* NEMEQUI · motor de preguntas del portal de seguimiento al PDM de Gachancipá.
   100 % del lado del cliente: sin LLM, sin red, sin librerías. JavaScript clásico (ES5).
   Entradas: window.PDM (data/datos.js) y window.NEMEQUI_BANCO (conocimiento/banco_preguntas.js).
   Las cifras NUNCA están escritas a mano: salen de window.PDM en el momento de responder.
   API: NemequiMotor.responder(texto, contexto) -> {tipo, texto, enlaces, acciones, sugerencias, confianza, intencion, ...}
        NemequiMotor.sugerirInicio(), .sugerirPagina(hash), .autocompletar(prefijo, n), .estadisticas() */
(function (root) {
  "use strict";

  function crear(PDM, BANCO) {
    var D = PDM, B = BANCO;
    if (!D || !B) throw new Error("NemequiMotor: faltan los datos (PDM) o el banco de preguntas");

    /* ============================ utilidades ============================ */
    function norm(t) {
      return String(t == null ? "" : t).toLowerCase().replace(/%/g, " porcentaje ").normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, " ").replace(/^ +| +$/g, "");
    }
    function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
    function p1(n) { return n == null || isNaN(n) ? "—" : Number(n).toFixed(1) + "%"; }
    function nf(v) { if (v == null || isNaN(v)) return "—"; v = Number(v); return Number.isInteger(v) ? String(v) : String(parseFloat(v.toFixed(2))); }
    function r1(x) { return Math.round(x * 10) / 10; }
    function unir(a) { a = a.slice(); if (a.length <= 1) return a.join(""); return a.slice(0, -1).join(", ") + " y " + a[a.length - 1]; }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function plural(n, s, p) { return n === 1 ? s : p; }
    function unicos(a) { var o = [], v = {}; a.forEach(function (x) { if (!v[x]) { v[x] = 1; o.push(x); } }); return o; }
    function copia(o) { return JSON.parse(JSON.stringify(o)); }

    /* ============================ datos del portal ============================ */
    var secBy = {}, ejeBy = {}, metaBy = {}, metasPorCod = {};
    D.secretarias.forEach(function (s) { secBy[s.carpeta] = s; });
    D.ejes.forEach(function (e) { ejeBy[e.id] = e; });
    D.metas.forEach(function (m) { metaBy[m.id] = m; (metasPorCod[m.cod] = metasPorCod[m.cod] || []).push(m); });
    var CORTE = D.corte;
    var ESTADO = {
      cumplida: { et: "cumplida", pl: "cumplidas", clave: "cumplida" },
      en_avance: { et: "en avance", pl: "en avance", clave: "en_avance" },
      rezagada: { et: "rezagada", pl: "rezagadas", clave: "rezagada" },
      no_programada: { et: "no programada", pl: "no programadas", clave: "no_programada" }
    };
    var ORDEN = ["cumplida", "en_avance", "rezagada", "no_programada"];
    function secCorto(c) { return secBy[c] ? secBy[c].corto : c; }
    function nombreEje(e) { return "Eje " + e.id + ", «" + e.nombre + "»"; }
    function conteo(rows) { var c = { cumplida: 0, en_avance: 0, rezagada: 0, no_programada: 0 }; rows.forEach(function (m) { c[m.s]++; }); return c; }
    function frase(c) { return c.cumplida + " " + plural(c.cumplida, "cumplida", "cumplidas") + ", " + c.en_avance + " en avance, " + c.rezagada + " " + plural(c.rezagada, "rezagada", "rezagadas") + " y " + c.no_programada + " " + plural(c.no_programada, "no programada", "no programadas"); }
    function codMax() { var mx = 0; D.metas.forEach(function (m) { if (+m.cod > mx) mx = +m.cod; }); return mx; }
    function progDe(s) { return s.metas - s.sem.no_programada; }
    function hashEx(o) { var p = []; ["q", "sec", "eje", "est", "vig"].forEach(function (k) { if (o && o[k]) p.push(k + "=" + encodeURIComponent(o[k])); }); return "#/metas" + (p.length ? "?" + p.join("&") : ""); }

    /* ============================ variables para {{marcadores}} ============================ */
    function variables() {
      var I = D.inst, Q = D.calidad || {}, C = D.cert || {}, V = {};
      V.corte = { texto: CORTE.texto, iso: CORTE.iso, mes: CORTE.mes, trimestre: CORTE.trimestre, generado: CORTE.generado, posteriores: CORTE.posteriores };
      V.vig = CORTE.vigencia; V.ant = CORTE.anterior;
      V.inst = { ind: I.ind, a2025: I.a2025, a2026: I.a2026, metas: I.metas, cumplida: I.sem.cumplida, en_avance: I.sem.en_avance, rezagada: I.sem.rezagada, no_programada: I.sem.no_programada, programadas: I.metas - I.sem.no_programada, n_sec: I.n_sec };
      var dif = 0; (D.compartidas || []).forEach(function (c) { if (c.difiere) dif++; });
      V.n = {
        ejes: D.ejes.length, sec: D.secretarias.length, registros: Q.registros, unicas: Q.unicas, compartidas: (D.compartidas || []).length, difieren: dif,
        cert: (C.certificables || []).length, pend: C.pend_unicas, pend_reg: (C.pendientes || []).length, arrastre: (Q.arrastre || []).length,
        sobre: (Q.sobreejecucion || []).length, fracc: (Q.fraccionarios || []).length, verif: (Q.verificacion || []).length, sin2025: Q.prog_2025_cero, codmax: codMax()
      };
      var sc = D.secretarias.slice().sort(function (a, b) { return b.ind - a.ind; });
      V.sec_top = { corto: sc[0].corto, ind: sc[0].ind, nombre: sc[0].nombre }; V.sec_bot = { corto: sc[sc.length - 1].corto, ind: sc[sc.length - 1].ind, nombre: sc[sc.length - 1].nombre };
      var ec = D.ejes.slice().sort(function (a, b) { return b.ind - a.ind; });
      V.eje_top = { id: ec[0].id, nombre: ec[0].nombre, ind: ec[0].ind }; V.eje_bot = { id: ec[ec.length - 1].id, nombre: ec[ec.length - 1].nombre, ind: ec[ec.length - 1].ind };
      V.sec_pocas = unir(D.secretarias.filter(function (s) { return s.metas <= 3; }).map(function (s) { return s.corto; }));
      var best = null;
      D.secretarias.forEach(function (s) {
        var set = {}; D.metas.forEach(function (m) { if (m.car === s.carpeta) set[m.eje] = 1; });
        var n = Object.keys(set).length; if (!best || n > best.n) best = { corto: s.corto, n: n };
      });
      V.sec_eje_max = best || { corto: "", n: 0 };
      var ej = metaBy["secretaria-educacion|14"] || D.metas[0];
      V.ej = { cod: ej.cod, car: ej.car, sec: secCorto(ej.car), ea: ej.ea, pa: ej.pa, ind: ej.ind };
      var vf = (Q.verificacion || [])[0] || {}; V.verif = { cod: vf.codigo || "", sec: vf.carpeta ? secCorto(vf.carpeta) : "" };
      V.fuente = { anterior: (D.fuentes && D.fuentes.anterior) || "Plan Indicativo" };
      V.lista = { ejes: unir(D.ejes.map(function (e) { return e.id + ". " + e.nombre; })), secs: unir(D.secretarias.map(function (s) { return s.corto; })) };
      return V;
    }
    var VARS = variables();
    var faltantes = [];
    function llenar(t) {
      return String(t || "").replace(/\{\{\s*([^}|]+?)\s*(?:\|\s*(\w+)\s*)?\}\}/g, function (m, ruta, fmt) {
        var v = VARS, ps = ruta.split(".");
        for (var i = 0; i < ps.length; i++) { if (v == null) break; v = v[ps[i]]; }
        if (v == null || (typeof v === "number" && isNaN(v))) { faltantes.push(ruta); return ""; }
        if (fmt === "p") return p1(v);
        if (fmt === "n") return nf(v);
        return String(v);
      });
    }

    /* ============================ normalización y lematización ============================ */
    var NZ = B.normalizacion;
    var FRASES = NZ.frases.map(function (f) { return [new RegExp(f[0], "g"), f[1]]; });
    var PAL = NZ.palabras, STOP = {}, RELLENO = {};
    NZ.stop.forEach(function (w) { STOP[w] = 1; }); NZ.relleno.forEach(function (w) { RELLENO[w] = 1; });
    var SUF = ["amientos", "amiento", "imientos", "imiento", "aciones", "acion", "iciones", "icion", "ciones", "cion", "mente", "adoras", "adores", "ador", "idades", "idad",
      "ando", "iendo", "yendo", "ados", "adas", "idos", "idas", "ado", "ada", "ido", "ida", "amos", "emos", "imos", "aran", "eran", "aron", "ieron", "ara", "era", "an", "en", "ar", "er", "ir", "as", "es", "os", "a", "e", "o", "s"];
    var FIJOS = { xsec: 1, xeje: 1, xmeta: 1, xent: 1, noprog: 1, enavance: 1, rezagada: 1, cumplida: 1, certificable: 1, pnp: 1, pdm: 1, portal: 1, mostrar: 1, indicador: 1, semaforo: 1 };
    function stem(w) {
      if (w.length <= 3 || /\d/.test(w) || FIJOS[w]) return w;
      for (var i = 0; i < SUF.length; i++) { var s = SUF[i]; if (w.length - s.length >= 3 && w.slice(-s.length) === s) return w.slice(0, -s.length); }
      return w;
    }
    function aplicarFrases(n) {
      var s = " " + n + " ";
      FRASES.forEach(function (f) { s = s.replace(f[0], f[1]); });
      return s.replace(/\s+/g, " ").replace(/^ +| +$/g, "");
    }

    /* ============================ diccionario de palabras (corrección ortográfica del texto) ============================ */
    var RAW = {};
    function addRaw(t) { norm(t).split(" ").forEach(function (w) { if (w) RAW[w] = (RAW[w] || 0) + 1; }); }
    B.intenciones.forEach(function (it) { it.formulaciones.forEach(addRaw); addRaw(it.respuesta); });
    Object.keys(PAL).forEach(function (w) { RAW[w] = (RAW[w] || 0) + 1; });
    D.metas.forEach(function (m) { addRaw(m.m); });
    D.secretarias.forEach(function (x) { addRaw(x.nombre); addRaw(x.corto); });
    D.ejes.forEach(function (x) { addRaw(x.nombre); });
    Object.keys(B.entidades.secretarias).forEach(function (c) { B.entidades.secretarias[c].forEach(addRaw); });
    Object.keys(B.entidades.ejes).forEach(function (c) { B.entidades.ejes[c].forEach(addRaw); });
    var RAWLIST = Object.keys(RAW).filter(function (w) { return w.length >= 4 && !/\d/.test(w); });
    var ACEPTA = {};
    Object.keys(RAW).forEach(function (w) {
      ACEPTA[w] = 1; ACEPTA[w + "s"] = 1; ACEPTA[w + "n"] = 1; ACEPTA[w + "es"] = 1; ACEPTA[w + "r"] = 1; ACEPTA[w + "o"] = 1; ACEPTA[w + "a"] = 1; ACEPTA[w + "ra"] = 1; ACEPTA[w + "me"] = 1;
      if (/s$/.test(w)) ACEPTA[w.slice(0, -1)] = 1; if (/[aeo]n$/.test(w)) ACEPTA[w.slice(0, -1)] = 1; if (/[aeo]$/.test(w)) { ACEPTA[w.slice(0, -1) + "a"] = 1; ACEPTA[w.slice(0, -1) + "o"] = 1; ACEPTA[w.slice(0, -1) + "e"] = 1; ACEPTA[w.slice(0, -1) + "an"] = 1; ACEPTA[w.slice(0, -1) + "as"] = 1; ACEPTA[w.slice(0, -1) + "os"] = 1; }
    });
    var RAICES = {}; Object.keys(RAW).forEach(function (w) { RAICES[stem(w)] = 1; });
    var CACHE_RAW = {};
    function dlPrev(a, b, max) { return dl(a, b, max); }
    function corregirPalabra(w) {
      if (w.length < 5 || ACEPTA[w] || /\d/.test(w)) return w;
      if (CACHE_RAW[w] !== undefined) return CACHE_RAW[w];
      var max = w.length >= 9 ? 2 : 1, mejor = null, md = 9;
      for (var i = 0; i < RAWLIST.length; i++) {
        var v = RAWLIST[i]; if (Math.abs(v.length - w.length) > max || v.charAt(0) !== w.charAt(0)) continue;
        var d = dlPrev(w, v, max);
        if (d <= max && (d < md || (d === md && (Math.abs(v.length - w.length) < Math.abs(mejor.length - w.length) || (Math.abs(v.length - w.length) === Math.abs(mejor.length - w.length) && RAW[v] > RAW[mejor]))))) { mejor = v; md = d; }
      }
      CACHE_RAW[w] = mejor || w; return CACHE_RAW[w];
    }
    function corregirTexto(n) { return n.split(" ").map(corregirPalabra).join(" "); }

    /* ============================ entidades ============================ */
    var ALIAS = [];  /* {a: alias normalizado, t: 'sec'|'eje'|'amb', id, amb} */
    function addAlias(a, t, id, amb) { a = norm(a); if (a) ALIAS.push({ a: a, t: t, id: id, amb: amb }); }
    D.secretarias.forEach(function (s) { addAlias(s.nombre, "sec", s.carpeta); addAlias(s.corto, "sec", s.carpeta); });
    D.ejes.forEach(function (e) { addAlias(e.nombre, "eje", e.id); addAlias(e.oficial.replace(/^\d+\.\s*/, "").replace(/^MI COMPROMISO ES /, ""), "eje", e.id); });
    Object.keys(B.entidades.secretarias).forEach(function (c) { B.entidades.secretarias[c].forEach(function (a) { addAlias(a, "sec", c); }); });
    Object.keys(B.entidades.ejes).forEach(function (k) { B.entidades.ejes[k].forEach(function (a) { addAlias(a, "eje", +k); }); });
    (B.entidades.ambiguos || []).forEach(function (x) { addAlias(x.alias, "amb", x.alias, x); });
    var AMBM = {}; (B.entidades.ambiguos || []).forEach(function (x) { AMBM[norm(x.alias)] = x; });
    /* un alias de eje o secretaría idéntico a uno ambiguo cede ante el ambiguo */
    ALIAS = ALIAS.filter(function (x, i, arr) { return x.t === "amb" || !AMBM[x.a]; });
    var visto = {}; ALIAS = ALIAS.filter(function (x) { var k = x.t + "|" + x.a + "|" + x.id; if (visto[k]) return false; visto[k] = 1; return true; });
    ALIAS.sort(function (a, b) { return b.a.length - a.a.length; });
    var NUMS = B.entidades.numeros || {};
    var ORG_INEXISTENTES = ["salud", "turismo", "movilidad", "transito", "juridica", "juridico", "personeria", "contraloria", "comisaria", "inspeccion", "mujer", "juventud", "seguridad", "infraestructura", "agricultura", "vivienda", "tic", "tecnologia", "comunicaciones", "control"];

    function hayLimites(s, i, len) {
      var ant = i === 0 ? " " : s.charAt(i - 1), sig = i + len >= s.length ? " " : s.charAt(i + len);
      return ant === " " && sig === " ";
    }
    function numPalabra(t) { if (/^\d+$/.test(t)) return +t; return NUMS[t] || null; }

    function extraerEntidades(n) {
      var s = " " + n + " ", marcas = [], ents = { secs: [], ejes: [], metas: [], amb: [], anios: [], tris: [], desconocida: null };
      function tomar(a, b, tipo, valor, extra) { marcas.push({ a: a, b: b, tipo: tipo, valor: valor, extra: extra }); s = s.slice(0, a) + new Array(b - a + 1).join("#") + s.slice(b); }
      var m, re;
      /* ejes por número: «eje 3», «ejes 2 y 3», «tercer eje» */
      re = /\b(?:eje|ejes)\s+(?:numero\s+|num\s+|no\s+|nro\s+)?(\d{1,2}|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)(?:\s+(?:y|con|vs|contra|o|frente a)\s+(?:el eje\s+)?(\d{1,2}|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez))?\b/g;
      while ((m = re.exec(s))) {
        var a0 = numPalabra(m[1]);
        if (a0 != null && !ejeBy[a0] && ents.ejeInvalido == null) { ents.ejeInvalido = a0; tomar(m.index, m.index + m[0].length, "eje", []); re.lastIndex = 0; continue; }
        var a = numPalabra(m[1]); if (a && ejeBy[a]) { var b2 = m[2] ? numPalabra(m[2]) : null; var ids = [a]; if (b2 && ejeBy[b2]) ids.push(b2); tomar(m.index, m.index + m[0].length, "eje", ids); re.lastIndex = 0; }
      }
      re = /\b(primer|segundo|tercer|cuarto|quinto|sexto|septimo|octavo|noveno|decimo)\s+eje\b/g;
      while ((m = re.exec(s))) { var o = numPalabra(m[1]); if (o && ejeBy[o]) { tomar(m.index, m.index + m[0].length, "eje", [o]); re.lastIndex = 0; } }
      /* códigos de meta */
      re = /\b(?:meta|metas|codigo|cod)\s*(?:compartida|cumplida|rezagada|no programada|en avance)?\s*(?:numero|num|no|nro|n)?\s*(\d{1,3})\b/g;
      while ((m = re.exec(s))) { tomar(m.index, m.index + m[0].length, "meta", m[1]); re.lastIndex = 0; }
      /* alias de secretarías y ejes, los más largos primero */
      ALIAS.forEach(function (al) {
        var from = 0, i;
        while ((i = s.indexOf(al.a, from)) >= 0) {
          if (hayLimites(s, i, al.a.length)) { tomar(i, i + al.a.length, al.t, al.t === "eje" ? [al.id] : al.id, al.amb); from = i + al.a.length; } else from = i + 1;
        }
      });
      /* años y trimestres */
      var ra = /\b(20\d\d)\b/g; while ((m = ra.exec(s))) ents.anios.push(+m[1]);
      var rt = /\bt([1-4])\b/g; while ((m = rt.exec(s))) ents.tris.push(+m[1]);
      var ro = /\b(primer|segundo|tercer|cuarto)\s+trimestre\b/g; while ((m = ro.exec(s))) ents.tris.push(numPalabra(m[1]));
      /* otras organizaciones que no son secretarías de este seguimiento */
      var rs = /\b(?:secretaria|secretarias|oficina|direccion|personeria|contraloria|comisaria|inspeccion|instituto)\s+(?:de\s+|del\s+|de la\s+)?([a-z]+)/g;
      while ((m = rs.exec(s))) { if (ORG_INEXISTENTES.indexOf(m[1]) >= 0) ents.desconocida = m[1]; }
      if (!ents.desconocida) { var ru = /\b(personeria|contraloria|comisaria|juridica|turismo|movilidad|transito|salud)\b/.exec(s); if (ru && !marcas.some(function (k) { return k.tipo === "sec"; })) ents.desconocida = ru[1]; }
      /* ordenar por posición y construir el texto con máscaras */
      marcas.sort(function (x, y) { return x.a - y.a; });
      var orig = " " + n + " ", out = "", pos = 0;
      var ctxEje = /\b(?:eje|ejes)\b/.test(orig), ctxSec = /\b(?:secretaria|secretarias|sec|dependencia|despacho)\b/.test(orig);
      marcas.forEach(function (k) {
        out += orig.slice(pos, k.a); pos = k.b;
        if (k.tipo === "meta") { ents.metas.push(k.valor); out += " xmeta "; }
        else if (k.tipo === "eje") { k.valor.forEach(function (v) { ents.ejes.push(v); }); out += " xeje "; }
        else if (k.tipo === "sec") { ents.secs.push(k.valor); out += " xsec "; }
        else {
          var amb = k.extra, elegido = null;
          if (ctxEje && !ctxSec) elegido = "eje"; else if (ctxSec && !ctxEje) elegido = "sec"; else if (amb.defecto) elegido = amb.defecto;
          if (elegido === "eje") { ents.ejes.push(amb.eje); out += " xeje "; }
          else if (elegido === "sec") { ents.secs.push(amb.sec); out += " xsec "; }
          else { ents.amb.push(amb); out += " xent "; }
        }
      });
      out += orig.slice(pos);
      out = out.replace(/\bsecretaria(?:s)?\s+(?:de\s+|del\s+|de la\s+)?(?=xsec)/g, " ").replace(/\b(?:eje|ejes)\s+(?:de la\s+|del\s+|de\s+)?(?=xeje)/g, " ").replace(/\bmeta\s+(?=xmeta)/g, " ");
      ents.ejes = unicos(ents.ejes); ents.secs = unicos(ents.secs);
      ents.masked = out.replace(/\s+/g, " ").replace(/^ +| +$/g, "");
      return ents;
    }

    /* ============================ tokenización ============================ */
    function tokensDe(masked, opciones) {
      var frasesTxt = aplicarFrases(masked), raw = frasesTxt.split(" ").filter(Boolean), out = [], conRelleno = [];
      raw.forEach(function (w) {
        w = PAL[w] || w;
        conRelleno.push(w);
      });
      var base = conRelleno.filter(function (w) { return !STOP[w]; });
      var sin = base.filter(function (w) { return !RELLENO[w]; });
      if (sin.length >= 3) sin = sin.filter(function (w) { return w !== "mostrar"; });
      var usar = sin.length ? sin : (base.length ? base : conRelleno);
      usar.forEach(function (w) { out.push(stem(w)); });
      return { tokens: out, crudo: conRelleno, frases: frasesTxt };
    }

    /* ============================ banco: índice BM25 ============================ */
    function qword(n) {
      n = " " + n + " ";
      if (/^ (cuanto|cuantas|cuantos|cuanta) /.test(n)) return "cuanto";
      if (/^ por que /.test(n)) return "porque";
      if (/^ cuando /.test(n)) return "cuando";
      if (/^ (que|qué) (es|son|significa|quiere|mide|representa|muestra|contiene|diferencia|pasa|tipo|utilidad|tiene|puedo|sabes|hay|veo|opcion|opciones|informes|metodologia|ley|norma)\b/.test(n)) return "que";
      if (/^ (que|qué) (meta|metas|secretaria|secretarias|eje|ejes|corte|cambio|tan|proporcion|porcentaje|cifra|dato)\b/.test(n)) return "quecosa";
      if (/^ como /.test(n)) return "como";
      if (/^ (cual|cuales) /.test(n)) return "cual";
      if (/^ donde /.test(n)) return "donde";
      if (/^ (quien|quienes) /.test(n)) return "quien";
      if (/^ (llevame|abre|abrir|ir|muestrame|dame|dime|exporta|descarga|imprime|pon|ponme|activa|cambia|quita|limpia|busca|compara|ordena|filtra|baja|encuentra|lista|hablame|resumeme|explicame|ayudame|invent\w*|supon\w*|ve) /.test(n)) return "imper";
      if (/^ (es|esta|hay|puedo|se puede|existe|funciona|tiene|sirve|usa|usas|eres|tienen|se ve|guardan|vale|cumple|inventas|se cuentan|toda|todas|los|las) /.test(n)) return "sino";
      return "otro";
    }
    var INT = B.intenciones, INTBY = {};
    var DOCS = [], DF = {}, POST = {}, avgdl = 0, VOCAB = {};
    INT.forEach(function (it, ix) { INTBY[it.id] = it; it._ix = ix; });
    INT.forEach(function (it, ix) {
      it.formulaciones.forEach(function (f, fi) {
        var e = extraerEntidades(norm(f)), t = tokensDe(e.masked).tokens;
        var tf = {}; t.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
        var di = DOCS.length; DOCS.push({ it: ix, fi: fi, tf: tf, len: t.length, set: Object.keys(tf), ord: t.join(" ") });
        (it._q = it._q || {})[qword(norm(f))] = 1;
        avgdl += t.length;
        Object.keys(tf).forEach(function (w) { DF[w] = (DF[w] || 0) + 1; (POST[w] = POST[w] || []).push(di); VOCAB[w] = (VOCAB[w] || 0) + 1; });
      });
    });
    avgdl = avgdl / DOCS.length;
    var NDOC = DOCS.length, IDF = {};
    Object.keys(DF).forEach(function (w) { IDF[w] = Math.log(1 + (NDOC - DF[w] + 0.5) / (DF[w] + 0.5)); });
    var VOCLIST = Object.keys(VOCAB);
    /* vocabulario de nombres de secretarías y ejes para no «corregirlos» */
    var PROPIOS = {};
    ALIAS.forEach(function (a) { a.a.split(" ").forEach(function (w) { PROPIOS[stem(w)] = 1; }); });
    function idf(w) { return IDF[w] != null ? IDF[w] : 0; }

    /* corrección ortográfica ligera (distancia de Damerau-Levenshtein) */
    function dl(a, b, max) {
      var la = a.length, lb = b.length; if (Math.abs(la - lb) > max) return max + 1;
      var d = [], i, j;
      for (i = 0; i <= la; i++) { d[i] = [i]; }
      for (j = 0; j <= lb; j++) d[0][j] = j;
      for (i = 1; i <= la; i++) for (j = 1; j <= lb; j++) {
        var c = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
      return d[la][lb];
    }
    var CACHE_ORT = {};
    function corregir(w) {
      if (VOCAB[w] || PROPIOS[w] || w.length < 5 || /\d/.test(w)) return w;
      if (CACHE_ORT[w] !== undefined) return CACHE_ORT[w];
      var max = w.length >= 8 ? 2 : 1, mejor = null, md = 9;
      for (var i = 0; i < VOCLIST.length; i++) {
        var v = VOCLIST[i]; if (v.length < 4 || Math.abs(v.length - w.length) > max) continue;
        if (max === 1 && v.charAt(0) !== w.charAt(0)) continue;
        var d = dl(w, v, max);
        if (d <= max && (d < md || (d === md && VOCAB[v] > VOCAB[mejor]))) { mejor = v; md = d; }
      }
      CACHE_ORT[w] = mejor || w; return CACHE_ORT[w];
    }

    var K1 = 1.2, BB = 0.75, OOVW = 2.2;
    function puntuar(qt, qw, fl) {
      fl = fl || {};
      var conEnt = qt.some(function (x) { return x === "xsec" || x === "xeje" || x === "xmeta"; });
      /* devuelve la mejor puntuación por intención y la lista de documentos */
      var qs = unicos(qt), sumQ = 0, i, w, ordQ = qt.join(" ");
      qs.forEach(function (x) { sumQ += POST[x] ? idf(x) : (/^x|\d/.test(x) ? 0 : OOVW); });
      var bm = {}, comp = {};
      qs.forEach(function (x) {
        var p = POST[x]; if (!p) return; var iw = idf(x);
        for (i = 0; i < p.length; i++) {
          var d = DOCS[p[i]], f = d.tf[x];
          bm[p[i]] = (bm[p[i]] || 0) + iw * (f * (K1 + 1)) / (f + K1 * (1 - BB + BB * d.len / avgdl));
          comp[p[i]] = (comp[p[i]] || 0) + iw;
        }
      });
      var porInt = {};
      Object.keys(bm).forEach(function (k) {
        var d = DOCS[k], sumD = 0; d.set.forEach(function (x) { sumD += idf(x); });
        var dice = sumQ + sumD > 0 ? 2 * comp[k] / (sumQ + sumD) : 0;
        var bn = sumQ > 0 ? Math.min(1, bm[k] / sumQ) : 0;
        var sc = 0.5 * dice + 0.5 * bn;
        if (d.ord === ordQ) sc += 0.08;
        var itq = INT[d.it]._q;
        if (qw && qw !== "otro" && itq && Object.keys(itq).length) sc += itq[qw] ? 0.05 : -0.05;
        if (qw && /^(como|que|porque|cuanto|quien|cuando|sino)$/.test(qw) && /^accion_/.test(INT[d.it].id)) sc -= 0.12;
        if (conEnt && INT[d.it].categoria === "navegacion" && !INT[d.it].handler) sc -= 0.25;
        var rq = INT[d.it].req; if (rq && !fl[rq]) sc -= 0.1;
        if (INT[d.it].id === "lim_eje_inexistente") sc += fl.ejeInvalido ? 0.2 : -0.4;
        if (INT[d.it].id === "lim_secretaria_inexistente") sc += fl.desconocida ? 0.2 : -0.4;
        var cur = porInt[d.it];
        if (!cur || sc > cur.sc) porInt[d.it] = { it: d.it, fi: d.fi, sc: sc, dice: dice };
      });
      var lista = Object.keys(porInt).map(function (k) { return porInt[k]; }).sort(function (a, b) { return b.sc - a.sc; });
      return lista;
    }

    /* ============================ sesión y contexto ============================ */
    var SESION = { mem: {} };
    function pagina(hash) {
      var h = String(hash || "").replace(/^#\/?/, "").split("?")[0], p = h.split("/").filter(Boolean), r = { ruta: p[0] || "", sec: null, eje: null, meta: null };
      if (p[0] === "secretarias" && p[1] && secBy[p[1]]) r.sec = p[1];
      if (p[0] === "ejes" && p[1] && ejeBy[+p[1]]) r.eje = +p[1];
      if (p[0] === "meta" && p[1] && p[2]) { r.meta = decodeURIComponent(p[2]); r.sec = secBy[p[1]] ? p[1] : null; }
      return r;
    }

    /* ============================ manejadores de datos ============================ */
    var H = {};
    function resp(texto, o) { o = o || {}; o.texto = texto; return o; }
    function enlaceSec(c) { return { texto: "Ficha de " + secCorto(c), hash: "#/secretarias/" + c }; }
    function enlaceEje(id) { return { texto: "Eje " + id, hash: "#/ejes/" + id }; }
    function enlaceMetas(o, t) { return { texto: t || "Ver estas metas en el explorador", hash: hashEx(o) }; }
    function qSec(c) { return "¿Cuál es el indicador de " + secCorto(c) + "?"; }

    /* alcance: la primera secretaría o eje mencionado; si falta, la memoria o la página */
    function alcance(q, tipo) {
      var s = q.ents.secs[0] || null, e = q.ents.ejes.length ? q.ents.ejes[0] : null;
      if (tipo === "sec") e = null; if (tipo === "eje") s = null;
      var heredado = false;
      if (!s && !e && q.pronombre) {
        if (q.pag.sec && tipo !== "eje") s = q.pag.sec; else if (q.pag.eje && tipo !== "sec") e = q.pag.eje;
        else if (q.mem.sec && tipo !== "eje") s = q.mem.sec; else if (q.mem.eje && tipo !== "sec") e = q.mem.eje;
        heredado = !!(s || e);
      }
      return { sec: s, eje: e, heredado: heredado };
    }
    function pideSec(q, que) {
      return resp("¿De cuál secretaría? " + (que || "") + "Las " + D.secretarias.length + " son: " + unir(D.secretarias.map(function (s) { return s.corto; })) + ".",
        { tipo: "aclaracion", pide: "sec", sugerencias: D.secretarias.slice(0, 3).map(function (s) { return qSec(s.carpeta); }) });
    }
    function pideEje(q) {
      return resp("¿De cuál eje? Los " + D.ejes.length + " ejes son: " + D.ejes.map(function (e) { return e.id + ". " + e.nombre; }).join("; ") + ".",
        { tipo: "aclaracion", pide: "eje", sugerencias: ["¿Cuál es el indicador del eje 1?", "¿Cuál es el indicador del eje 2?", "Ranking de ejes"] });
    }
    function filasAlcance(a) { return D.metas.filter(function (m) { return (!a.sec || m.car === a.sec) && (!a.eje || m.eje === a.eje); }); }
    function nombreAlcance(a) {
      if (a.sec && a.eje) return secCorto(a.sec) + " en el eje " + a.eje;
      if (a.sec) return "la " + secBy[a.sec].nombre; if (a.eje) return "el " + nombreEje(ejeBy[a.eje]); return "el Plan";
    }
    function memo(q, o) { q.nuevaMem = o; }

    H.ind_inst = function (q) {
      var I = D.inst, t, an = q.ents.anios;
      if (an.indexOf(CORTE.anterior) >= 0 && an.indexOf(CORTE.vigencia) < 0)
        t = "En " + CORTE.anterior + " el avance institucional fue " + p1(I.a2025) + " (vigencia cerrada). En " + CORTE.vigencia + " al corte es " + p1(I.a2026) + "; el indicador que acumula ambas vigencias es " + p1(I.ind) + ".";
      else if (an.indexOf(CORTE.vigencia) >= 0 && an.indexOf(CORTE.anterior) < 0)
        t = "El avance institucional de " + CORTE.vigencia + " al corte (" + CORTE.texto + ") es " + p1(I.a2026) + ". En " + CORTE.anterior + " fue " + p1(I.a2025) + " y el indicador que acumula ambas vigencias es " + p1(I.ind) + ".";
      else
        t = "El indicador institucional al corte del " + CORTE.texto + " es " + p1(I.ind) + ". Es la media simple de las " + I.n_sec + " secretarías sobre " + I.metas + " filas de meta. Avance " + CORTE.anterior + ": " + p1(I.a2025) + "; avance " + CORTE.vigencia + " al corte: " + p1(I.a2026) + ".";
      return resp(t, { datos: { indicador: I.ind, avance_2025: I.a2025, avance_2026: I.a2026, metas: I.metas, secretarias: I.n_sec }, enlaces: [{ texto: "Resumen ejecutivo", hash: "#/resumen" }],
        sugerencias: ["¿Qué secretaría tiene el mayor indicador?", "¿Cuántas metas están rezagadas?", "¿Cómo se calcula el indicador institucional?"] });
    };
    function textoSec(s, q) {
      var c = s.sem, pr = progDe(s), t = s.nombre + ": indicador " + p1(s.ind) + " al corte, con " + s.metas + " " + plural(s.metas, "meta", "metas") + " (" + frase(c) + "). Avance " + CORTE.anterior + ": " + p1(s.a2025) + "; " + CORTE.vigencia + " al corte: " + p1(s.a2026) + ".";
      var d = r1(s.ind - D.inst.ind);
      t += " " + (d >= 0 ? "Está " + Math.abs(d).toFixed(1) + " puntos por encima" : "Está " + Math.abs(d).toFixed(1) + " puntos por debajo") + " del indicador institucional (" + p1(D.inst.ind) + ").";
      if (pr <= 3) t += " Conviene tener presente que solo " + (pr === 1 ? "una meta está programada" : pr + " metas están programadas") + " al corte, por lo que cada una pesa mucho en su indicador.";
      return t;
    }
    H.ind_sec = function (q) {
      if (q.ents.secs.length && q.ents.ejes.length) return H.ind_eje(q);
      var a = alcance(q, "sec"); if (!a.sec) return pideSec(q);
      var s = secBy[a.sec]; memo(q, { sec: a.sec });
      return resp(textoSec(s, q), { datos: { secretaria: s.corto, indicador: s.ind, avance_2025: s.a2025, avance_2026: s.a2026, metas: s.metas, cumplida: s.sem.cumplida, en_avance: s.sem.en_avance, rezagada: s.sem.rezagada, no_programada: s.sem.no_programada },
        enlaces: [enlaceSec(a.sec), enlaceMetas({ sec: a.sec })],
        sugerencias: ["¿Cuántas metas rezagadas tiene " + s.corto + "?", "¿Dónde descargo el informe de " + s.corto + "?", "¿Qué metas tiene " + s.corto + "?"] });
    };
    H.ficha_sec = H.ind_sec;
    H.ind_eje = function (q) {
      if (q.ents.secs.length && q.ents.ejes.length) {
        var S0 = secBy[q.ents.secs[0]], E0 = ejeBy[q.ents.ejes[0]], R0 = filasAlcance({ sec: S0.carpeta, eje: E0.id }); memo(q, { sec: S0.carpeta, eje: E0.id });
        var base = "El portal no publica un indicador de secretaría por eje: publica el del eje completo y el de cada secretaría en todo el Plan. El indicador del eje " + E0.id + " es " + p1(E0.ind) + " y reúne a " + unir(E0.secretarias) + "; el de " + S0.corto + " en todo el Plan es " + p1(S0.ind) + ".";
        var t0 = R0.length ? S0.corto + " tiene " + R0.length + " " + plural(R0.length, "meta", "metas") + " en el eje " + E0.id + " (" + frase(conteo(R0)) + "). " + base : S0.corto + " no tiene metas en el eje " + E0.id + ". " + base;
        return resp(t0, { datos: { eje: E0.id, secretaria: S0.corto, indicador: E0.ind, indicador_secretaria: S0.ind, metas: R0.length, ind_sec_por_eje_publicado: false }, enlaces: [enlaceEje(E0.id), enlaceMetas({ sec: S0.carpeta, eje: String(E0.id) }, "Ver las metas de " + S0.corto + " en el eje " + E0.id)], sugerencias: ["¿Cuál es el indicador del eje " + E0.id + "?", qSec(S0.carpeta)] });
      }
      var a = alcance(q, "eje"); if (!a.eje) return pideEje(q);
      var e = ejeBy[a.eje]; memo(q, { eje: a.eje });
      var t = nombreEje(e) + ": indicador " + p1(e.ind) + " al corte, con " + e.metas + " metas (" + e.prog + " programadas; " + frase(e.sem) + "). Avance " + CORTE.anterior + ": " + p1(e.a2025) + "; " + CORTE.vigencia + " al corte: " + p1(e.a2026) + ". Participan " + unir(e.secretarias) + ".";
      return resp(t, { datos: { eje: e.id, indicador: e.ind, avance_2025: e.a2025, avance_2026: e.a2026, metas: e.metas, programadas: e.prog, cumplida: e.sem.cumplida, en_avance: e.sem.en_avance, rezagada: e.sem.rezagada, no_programada: e.sem.no_programada },
        enlaces: [enlaceEje(e.id), enlaceMetas({ eje: String(e.id) })], sugerencias: ["¿Cuántas metas rezagadas tiene el eje " + e.id + "?", "¿Qué secretarías participan en el eje " + e.id + "?", "Ranking de ejes"] });
    };
    H.ficha_eje = H.ind_eje;
    /* avance de una secretaría o un eje en UNA vigencia (2025 cerrada o 2026 al corte): cifras oficiales de la entidad, nunca las institucionales */
    H.avance_vig = function (q) {
      var an = q.ents.anios, ant = an.indexOf(CORTE.anterior) >= 0, x, nom, id = {};
      if (q.ents.secs.length) { x = secBy[q.ents.secs[0]]; nom = x.nombre; id.secretaria = x.corto; memo(q, { sec: x.carpeta }); } else { x = ejeBy[q.ents.ejes[0]]; nom = nombreEje(x); id.eje = x.id; memo(q, { eje: x.id }); }
      var v = ant ? x.a2025 : x.a2026, vig = ant ? CORTE.anterior : CORTE.vigencia, t;
      if (v == null || isNaN(v)) t = "En " + vig + " " + (q.ents.secs.length ? "la " : "el ") + nom + " no tiene metas programadas" + (ant ? "" : " al corte") + ", por eso no hay avance para mostrar. El indicador que acumula ambas vigencias es " + p1(x.ind) + ".";
      else t = "En " + vig + (ant ? " (vigencia cerrada)" : " al corte del " + CORTE.texto) + ", el avance de " + nom + " fue " + p1(v) + ". El indicador que acumula ambas vigencias es " + p1(x.ind) + "; el avance institucional de " + vig + " es " + p1(ant ? D.inst.a2025 : D.inst.a2026) + ".";
      var d = { vigencia: vig, avance: v, indicador: x.ind, institucional: ant ? D.inst.a2025 : D.inst.a2026 }; Object.keys(id).forEach(function (k) { d[k] = id[k]; });
      d[ant ? "avance_2025" : "avance_2026"] = v;
      return resp(t, { datos: d, enlaces: [q.ents.secs.length ? enlaceSec(x.carpeta) : enlaceEje(x.id)], sugerencias: [q.ents.secs.length ? qSec(x.carpeta) : "¿Cuál es el indicador del eje " + x.id + "?", "¿Qué diferencia hay entre avance e indicador?"] });
    };

    function estadosDe(q) { return unicos(q.estados); }
    H.conteo = function (q) {
      var a = alcance(q), es = estadosDe(q), rows, c, total, nom;
      if (a.sec && !a.eje) { c = secBy[a.sec].sem; total = secBy[a.sec].metas; }
      else if (a.eje && !a.sec) { c = ejeBy[a.eje].sem; total = ejeBy[a.eje].metas; }
      else if (a.sec && a.eje) { rows = filasAlcance(a); c = conteo(rows); total = rows.length; }
      else { c = D.inst.sem; total = D.inst.metas; }
      nom = a.sec || a.eje ? " en " + nombreAlcance(a) : " en el Plan";
      memo(q, { sec: a.sec, eje: a.eje, estado: es[0] || null });
      var datos = { total: total, cumplida: c.cumplida, en_avance: c.en_avance, rezagada: c.rezagada, no_programada: c.no_programada }, t;
      var filtro = { sec: a.sec || "", eje: a.eje ? String(a.eje) : "" };
      if (es.length) {
        var partes = es.map(function (k) { return c[k] + " " + plural(c[k], "meta " + ESTADO[k].et, "metas " + ESTADO[k].pl); });
        t = "Al corte del " + CORTE.texto + " hay " + unir(partes) + nom + " (de " + total + ").";
        if (es.indexOf("no_programada") >= 0) t += " Las no programadas no penalizan el indicador.";
        if (es.indexOf("rezagada") >= 0 && c.rezagada > 0) t += (c.rezagada === 1 ? " Es una señal" : " Son una señal") + " para acompañar con la secretaría.";
        filtro.est = es[0];
      } else {
        t = "Al corte del " + CORTE.texto + ", " + nom.replace(/^ en /, "en ") + " hay " + total + " metas: " + frase(c) + ".";
      }
      return resp(t, { datos: datos, enlaces: [enlaceMetas(filtro)], sugerencias: ["¿Cuáles son las metas rezagadas?", "¿Qué porcentaje de metas está cumplido?", "¿Qué secretaría tiene más metas rezagadas?"] });
    };
    H.pct_estado = function (q) {
      var a = alcance(q), es = estadosDe(q), c, total;
      if (a.sec && !a.eje) { c = secBy[a.sec].sem; total = secBy[a.sec].metas; } else if (a.eje && !a.sec) { c = ejeBy[a.eje].sem; total = ejeBy[a.eje].metas; }
      else if (a.sec && a.eje) { var rows = filasAlcance(a); c = conteo(rows); total = rows.length; } else { c = D.inst.sem; total = D.inst.metas; }
      if (!es.length) es = ["cumplida"];
      var k = es[0], pc = r1(100 * c[k] / total);
      memo(q, { sec: a.sec, eje: a.eje, estado: k });
      return resp("Las metas " + ESTADO[k].pl + " son " + c[k] + " de " + total + ", es decir " + p1(pc) + " del total" + (a.sec || a.eje ? " en " + nombreAlcance(a) : "") + ". Es un porcentaje de metas, distinto del indicador de avance.",
        { datos: { estado: k, cantidad: c[k], total: total, porcentaje: pc }, enlaces: [enlaceMetas({ est: k, sec: a.sec || "", eje: a.eje ? String(a.eje) : "" })], sugerencias: ["¿Cuántas metas están rezagadas?", "Dame un resumen del corte"] });
    };
    H.totales = function (q) {
      var a = alcance(q), Q = D.calidad;
      if (a.sec && !a.eje) { var s = secBy[a.sec]; memo(q, { sec: a.sec }); return resp(s.nombre + " tiene " + s.metas + " " + plural(s.metas, "meta", "metas") + ", de las cuales " + progDe(s) + " están programadas al corte.", { datos: { metas: s.metas, programadas: progDe(s) }, enlaces: [enlaceSec(a.sec), enlaceMetas({ sec: a.sec })], sugerencias: [qSec(a.sec), "¿Cuántas metas rezagadas tiene " + s.corto + "?"] }); }
      if (a.eje && !a.sec) { var e = ejeBy[a.eje]; memo(q, { eje: a.eje }); return resp(nombreEje(e) + " tiene " + e.metas + " metas, de las cuales " + e.prog + " están programadas al corte.", { datos: { metas: e.metas, programadas: e.prog }, enlaces: [enlaceEje(a.eje), enlaceMetas({ eje: String(a.eje) })], sugerencias: ["¿Cuál es el indicador del eje " + a.eje + "?"] }); }
      if (a.sec && a.eje) { var rows = filasAlcance(a); return resp(secCorto(a.sec) + " tiene " + rows.length + " metas en el eje " + a.eje + ".", { datos: { metas: rows.length }, enlaces: [enlaceMetas({ sec: a.sec, eje: String(a.eje) })] }); }
      return resp("El Plan tiene " + D.inst.metas + " filas de meta (una por secretaría responsable), que corresponden a " + Q.unicas + " metas únicas por código. Están a cargo de " + D.secretarias.length + " secretarías y organizadas en " + D.ejes.length + " ejes.",
        { datos: { registros: D.inst.metas, unicas: Q.unicas, secretarias: D.secretarias.length, ejes: D.ejes.length }, enlaces: [{ texto: "Explorador de metas", hash: "#/metas" }], sugerencias: ["¿Por qué hay más filas que metas únicas?", "¿Qué secretaría tiene más metas?"] });
    };
    H.lista_secs = function () {
      return resp("El seguimiento cubre " + D.secretarias.length + " secretarías: " + unir(D.secretarias.map(function (s) { return s.nombre; })) + ".",
        { datos: { n: D.secretarias.length, nombres: D.secretarias.map(function (s) { return s.corto; }) }, enlaces: [{ texto: "Secretarías", hash: "#/secretarias" }], sugerencias: ["Ranking de secretarías", "¿Qué secretaría tiene más metas?"] });
    };
    H.lista_ejes = function () {
      return resp("El Plan tiene " + D.ejes.length + " ejes estratégicos: " + D.ejes.map(function (e) { return e.id + ". " + e.nombre; }).join("; ") + ".",
        { datos: { n: D.ejes.length, nombres: D.ejes.map(function (e) { return e.nombre; }) }, enlaces: [{ texto: "Avance por eje", hash: "#/ejes" }], sugerencias: ["Ranking de ejes", "¿Qué eje tiene más metas?"] });
    };
    H.programadas = function (q) {
      var a = alcance(q), n, nom;
      if (a.sec && !a.eje) { n = progDe(secBy[a.sec]); nom = secBy[a.sec].nombre; } else if (a.eje && !a.sec) { n = ejeBy[a.eje].prog; nom = nombreEje(ejeBy[a.eje]); }
      else if (a.sec && a.eje) { n = filasAlcance(a).filter(function (m) { return m.s !== "no_programada"; }).length; nom = nombreAlcance(a); }
      else { n = D.inst.metas - D.inst.sem.no_programada; nom = "el Plan"; }
      return resp("En " + nom + " hay " + n + " metas programadas al corte; solo esas entran en el promedio del indicador.", { datos: { programadas: n }, enlaces: [enlaceMetas({ sec: a.sec || "", eje: a.eje ? String(a.eje) : "" })], sugerencias: ["¿Cuántas metas no están programadas?", "¿Qué es una meta no programada?"] });
    };

    function porIndicador(lista, campo) { return lista.slice().sort(function (x, y) { return y[campo] - x[campo]; }); }
    function campoVig(q) { var an = q.ents.anios; if (an.indexOf(CORTE.anterior) >= 0 && an.indexOf(CORTE.vigencia) < 0) return "a2025"; if (an.indexOf(CORTE.vigencia) >= 0 && an.indexOf(CORTE.anterior) < 0) return "a2026"; return "ind"; }
    var ETQ_CAMPO = { ind: "indicador", a2025: "avance de " + CORTE.anterior, a2026: "avance de " + CORTE.vigencia + " al corte" };
    H.extremo_sec = function (q) {
      var campo = campoVig(q), menor = q.menor || q.menos, ord = porIndicador(D.secretarias, campo), top = menor ? ord[ord.length - 1] : ord[0];
      var iguales = ord.filter(function (s) { return s[campo] === top[campo]; });
      var t = "La secretaría con el " + ETQ_CAMPO[campo] + (menor ? " más bajo" : " más alto") + " es " + unir(iguales.map(function (s) { return s.nombre; })) + " (" + p1(top[campo]) + ").";
      var otro = menor ? ord[0] : ord[ord.length - 1];
      t += " En el otro extremo está " + otro.corto + " (" + p1(otro[campo]) + ").";
      if (progDe(top) <= 3) t += " Conviene recordar que " + top.corto + " tiene pocas metas programadas, por lo que cada una pesa mucho; no es un juicio sobre su gestión.";
      else t += " Cada secretaría responde por metas distintas, así que el orden es una referencia, no una calificación.";
      return resp(t, { datos: { nombre: top.nombre, corto: top.corto, indicador: top[campo], campo: campo }, enlaces: [{ texto: "Secretarías", hash: "#/secretarias" }, enlaceSec(top.carpeta)], sugerencias: ["Ranking de secretarías", "¿Cómo se calcula el indicador de una secretaría?", "¿Qué secretaría tiene el menor indicador?"] });
    };
    H.extremo_eje = function (q) {
      var campo = campoVig(q), menor = q.menor || q.menos, ord = porIndicador(D.ejes, campo), top = menor ? ord[ord.length - 1] : ord[0];
      var iguales = ord.filter(function (e) { return e[campo] === top[campo]; });
      var t = "El eje con el " + ETQ_CAMPO[campo] + (menor ? " más bajo" : " más alto") + " es " + unir(iguales.map(nombreEje)) + " (" + p1(top[campo]) + "). En el otro extremo está " + nombreEje(menor ? ord[0] : ord[ord.length - 1]) + " (" + p1((menor ? ord[0] : ord[ord.length - 1])[campo]) + ").";
      return resp(t, { datos: { eje: top.id, nombre: top.nombre, indicador: top[campo], campo: campo }, enlaces: [{ texto: "Avance por eje", hash: "#/ejes" }, enlaceEje(top.id)], sugerencias: ["Ranking de ejes", "¿Por qué un eje puede tener un indicador mayor al institucional?"] });
    };
    H.ranking_sec = function (q) {
      var campo = campoVig(q), ord = porIndicador(D.secretarias, campo); if (q.menor) ord.reverse();
      return resp("Secretarías por " + ETQ_CAMPO[campo] + (q.menor ? " (de menor a mayor)" : " (de mayor a menor)") + ":\n" + ord.map(function (s, i) { return (i + 1) + ". " + s.corto + ": " + p1(s[campo]); }).join("\n") + "\nEs una referencia para acompañar, no una calificación: cada secretaría responde por metas distintas.",
        { datos: { orden: ord.map(function (s) { return { nombre: s.corto, indicador: s[campo] }; }) }, enlaces: [{ texto: "Secretarías", hash: "#/secretarias" }], sugerencias: ["¿Por qué las secretarías pesan igual?", "Ranking de ejes"] });
    };
    H.ranking_eje = function (q) {
      var campo = campoVig(q), ord = porIndicador(D.ejes, campo); if (q.menor) ord.reverse();
      return resp("Ejes por " + ETQ_CAMPO[campo] + (q.menor ? " (de menor a mayor)" : " (de mayor a menor)") + ":\n" + ord.map(function (e, i) { return (i + 1) + ". Eje " + e.id + " " + e.nombre + ": " + p1(e[campo]); }).join("\n"),
        { datos: { orden: ord.map(function (e) { return { eje: e.id, indicador: e[campo] }; }) }, enlaces: [{ texto: "Avance por eje", hash: "#/ejes" }], sugerencias: ["Ranking de secretarías", "¿Qué eje tiene el menor indicador?"] });
    };
    H.extremo_estado = function (q) {
      var es = estadosDe(q), k = es[0];
      if (!k) return resp("¿De qué estado? Puedo decirte dónde hay más metas cumplidas, en avance, rezagadas o no programadas.", { tipo: "aclaracion", pide: "estado", sugerencias: ["¿Qué secretaría tiene más metas rezagadas?", "¿Qué secretaría tiene más metas cumplidas?", "¿Qué eje tiene más metas no programadas?"] });
      var porEje = q.tokens.indexOf("eje") >= 0 || q.ents.ejes.length > 0 && !q.ents.secs.length || /\beje\b|\bejes\b/.test(q.n);
      var lista = porEje ? D.ejes : D.secretarias, mn = q.menos;
      var ord = lista.slice().sort(function (x, y) { return mn ? x.sem[k] - y.sem[k] : y.sem[k] - x.sem[k]; }), top = ord[0];
      var iguales = ord.filter(function (x) { return x.sem[k] === top.sem[k]; });
      var nom = function (x) { return porEje ? nombreEje(x) : x.nombre; };
      var t = (porEje ? "El eje" : "La secretaría") + " con " + (mn ? "menos" : "más") + " metas " + ESTADO[k].pl + " es " + unir(iguales.map(nom)) + ", con " + top.sem[k] + " (de " + D.inst.sem[k] + " en total).";
      if (!mn) { var sig = ord.filter(function (x) { return x.sem[k] < top.sem[k] && x.sem[k] > 0; }); if (sig.length) { var nx = sig[0].sem[k], ig2 = sig.filter(function (x) { return x.sem[k] === nx; }); t += " Le " + plural(ig2.length, "sigue", "siguen") + " " + unir(ig2.map(nom)) + " con " + nx + "."; } }
      if (k === "rezagada") t += " Son metas para acompañar con la secretaría; no es una calificación.";
      return resp(t, { datos: { nombre: porEje ? top.nombre : top.corto, cantidad: top.sem[k], estado: k }, enlaces: [enlaceMetas({ est: k })], sugerencias: ["¿Cuáles son las metas " + ESTADO[k].pl + "?", "Ranking de secretarías"] });
    };

    /* cuántas secretarías (o en qué ejes) hay metas de un estado, con el desglose */
    H.dist_estado = function (q) {
      var k = estadosDe(q)[0], porEje = /\bejes\b/.test(q.n) && !/\bsecretarias\b/.test(q.n), lista = porEje ? D.ejes : D.secretarias;
      var con = lista.filter(function (x) { return x.sem[k] > 0; }).sort(function (a, b) { return b.sem[k] - a.sem[k]; });
      var nm = function (x) { return porEje ? "eje " + x.id : x.corto; }, tot = D.inst.sem[k];
      var t = con.length ? "Al corte hay metas " + ESTADO[k].pl + " en " + con.length + " de " + lista.length + (porEje ? " ejes" : " secretarías") + ": " + unir(con.map(function (x) { return nm(x) + " (" + x.sem[k] + ")"; })) + ". En total son " + tot + " " + plural(tot, "meta " + ESTADO[k].et, "metas " + ESTADO[k].pl) + " en el Plan."
        : "Ningún" + (porEje ? " eje" : "a secretaría") + " tiene metas " + ESTADO[k].pl + " al corte.";
      if (k === "rezagada" && con.length) t += " Son señales para acompañar con cada secretaría; no es una calificación.";
      if (k === "no_programada") t += " Las no programadas no penalizan el indicador.";
      return resp(t, { datos: { total: con.length, estado: k, metas: tot, nombres: con.map(function (x) { return porEje ? x.id : x.corto; }), detalle: con.map(function (x) { return { nombre: porEje ? x.id : x.corto, cantidad: x.sem[k] }; }) }, enlaces: [enlaceMetas({ est: k }), { texto: porEje ? "Avance por eje" : "Secretarías", hash: porEje ? "#/ejes" : "#/secretarias" }], sugerencias: ["¿Cuáles son las metas " + ESTADO[k].pl + "?", "Ranking de secretarías"] });
    };

    function listaMetasTexto(rows, max) {
      return rows.slice(0, max).map(function (m) { return m.cod + " (" + secCorto(m.car) + (m.s === "no_programada" ? "" : ", " + p1(m.ind)) + ")"; }).join("; ");
    }
    function ordCod(a, b) { return (+a.cod) - (+b.cod) || a.car.localeCompare(b.car); }
    H.rezagadas = function (q) {
      var a = alcance(q), rows = filasAlcance(a).filter(function (m) { return m.s === "rezagada"; }).sort(function (x, y) { return x.ind - y.ind || ordCod(x, y); });
      memo(q, { sec: a.sec, eje: a.eje, estado: "rezagada" });
      var ambito = a.sec || a.eje ? " en " + nombreAlcance(a) : "";
      var t = rows.length ? "Hay " + rows.length + " " + plural(rows.length, "meta rezagada", "metas rezagadas") + ambito + " al corte: " + listaMetasTexto(rows, 12) + ". Son metas para acompañar con la secretaría y revisar cronograma y soportes; no es un juicio sobre la gestión."
        : "No hay metas rezagadas" + ambito + " al corte del " + CORTE.texto + ".";
      return resp(t, { datos: { total: rows.length, rezagada: rows.length, codigos: rows.map(function (m) { return m.cod; }) }, enlaces: [enlaceMetas({ est: "rezagada", sec: a.sec || "", eje: a.eje ? String(a.eje) : "" }, "Ver las rezagadas en el explorador"), { texto: "Alertas", hash: "#/alertas" }],
        sugerencias: ["¿Por qué está rezagada la meta?", "¿Qué es una meta rezagada?", "¿Cuántas metas no programadas hay?"] });
    };
    H.noprog = function (q) {
      var a = alcance(q), rows = filasAlcance(a).filter(function (m) { return m.s === "no_programada"; }).sort(ordCod);
      var ambito = a.sec || a.eje ? " en " + nombreAlcance(a) : "";
      var t = "Hay " + rows.length + " metas no programadas" + ambito + " al corte" + (rows.length ? " (códigos: " + rows.map(function (m) { return m.cod; }).join(", ") + ")" : "") + ". No tienen programación hasta el corte, por eso no entran en el promedio y no penalizan.";
      return resp(t, { datos: { total: rows.length, no_programada: rows.length, codigos: rows.map(function (m) { return m.cod; }) }, enlaces: [enlaceMetas({ est: "no_programada", sec: a.sec || "", eje: a.eje ? String(a.eje) : "" }), { texto: "Alertas", hash: "#/alertas" }], sugerencias: ["¿Por qué las metas no programadas no penalizan?"] });
    };
    H.cumplidas = function (q) {
      var a = alcance(q), rows = filasAlcance(a).filter(function (m) { return m.s === "cumplida"; }).sort(ordCod);
      var ambito = a.sec || a.eje ? " en " + nombreAlcance(a) : "";
      var cert = rows.filter(function (m) { return D.cert.certificables.indexOf(m.id) >= 0; }).length;
      return resp("Hay " + rows.length + " metas cumplidas" + ambito + " (indicador de 100% o más); de ellas, " + cert + " son certificables. Puedes verlas completas en el explorador o en Logros.",
        { datos: { total: rows.length, cumplida: rows.length, certificables: cert }, enlaces: [enlaceMetas({ est: "cumplida", sec: a.sec || "", eje: a.eje ? String(a.eje) : "" }), { texto: "Logros y metas cumplidas", hash: "#/logros" }], sugerencias: ["¿Cuántas metas son certificables?", "¿Qué es una meta certificable?"] });
    };

    function marcasTxt(m) {
      var MARCA = { compartida: "meta compartida", arrastre: "sin programación " + CORTE.vigencia + " al corte (arrastre " + CORTE.anterior + ")", sobreejecucion: "ejecución superior a lo programado", ajuste25: "2025 tomado como 100 % por estar cumplida en 2026" };
      return (m.mk || []).map(function (k) { return MARCA[k] || k; });
    }
    function detalleMeta(m) {
      var t = "Meta " + m.cod + " · " + secCorto(m.car) + " · Eje " + m.eje + ": «" + m.m + "». Estado: " + ESTADO[m.s].et + ".";
      if (m.s === "no_programada") t += " No tiene programación acumulada al corte, por lo que no tiene indicador y no penaliza.";
      else t += " Indicador: " + p1(m.ind) + " (ejecutado acumulado " + nf(m.ea) + " de " + nf(m.pa) + " programado). Avance " + CORTE.anterior + ": " + (m.p25 > 0 ? p1(m.a25) : "sin programación") + "; " + CORTE.vigencia + " al corte: " + (m.p26 > 0 ? p1(m.a26) : "sin programación") + ".";
      var mk = marcasTxt(m); if (mk.length) t += " Etiquetas: " + mk.join("; ") + ".";
      return t;
    }
    H.meta = function (q) {
      var cod = q.ents.metas[0];
      if (cod == null && q.mem.meta && q.pronombre) cod = q.mem.meta;
      if (cod == null && q.pag.meta) cod = q.pag.meta;
      if (cod == null) return H.meta_texto(q);
      cod = String(+cod);
      var regs = metasPorCod[cod] || [];
      var avisoSec = "";
      if (q.ents.secs.length && regs.length) { var f = regs.filter(function (m) { return q.ents.secs.indexOf(m.car) >= 0; }); if (f.length) regs = f; else avisoSec = "La meta " + cod + " la reporta " + unir(regs.map(function (m) { return secCorto(m.car); })) + ", no " + unir(q.ents.secs.map(secCorto)) + ". "; }
      if (!regs.length) return resp("No encuentro la meta " + cod + " en el seguimiento. Los códigos de meta van de 1 a " + VARS.n.codmax + ". Si me das una palabra clave, puedo buscarla por texto.",
        { datos: { existe: false, codigo: cod }, tipo: "limite", enlaces: [{ texto: "Explorador de metas", hash: "#/metas" }], sugerencias: ["Busca la meta de vivienda", "¿Cuántas metas tiene el plan?"] });
      var m = regs[0]; memo(q, { meta: cod, sec: m.car });
      var t = avisoSec + regs.map(detalleMeta).join("\n");
      var es = estadosDe(q);
      if (es.length && regs.length === 1) t = (es.indexOf(m.s) >= 0 ? "Sí, la meta " + cod + " está " + ESTADO[m.s].et + ". " : "No: la meta " + cod + " está " + ESTADO[m.s].et + ". ") + t;
      if (regs.length > 1) t += "\nEs una meta compartida: la reportan " + regs.length + " secretarías.";
      var d = { existe: true, codigo: m.cod, secretaria: secCorto(m.car), eje: m.eje, estado: m.s, indicador: m.s === "no_programada" ? null : m.ind, programado_acumulado: m.pa, ejecutado_acumulado: m.ea, registros: regs.length }; if (avisoSec) d.sec_consultada_no_reporta = true;
      return resp(t, { datos: d, enlaces: regs.map(function (r) { return { texto: "Meta " + r.cod + (regs.length > 1 ? " · " + secCorto(r.car) : ""), hash: "#/meta/" + r.car + "/" + encodeURIComponent(r.cod) }; }), sugerencias: ["¿Cómo se calcula el indicador?", "¿Qué significan los colores?", "¿Por qué está rezagada la meta?"] });
    };
    var GENERICAS = { meta: 1, busca: 1, buscar: 1, hay: 1, alguna: 1, algun: 1, sobre: 1, tema: 1, habla: 1, hablan: 1, relacionada: 1, relacionadas: 1, relacionado: 1, existe: 1, existen: 1, encuentra: 1, que: 1, cual: 1, cuales: 1, mostrar: 1, ir: 1, plan: 1, pdm: 1, secretaria: 1, trata: 1, tiene: 1, tienen: 1, para: 1, por: 1, como: 1, donde: 1, quien: 1, cuanto: 1, indicador: 1, dato: 1, portal: 1, explorador: 1, noprog: 1, cumplida: 1, rezagada: 1, enavance: 1, hablar: 1, de: 1, en: 1 };
    var METAIDX = null;
    function indiceMetas() {
      if (METAIDX) return METAIDX;
      var df = {}, docs = D.metas.map(function (m) {
        var ws = unicos(norm(m.m).split(" ").filter(function (w) { return w.length > 2 && !STOP[w]; }).map(stem)); ws.forEach(function (w) { df[w] = (df[w] || 0) + 1; }); return { m: m, set: ws };
      });
      METAIDX = { docs: docs, df: df, n: docs.length }; return METAIDX;
    }
    H.meta_texto = function (q) {
      var ix = indiceMetas(), qs = unicos(norm(q.n).split(" ").filter(function (w) { return w.length > 2 && !STOP[w] && !GENERICAS[PAL[w] || w] && !GENERICAS[w] && !/^x/.test(w) && !/^\d+$/.test(w); }).map(function (w) { return stem(PAL[w] || w); }));
      qs = qs.filter(function (w) { return !GENERICAS[w] && !RELLENO[w]; });
      if (!qs.length) return resp("Dime una palabra clave y busco las metas que la mencionan, por ejemplo «vivienda» o «residuos». También puedes usar el buscador del explorador.", { tipo: "aclaracion", enlaces: [{ texto: "Explorador de metas", hash: "#/metas" }], sugerencias: ["Busca la meta de vivienda", "Detalle de la meta 14"] });
      var sc = ix.docs.map(function (d) {
        var s = 0, hit = 0; qs.forEach(function (w) { if (d.set.indexOf(w) >= 0) { s += Math.log(1 + ix.n / ix.df[w]); hit++; } else { /* coincidencia por prefijo */ for (var i = 0; i < d.set.length; i++) { if (w.length >= 4 && (d.set[i].indexOf(w) === 0 || w.indexOf(d.set[i]) === 0 && d.set[i].length >= 4)) { s += 0.7 * Math.log(1 + ix.n / (ix.df[d.set[i]] || 1)); hit++; break; } } } });
        return { m: d.m, s: s, hit: hit };
      }).filter(function (x) { return x.hit > 0; }).sort(function (a, b) { return b.hit - a.hit || b.s - a.s; });
      var buscado = qs.join(" ");
      if (!sc.length) return resp("No encuentro metas que mencionen «" + qs.join(" ") + "». Prueba con otra palabra o revisa el explorador, que busca por texto o código.",
        { tipo: "limite", datos: { total: 0 }, enlaces: [{ texto: "Explorador de metas", hash: "#/metas" }], sugerencias: ["¿Cuántas metas tiene el plan?", "Busca la meta de vivienda"] });
      var mejor = sc[0].hit; sc = sc.filter(function (x) { return x.hit === mejor; });
      var top = sc.slice(0, 5);
      var palabra = qs.slice().sort(function (a, b) { return b.length - a.length; })[0];
      var qtxt = norm(q.n).split(" ").filter(function (w) { return w.length > 2 && stem(PAL[w] || w) === palabra; })[0] || palabra;
      return resp("Encontré " + sc.length + " " + plural(sc.length, "meta relacionada", "metas relacionadas") + ": " + top.map(function (x) { return x.m.cod + " (" + secCorto(x.m.car) + "): " + (x.m.m.length > 90 ? x.m.m.slice(0, 88) + "…" : x.m.m); }).join("; ") + (sc.length > 5 ? ". Hay más en el explorador." : "."),
        { datos: { total: sc.length, codigos: top.map(function (x) { return x.m.cod; }) }, enlaces: top.slice(0, 3).map(function (x) { return { texto: "Meta " + x.m.cod, hash: "#/meta/" + x.m.car + "/" + encodeURIComponent(x.m.cod) }; }).concat([{ texto: "Buscar «" + qtxt + "» en el explorador", hash: hashEx({ q: qtxt }) }]),
          sugerencias: ["Detalle de la meta " + top[0].m.cod, "¿Cuántas metas tiene el plan?"] });
    };
    H.metas_sec = function (q) {
      var a = alcance(q, "sec"); if (!a.sec) return pideSec(q);
      var s = secBy[a.sec], rows = D.metas.filter(function (m) { return m.car === a.sec; }); memo(q, { sec: a.sec });
      return resp(s.nombre + " tiene " + s.metas + " " + plural(s.metas, "meta", "metas") + ": " + frase(s.sem) + ". Puedes verlas todas, con su estado, en el explorador.",
        { datos: { metas: s.metas, cumplida: s.sem.cumplida, en_avance: s.sem.en_avance, rezagada: s.sem.rezagada, no_programada: s.sem.no_programada }, enlaces: [enlaceMetas({ sec: a.sec }, "Ver las metas de " + s.corto), enlaceSec(a.sec)], sugerencias: [qSec(a.sec), "¿Cuántas metas rezagadas tiene " + s.corto + "?"] });
    };
    H.metas_eje = function (q) {
      var a = alcance(q, "eje"); if (!a.eje) return pideEje(q);
      var e = ejeBy[a.eje]; memo(q, { eje: a.eje });
      return resp(nombreEje(e) + " tiene " + e.metas + " metas (" + frase(e.sem) + "), a cargo de " + unir(e.secretarias) + ".",
        { datos: { metas: e.metas, programadas: e.prog }, enlaces: [enlaceMetas({ eje: String(e.id) }, "Ver las metas del eje " + e.id), enlaceEje(e.id)], sugerencias: ["¿Cuál es el indicador del eje " + e.id + "?", "¿Qué secretarías participan en el eje " + e.id + "?"] });
    };
    H.comparar = function (q) {
      var ss = q.ents.secs.slice(), ee = q.ents.ejes.slice();
      q.ents.amb.forEach(function (a) { if (!ee.length && a.sec && ss.indexOf(a.sec) < 0) ss.push(a.sec); else if (!ss.length && a.eje != null && ee.indexOf(a.eje) < 0) ee.push(a.eje); });
      if (ss.length === 1 && ss[0] !== "secretaria-general" && /\b(?:con|y|vs|contra|frente a)\s+(?:la\s+)?(?:secretaria\s+)?general\b/.test(q.n)) ss.push("secretaria-general");
      if (ss.length >= 2) {
        var A = secBy[ss[0]], Bb = secBy[ss[1]], d = r1(A.ind - Bb.ind);
        var t = "Comparación al corte:\n" + [A, Bb].map(function (s) { return "• " + s.nombre + ": indicador " + p1(s.ind) + ", " + s.metas + " metas (" + s.sem.rezagada + " rezagadas)."; }).join("\n") +
          "\nDiferencia: " + Math.abs(d).toFixed(1) + " puntos a favor de " + (d >= 0 ? A.corto : Bb.corto) + ". Cada secretaría responde por metas distintas, así que es una referencia y no una calificación.";
        if (d === 0) t = t.replace(/Diferencia: .*? a favor de .*?\./, "Ambas tienen el mismo indicador.");
        memo(q, { sec: ss[0] });
        return resp(t, { datos: { a: { nombre: A.corto, indicador: A.ind }, b: { nombre: Bb.corto, indicador: Bb.ind }, diferencia: Math.abs(d) }, enlaces: [enlaceSec(ss[0]), enlaceSec(ss[1])], sugerencias: ["Ranking de secretarías", "¿Qué secretarías están por encima del indicador institucional?"] });
      }
      if (ee.length >= 2) {
        var E1 = ejeBy[ee[0]], E2 = ejeBy[ee[1]], de = r1(E1.ind - E2.ind);
        return resp("Comparación al corte:\n" + [E1, E2].map(function (e) { return "• " + nombreEje(e) + ": indicador " + p1(e.ind) + ", " + e.metas + " metas (" + e.sem.rezagada + " rezagadas)."; }).join("\n") + "\nDiferencia: " + Math.abs(de).toFixed(1) + " puntos" + (de === 0 ? " (iguales)." : " a favor del eje " + (de >= 0 ? E1.id : E2.id) + "."),
          { datos: { a: { eje: E1.id, indicador: E1.ind }, b: { eje: E2.id, indicador: E2.ind }, diferencia: Math.abs(de) }, enlaces: [enlaceEje(E1.id), enlaceEje(E2.id)], sugerencias: ["Ranking de ejes"] });
      }
      if (ss.length === 1 || ee.length === 1) {
        if (/\b(institucional|promedio|plan|media|conjunto)\b/.test(q.n)) { if (!q.ents.secs.length && !q.ents.ejes.length) { if (ss.length) q.ents.secs.push(ss[0]); else q.ents.ejes.push(ee[0]); } return H.vs_inst(q); }
        var unaSec = ss.length === 1;
        return resp("Tengo " + (unaSec ? secBy[ss[0]].nombre : nombreEje(ejeBy[ee[0]])) + ", pero falta la otra parte de la comparación. ¿Con " + (unaSec ? "cuál secretaría" : "cuál eje") + " quieres compararla" + (unaSec ? "" : "") + "? Si prefieres, la comparo con el indicador institucional.",
          { tipo: "aclaracion", pide: unaSec ? "sec" : "eje", sugerencias: [unaSec ? "Compara " + secBy[ss[0]].corto + " con el institucional" : "Compara el eje " + ee[0] + " con el institucional", "Ranking de secretarías", "Ranking de ejes"] });
      }
      return resp("Dime qué quieres comparar: dos secretarías (por ejemplo «compara Gobierno con Hacienda») o dos ejes («compara el eje 2 y el eje 3»).", { tipo: "aclaracion", sugerencias: ["Compara Gobierno con Hacienda", "Compara el eje 2 y el eje 3", "Ranking de secretarías"] });
    };
    H.vs_inst = function (q) {
      var a = alcance(q); if (!a.sec && !a.eje) return H.sobre_inst(q);
      var x = a.sec ? secBy[a.sec] : ejeBy[a.eje], nom = a.sec ? x.nombre : nombreEje(x), d = r1(x.ind - D.inst.ind); memo(q, { sec: a.sec, eje: a.eje });
      var rel = d > 0 ? "por encima" : d < 0 ? "por debajo" : "igual";
      return resp(nom + " tiene un indicador de " + p1(x.ind) + ", " + (d === 0 ? "igual al institucional" : Math.abs(d).toFixed(1) + " puntos " + rel + " del institucional") + " (" + p1(D.inst.ind) + "). Recuerda que el institucional es la media simple de las " + D.secretarias.length + " secretarías.",
        { datos: { indicador: x.ind, institucional: D.inst.ind, diferencia: Math.abs(d), posicion: d > 0 ? "por_encima" : d < 0 ? "por_debajo" : "igual" }, enlaces: [a.sec ? enlaceSec(a.sec) : enlaceEje(a.eje)], sugerencias: ["¿Qué secretarías están por encima del indicador institucional?", "¿Cómo se calcula el indicador institucional?"] });
    };
    H.sobre_inst = function (q) {
      var porEje = /\beje\b|\bejes\b/.test(q.n), lista = porEje ? D.ejes : D.secretarias, I = D.inst.ind;
      var sobre = lista.filter(function (x) { return x.ind > I; }), bajo = lista.filter(function (x) { return x.ind < I; }), igual = lista.length - sobre.length - bajo.length;
      var nm = function (x) { return porEje ? "eje " + x.id : x.corto; };
      var t = (porEje ? "De los " : "De las ") + lista.length + (porEje ? " ejes" : " secretarías") + ", " + sobre.length + " superan el indicador institucional (" + p1(I) + "): " + unir(sobre.map(nm)) + "; " + bajo.length + " están por debajo: " + unir(bajo.map(nm)) + (igual ? "; " + igual + " igual" : "") + ". Es una referencia, no una calificación.";
      return resp(t, { datos: { por_encima: sobre.length, por_debajo: bajo.length, institucional: I }, enlaces: [{ texto: porEje ? "Avance por eje" : "Secretarías", hash: porEje ? "#/ejes" : "#/secretarias" }], sugerencias: ["Ranking de secretarías", "¿Cómo se calcula el indicador institucional?"] });
    };
    H.certificables = function (q) {
      var a = alcance(q), C = D.cert, ids = C.certificables.filter(function (i) { var m = metaBy[i]; return (!a.sec || m.car === a.sec) && (!a.eje || m.eje === a.eje); });
      var ambito = a.sec || a.eje ? " en " + nombreAlcance(a) : "";
      var t = "Hay " + ids.length + " " + plural(ids.length, "meta certificable", "metas certificables") + ambito + ": cumplieron lo programado y no tienen programación en " + CORTE.posteriores + ".";
      if (!a.sec && !a.eje) t += " Además, " + C.pend_unicas + " metas únicas (" + C.pendientes.length + " filas) van al 100% pero tienen programación posterior y se certifican al cierre.";
      return resp(t, { datos: { certificables: ids.length, pendientes_unicas: C.pend_unicas, pendientes_registros: C.pendientes.length }, enlaces: [{ texto: "Logros y metas cumplidas", hash: "#/logros" }], sugerencias: ["¿Cuántas metas están al 100% con programación posterior?", "¿Qué es una meta certificable?"] });
    };
    H.pendientes = function (q) {
      var C = D.cert;
      return resp("Hay " + C.pend_unicas + " metas únicas (" + C.pendientes.length + " filas) al 100% con programación posterior: se certifican cuando concluya " + CORTE.posteriores + ". Los certificables hoy son " + C.certificables.length + ".",
        { datos: { pendientes_unicas: C.pend_unicas, pendientes_registros: C.pendientes.length, certificables: C.certificables.length }, enlaces: [{ texto: "Logros y metas cumplidas", hash: "#/logros" }], sugerencias: ["¿Qué es una meta con T4 pendiente?", "¿Cuántas metas son certificables?"] });
    };
    H.compartidas = function (q) {
      var cs = D.compartidas, cod = q.ents.metas[0];
      if (cod != null) {
        var c = cs.filter(function (x) { return x.codigo === String(+cod); })[0];
        if (!c) return resp("La meta " + cod + " no figura como compartida: la reporta una sola secretaría (o no existe).", { datos: { compartida: false, codigo: String(+cod) }, enlaces: [{ texto: "Metas compartidas", hash: "#/compartidas" }] });
        return resp("La meta " + c.codigo + " es compartida por " + unir(c.registros.map(function (r) { return secCorto(r.carpeta); })) + ". " + (c.difiere ? "Los valores difieren entre secretarías (cada una reporta su parte) y se verifican con ellas." : "Los valores coinciden entre secretarías."),
          { datos: { compartida: true, codigo: c.codigo, secretarias: c.registros.length, difiere: c.difiere }, enlaces: [{ texto: "Metas compartidas", hash: "#/compartidas" }] });
      }
      var dif = cs.filter(function (x) { return x.difiere; }).length;
      return resp("Hay " + cs.length + " metas compartidas (códigos " + cs.map(function (x) { return x.codigo; }).join(", ") + "); en " + dif + " de ellas los valores difieren entre secretarías y se verifican con ellas. Por eso hay " + D.calidad.registros + " filas para " + D.calidad.unicas + " metas únicas.",
        { datos: { total: cs.length, difieren: dif, codigos: cs.map(function (x) { return x.codigo; }) }, enlaces: [{ texto: "Metas compartidas y calidad de dato", hash: "#/compartidas" }], sugerencias: ["¿Qué es una meta compartida?", "¿Por qué hay más filas que metas únicas?"] });
    };
    H.cambio = function (q) {
      var a = alcance(q), x = a.sec ? secBy[a.sec] : a.eje ? ejeBy[a.eje] : D.inst, nom = a.sec ? x.nombre : a.eje ? nombreEje(x) : "el institucional";
      var d = r1(x.a2026 - x.a2025), tend = d > 0 ? "sube" : d < 0 ? "baja" : "se mantiene";
      var t = "En " + nom + ", el avance pasa de " + p1(x.a2025) + " en " + CORTE.anterior + " (vigencia cerrada) a " + p1(x.a2026) + " en " + CORTE.vigencia + " al corte: " + (d === 0 ? "sin cambio" : Math.abs(d).toFixed(1) + " puntos " + (d > 0 ? "más" : "menos")) + ". Cada valor se mide frente a lo programado en su propio período; " + CORTE.vigencia + " va solo hasta " + CORTE.trimestre + ".";
      var datos = { avance_2025: x.a2025, avance_2026: x.a2026, diferencia: d };
      if (!a.sec && !a.eje) { var mejora = D.secretarias.filter(function (s) { return s.a2026 >= s.a2025; }).length; t += " " + mejora + " de las " + D.secretarias.length + " secretarías tienen un avance " + CORTE.vigencia + " igual o mayor al de " + CORTE.anterior + "."; datos.secretarias_igual_o_mayor = mejora; }
      memo(q, { sec: a.sec, eje: a.eje });
      return resp(t, { datos: datos, enlaces: [{ texto: "Avance por eje", hash: "#/ejes" }, { texto: "Resumen ejecutivo", hash: "#/resumen" }], sugerencias: ["¿Qué diferencia hay entre avance e indicador?", "¿Qué secretaría tiene el mayor indicador?"] });
    };
    H.corte = function () {
      return resp("Los datos tienen corte al " + CORTE.texto + " (" + CORTE.trimestre + " de " + CORTE.vigencia + "). El portal se generó el " + CORTE.generado + ". Lo programado para " + CORTE.posteriores + " aún no se cuenta.",
        { datos: { corte: CORTE.iso, texto: CORTE.texto, trimestre: CORTE.trimestre, generado: CORTE.generado }, sugerencias: ["¿Cada cuánto se actualiza el portal?", "¿Qué es el corte?"] });
    };
    H.fuentes = function () {
      return resp("Las cifras provienen de los reportes de avance de cada una de las " + D.secretarias.length + " secretarías, con corte al " + CORTE.texto + ", y del " + D.fuentes.anterior + " para la vigencia " + CORTE.anterior + ". El portal no recalcula nada: muestra las cifras oficiales y permite verificar su huella en Metodología y fuentes.",
        { datos: { fuente_2025: D.fuentes.anterior, secretarias: D.secretarias.length }, enlaces: [{ texto: "Metodología y fuentes", hash: "#/metodologia" }], sugerencias: ["¿Qué son las huellas de verificación?", "¿Quién alimenta los datos?"] });
    };
    H.sobre = function () {
      var Q = D.calidad.sobreejecucion;
      return resp("Hay " + Q.length + " metas con ejecución superior a lo programado: " + Q.map(function (s) { return s.codigo + " (" + secCorto(s.carpeta) + ", " + p1(s.indicador) + ")"; }).join("; ") + ". Se verifica con la secretaría que el ejecutado corresponda al período; siguen contando como cumplidas.",
        { datos: { total: Q.length, codigos: Q.map(function (s) { return s.codigo; }) }, enlaces: [{ texto: "Metas compartidas y calidad de dato", hash: "#/compartidas" }], sugerencias: ["¿Por qué hay valores mayores a 100%?"] });
    };
    H.arrastre = function () {
      var A = D.calidad.arrastre, t = {}; A.forEach(function (x) { t[x.tipo] = (t[x.tipo] || 0) + 1; });
      return resp("Hay " + A.length + " metas con marca de arrastre de " + CORTE.anterior + " (sin programación " + CORTE.vigencia + " al corte): " + (t.cumplida_por_2025 || 0) + " cumplidas con lo registrado en " + CORTE.anterior + ", " + (t.rezago_heredado || 0) + " con avance heredado de ese año y " + (t.ejecucion_sin_programacion || 0) + " con ejecución registrada sin programación. La marca es para dar transparencia a su lectura.",
        { datos: { total: A.length, cumplida_por_2025: t.cumplida_por_2025 || 0, rezago_heredado: t.rezago_heredado || 0, ejecucion_sin_programacion: t.ejecucion_sin_programacion || 0 }, enlaces: [{ texto: "Metas compartidas y calidad de dato", hash: "#/compartidas" }], sugerencias: ["¿Qué es el arrastre de 2025?"] });
    };
    H.mas_metas = function (q) {
      if (q.estados.length) return H.extremo_estado(q);
      var porEje = /\beje\b|\bejes\b/.test(q.n), lista = porEje ? D.ejes : D.secretarias, mn = q.menos;
      var ord = lista.slice().sort(function (a, b) { return mn ? a.metas - b.metas : b.metas - a.metas; }), top = ord[0], iguales = ord.filter(function (x) { return x.metas === top.metas; });
      return resp((porEje ? "El eje" : "La secretaría") + " con " + (mn ? "menos" : "más") + " metas es " + unir(iguales.map(function (x) { return porEje ? nombreEje(x) : x.nombre; })) + ", con " + top.metas + ".",
        { datos: { nombre: porEje ? top.nombre : top.corto, metas: top.metas }, enlaces: [{ texto: porEje ? "Avance por eje" : "Secretarías", hash: porEje ? "#/ejes" : "#/secretarias" }], sugerencias: ["Ranking de secretarías", "¿Cuántas metas tiene el plan?"] });
    };
    H.sin_rezago = function (q) {
      var porEje = /\beje\b|\bejes\b/.test(q.n), lista = porEje ? D.ejes : D.secretarias, ok = lista.filter(function (x) { return x.sem.rezagada === 0; });
      return resp("Sin metas rezagadas al corte hay " + ok.length + " de " + lista.length + (porEje ? " ejes: " : " secretarías: ") + unir(ok.map(function (x) { return porEje ? "eje " + x.id : x.corto; })) + ".",
        { datos: { total: ok.length, nombres: ok.map(function (x) { return porEje ? x.id : x.corto; }) }, enlaces: [{ texto: "Alertas", hash: "#/alertas" }], sugerencias: ["¿Cuáles son las metas rezagadas?"] });
    };
    H.secs_eje = function (q) {
      var a = alcance(q, "eje"); if (!a.eje) return pideEje(q);
      var e = ejeBy[a.eje]; memo(q, { eje: a.eje });
      return resp("En " + nombreEje(e) + " participan " + e.secretarias.length + " " + plural(e.secretarias.length, "secretaría", "secretarías") + ": " + unir(e.secretarias) + ".", { datos: { n: e.secretarias.length, secretarias: e.secretarias }, enlaces: [enlaceEje(e.id)], sugerencias: ["¿Cuál es el indicador del eje " + e.id + "?"] });
    };
    H.ejes_sec = function (q) {
      var a = alcance(q, "sec"); if (!a.sec) return pideSec(q);
      var set = {}; D.metas.forEach(function (m) { if (m.car === a.sec) set[m.eje] = 1; });
      var ids = Object.keys(set).map(Number).sort(function (x, y) { return x - y; }); memo(q, { sec: a.sec });
      return resp(secBy[a.sec].nombre + " tiene metas en " + ids.length + " " + plural(ids.length, "eje", "ejes") + ": " + unir(ids.map(function (i) { return i + " (" + ejeBy[i].nombre + ")"; })) + ".", { datos: { n: ids.length, ejes: ids }, enlaces: [enlaceSec(a.sec)], sugerencias: [qSec(a.sec)] });
    };
    H.meta_extremo = function (q) {
      var rows = D.metas.filter(function (m) { return m.s !== "no_programada"; }), mn = q.menor || q.menos || /\b(menor|peor|bajo|baja|minimo|atrasad[oa]|rezagad[oa]|inferior|lent[oa]|critic[oa])\b/.test(q.n);
      var mv = /(\d+(?:[.,]\d+)?)\s*%/.exec(q.texto) || /\b(?:con|en|de|igual a|del|al)\s+(\d+(?:[.,]\d+)?)\b/.exec(q.texto), vx = mv ? parseFloat(mv[1].replace(",", ".")) : (/\bcero\b/.test(q.n) ? 0 : null);
      if (vx != null && !isNaN(vx)) {
        var ig = rows.filter(function (m) { return Math.abs(m.ind - vx) < 0.05; }).sort(ordCod);
        var tx = ig.length ? "Al corte hay " + ig.length + " " + plural(ig.length, "meta", "metas") + " con indicador de " + p1(vx) + ": " + listaMetasTexto(ig, 12) + "." + (vx === 0 ? " Un 0% con programación al corte indica que aún no se registra ejecución; son metas para acompañar con la secretaría." : "") : "Al corte ninguna meta programada tiene un indicador de " + p1(vx) + ".";
        return resp(tx, { datos: { indicador: vx, codigos: ig.map(function (m) { return m.cod; }), total: ig.length }, enlaces: ig.slice(0, 3).map(function (m) { return { texto: "Meta " + m.cod, hash: "#/meta/" + m.car + "/" + encodeURIComponent(m.cod) }; }).concat([{ texto: "Ver las rezagadas", hash: hashEx({ est: "rezagada" }) }]), sugerencias: ["¿Cuáles son las metas rezagadas?", "¿Qué significa 0% en una meta?"] });
      }
      if (!mn && !q.mayor && !/\b(mayor|mejor|alto|alta|maximo|superior|adelantad[oa]|avanzad[oa]|sobresal\w*|top|cumplid\w*|destacad[oa]|mas)\b/.test(q.n))
        return resp("¿Buscas la meta con el indicador más alto o con el más bajo? También puedo mostrarte las metas con un valor exacto, por ejemplo «metas con 0%».", { tipo: "aclaracion", sugerencias: ["¿Cuál es la meta con el indicador más alto?", "¿Cuál es la meta con el indicador más bajo?", "¿Cuáles son las metas rezagadas?"] });
      var v = rows.reduce(function (acc, m) { return acc == null ? m.ind : (mn ? Math.min(acc, m.ind) : Math.max(acc, m.ind)); }, null);
      var top = rows.filter(function (m) { return m.ind === v; }).sort(ordCod);
      return resp("Entre las metas programadas al corte, el indicador " + (mn ? "más bajo" : "más alto") + " es " + p1(v) + ", en " + (top.length === 1 ? "la meta " : "las metas ") + listaMetasTexto(top, 8) + "." + (mn ? " Son metas para acompañar con la secretaría." : ""),
        { datos: { indicador: v, codigos: top.map(function (m) { return m.cod; }), total: top.length }, enlaces: top.slice(0, 2).map(function (m) { return { texto: "Meta " + m.cod, hash: "#/meta/" + m.car + "/" + encodeURIComponent(m.cod) }; }), sugerencias: ["¿Cuáles son las metas rezagadas?"] });
    };
    H.pocas_metas = function () {
      var ss = D.secretarias.filter(function (s) { return s.metas <= 3; });
      return resp("Tienen pocas metas: " + unir(ss.map(function (s) { return s.nombre + " (" + s.metas + ", de las cuales " + progDe(s) + " " + plural(progDe(s), "está programada", "están programadas") + ")"; })) + ". Como cada secretaría pesa igual en el indicador institucional, con pocas metas cada una influye mucho; no es un juicio sobre su gestión.",
        { datos: { n: ss.length, secretarias: ss.map(function (s) { return s.corto; }) }, enlaces: [{ texto: "Secretarías", hash: "#/secretarias" }], sugerencias: ["¿Cómo se calcula el indicador institucional?"] });
    };
    H.verificar = function (q) {
      var nums = (q.texto.match(/\d+(?:[.,]\d+)?/g) || []).map(function (x) { return parseFloat(x.replace(",", ".")); });
      var a = alcance(q), x, nom;
      if (a.sec) { x = secBy[a.sec]; nom = x.nombre; } else if (a.eje) { x = ejeBy[a.eje]; nom = nombreEje(x); } else { x = D.inst; nom = "institucional"; }
      var t, datos = { indicador: x.ind, institucional: D.inst.ind };
      if (/metas/.test(q.n) && !a.sec && !a.eje && !/indicador|porcentaje|avance/.test(q.n) && nums.length) { t = "Según el portal hay " + D.inst.metas + " filas de meta (" + D.calidad.unicas + " metas únicas); no puedo confirmar otro número."; datos = { registros: D.inst.metas, unicas: D.calidad.unicas }; }
      else if (/todo|todas/.test(q.n) && !nums.length) { t = "No: al corte hay " + D.inst.sem.cumplida + " metas cumplidas de " + D.inst.metas + "; el indicador institucional es " + p1(D.inst.ind) + "."; datos = { cumplida: D.inst.sem.cumplida, total: D.inst.metas, indicador: D.inst.ind }; }
      else { var igual = nums.some(function (v) { return Math.abs(v - x.ind) < 0.05; }); t = (igual ? "Sí coincide: " : "No coincide con lo que registra el portal: ") + (a.sec || a.eje ? "el indicador de " + nom : "el indicador institucional") + " es " + p1(x.ind) + " al corte del " + CORTE.texto + "."; datos.coincide = igual; }
      return resp(t, { datos: datos, enlaces: [{ texto: "Resumen ejecutivo", hash: "#/resumen" }], sugerencias: ["Dame un resumen del corte", "¿De dónde salen las cifras?"] });
    };
    H.resumen = function () {
      var I = D.inst, sc = VARS.sec_top, sb = VARS.sec_bot, et = VARS.eje_top, eb = VARS.eje_bot;
      return resp("Resumen al corte del " + CORTE.texto + ": el indicador institucional es " + p1(I.ind) + " (avance " + CORTE.anterior + " " + p1(I.a2025) + "; " + CORTE.vigencia + " al corte " + p1(I.a2026) + "). De las " + I.metas + " filas de meta, " + frase(I.sem) + ". La secretaría con mayor indicador es " + sc.corto + " (" + p1(sc.ind) + ") y el eje con mayor indicador es el " + et.id + " (" + p1(et.ind) + "). Las no programadas no penalizan.",
        { datos: { indicador: I.ind, avance_2025: I.a2025, avance_2026: I.a2026, metas: I.metas, cumplida: I.sem.cumplida, en_avance: I.sem.en_avance, rezagada: I.sem.rezagada, no_programada: I.sem.no_programada }, enlaces: [{ texto: "Resumen ejecutivo", hash: "#/resumen" }, { texto: "Alertas", hash: "#/alertas" }], sugerencias: ["¿Cuáles son las metas rezagadas?", "Ranking de secretarías", "¿Qué significan los colores?"] });
    };
    H.informes_anio = function (q) {
      var M = D.informes, gens = (M && M.general) || [];
      if (!gens.length) return resp("El catálogo de informes no está disponible en este momento; los archivos permanecen en la carpeta informes/.", { enlaces: [{ texto: "Informes", hash: "#/informes" }] });
      var an = q.ents.anios.length ? q.ents.anios : gens.map(function (g) { return g.anio; });
      var partes = [];
      gens.forEach(function (g) { if (an.indexOf(g.anio) < 0) return; partes.push(g.estado === "disponible" && g.informes.length ? "El informe general de " + g.anio + " está disponible (" + g.informes.map(function (i) { return i.titulo; }).join("; ") + ")." : "El informe general de " + g.anio + " aún no está disponible" + (g.nota ? ": " + g.nota : ".")); });
      var enl = [{ texto: "Informes", hash: "#/informes" }];
      gens.forEach(function (g) { if (an.indexOf(g.anio) >= 0 && g.estado === "disponible") g.informes.forEach(function (i) { if (i.archivos.pdf) enl.push({ texto: i.titulo + " (PDF)", hash: "", href: i.archivos.pdf.ruta }); }); });
      return resp(partes.join(" ") || "No hay informe general para ese año.", { datos: { anios: gens.map(function (g) { return { anio: g.anio, estado: g.estado }; }) }, enlaces: enl, sugerencias: ["¿Cómo descargo los informes?", "¿Dónde descargo el informe de Gobierno?"] });
    };
    H.informe_general = function () {
      var gens = (D.informes && D.informes.general) || [], g = gens.filter(function (x) { return x.estado === "disponible" && x.informes.length; })[0];
      if (!g) return H.informes_anio({ ents: { anios: [] } });
      var enl = [{ texto: "Página de informes", hash: "#/informes" }];
      g.informes.forEach(function (i) { if (i.archivos.docx) enl.push({ texto: i.titulo + " (Word, " + nf(i.archivos.docx.kb) + " KB)", hash: "", href: i.archivos.docx.ruta }); if (i.archivos.pdf) enl.push({ texto: i.titulo + " (PDF, " + nf(i.archivos.pdf.kb) + " KB)", hash: "", href: i.archivos.pdf.ruta }); });
      return resp("El informe general de " + g.anio + " está en la página Informes, en Word y PDF: " + g.informes.map(function (i) { return i.titulo; }).join("; ") + ". Te dejo los enlaces directos.",
        { datos: { anio: g.anio, informes: g.informes.length }, enlaces: enl, acciones: [{ tipo: "ir", hash: "#/informes" }], sugerencias: ["¿Hay informe general de 2025?", "¿Qué diferencia hay entre Word y PDF?"] });
    };
    H.informe_sec = function (q) {
      var a = alcance(q, "sec"); if (!a.sec) return pideSec(q, "Te ubico su informe. ");
      var s = secBy[a.sec], inf = s.informe || {}, enl = [{ texto: "Página de informes", hash: "#/informes" }, enlaceSec(a.sec)]; memo(q, { sec: a.sec });
      if (inf.docx) enl.push({ texto: "Informe de " + s.corto + " (Word, " + nf(inf.docx.kb) + " KB)", hash: "", href: inf.docx.ruta });
      if (inf.pdf) enl.push({ texto: "Informe de " + s.corto + " (PDF, " + nf(inf.pdf.kb) + " KB)", hash: "", href: inf.pdf.ruta });
      return resp("El informe de seguimiento de " + s.nombre + " (vigencia " + CORTE.vigencia + ") está en la página Informes, en " + (inf.docx && inf.pdf ? "Word y PDF" : inf.docx ? "Word" : inf.pdf ? "PDF" : "formato aún no disponible") + ". Te dejo los enlaces directos.",
        { datos: { secretaria: s.corto, docx: !!inf.docx, pdf: !!inf.pdf }, enlaces: enl, acciones: [{ tipo: "ir", hash: "#/informes" }], sugerencias: [qSec(a.sec), "¿Qué diferencia hay entre Word y PDF?"] });
    };
    H.nav_sec = function (q) {
      var a = alcance(q, "sec"); if (!a.sec) return pideSec(q, "Te llevo a su ficha. "); var s = secBy[a.sec]; memo(q, { sec: a.sec });
      return resp("Claro, te llevo a la ficha de " + s.nombre + ".", { enlaces: [enlaceSec(a.sec)], acciones: [{ tipo: "ir", hash: "#/secretarias/" + a.sec }], sugerencias: [qSec(a.sec), "¿Qué metas tiene " + s.corto + "?"] });
    };
    H.nav_eje = function (q) {
      var a = alcance(q, "eje"); if (!a.eje) return pideEje(q); var e = ejeBy[a.eje]; memo(q, { eje: a.eje });
      return resp("Claro, te llevo al " + nombreEje(e) + ".", { enlaces: [enlaceEje(e.id)], acciones: [{ tipo: "ir", hash: "#/ejes/" + e.id }], sugerencias: ["¿Cuál es el indicador del eje " + e.id + "?"] });
    };
    H.nav_meta = function (q) {
      var cod = q.ents.metas[0]; if (cod == null) return resp("¿A cuál meta? Dime su código, por ejemplo «llévame a la meta 14».", { tipo: "aclaracion", sugerencias: ["Llévame a la meta 14", "Busca la meta de vivienda"] });
      cod = String(+cod); var regs = metasPorCod[cod] || [];
      if (!regs.length) return resp("No encuentro la meta " + cod + ". Los códigos van de 1 a " + VARS.n.codmax + ".", { tipo: "limite", datos: { existe: false }, enlaces: [{ texto: "Explorador de metas", hash: "#/metas" }] });
      var m = regs[0]; memo(q, { meta: cod });
      return resp("Claro, te llevo a la meta " + cod + " (" + secCorto(m.car) + ").", { datos: { existe: true, codigo: cod }, enlaces: regs.map(function (r) { return { texto: "Meta " + r.cod + " · " + secCorto(r.car), hash: "#/meta/" + r.car + "/" + encodeURIComponent(r.cod) }; }), acciones: [{ tipo: "ir", hash: "#/meta/" + m.car + "/" + encodeURIComponent(m.cod) }], sugerencias: ["Detalle de la meta " + cod] });
    };
    function filtroDe(q) { var a = alcance(q), es = estadosDe(q); return { est: es[0] || "", sec: a.sec || "", eje: a.eje ? String(a.eje) : "" }; }
    H.nav_metas = function (q) {
      var f = filtroDe(q), partes = [];
      if (f.est) partes.push(ESTADO[f.est].pl); if (f.sec) partes.push("de " + secCorto(f.sec)); if (f.eje) partes.push("del eje " + f.eje);
      var filas = D.metas.filter(function (m) { return (!f.est || m.s === f.est) && (!f.sec || m.car === f.sec) && (!f.eje || String(m.eje) === f.eje); });
      var datos = { total: filas.length, codigos: filas.map(function (m) { return m.cod; }) }; if (f.est) datos[f.est] = filas.length;
      return resp("Te llevo al explorador con las metas" + (partes.length ? " " + partes.join(" ") : "") + " ya filtradas: coinciden " + filas.length + " " + plural(filas.length, "meta", "metas") + ".", { datos: datos, enlaces: [enlaceMetas(f)], acciones: [{ tipo: "ir", hash: hashEx(f) }], sugerencias: ["¿Cómo exporto a Excel?", "¿Cuántas metas están rezagadas?"] });
    };
    H.accion_csv = function (q) {
      var f = filtroDe(q);
      return resp("Preparo la exportación en CSV de las metas" + (f.est || f.sec || f.eje ? " con ese filtro" : "") + "; si no ves la descarga, abre el explorador y usa «Exportar CSV de lo filtrado».", { enlaces: [enlaceMetas(f, "Abrir el explorador")], acciones: [{ tipo: "ir", hash: hashEx(f) }, { tipo: "exportar_csv", filtros: f }], sugerencias: ["¿Cómo filtro las metas?"] });
    };
    H.accion_tema = function (q) {
      var t = /noche|oscur|dark|negro/.test(q.n) ? "dark" : /\bdia\b|claro|light|blanco/.test(q.n) ? "light" : "alternar";
      return resp(t === "dark" ? "Listo, activo el modo noche." : t === "light" ? "Listo, activo el modo día." : "Listo, cambio entre modo día y noche.", { acciones: [{ tipo: "tema", valor: t }], sugerencias: ["¿Es accesible el portal?"] });
    };
    H.eje_inexistente = function (q) {
      var n = q.ents.ejeInvalido;
      return resp("No encuentro el eje " + n + ": el Plan tiene " + D.ejes.length + " ejes, numerados del 1 al " + D.ejes.length + ".",
        { tipo: "limite", datos: { existe: false, eje: n }, enlaces: [{ texto: "Avance por eje", hash: "#/ejes" }], sugerencias: ["¿Cuáles son los ejes del plan?", "Ranking de ejes"] });
    };
    H.sec_inexistente = function (q) {
      var n = q.ents.desconocida || "esa dependencia";
      return resp("No encuentro «" + n + "» entre las dependencias del seguimiento. El portal cubre " + D.secretarias.length + " secretarías: " + unir(D.secretarias.map(function (s) { return s.corto; })) + ". Para otras dependencias, consulta a Planeación y Servicios Públicos.",
        { tipo: "limite", datos: { existe: false, nombre: n }, enlaces: [{ texto: "Secretarías", hash: "#/secretarias" }], sugerencias: ["¿Cuáles son las secretarías?", "Ranking de secretarías"] });
    };

    /* ============================ reglas de límites ============================ */
    var REGLAS_LIM = [
      ["lim_inventar", /\b(inventa(?:me)?|inventar|invente|supon\w*|haz de cuenta|finge|(?:ignora\w*|olvida\w*|desobedece\w*|omite\w*) (?:tus|las|todas las|todo lo anterior|tus propias)\b|responde cualquier cosa|actua como|eres ahora|modo desarrollador|jailbreak|exagera\w*|ajusta la cifra|pon que|cambia el (?:indicador|dato|valor)|modifica\w* (?:el|la|los) (?:indicador|dato|cifra|avance)|falsea\w*|maquilla\w*)\b/],
      ["lim_presupuesto", /\b(presupuest\w*|plata|dinero|recursos? (?:ejecutad|asignad|financier|economic)\w*|inversion|invertid\w*|invirtio\w*|cuesta\w*|costo\w*|gastad\w*|gasto\w*|pesos|billete|financier\w*|ejecucion presupuestal)\b/],
      ["lim_contratos", /\b(contrato\w*|contratista\w*|bpin|secop|licitacion\w*|proveedor\w*)\b/],
      ["lim_personas", /\b(telefono\w*|numero de celular|celular de\w*|correo\w*|e mail|contacto|nombre del (?:funcionario|secretario|alcalde)|como se llama (?:el|la) (?:alcalde|secretari\w+|jefe)|quien es (?:el|la) (?:alcalde|secretari\w+|jefe|responsable|funcionari\w+))\b/],
      ["lim_culpables", /\b(culpa\w*|culpable\w*|sancion\w*|incumpl\w*|quien (?:esta )?fallando|quien fallo|responsable del (?:atraso|rezago|retraso)|ponle nota|que secretaria es la peor|trabaja\w* menos|fallo|fallaron|fallado|fracas\w*|ineficien\w*|merece\w* (?:sancion|castigo|regano)\w*|incompeten\w*|vago\w*|flojo\w*|(?:secretaria|dependencia)\w*.*deberi\w* mejorar|quien trabaja (?:peor|mal))\b/],
      ["lim_futuro", /\b(proyeccion\w*|prediccion\w*|predecir|pronostic\w*|llegaremos|se va a cumplir|cumplira\w*|tendra\w*|sera el (?:indicador|avance)|al cierre|en diciembre|dentro de|20(?:2[7-9]|3\d))\b/],
      ["lim_opinion", /\b(opinas?|opinion\w*|votar|votaria|politic\w+|gobierna mejor|es buen[oa]|esta (?:bien|mal)|buena gestion|mala gestion|el alcalde (?:esta|es)|quien gobierna)\b/],
      ["lim_otros_municipios", /\b(otros? municipios?|cajica|zipaquira|sopo|chia|tocancipa|guatavita|sesquile|cundinamarca)\b/],
      ["lim_historico", /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|historic\w*|corte anterior|cortes anteriores|serie mensual|evolucion mensual|mes pasado|mes anterior|otras? vigencias?|(?:datos|informacion|cifras|avance|indicador|reporte)\w* (?:de|del|en) 20(?:0\d|1\d|2[0-4])|(?:hay|tienes|tienen|existen) .*20(?:0\d|1\d|2[0-4])|en 20(?:0\d|1\d|2[0-4]))\b/],
      ["lim_trimestre", /\b(t[12]|primer trimestre|segundo trimestre)\b/],
      ["lim_ubicacion", /\b(vereda\w*|barrio\w*|georreferenc\w*|ubicacion|mapa de (?:las )?obras|coordenadas)\b/],
      ["lim_tramites", /\b(tramite\w*|pqrs|predial|derecho de peticion|radicar|horario de la alcaldia|cita)\b/],
      ["lim_causas", /\b(caus[ao]\w*|motivo\w*|razon(?:es)? (?:del|de la|por)|por que (?:esta|va|quedo|hay|tiene|no)\w*(?:.*(?:rezag|atras|retras|rojo|lent|cumpl|avanz)\w*)|que paso con|a que se debe|que problema)\b/],
      ["lim_calidad_impacto", /\b(impacto|satisfaccion|calidad de vida|mejora la vida|bienestar)\b/],
      ["lim_normativa", /\b(ley \d+|articulo \d+|decreto|acuerdo municipal|fundamento legal|normatividad|normativ\w*|normas?)\b/],
      ["lim_editar", /\b(editar|corregir|subir (?:mi|el) reporte|cargar (?:mi|el|la) |actualizar el avance|modificar el avance)\b/]
    ];
    function reglasLimite(n) { var o = []; REGLAS_LIM.forEach(function (r) { if (r[1].test(n)) o.push(r[0]); }); return o; }

    /* ============================ clasificación ============================ */
    var UMBRAL_ALTO = 0.56, UMBRAL_BAJO = 0.34, MARGEN = 0.07;
    function canonica(it) { var f = it.formulaciones[0]; return /^¿/.test(f) ? f : (/[?¿]$/.test(f) ? f : f.charAt(0).toUpperCase() + f.slice(1)); }
    function preguntaDe(id) { var it = INTBY[id]; return it ? canonica(it) : id; }

    function analizar(texto, ctx) {
      var t = String(texto == null ? "" : texto).replace(/\s+/g, " ").trim().slice(0, 300);
      var n = corregirTexto(norm(t)).replace(/\bay\b/g, "hay"), ents = extraerEntidades(n);
      var pg0 = pagina(ctx && (ctx.hash || ctx.pagina)), mem0 = (ctx && ctx.mem) || {};
      /* deícticos: «esa secretaría», «ese eje», «esa meta» toman la entidad de la página o de la conversación */
      var dsec = /\b(?:esa|esta|dicha|aquella|misma) (?:secretaria|dependencia)\b|\bsu secretaria\b/, deje = /\b(?:ese|este|dicho|aquel|mismo) eje\b/, dmeta = /\b(?:esa|esta|dicha|aquella|misma) meta\b/;
      if (!ents.secs.length && dsec.test(ents.masked) && (pg0.sec || mem0.sec)) { ents.secs.push(pg0.sec || mem0.sec); ents.masked = ents.masked.replace(dsec, " xsec "); }
      if (!ents.ejes.length && deje.test(ents.masked) && (pg0.eje || mem0.eje)) { ents.ejes.push(pg0.eje || mem0.eje); ents.masked = ents.masked.replace(deje, " xeje "); }
      if (!ents.metas.length && dmeta.test(ents.masked) && (pg0.meta || mem0.meta)) { ents.metas.push(pg0.meta || mem0.meta); ents.masked = ents.masked.replace(dmeta, " xmeta "); }
      var tk = tokensDe(ents.masked), q = { texto: t, n: n, ents: ents, tokens: tk.tokens, crudo: tk.crudo, frases: tk.frases };
      var cr = tk.crudo;
      q.qw = qword(n);
      q.oov = ents.masked.split(" ").filter(function (w) { return w.length >= 5 && !/^x/.test(w) && !/\d/.test(w) && !ACEPTA[w] && !RAICES[stem(w)]; }).length;
      q.estados = []; cr.forEach(function (w) { var m = { cumplida: "cumplida", enavance: "en_avance", rezagada: "rezagada", noprog: "no_programada" }[w]; if (m) q.estados.push(m); });
      q.menor = cr.indexOf("menor") >= 0; q.mayor = cr.indexOf("mayor") >= 0;
      if (/\bmayor a menor\b|\bde mayor a menor\b|\bdescendente\b/.test(frasesTxtDe(tk))) { q.menor = false; q.ordenDesc = true; }
      if (/\bmenor a mayor\b|\bascendente\b/.test(frasesTxtDe(tk))) q.menor = true;
      q.menos = (/\bmenos\b/.test(n) && !q.ordenDesc && !/\bmenos a mas\b/.test(n)) || q.menor;
      q.pronombre = /\b(esa|esta|ese|este|esas|estos|ella|ellas|dicha|misma|su|sus|ahi|aqui|actual)\b/.test(n);
      q.pag = pagina(ctx && (ctx.hash || ctx.pagina)); q.mem = (ctx && ctx.mem) || {};
      /* corrección ortográfica de los términos desconocidos */
      q.tokens = q.tokens.map(corregir);
      return q;
    }
    function frasesTxtDe(tk) { return tk.frases; }
    function esSeguimiento(q) {
      var n = q.n, tieneEnt = q.ents.secs.length || q.ents.ejes.length || q.ents.metas.length || q.estados.length || q.ents.anios.length;
      var contenido = q.tokens.filter(function (w) { return !/^x/.test(w) && !/^\d+$/.test(w) && ["cumplid", "enavance", "rezagada", "noprog", "cumplida"].indexOf(w) < 0; });
      return !!(tieneEnt && (/^(y|pero|tambien|ahora|entonces|y si|que tal|y en|y para|y de)\b/.test(n) || contenido.length <= 1));
    }

    function mejores(q, max) {
      var lista = puntuar(q.tokens, q.qw, { sec: q.ents.secs.length > 0, eje: q.ents.ejes.length > 0, meta: q.ents.metas.length > 0, ejeInvalido: q.ents.ejeInvalido != null, desconocida: !!q.ents.desconocida });
      return lista.slice(0, max || 5).map(function (x) { return { it: INT[x.it], sc: x.sc, dice: x.dice, fi: x.fi }; });
    }

    var MANEJA_EJE = { ind_eje: 1, ficha_eje: 1, metas_eje: 1, secs_eje: 1, nav_eje: 1 };
    function tplAmbiguo(h, estado, kind, ent, a) {
      var X = kind === "sec" ? "la " + secBy[ent].nombre : "el eje " + ent + " (" + ejeBy[ent].nombre + ")";
      var Xc = kind === "sec" ? secBy[ent].corto : "el eje " + ent;
      if (h === "conteo" || h === "pct_estado") return "¿Cuántas metas " + (estado ? ESTADO[estado].pl : "hay") + " tiene " + Xc + "?";
      if (h === "rezagadas") return "¿Cuáles son las metas rezagadas de " + Xc + "?";
      if (h === "metas_sec" || h === "metas_eje") return "¿Qué metas tiene " + Xc + "?";
      if (h === "informe_sec") return "¿Dónde descargo el informe de " + Xc + "?";
      if (h === "nav_sec" || h === "nav_eje") return "Llévame a " + Xc;
      return kind === "sec" ? "¿Cuál es el indicador de " + Xc + "?" : "¿Cuál es el indicador del eje " + ent + "?";
    }
    function aclarar(q, h) {
      var a = q.ents.amb[0], opciones = [], kinds = [];
      if (a.sec) { kinds.push(["sec", a.sec]); } if (a.eje != null) { kinds.push(["eje", a.eje]); }
      var d = kinds.map(function (k) { return k[0] === "sec" ? "la " + secBy[k[1]].nombre : "el eje " + k[1] + " (" + ejeBy[k[1]].nombre + ")"; });
      var es = estadosDe(q)[0];
      return { tipo: "aclaracion", texto: "«" + cap(a.alias) + "» puede referirse a " + d.join(" o a ") + ". ¿Cuál prefieres?", sugerencias: kinds.map(function (k) { return tplAmbiguo(h, es, k[0], k[1]); }), enlaces: [], acciones: [] };
    }

    function respuestaIntencion(it, q, conf, ctx) {
      var base, r;
      if (it.handler) {
        var h = it.handler;
        /* la intención fija el tipo de entidad cuando el alias es ambiguo */
        if (q.ents.amb.length && !q.ents.secs.length && !q.ents.ejes.length) {
          var a = q.ents.amb[0];
          var ac = aclarar(q, h); return finalizar(ac, it, conf, q, ctx);
        }
        if (q.ents.desconocida && !q.ents.secs.length && h !== "sec_inexistente" && /sec|metas_sec|ficha|ind_sec|nav_sec|informe_sec|comparar|ejes_sec/.test(h)) { r = H.sec_inexistente(q); return finalizar(r, it, conf, q, ctx); }
        q.nuevaMem = null;
        r = H[h](q);
        if (q.nuevaMem && ctx) { var mem = ctx.mem = ctx.mem || {}; mem.h = h; mem.intencion = it.id; Object.keys(q.nuevaMem).forEach(function (k) { if (q.nuevaMem[k] != null) mem[k] = q.nuevaMem[k]; }); mem.estado = q.nuevaMem.estado || mem.estado; }
        else if (ctx && ctx.mem) { ctx.mem.h = h; ctx.mem.intencion = it.id; }
        return finalizar(r, it, conf, q, ctx);
      }
      r = { texto: llenar(it.respuesta), enlaces: it.enlaces.map(function (e) { var hh = llenar(e.hash); return { texto: e.texto, hash: /^#/.test(hh) ? hh : "", href: hh }; }), acciones: copia(it.acciones || []) };
      (r.acciones || []).forEach(function (a) { if (a.hash) a.hash = llenar(a.hash); });
      if (ctx) { ctx.mem = ctx.mem || {}; ctx.mem.intencion = it.id; if (!/^conversacion$/.test(it.categoria)) ctx.mem.h = ctx.mem.h; }
      return finalizar(r, it, conf, q, ctx);
    }
    function finalizar(r, it, conf, q, ctx) {
      var sug = r.sugerencias && r.sugerencias.length ? r.sugerencias.slice() : it.sugerencias.map(preguntaDe);
      if (sug.length < 2) INT.length && it.sugerencias.map(preguntaDe).forEach(function (s) { if (sug.indexOf(s) < 0) sug.push(s); });
      sug = unicos(sug).filter(function (s) { return norm(s) !== norm(q.texto); }).slice(0, 3);
      if (sug.length < 2) B.por_pagina.defecto.map(preguntaDe).forEach(function (s) { if (sug.length < 3 && sug.indexOf(s) < 0 && norm(s) !== norm(q.texto)) sug.push(s); });
      var out = {
        tipo: r.tipo || it.tipo, texto: llenarSeguro(r.texto), enlaces: (r.enlaces && r.enlaces.length ? r.enlaces : it.enlaces.map(function (e) { var hh = llenar(e.hash); return { texto: e.texto, hash: /^#/.test(hh) ? hh : "", href: hh }; })).map(function (e) { return { texto: e.texto, hash: e.hash || "", href: e.href || e.hash || "" }; }),
        acciones: r.acciones || [], sugerencias: sug, confianza: Math.round(conf * 100) / 100, intencion: it.id, categoria: it.categoria
      };
      if (r.datos) out.datos = r.datos; if (r.pide) out.pide = r.pide; if (r.alternativas) out.alternativas = r.alternativas;
      if (out.tipo === "datos" && it.handler && q.ents.amb.length === 0) out.entidades = { secretarias: q.ents.secs.slice(), ejes: q.ents.ejes.slice(), metas: q.ents.metas.slice(), estados: unicos(q.estados) };
      return out;
    }
    function llenarSeguro(t) { return llenar(t); }

    /* ¿pregunta de seguimiento? (p. ej. «¿y la de Hacienda?») */
    function intentarSeguimiento(q, ctx) {
      var mem = ctx && ctx.mem; if (!mem || !mem.h || !H[mem.h]) return null;
      if (!esSeguimiento(q) || q.ents.metas.length && mem.h !== "meta") return null;
      var it = INTBY[mem.intencion]; if (!it) return null;
      /* hereda lo que no se menciona */
      var nuevo = q.ents;
      if (!nuevo.secs.length && !nuevo.ejes.length && mem.sec && /sec|conteo|rezagadas|noprog|cumplidas|pct|certificables|programadas|extremo_estado/.test(mem.h) && !nuevo.metas.length && nuevo.anios.length + q.estados.length > 0) nuevo.secs.push(mem.sec);
      if (!nuevo.secs.length && !nuevo.ejes.length && mem.eje && /eje|conteo|rezagadas|pct/.test(mem.h) && !nuevo.metas.length && nuevo.anios.length + q.estados.length > 0) nuevo.ejes.push(mem.eje);
      if (!q.estados.length && mem.estado && /conteo|pct_estado/.test(mem.h) && (nuevo.secs.length || nuevo.ejes.length)) q.estados.push(mem.estado);
      var h = mem.h;
      /* si el seguimiento cambia de tipo de entidad, ajusta el manejador */
      if (nuevo.ejes.length && !nuevo.secs.length) { if (h === "ind_sec" || h === "ficha_sec") h = "ind_eje"; else if (h === "metas_sec") h = "metas_eje"; else if (h === "ejes_sec") h = "secs_eje"; else if (h === "nav_sec") h = "nav_eje"; }
      if (nuevo.secs.length && !nuevo.ejes.length) { if (h === "ind_eje" || h === "ficha_eje") h = "ind_sec"; else if (h === "metas_eje") h = "metas_sec"; else if (h === "secs_eje") h = "ejes_sec"; else if (h === "nav_eje") h = "nav_sec"; }
      if (h === "meta" && !nuevo.metas.length) return null;
      var it2 = it.handler === h ? it : INT.filter(function (x) { return x.handler === h; })[0] || it;
      var r = respuestaIntencion(it2, q, 0.8, ctx); r.seguimiento = true; return r;
    }

    var QPREG = { cuando: 1, cuanto: 1, porque: 1, que: 1, quecosa: 1, como: 1, cual: 1, donde: 1, quien: 1 };
    function social(q) {
      if (QPREG[q.qw] || q.ents.secs.length || q.ents.ejes.length || q.ents.metas.length || q.n.length > 70) return null;
      var resto = q.n.replace(/\b(muchisimas|muchas|mil|infinitas|super|vale|genial|perfecto|excelente|listo|por|tu|su|la|el|de|que|me|te|lo|ayuda|ayudar|nemequi|todo|colaboracion|amable|amables|atencion)\b/g, " ").replace(/\s+/g, " ").trim();
      if (/\b(gracias|agradezc\w*|agradecid\w*|agradezco)\b/.test(q.n) && resto.split(" ").length <= 3) return "gracias";
      if (/\b(adios|chao|hasta luego|hasta pronto|nos vemos|me voy|me despido|bye|hasta manana|hasta la proxima)\b/.test(q.n) && q.n.split(" ").length <= 7) return "despedida";
      return null;
    }
    var CONTEO_EST = { cumplida: "conteo_cumplidas", en_avance: "conteo_en_avance", rezagada: "conteo_rezagadas", no_programada: "conteo_no_programadas" };
    function reruteo(q, mejor) {
      if (!mejor) return null;
      var id = mejor.it.id, cat = mejor.it.categoria;
      /* «¿cómo va el indicador/plan/avance?» pregunta por el tablero, no por el estado de ánimo de NEMEQUI */
      if (id === "como_estas" && /\b(indicador|indicadores|plan|avance|avances|institucional|pdm|portal|tablero|alcaldia|corte|desarrollo)\b/.test(q.n) && !q.ents.secs.length && !q.ents.ejes.length) return "ind_inst";
      if (id === "lim_causas" && q.ents.metas.length && !/\b(por que|porque|causa\w*|motivo\w*|razon\w*|se debe|paso)\b/.test(q.n)) return "meta_detalle";
      if (id === "pagina_logros" && q.estados.length && q.estados.indexOf("cumplida") < 0) return "ver_metas_estado";
      if (q.ents.metas.length && !q.ents.ejes.length && mejor.it.handler && ["lista_secs", "lista_ejes", "verificar", "mas_metas", "totales", "resumen", "sin_rezago", "programadas", "sobre_inst", "ranking_sec", "ranking_eje", "extremo_sec", "extremo_eje", "pocas_metas"].indexOf(mejor.it.handler) >= 0) return /compartid/.test(q.n) ? "compartidas_datos" : "meta_detalle";
      if (q.ents.metas.length && (cat === "comprender" || cat === "funcionamiento" || cat === "metodologia" || cat === "fuentes" || cat === "conversacion")) return /compartid/.test(q.n) ? "compartidas_datos" : "meta_detalle";
      if (q.estados.length && q.qw === "cuanto" && ["total_metas", "pct_estado", "metas_programadas_n", "conteo_estados", "certificables_datos"].indexOf(id) >= 0 && !/porcentaje|proporcion|representa|por ciento|certific/.test(q.n)) return CONTEO_EST[q.estados[0]];
      if (cat === "conversacion" && id !== "gracias" && id !== "saludo" && (q.ents.secs.length || q.ents.ejes.length)) return q.ents.secs.length ? "ficha_sec" : "ficha_eje";
      if ((id === "ir_sec" || id === "ir_explorador") && q.estados.length) return "ver_metas_estado";
      if (/\b(porcentaje|proporcion|por ciento)\b/.test(q.n) && q.estados.length && /\bmetas?\b/.test(q.n) && ["no_programadas_lista", "rezagadas_lista", "cumplidas_lista", "conteo_estados", "conteo_cumplidas", "conteo_en_avance", "conteo_rezagadas", "conteo_no_programadas", "total_metas"].indexOf(id) >= 0) return "pct_estado";
      if (q.estados.length && /\b(significa|significado|definicion|definir|que es)\b/.test(" " + q.frases + " " + q.n + " ") && ["rezagadas_lista", "conteo_rezagadas", "no_programadas_lista", "conteo_no_programadas", "cumplidas_lista", "conteo_cumplidas", "conteo_en_avance", "conteo_estados"].indexOf(id) >= 0 && !q.ents.secs.length && !q.ents.ejes.length) return { cumplida: "que_es_cumplida", en_avance: "que_es_en_avance", rezagada: "que_es_rezagada", no_programada: "que_es_no_programada" }[q.estados[0]];
      return null;
    }
    /* ---- reglas de enrutamiento de preguntas frecuentes que el puntaje por similitud no resuelve bien (conteos por entidad, extremos con polaridad, vigencia por entidad) ---- */
    function conH(id, h) { var b = INTBY[id], o = {}, k; for (k in b) o[k] = b[k]; if (h) o.handler = h; return o; }
    function serv(id, h, q, ctx, conf) { return respuestaIntencion(conH(id, h), q, conf || 0.82, ctx); }
    function preRuta(q, ctx) {
      var n = q.n, E = q.ents, sing = q.estados.length ? q.estados[0] : null, sinEnt = !E.secs.length && !E.ejes.length && !E.metas.length;
      if (E.ejeInvalido != null || E.desconocida) return null;
      var plSec = /\bsecretarias\b/.test(n), plEje = /\bejes\b/.test(n), polar = /\b(mas|menos|mayor|menor|sin|ninguna|ningun|cero|no tienen|no hay|no presentan)\b/.test(n);
      /* cuántas secretarías / en qué ejes hay metas de un estado */
      if (sing && sinEnt && (plSec || plEje) && !polar && /^(cuantas|cuantos|en que|que|cuales|dime|dame|lista\w*|muestrame|donde)\b/.test(n)) return serv(CONTEO_EST[sing], "dist_estado", q, ctx);
      /* qué secretaría / eje tiene más o menos metas de un estado */
      if (sing && sinEnt && /\b(mas|menos|mayor|menor)\b/.test(n) && /\b(secretaria|secretarias|eje|ejes)\b/.test(n) && (/\bmetas\b/.test(n) || /\b(mas|menos) (cumplidas|rezagadas|no programadas|en avance)\b/.test(n)) && /^(que|cual|cuales)\b/.test(n)) return serv("extremo_estado", "extremo_estado", q, ctx);
      /* «cuántas metas rezagadas hay» (y variantes sin «están») */
      if (sing && q.qw === "cuanto" && !/\b(porcentaje|proporcion|representa|por ciento|certific\w*|umbral\w*|rango\w*|define|definicion|significa|criterio\w*|calcul\w*|desde|hasta|entre|secretarias|ejes|mas|menos|vigencia\w*|pasa|queda|falta|posterior\w*|pendiente\w*|t4|arrastre|sobreejecu\w*|compartid\w*)\b/.test(n) && (/\bmetas?\b/.test(n) || /^cuant[ao]s (cumplid|rezagad|no programad|en avance|sin programacion)/.test(n))) return serv(CONTEO_EST[sing], "conteo", q, ctx);
      /* el eje o la secretaría «más rezagado/a», «va peor»: extremo bajo del indicador, con tacto */
      if (sinEnt && !/\bmetas?\b/.test(n) && /\b(peor|atrasad[oa]|rezagad[oa]|mas bajo|menor avance|menos avance)\b/.test(n) && !q.ents.amb.length) {
        if (/\bsecretaria\b/.test(n)) { q.menor = true; return serv("menor_sec", "extremo_sec", q, ctx); }
        if (/\beje\b/.test(n)) { q.menor = true; return serv("menor_eje", "extremo_eje", q, ctx); }
      }
      /* la meta más atrasada / más baja */
      if (sinEnt && /\bmeta\b/.test(n) && /\b(mas (atrasad[oa]|rezagad[oa]|baja|lent[oa])|peor meta)\b/.test(n)) { q.menor = true; return serv("meta_extremo", "meta_extremo", q, ctx); }
      /* avance de una secretaría o un eje en una sola vigencia */
      var tiene25 = E.anios.indexOf(CORTE.anterior) >= 0, tiene26 = E.anios.indexOf(CORTE.vigencia) >= 0;
      if ((E.secs.length || E.ejes.length) && (tiene25 !== tiene26) && !E.metas.length && !sing && q.qw !== "cuanto" && !/\b(informe\w*|descarg\w*|pdf|word|docx|archivo\w*|metas|meta|certific\w*|compar\w*|cambio|cambia\w*)\b/.test(n)) return serv(E.secs.length ? "ind_sec" : "ind_eje", "avance_vig", q, ctx);
      /* «aplica filtro Gobierno» */
      if (/\b(aplica\w*|pon\w*|activa\w*|usa\w*|filtra\w*)\b/.test(n) && /\bfiltro\w*\b|\bfiltra\w*\b/.test(n) && !/\b(quita\w*|limpia\w*|borra\w*|elimina\w*)\b/.test(n) && (E.secs.length || E.ejes.length || sing)) return serv("ver_metas_estado", "nav_metas", q, ctx);
      return null;
    }
    function limiteTexto(id) { var it = INTBY[id]; return it ? llenar(it.respuesta) : ""; }

    function responder(texto, contexto) {
      var ctx = contexto || SESION; ctx.mem = ctx.mem || {};
      var t = String(texto == null ? "" : texto).trim();
      faltantes.length = 0;
      if (!t) {
        return { tipo: "conversacion", texto: "Escribe tu pregunta sobre el portal; por ejemplo: «¿cómo va el indicador institucional?» o «¿qué significa el semáforo?».", enlaces: [], acciones: [], sugerencias: sugerirInicio().sugerencias.slice(0, 3), confianza: 1, intencion: "vacio", categoria: "conversacion" };
      }
      var q = analizar(t, ctx), top = mejores(q, 5), mejor = top[0], seg = null;
      var soc = social(q); if (soc) return respuestaIntencion(INTBY[soc], q, 0.9, ctx);
      var rr = reruteo(q, mejor); if (rr && INTBY[rr]) { mejor = { it: INTBY[rr], sc: Math.max(mejor.sc, 0.7), dice: 1, fi: 0 }; top = [mejor].concat(top.filter(function (x) { return x.it.id !== rr; })); }
      var reglas = reglasLimite(q.n);
      if (q.ents.anios.length && q.ents.anios.every(function (y) { return y < CORTE.anterior; }) && !q.ents.metas.length && !/\b(pdm|periodo|cuatrienio)\b/.test(q.n)) return respuestaIntencion(INTBY.lim_historico, q, 0.8, ctx);
      if (!reglas.length) { var pr = preRuta(q, ctx); if (pr) return pr; }
      if (q.qw === "porque" && (q.ents.secs.length || q.ents.ejes.length || q.ents.metas.length) && reglas.indexOf("lim_causas") < 0 && !(mejor && mejor.it.categoria === "limites")) reglas.push("lim_causas");
      var esDatos = function (x) { return x && (x.it.categoria === "datos" || x.it.categoria === "navegacion") && x.it.handler; };
      /* entidades que no existen: nunca se inventa una cifra */
      if (q.ents.ejeInvalido != null && !q.ents.ejes.length && !reglas.length && (esDatos(mejor) || (mejor && mejor.sc < UMBRAL_ALTO))) return respuestaIntencion(INTBY.lim_eje_inexistente, q, 0.8, ctx);
      if (q.ents.desconocida && !q.ents.secs.length && !reglas.length && (esDatos(mejor) || (mejor && mejor.sc < UMBRAL_ALTO))) return respuestaIntencion(INTBY.lim_secretaria_inexistente, q, 0.8, ctx);
      /* alias ambiguo (p. ej. «social» puede ser secretaría o eje): se pide aclarar */
      if (q.ents.amb.length && !q.ents.secs.length && !q.ents.ejes.length && !reglas.length && mejor && (esDatos(mejor) || mejor.it.categoria === "conversacion" || mejor.sc < UMBRAL_ALTO)) {
        var hh = esDatos(mejor) ? mejor.it.handler : "ind_sec", ac = aclarar(q, hh);
        return finalizar(ac, INTBY[esDatos(mejor) ? mejor.it.id : "ficha_sec"], 0.6, q, ctx);
      }
      /* 1. seguimiento de la conversación */
      var soloEnt = !q.tokens.filter(function (w) { return !/^x/.test(w) && !/^\d+$/.test(w) && ["cumplida", "enavance", "rezagada", "noprog", "cumplid"].indexOf(w) < 0; }).length;
      if (!mejor || mejor.sc < UMBRAL_ALTO || soloEnt || /^(y|pero|tambien)\b/.test(q.n)) { seg = intentarSeguimiento(q, ctx); if (seg) return seg; }
      /* 2. solo una entidad: ficha */
      if (soloEnt && (q.ents.secs.length || q.ents.ejes.length || q.ents.metas.length) && (!mejor || mejor.sc < UMBRAL_ALTO)) {
        var idf = q.ents.metas.length ? "meta_detalle" : q.ents.secs.length ? "ficha_sec" : "ficha_eje";
        return respuestaIntencion(INTBY[idf], q, 0.7, ctx);
      }
      /* 3. límites por reglas */
      if (reglas.length) {
        var mejorEsLim = mejor && mejor.it.categoria === "limites";
        if (mejorEsLim && reglas.indexOf(mejor.it.id) < 0 && mejor.sc >= 0.85) reglas.unshift(mejor.it.id);
        var id = reglas[0];
        var alt = null, tipoEnt = q.ents.secs.length ? "sec" : q.ents.ejes.length ? "eje" : q.ents.metas.length ? "meta" : null;
        top.forEach(function (x) { if (!alt && x.it.categoria === "datos" && x.it.handler && x.sc >= 0.4 && (tipoEnt ? x.it.req === tipoEnt : (x.it.id === "ind_inst" || x.it.id === "resumen_general"))) alt = x; });
        var conector = /\b(y|ademas|tambien|pero)\b|,/.test(q.n);
        var conceptoFuerte = mejor && (mejor.it.categoria === "comprender" || mejor.it.categoria === "funcionamiento" || mejor.it.categoria === "metodologia") && mejor.sc >= 0.62 && id !== "lim_inventar";
        if (!conceptoFuerte) {
          var itl = INTBY[id], rl = respuestaIntencion(itl, q, Math.max(0.6, mejorEsLim ? mejor.sc : 0.6), ctx);
          if (alt && conector && id !== "lim_inventar") {
            var rd = respuestaIntencion(alt.it, q, alt.sc, ctx);
            if (rd.tipo === "datos") { rl.texto = rl.texto + " Lo que sí puedo mostrarte es esto: " + rd.texto; rl.datos = rd.datos; rl.enlaces = rd.enlaces.concat(rl.enlaces).slice(0, 4); rl.compuesta = true; }
          }
          return rl;
        }
      }
      if (!mejor) return fallback(q, top);
      if (!esDatos(mejor) && ((q.oov >= 2 && mejor.sc < 0.8) || (q.oov === 1 && mejor.sc < 0.66))) return fallback(q, top);
      /* 4. desambiguación entre intenciones cercanas */
      var seg2 = top[1];
      if (mejor.sc >= UMBRAL_ALTO) {
        return respuestaIntencion(mejor.it, q, mejor.sc, ctx);
      }
      if (mejor.sc >= UMBRAL_BAJO) {
        if (seg2 && mejor.sc - seg2.sc < MARGEN && seg2.it.categoria !== "conversacion" && seg2.it.id !== mejor.it.id && !(mejor.it.handler && mejor.it.handler === seg2.it.handler)) {
          return { tipo: "aclaracion", texto: "¿Te refieres a «" + canonica(mejor.it) + "» o a «" + canonica(seg2.it) + "»? Elige una y te respondo.", enlaces: [], acciones: [], sugerencias: [canonica(mejor.it), canonica(seg2.it)], alternativas: [mejor.it.id, seg2.it.id], confianza: Math.round(mejor.sc * 100) / 100, intencion: mejor.it.id, categoria: mejor.it.categoria };
        }
        return respuestaIntencion(mejor.it, q, mejor.sc, ctx);
      }
      return fallback(q, top);
    }
    function fallback(q, top) {
      var sug = [], vistos = {};
      top.forEach(function (x) { if (x.it.categoria === "conversacion" || vistos[x.it.id] || sug.length >= 3) return; vistos[x.it.id] = 1; sug.push(canonica(x.it)); });
      if (sug.length < 3) B.por_pagina.defecto.map(preguntaDe).forEach(function (s) { if (sug.length < 3 && sug.indexOf(s) < 0) sug.push(s); });
      return { tipo: "fallback", texto: "No estoy segura de haber entendido. ¿Quizá quisiste preguntar alguna de estas? Si lo que buscas no está en el portal, también puedo decírtelo.", enlaces: [], acciones: [], sugerencias: sug, confianza: top[0] ? Math.round(top[0].sc * 100) / 100 : 0, intencion: "fallback", categoria: "fallback" };
    }

    /* ============================ preguntas sugeridas ============================ */
    function sugerirInicio() {
      return { tipo: "conversacion", texto: llenar(INTBY.saludo.respuesta), sugerencias: B.inicio.map(preguntaDe), enlaces: [], acciones: [], intencion: "inicio", categoria: "conversacion", confianza: 1 };
    }
    function sugerirPagina(hash) {
      var pg = pagina(hash), clave = { resumen: "resumen", ejes: pg.eje ? "eje" : "ejes", secretarias: pg.sec ? "secretaria" : "secretarias", metas: "metas", meta: "meta", logros: "logros", alertas: "alertas", compartidas: "compartidas", informes: "informes", metodologia: "metodologia" }[pg.ruta] || "defecto";
      var ids = (B.por_pagina[clave] || B.por_pagina.defecto).slice();
      return ids.map(function (id) {
        var s = pg.sec && secBy[pg.sec] ? secBy[pg.sec].corto : "", e = pg.eje;
        if (pg.sec) { if (id === "ind_sec") return "¿Cuál es el indicador de " + s + "?"; if (id === "metas_sec") return "¿Qué metas tiene " + s + "?"; if (id === "informe_sec_dl") return "¿Dónde descargo el informe de " + s + "?"; if (id === "ejes_de_sec") return "¿En qué ejes tiene metas " + s + "?"; }
        if (e) { if (id === "ind_eje") return "¿Cuál es el indicador del eje " + e + "?"; if (id === "secs_de_eje") return "¿Qué secretarías participan en el eje " + e + "?"; if (id === "rezagadas_lista") return "¿Cuáles son las metas rezagadas del eje " + e + "?"; }
        return preguntaDe(id);
      });
    }
    function autocompletar(prefijo, max) {
      var p = norm(prefijo); if (p.length < 2) return [];
      var toks = p.split(" "), res = [];
      INT.forEach(function (it) {
        var c = canonica(it), nc = norm(c), ok = toks.every(function (w) { return nc.indexOf(w) >= 0; });
        if (ok && it.categoria !== "conversacion") res.push({ q: c, s: (nc.indexOf(p) === 0 ? 2 : nc.indexOf(p) > 0 ? 1 : 0) });
      });
      return res.sort(function (a, b) { return b.s - a.s; }).slice(0, max || 5).map(function (x) { return x.q; });
    }
    function estadisticas() {
      var por = {}; INT.forEach(function (it) { por[it.categoria] = (por[it.categoria] || 0) + 1; });
      return { intenciones: INT.length, formulaciones: DOCS.length, porCategoria: por, vocabulario: VOCLIST.length, faltantes: faltantes.slice() };
    }
    function nuevaSesion() { return { mem: {} }; }
    function marcadoresFaltantes() { return faltantes.slice(); }

    return {
      version: B.version, responder: responder, sugerirInicio: sugerirInicio, sugerirPagina: sugerirPagina, autocompletar: autocompletar, estadisticas: estadisticas,
      nuevaSesion: nuevaSesion, preguntaDe: preguntaDe, marcadoresFaltantes: marcadoresFaltantes, _analizar: analizar, _top: function (t) { var q = analizar(t, { mem: {} }); return { tokens: q.tokens, masked: q.ents.masked, top: mejores(q, 5).map(function (x) { return x.it.id + ":" + x.sc.toFixed(3) + ":" + x.it.formulaciones[x.fi]; }) }; }, _llenar: llenar, _norm: norm, _intenciones: INT, _vars: VARS
    };
  }

  /* ============================ instancia perezosa y exportación ============================ */
  var instancia = null;
  function obtener() {
    if (instancia) return instancia;
    var P = root.PDM, Bk = root.NEMEQUI_BANCO;
    if (!Bk && typeof require === "function") { try { Bk = require("../conocimiento/banco_preguntas.json"); } catch (e) { /* sin banco */ } }
    if (!P || !Bk) throw new Error("NemequiMotor: cargue data/datos.js y conocimiento/banco_preguntas.js antes de usar el motor");
    instancia = crear(P, Bk); return instancia;
  }
  var api = {
    crear: crear,
    cargar: function (P, Bk) { instancia = crear(P, Bk); return instancia; },
    listo: function () { try { obtener(); return true; } catch (e) { return false; } },
    responder: function (t, c) { return obtener().responder(t, c); },
    sugerirInicio: function () { return obtener().sugerirInicio(); },
    sugerirPagina: function (h) { return obtener().sugerirPagina(h); },
    autocompletar: function (p, n) { return obtener().autocompletar(p, n); },
    estadisticas: function () { return obtener().estadisticas(); },
    nuevaSesion: function () { return obtener().nuevaSesion(); }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root && typeof root === "object") root.NemequiMotor = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
