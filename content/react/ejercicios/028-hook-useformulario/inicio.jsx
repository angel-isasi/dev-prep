// Hook useFormulario
//
// Un solo estado (un objeto) y un solo manejador `cambiar` para todos los
// campos. Usa event.target.name para saber qué campo cambió; en los checkbox
// guarda `checked` y en el resto `value`.
//
//   const { valores, cambiar, reiniciar } = useFormulario({ nombre: "", promo: false });
//   <input name="nombre" value={valores.nombre} onChange={cambiar} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState } from "react";

export function useFormulario(inicial) {
  // Tu código aquí
}
