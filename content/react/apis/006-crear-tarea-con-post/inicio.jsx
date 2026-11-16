// Crear una tarea con POST
//
// Un formulario que envía { titulo } con POST a "/api/practica/tareas".
// Mientras envía, el botón se deshabilita. Muestra el error 400 del
// servidor y limpia el campo cuando la tarea se crea.
//
//   <NuevaTarea alCrear={(tarea) => console.log(tarea)} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";

export function NuevaTarea({ alCrear }) {
  const [titulo, setTitulo] = useState("");

  // Tu código aquí: estados de envío y error, y la función que hace el POST.

  return (
    <form>
      <label>
        Título
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>
      <button type="submit">Agregar</button>
    </form>
  );
}
