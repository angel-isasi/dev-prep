// /vincular: abre el enlace del QR de la laptop. Guarda la URL y el token (que vienen después
// del "#", así no viajan a ningún servidor) y hace la primera sincronización.
// Solo acepta una URL de Lambda de AWS, y si este navegador ya estaba vinculado a otra, pregunta
// antes de cambiarla (ver lib/vinculo.js).
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { leerVinculo, sincronizar, vincular } from "../lib/sync-movil.js";
import { marcarMiLaptop, probar } from "../lib/conexion-local.js";
import { decidirVinculo } from "../lib/vinculo.js";
import estilos from "./MasMovil.module.css";

export function VincularMovil() {
  const [estado, setEstado] = useState("vinculando");
  const [detalle, setDetalle] = useState("");
  const enlace = useRef(null);

  /** Guarda el vínculo del enlace y sincroniza. */
  function aplicar() {
    const { url, token, local } = enlace.current;
    vincular(url, token);
    // Viene del botón "Vincular la versión web" de la app local: este navegador está en tu laptop.
    if (local) {
      marcarMiLaptop(true);
      probar();
    }
    setEstado("vinculando");
    sincronizar().then((v) => {
      if (v?.error) {
        setEstado("error");
        setDetalle(v.error);
      } else setEstado("listo");
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(location.hash.slice(1));
    enlace.current = { url: params.get("u"), token: params.get("t"), local: params.get("local") === "1" };
    // Borra el token de la barra de direcciones y del historial.
    history.replaceState(null, "", "/vincular");
    const decision = decidirVinculo(enlace.current, leerVinculo());
    if (decision === "sin-datos") {
      // Sin datos en el enlace, pero si este navegador ya quedó vinculado (por ejemplo, la página se
      // recargó justo después de vincular), no es un error.
      if (leerVinculo()) {
        sincronizar().finally(() => setEstado("listo"));
        return;
      }
      setEstado("error");
      setDetalle("El enlace no trae los datos del vínculo. Vuelve a escanear el QR en Ajustes de la laptop.");
    } else if (decision === "invalido") {
      setEstado("error");
      setDetalle("Este enlace no es de tu dev-prep: no apunta a tu servidor de AWS. No se guardó nada. Usa solo el QR de Ajustes de tu laptop.");
    } else if (decision === "confirmar") {
      setEstado("confirmar");
    } else {
      aplicar();
    }
  }, []);

  const titulos = {
    vinculando: "Vinculando…",
    listo: "¡Vinculado!",
    error: "No se pudo vincular",
    confirmar: "¿Cambiar el vínculo?",
    cancelado: "No se cambió nada",
  };

  return (
    <section className={estilos.pagina}>
      <h1 style={{ fontSize: 30, marginBottom: 16 }}>{titulos[estado]}</h1>
      <p style={{ color: "var(--texto-suave)", marginBottom: 24 }}>
        {estado === "listo"
          ? "Tu progreso de este dispositivo y de la laptop se une solo cada vez que tengas internet."
          : estado === "error"
            ? detalle
            : estado === "confirmar"
              ? "Este navegador ya está vinculado a otro servidor. Cámbialo solo si escaneaste el QR de tu laptop después de crear de nuevo la sincronización. Si alguien te mandó este enlace, toca \"No cambiar\"."
              : estado === "cancelado"
                ? "Tu vínculo sigue igual."
                : "Guardando el vínculo y haciendo la primera sincronización."}
      </p>
      {estado === "confirmar" ? (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="boton boton-primario" onClick={() => setEstado("cancelado")}>
            No cambiar
          </button>
          <button type="button" className="boton" onClick={aplicar}>
            Sí, es mi QR
          </button>
        </div>
      ) : (
        <Link to="/" className="boton boton-primario">
          Ir a Hoy
        </Link>
      )}
    </section>
  );
}
