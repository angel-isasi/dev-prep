// Avisos de dev-prep (Web Push). El service worker de la app carga este archivo (ver vite.config.js).
// Llegan cifrados desde la Lambda de AWS; aquí solo se muestran y, al tocarlos, abren la app.
self.addEventListener("push", (evento) => {
  let datos = {};
  try {
    datos = evento.data ? evento.data.json() : {};
  } catch {
    datos = { cuerpo: evento.data ? evento.data.text() : "" };
  }
  const titulo = datos.titulo || "dev-prep";
  evento.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.cuerpo || "",
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      tag: datos.tipo || "dev-prep",
      data: { url: datos.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const url = new URL(evento.notification.data?.url || "/", self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if (v.url.startsWith(self.location.origin) && "focus" in v) {
          v.navigate?.(url);
          return v.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
