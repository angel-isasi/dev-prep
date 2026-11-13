import { useState } from "react";

export function Registro() {
  const [datos, setDatos] = useState({ nombre: "", distrito: "" });

  // Currying: cambiar("nombre") devuelve el manejador del campo "nombre".
  const cambiar = (campo) => (evento) =>
    setDatos((anteriores) => ({ ...anteriores, [campo]: evento.target.value }));

  return (
    <form>
      <input aria-label="Nombre" value={datos.nombre} onChange={cambiar("nombre")} />
      <input aria-label="Distrito" value={datos.distrito} onChange={cambiar("distrito")} />
      <output>
        {datos.nombre} / {datos.distrito}
      </output>
    </form>
  );
}
