// Red de seguridad: si una pantalla falla al cargar, en vez de quedar todo en negro se muestra un
// mensaje con un botón que descarta la copia guardada de la app y la vuelve a bajar.
// Tu progreso no se toca: vive en otro almacén del navegador y en tus otros dispositivos.
import { Component } from "react";

export class RedDeSeguridad extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  async reparar() {
    try {
      const registros = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
      await Promise.all(registros.map((r) => r.unregister()));
      const nombres = (await globalThis.caches?.keys?.()) ?? [];
      await Promise.all(nombres.map((n) => caches.delete(n)));
    } catch {
      // si no se puede limpiar, igual se recarga
    }
    sessionStorage.clear();
    location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
        <div style={{ display: "grid", gap: 12, maxWidth: 460 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Esta pantalla no cargó bien</h1>
          <p style={{ margin: 0, color: "var(--texto-suave)" }}>
            Suele pasar justo después de una actualización de la app. Tu progreso está a salvo.
          </p>
          <button type="button" className="boton boton-primario" style={{ justifySelf: "center" }} onClick={() => this.reparar()}>
            Reparar y recargar
          </button>
        </div>
      </div>
    );
  }
}
