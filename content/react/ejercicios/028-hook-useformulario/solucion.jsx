import { useState } from "react";

export function useFormulario(inicial) {
  const [valores, setValores] = useState(inicial);

  // Un solo manejador para todos los campos: el `name` del input dice cuál cambió.
  const cambiar = (evento) => {
    const { name, type, value, checked } = evento.target;
    setValores((anteriores) => ({
      ...anteriores, // copia los demás campos
      [name]: type === "checkbox" ? checked : value, // propiedad computada
    }));
  };

  const reiniciar = () => setValores(inicial);

  return { valores, cambiar, reiniciar };
}
