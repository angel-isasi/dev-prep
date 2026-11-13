import { useState } from "react";

const MENU = [
  { id: 1, nombre: "Margarita", precio: 28 },
  { id: 2, nombre: "Pepperoni", precio: 32 },
];

export function Pedido() {
  const [items, setItems] = useState([]);

  // Estado derivado: se calculan en cada render, no se guardan.
  const total = items.reduce((suma, item) => suma + item.precio, 0);
  const palabra = items.length === 1 ? "pizza" : "pizzas";

  function agregar(pizza) {
    // Arreglo nuevo con lo anterior más la pizza (sin push).
    setItems((anteriores) => [...anteriores, pizza]);
  }

  return (
    <div>
      {MENU.map((pizza) => (
        <button key={pizza.id} onClick={() => agregar(pizza)}>
          Agregar {pizza.nombre}
        </button>
      ))}

      <p>
        {items.length} {palabra}, total S/ {total}
      </p>
    </div>
  );
}
