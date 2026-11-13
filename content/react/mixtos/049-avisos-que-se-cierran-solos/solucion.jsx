import { useCallback, useEffect, useRef, useState } from "react";

export function useAvisos(duracion = 3000) {
  const [avisos, setAvisos] = useState([]);
  // Refs: valores que deben sobrevivir entre renders pero que no se pintan.
  const siguienteId = useRef(1);
  const temporizadores = useRef(new Map()); // id del aviso -> id del setTimeout

  const cerrar = useCallback((id) => {
    clearTimeout(temporizadores.current.get(id));
    temporizadores.current.delete(id);
    setAvisos((lista) => lista.filter((aviso) => aviso.id !== id));
  }, []);

  const avisar = useCallback(
    (texto) => {
      const id = siguienteId.current++;
      setAvisos((lista) => [...lista, { id, texto }]);
      temporizadores.current.set(
        id,
        setTimeout(() => cerrar(id), duracion),
      );
    },
    [cerrar, duracion],
  );

  // Al desmontar, cancelamos todo lo que quedó pendiente.
  useEffect(() => {
    const pendientes = temporizadores.current;
    return () => pendientes.forEach((temporizador) => clearTimeout(temporizador));
  }, []);

  return { avisos, avisar, cerrar };
}

export function Avisos() {
  const { avisos, avisar, cerrar } = useAvisos();

  return (
    <div>
      <button onClick={() => avisar("Pizza agregada")}>Agregar pizza</button>
      <ul aria-live="polite">
        {avisos.map((aviso) => (
          <li key={aviso.id}>
            {aviso.texto}{" "}
            <button aria-label={`Cerrar aviso ${aviso.id}`} onClick={() => cerrar(aviso.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
