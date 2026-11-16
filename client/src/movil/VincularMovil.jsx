// /vincular: abre el enlace del QR de la laptop. Guarda la URL y el token (que vienen después
// del "#", así no viajan a ningún servidor) y hace la primera sincronización.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { sincronizar, vincular } from "../lib/sync-movil.js";
import { marcarMiLaptop, probar } from "../lib/conexion-local.js";
import estilos from "./MasMovil.module.css";

export function VincularMovil() {
  const [estado, setEstado] = useState("vinculando");
  const [detalle, setDetalle] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.hash.slice(1));
    const url = params.get("u");
    const token = params.get("t");
    // Borra el token de la barra de direcciones y del historial.
    history.replaceState(null, "", "/vincular");
    if (!url?.startsWith("https://") || !token) {
      setEstado("error");
      setDetalle("El enlace no trae los datos del vínculo. Vuelve a escanear el QR en Ajustes de la laptop.");
      return;
    }
    vincular(url, token);
    // Viene del botón "Vincular la versión web" de la app local: este navegador está en tu laptop.
    if (params.get("local") === "1") {
      marcarMiLaptop(true);
      probar();
    }
    sincronizar().then((v) => {
      if (v?.error) {
        setEstado("error");
        setDetalle(v.error);
      } else setEstado("listo");
    });
  }, []);

  return (
    <section className={estilos.pagina}>
      <h1 style={{ fontSize: 30, marginBottom: 16 }}>
        {estado === "vinculando" ? "Vinculando…" : estado === "listo" ? "¡Vinculado!" : "No se pudo vincular"}
      </h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: 24 }}>
        {estado === "listo"
          ? "Tu progreso de este dispositivo y de la laptop se une solo cada vez que tengas internet."
          : estado === "error"
            ? detalle
            : "Guardando el vínculo y haciendo la primera sincronización."}
      </p>
      <Link to="/" className="boton boton-primario">
        Ir a Hoy
      </Link>
    </section>
  );
}
