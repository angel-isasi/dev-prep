import { useReducer } from "react";

// Función pura: recibe el estado actual y una acción, devuelve el estado nuevo.
export function reducer(estado, accion) {
  switch (accion.tipo) {
    case "sumar":
      return { cuenta: estado.cuenta + (accion.paso ?? 1) };
    case "reiniciar":
      return { cuenta: 0 };
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

export function Contador() {
  const [estado, despachar] = useReducer(reducer, { cuenta: 0 });

  return (
    <div>
      <p>Cuenta: {estado.cuenta}</p>
      <button onClick={() => despachar({ tipo: "sumar", paso: 5 })}>+5</button>
      <button onClick={() => despachar({ tipo: "reiniciar" })}>Reiniciar</button>
    </div>
  );
}
