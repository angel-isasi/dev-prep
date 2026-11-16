import { useState } from "react";

// Lista de pendientes
//
// Cada pendiente tiene su casilla de "hecho" (estado propio) y un botón para
// borrarlo. Al borrar uno, los demás conservan su casilla tal como estaba.

function Pendiente({ texto, onBorrar }) {
  const [hecho, setHecho] = useState(false);
  return (
    <li>
      <label>
        <input type="checkbox" checked={hecho} onChange={(e) => setHecho(e.target.checked)} />
        {texto}
      </label>
      <button onClick={onBorrar}>Borrar {texto}</button>
    </li>
  );
}

export function Pendientes({ iniciales }) {
  const [lista, setLista] = useState(iniciales);
  const borrar = (id) => setLista((actual) => actual.filter((p) => p.id !== id));

  return (
    <ul>
      {lista.map((p) => (
        <Pendiente key={p.id} texto={p.texto} onBorrar={() => borrar(p.id)} /> // key estable: el id, no la posición
      ))}
    </ul>
  );
}
