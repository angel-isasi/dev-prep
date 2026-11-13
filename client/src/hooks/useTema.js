import { useEffect, useState } from "react";

/** Tema claro/oscuro guardado en el navegador. */
export function useTema() {
  const [tema, setTema] = useState(() => document.documentElement.dataset.tema ?? "oscuro");

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    localStorage.setItem("tema", tema);
  }, [tema]);

  const alternar = () => setTema((t) => (t === "oscuro" ? "claro" : "oscuro"));
  return { tema, alternar };
}
