// Ajustes de la versión web en tu laptop: conectarla con el dev-prep de esta laptop (o dejar de hacerlo).
// Conectada, la web es igual a la app local: VS Code, tests en vivo y ejercicios resueltos.
import { useState } from "react";
import { conectada, esMiLaptop, marcarMiLaptop, probar } from "../lib/conexion-local.js";
import estilos from "../components/SeccionSync.module.css";

export function SeccionLaptop() {
  const [aviso, setAviso] = useState(null);
  const [probando, setProbando] = useState(false);

  async function conectar() {
    marcarMiLaptop(true);
    setProbando(true);
    const ok = await probar();
    setProbando(false);
    if (!ok) {
      setAviso(
        'No encontré dev-prep abierto en esta laptop. Ábrelo con el acceso directo del escritorio. Si Chrome pregunta si esta página puede acceder a tu red local, toca "Permitir".',
      );
    }
  }

  if (conectada()) {
    return (
      <section className={estilos.seccion}>
        <h2>Conectada a tu laptop</h2>
        <p className={estilos.ayuda}>
          Esta página usa el dev-prep abierto en esta laptop: VS Code, tests en vivo y tu progreso de la laptop. Si cierras
          dev-prep, vuelve al modo estudio y se reconecta sola cuando lo abras.
        </p>
        <div className={estilos.acciones}>
          <button type="button" className="boton boton-fantasma" onClick={() => marcarMiLaptop(false)}>
            Esta no es mi laptop
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={estilos.seccion}>
      <h2>Programar desde esta página</h2>
      <p className={estilos.ayuda}>
        {esMiLaptop()
          ? "Esta laptop está marcada como tuya, pero dev-prep no está abierto. Ábrelo con el acceso directo del escritorio y esta página se conecta sola."
          : "Si esta es tu laptop y tiene dev-prep, conéctala: tendrás aquí VS Code, los tests en vivo y todo lo de la app local."}
      </p>
      <div className={estilos.acciones}>
        <button type="button" className="boton" onClick={conectar} disabled={probando}>
          {probando ? "Buscando dev-prep…" : "Conectar con dev-prep de esta laptop"}
        </button>
        {esMiLaptop() && (
          <button type="button" className="boton boton-fantasma" onClick={() => (marcarMiLaptop(false), setAviso(null))}>
            Esta no es mi laptop
          </button>
        )}
      </div>
      {aviso && <p className={estilos.ayuda}>{aviso}</p>}
    </section>
  );
}
