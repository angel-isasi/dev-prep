import { useState } from "react";

export function useHistorial(inicial) {
  // Las tres partes cambian juntas, por eso van en un solo estado.
  const [historial, setHistorial] = useState({ pasado: [], presente: inicial, futuro: [] });

  const fijar = (nuevo) =>
    setHistorial((h) => ({
      pasado: [...h.pasado, h.presente], // el presente pasa al pasado
      presente: nuevo,
      futuro: [], // un cambio nuevo borra lo que se podía rehacer
    }));

  const deshacer = () =>
    setHistorial((h) => {
      if (h.pasado.length === 0) return h; // nada que deshacer
      return {
        pasado: h.pasado.slice(0, -1), // todo menos el último
        presente: h.pasado.at(-1), // el último del pasado
        futuro: [h.presente, ...h.futuro], // el presente va al inicio del futuro
      };
    });

  const rehacer = () =>
    setHistorial((h) => {
      if (h.futuro.length === 0) return h; // nada que rehacer
      return {
        pasado: [...h.pasado, h.presente],
        presente: h.futuro[0],
        futuro: h.futuro.slice(1),
      };
    });

  return {
    valor: historial.presente,
    fijar,
    deshacer,
    rehacer,
    puedeDeshacer: historial.pasado.length > 0,
    puedeRehacer: historial.futuro.length > 0,
  };
}
