import { useState, useTransition } from "react";

const PESTANAS = [
  { valor: "menu", texto: "Menú" },
  { valor: "pedidos", texto: "Pedidos" },
];

export function Pestanas() {
  const [pestana, setPestana] = useState("menu");
  // pendiente: true mientras React prepara la transición en segundo plano.
  const [pendiente, iniciarTransicion] = useTransition();

  function cambiar(valor) {
    // Lo que va aquí adentro se marca como NO urgente.
    iniciarTransicion(() => setPestana(valor));
  }

  return (
    <div>
      {PESTANAS.map((p) => (
        <button key={p.valor} aria-pressed={pestana === p.valor} onClick={() => cambiar(p.valor)}>
          {p.texto}
        </button>
      ))}
      <p>{pendiente ? "Cambiando…" : `Viendo: ${pestana}`}</p>
    </div>
  );
}
