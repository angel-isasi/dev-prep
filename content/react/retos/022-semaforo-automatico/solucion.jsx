import { useEffect, useState } from "react";

// Cuánto dura cada luz y cuál viene después.
const LUCES = {
  rojo: { duracion: 3000, siguiente: "verde" },
  verde: { duracion: 2000, siguiente: "amarillo" },
  amarillo: { duracion: 1000, siguiente: "rojo" },
};

export function Semaforo() {
  const [luz, setLuz] = useState("rojo");

  useEffect(() => {
    const { duracion, siguiente } = LUCES[luz];
    const id = setTimeout(() => setLuz(siguiente), duracion);
    return () => clearTimeout(id);
  }, [luz]);

  return <p data-testid="luz">{luz}</p>;
}
