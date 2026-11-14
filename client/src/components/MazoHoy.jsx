import { useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import Stack from "./reactbits/Stack.jsx";
import { LiquidButton } from "./ui/liquid-button.jsx";
import { nombreTema } from "../lib/etiquetas.js";
import estilos from "./MazoHoy.module.css";

const NIVELES = { 1: "Básico", 2: "Intermedio", 3: "Difícil" };
const TIPOS = {
  repaso: { texto: "Repaso", accion: "Repasar" },
  continuar: { texto: "Continuar", accion: "Continuar" },
  siguiente: { texto: "Siguiente", accion: "Empezar" },
  sugerido: { texto: "Sugerido", accion: "Empezar" },
};

/** Tres rayitas que se llenan según el nivel (1, 2 o 3). */
function Nivel({ nivel }) {
  return (
    <span className={estilos.nivel} data-nivel={nivel} title={NIVELES[nivel]}>
      {[1, 2, 3].map((n) => (
        <i key={n} data-lleno={n <= nivel} />
      ))}
      <span>{NIVELES[nivel]}</span>
    </span>
  );
}

/** El frente de una carta del mazo. */
function Carta({ ej, numero, total }) {
  return (
    <div className={estilos.carta} data-tipo={ej.tipo} data-nivel={ej.nivel}>
      <div className={estilos.cartaArriba}>
        <span className={estilos.tipo}>{TIPOS[ej.tipo].texto}</span>
        <span className={estilos.numero}>
          {String(numero).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>
      <strong className={estilos.cartaTitulo}>{ej.titulo}</strong>
      <div className={estilos.cartaAbajo}>
        <span className={estilos.tema}>{nombreTema(ej.tema)}</span>
        <Nivel nivel={ej.nivel} />
      </div>
    </div>
  );
}

/**
 * "Para hoy" como un mazo de cartas (Stack de React Bits): repasos, el ejercicio que
 * dejaste a medias y sugerencias. Arrastras o haces clic en la carta de arriba para pasar
 * a la siguiente; a la derecha ves la carta actual y el botón para abrirla.
 * @param {{ cartas: { id: string, titulo: string, tema: string, nivel: number, tipo: string }[], alAzar: () => void }} props
 */
export function MazoHoy({ cartas, alAzar }) {
  const navegar = useNavigate();
  const [arriba, setArriba] = useState(0);
  const actual = cartas[arriba] ?? cartas[0];

  if (!cartas.length) {
    return <p className={estilos.vacio}>No quedan ejercicios pendientes. ¡Enorme!</p>;
  }

  const abrir = () => navegar(`/practicar/${actual.id}`);

  return (
    <div className={estilos.mazo}>
      <div className={estilos.zonaCartas}>
        <Stack
          layout="fan"
          visible={4}
          spread={0.55}
          depth={0.45}
          radius={16}
          tilt={18}
          sendToBackOnClick
          onChange={setArriba}
          cards={cartas.map((ej, i) => (
            <Carta key={ej.id} ej={ej} numero={i + 1} total={cartas.length} />
          ))}
        />
      </div>

      <div className={estilos.panel}>
        <AnimatePresence mode="wait">
          <motion.div
            key={actual.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className={estilos.info}
          >
            <span className={estilos.tipoPanel} data-tipo={actual.tipo}>
              {TIPOS[actual.tipo].texto}
            </span>
            <p className={estilos.titulo}>{actual.titulo}</p>
            <p className={estilos.detalle}>
              {nombreTema(actual.tema)} · {NIVELES[actual.nivel]}
            </p>
          </motion.div>
        </AnimatePresence>

        <LiquidButton onClick={abrir}>{TIPOS[actual.tipo].accion} →</LiquidButton>

        <div className={estilos.pie}>
          <span className={estilos.pista}>Arrastra o haz clic en la carta para ver otra</span>
          <button type="button" className={estilos.azar} onClick={alAzar}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
              <circle cx="12" cy="12" r="1.2" fill="currentColor" />
            </svg>
            Uno al azar
          </button>
        </div>
      </div>
    </div>
  );
}
