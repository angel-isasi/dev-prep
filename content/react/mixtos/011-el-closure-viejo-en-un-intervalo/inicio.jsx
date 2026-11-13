// El closure viejo en un intervalo
//
// Este segundero debería contar 0 s, 1 s, 2 s, 3 s... pero se queda en 1 s.
// Encuentra por qué y arréglalo sin crear más de un intervalo.
//
//   <Segundero />  -> después de 3 segundos muestra "3 s"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

export function Segundero() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSegundos(segundos + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{segundos} s</p>;
}
