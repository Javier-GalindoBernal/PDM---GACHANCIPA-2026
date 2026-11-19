/* Registro anónimo de visitas.
   Envía a una hoja privada de Google Drive: fecha y hora (la pone el servidor), página, tipo de dispositivo,
   navegador, idioma, origen de la visita e identificador anónimo. Sin IP, sin nombre, sin ubicación.
   No muestra nada en pantalla. Si la dirección de registro está vacía, no hace nada. */
(function () {
  "use strict";
  var W = window, D = document, N = W.navigator;
  /* La dirección se completa al publicar el script de Google (ver 03_scripts/visitas/LEEME.md). */
  var CFG = W.PDM_VISITAS = W.PDM_VISITAS || { url: "https://script.google.com/macros/s/AKfycbyEgmW2OtTDLUV-XqrWBQms120PiGmWhpbwlqGpL3Kih0O9zzyAgeWKX6hlY2JsG1yB/exec", k: "pdm-gachancipa-2026-visitas-7f3a9c" };
  var K_ID = "pdm_vid";

  function dispositivo(ua, ancho, tactil) {
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || (/Macintosh/i.test(ua) && tactil > 1)) return "tableta";
    if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return "móvil";
    return ancho && ancho < 600 && tactil > 0 ? "móvil" : "escritorio";
  }
  function navegador(ua) {
    if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
    if (/EdgiOS|Edg\//i.test(ua)) return "Edge";
    if (/OPiOS|OPR\//i.test(ua)) return "Opera";
    if (/FxiOS|Firefox/i.test(ua)) return "Firefox";
    if (/CriOS|Chrome/i.test(ua)) return "Chrome";
    if (/Safari/i.test(ua)) return "Safari";
    return "otro";
  }
  /* Solo el nombre del sitio de origen, nunca la dirección completa. */
  function origen(ref, hostPropio, primera) {
    if (!primera) return "interno";
    if (!ref) return "directo";
    var h; try { h = new URL(ref).hostname.replace(/^www\./, ""); } catch (e) { return "directo"; }
    if (!h || h === hostPropio) return "interno";
    if (/(^|\.)(google|bing|duckduckgo|yahoo|ecosia|brave)\./i.test(h) || /search\.brave|yandex|baidu/i.test(h)) return "buscador (" + h.split(".").slice(-2, -1)[0] + ")";
    return "enlace (" + h + ")";
  }
  /* Solo la ruta del portal (p. ej. #/resumen); se descartan filtros y parámetros. */
  function pagina(hash) { return String(hash || "#/").split("?")[0].slice(0, 100) || "#/"; }

  function idAnonimo() {
    try {
      var id = localStorage.getItem(K_ID);
      if (!id) {
        var b = new Uint8Array(12); (W.crypto || W.msCrypto).getRandomValues(b);
        id = Array.prototype.map.call(b, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
        localStorage.setItem(K_ID, id);
      }
      return id;
    } catch (e) { return "sin-almacenamiento"; }
  }
  function armar(hash, ua, ref, primera, host, ancho, tactil) {
    return {
      k: CFG.k, id_anonimo: idAnonimo(), pagina: pagina(hash), dispositivo: dispositivo(ua, ancho, tactil),
      navegador: navegador(ua), idioma: String((N && N.language) || "").slice(0, 12), origen: origen(ref, host, primera)
    };
  }

  /* No se registra en pruebas locales ni si la persona pidió no ser rastreada. */
  function permitido() {
    var h = W.location.hostname;
    if (!CFG.url || !h || /^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(h) || W.location.protocol === "file:") return false;
    if (N && (N.doNotTrack === "1" || W.doNotTrack === "1" || N.globalPrivacyControl === true)) return false;
    return true;
  }

  var ultima = "", primera = true;
  function registrar() {
    try {
      var hash = pagina(W.location.hash);
      if (hash === ultima) return;           /* la misma página no se cuenta dos veces seguidas */
      ultima = hash;
      var datos = armar(hash, (N && N.userAgent) || "", D.referrer, primera, W.location.hostname, W.innerWidth, (N && N.maxTouchPoints) || 0);
      primera = false;
      if (!permitido()) return;
      var cuerpo = JSON.stringify(datos);
      /* text/plain evita la consulta previa (CORS) y Google lo acepta igual */
      if (N.sendBeacon && N.sendBeacon(CFG.url, new Blob([cuerpo], { type: "text/plain;charset=UTF-8" }))) return;
      if (W.fetch) fetch(CFG.url, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: cuerpo }).catch(function () {});
    } catch (e) { /* el registro nunca debe afectar al portal */ }
  }

  W.PDMVisitas = { armar: armar, dispositivo: dispositivo, navegador: navegador, origen: origen, pagina: pagina, permitido: permitido };
  function iniciar() { setTimeout(registrar, 800); W.addEventListener("hashchange", function () { setTimeout(registrar, 400); }); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
