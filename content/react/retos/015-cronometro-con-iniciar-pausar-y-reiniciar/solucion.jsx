import { useEffect, useState } from "react";

export function Cronometro() {
  const [ms, setMs] = useState(0);
  const [corriendo, setCorriendo] = useState(false);

  // El intervalo existe SOLO mientras `corriendo` es true.
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      setMs((anterior) => anterior + 100); // forma funcional: siempre el valor más reciente
    }, 100);
    return () => clearInterval(id); // al pausar o al desmontar
  }, [corriendo]);

  function reiniciar() {
    setCorriendo(false);
    setMs(0);
  }

  return (
    <div>
      <p>{(ms / 1000).toFixed(1)} s</p>
      <button onClick={() => setCorriendo((c) => !c)}>{corriendo ? "Pausar" : "Iniciar"}</button>
      <button onClick={reiniciar}>Reiniciar</button>
    </div>
  );
}
