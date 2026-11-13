import { useEffect, useState } from "react";

// Lee un valor guardado como JSON. Si no existe o está corrupto, usa el respaldo.
export function leerGuardado(clave, respaldo) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo === null ? respaldo : JSON.parse(crudo);
  } catch {
    return respaldo;
  }
}

export function Preferencias() {
  // Inicialización perezosa: la función solo se ejecuta en el primer render.
  const [tema, setTema] = useState(() => leerGuardado("tema", "claro"));

  // Cada vez que cambia el tema, se guarda.
  useEffect(() => {
    localStorage.setItem("tema", JSON.stringify(tema));
  }, [tema]);

  return (
    <button onClick={() => setTema(tema === "claro" ? "oscuro" : "claro")}>
      Tema: {tema}
    </button>
  );
}
