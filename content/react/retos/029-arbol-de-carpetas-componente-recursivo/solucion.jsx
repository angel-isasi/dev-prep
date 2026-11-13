import { useState } from "react";

// Cada nodo es { nombre, hijos? }. Si tiene `hijos`, es una carpeta; si no, un archivo.
export function Arbol({ nodo }) {
  const [abierto, setAbierto] = useState(false);

  // Caso base: un archivo no tiene hijos, no se abre ni se cierra.
  if (!nodo.hijos) {
    return <li>📄 {nodo.nombre}</li>;
  }

  return (
    <li>
      <button type="button" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        {abierto ? "📂" : "📁"} {nodo.nombre}
      </button>
      {abierto && (
        <ul>
          {nodo.hijos.map((hijo) => (
            // Recursión: el componente se usa a sí mismo para cada hijo.
            <Arbol key={hijo.nombre} nodo={hijo} />
          ))}
        </ul>
      )}
    </li>
  );
}
