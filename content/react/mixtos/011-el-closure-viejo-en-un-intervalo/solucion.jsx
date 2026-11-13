import { useEffect, useState } from "react";

export function Segundero() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    // Forma funcional: React le pasa el valor ACTUAL (s), no el que
    // quedó guardado en el closure del primer render.
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    // Limpieza: al desmontar, se detiene el intervalo.
    return () => clearInterval(id);
  }, []);

  return <p>{segundos} s</p>;
}
