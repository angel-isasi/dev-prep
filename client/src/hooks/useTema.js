import { useEffect, useState } from "react";

/** Color de la barra del sistema (celular) y de la ventana de la app instalada, por tema. */
const COLOR_BARRA = { oscuro: "#07070a", claro: "#f6f6f8" };

/** Tema claro/oscuro guardado en el navegador. */
export function useTema() {
  const [tema, setTema] = useState(() => document.documentElement.dataset.tema ?? "oscuro");

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    localStorage.setItem("tema", tema);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLOR_BARRA[tema] ?? COLOR_BARRA.oscuro);
  }, [tema]);

  const alternar = () => setTema((t) => (t === "oscuro" ? "claro" : "oscuro"));
  return { tema, alternar };
}
