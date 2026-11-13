// Tema claro/oscuro con Context
//
// TemaProvider guarda el tema ("claro" u "oscuro") y lo comparte.
// useTema() devuelve { tema, alternar } y lanza un error fuera del Provider.
// BotonTema muestra "Tema: {tema}" y lo alterna; Tarjeta usa la clase
// "bg-white" (claro) o "bg-navy" (oscuro).
//
//   <TemaProvider>
//     <BotonTema />
//     <Tarjeta />
//   </TemaProvider>
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export function TemaProvider({ children }) {
  // Tu código aquí
  return children;
}

export function useTema() {
  // Tu código aquí
  return {};
}

export function BotonTema() {
  // Tu código aquí
  return null;
}

export function Tarjeta() {
  // Tu código aquí
  return null;
}
