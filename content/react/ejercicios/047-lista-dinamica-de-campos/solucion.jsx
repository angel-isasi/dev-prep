import { useRef, useState } from "react";

export function Ingredientes() {
  // Cada fila tiene un id propio que NO cambia aunque se borren otras.
  const [lista, setLista] = useState([{ id: 1, valor: "" }]);
  const siguienteId = useRef(2); // contador que no necesita re-renderizar

  const cambiar = (id, valor) =>
    setLista((l) => l.map((item) => (item.id === id ? { ...item, valor } : item)));

  const quitar = (id) => setLista((l) => l.filter((item) => item.id !== id));

  const agregar = () => {
    const id = siguienteId.current++;
    setLista((l) => [...l, { id, valor: "" }]);
  };

  return (
    <div>
      {lista.map((item, i) => (
        <div key={item.id}>
          <input
            aria-label={`Ingrediente ${i + 1}`}
            value={item.valor}
            onChange={(e) => cambiar(item.id, e.target.value)}
          />
          <button aria-label={`Quitar ingrediente ${i + 1}`} onClick={() => quitar(item.id)}>
            ×
          </button>
        </div>
      ))}
      <button onClick={agregar}>Agregar ingrediente</button>
    </div>
  );
}
