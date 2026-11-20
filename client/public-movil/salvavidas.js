// Salvavidas: si la copia guardada de la app quedó mal (la página pide un archivo que ya no existe),
// la pantalla se quedaba en negro. Este archivo carga antes que la app y, si ve que un archivo de
// /assets/ no cargó, borra la copia guardada (no tu progreso) y recarga una sola vez desde internet.
//
// Cómo puede pasar: al publicar una versión nueva, el navegador guarda la app para usarla sin
// internet; si justo en ese momento el servidor todavía entrega la página anterior, queda guardada
// una página vieja junto a archivos nuevos, y esa página pide un archivo que ya se borró.
(function () {
  var CLAVE = "devprep-salvavidas";
  window.addEventListener(
    "error",
    function (evento) {
      var el = evento.target;
      var url = el && (el.src || el.href);
      if (!url || !(el.tagName === "SCRIPT" || el.tagName === "LINK") || url.indexOf("/assets/") === -1) return;
      // Sin internet no hay de dónde traer otra copia; y solo se intenta una vez por pestaña
      if (!navigator.onLine || sessionStorage.getItem(CLAVE)) return;
      sessionStorage.setItem(CLAVE, "1");
      var borrar = [];
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        borrar.push(
          navigator.serviceWorker.getRegistrations().then(function (regs) {
            return Promise.all(regs.map(function (r) { return r.unregister(); }));
          }),
        );
      }
      if (window.caches) {
        borrar.push(
          caches.keys().then(function (nombres) {
            return Promise.all(nombres.map(function (n) { return caches.delete(n); }));
          }),
        );
      }
      var hecho = false;
      var recargar = function () {
        if (hecho) return;
        hecho = true;
        location.reload();
      };
      Promise.all(borrar).then(recargar, recargar);
      // Borrar la copia puede tardar (o quedarse esperando si se está guardando otra): a los 2 segundos se recarga igual
      setTimeout(recargar, 2000);
    },
    true, // en captura: los errores de carga de <script> y <link> no suben como los demás
  );
})();
