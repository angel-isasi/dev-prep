import { useEffect, useState } from "react";

export function CuentaRegresiva({ hasta }) {
  // Solo guardamos "qué hora es ahora"; lo que falta se calcula.
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const meta = new Date(hasta).getTime();
  const restanteMs = Math.max(0, meta - ahora);

  if (restanteMs === 0) {
    return <p>¡Ya empezó!</p>;
  }

  const totalSegundos = Math.floor(restanteMs / 1000);
  const dias = Math.floor(totalSegundos / 86400); // 60 * 60 * 24
  const horas = Math.floor((totalSegundos % 86400) / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  return <p>{`${dias}d ${horas}h ${minutos}m ${segundos}s`}</p>;
}
