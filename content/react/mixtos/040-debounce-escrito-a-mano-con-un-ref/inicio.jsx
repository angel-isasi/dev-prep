// Debounce escrito a mano con un ref
//
// El input muestra lo que escribes al instante, pero `onBuscar` solo se llama
// cuando dejas de escribir durante `espera` milisegundos (300 por defecto).
//
//   <BuscadorConEspera onBuscar={(texto) => console.log(texto)} />
//   escribes "m", "ma", "mar" seguido  ->  onBuscar("mar") una sola vez
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useRef, useState } from "react";

export function BuscadorConEspera({ onBuscar, espera = 300 }) {
  // Tu código aquí
  return null;
}
