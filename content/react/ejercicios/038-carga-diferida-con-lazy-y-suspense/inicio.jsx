// Carga diferida con lazy y Suspense
//
// El mapa no se descarga al abrir la página: solo cuando el usuario pulsa
// "Ver mapa". Mientras llega, se muestra "Cargando mapa…".
// `Mapa` debe crearse con lazy usando la función descargarMapa.
//
//   <Locales />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { lazy, Suspense, useState } from "react";

// El componente "pesado" que no queremos en la carga inicial.
function MapaDeLocales() {
  return <p>Mapa de locales</p>;
}

// Simula la descarga de un archivo aparte: espera 200 ms y entrega el módulo.
// En un proyecto real escribirías: lazy(() => import("./MapaDeLocales.jsx"))
function descargarMapa() {
  return new Promise((resolver) => setTimeout(() => resolver({ default: MapaDeLocales }), 200));
}

// Cámbialo: Mapa debe ser un componente cargado con lazy.
export const Mapa = MapaDeLocales;

export function Locales() {
  // Tu código aquí
  return null;
}
