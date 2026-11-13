import { useEffect, useReducer } from "react";

export function crearInicial({ trabajo, descanso }) {
  return { modo: "trabajo", restante: trabajo, corriendo: false, duraciones: { trabajo, descanso } };
}

// Toda la lógica del temporizador: pura, sin React ni timers.
export function pomodoro(estado, accion) {
  switch (accion.tipo) {
    case "alternar":
      return { ...estado, corriendo: !estado.corriendo };
    case "tic": {
      if (estado.restante > 1) return { ...estado, restante: estado.restante - 1 };
      const modo = estado.modo === "trabajo" ? "descanso" : "trabajo";
      return { ...estado, modo, restante: estado.duraciones[modo] };
    }
    case "reiniciar":
      return crearInicial(estado.duraciones);
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

// 5 -> "05"
const dosDigitos = (numero) => String(numero).padStart(2, "0");

export function Pomodoro({ trabajo = 25 * 60, descanso = 5 * 60 }) {
  // El tercer argumento calcula el estado inicial a partir del segundo.
  const [estado, despachar] = useReducer(pomodoro, { trabajo, descanso }, crearInicial);

  // El efecto solo avisa "pasó un segundo"; el reducer decide qué significa.
  useEffect(() => {
    if (!estado.corriendo) return;
    const id = setInterval(() => despachar({ tipo: "tic" }), 1000);
    return () => clearInterval(id);
  }, [estado.corriendo]);

  const minutos = Math.floor(estado.restante / 60);
  const segundos = estado.restante % 60;

  return (
    <div>
      <p>{estado.modo === "trabajo" ? "A trabajar" : "Descanso"}</p>
      <p role="timer">
        {dosDigitos(minutos)}:{dosDigitos(segundos)}
      </p>
      <button onClick={() => despachar({ tipo: "alternar" })}>
        {estado.corriendo ? "Pausar" : "Iniciar"}
      </button>
      <button onClick={() => despachar({ tipo: "reiniciar" })}>Reiniciar</button>
    </div>
  );
}
