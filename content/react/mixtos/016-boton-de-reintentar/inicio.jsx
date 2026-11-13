// Botón de reintentar
//
// Llama a cargar() al montar. Muestra "Cargando…", el dato, o si falla:
// <p role="alert">No se pudo cargar el menú</p> y un botón "Reintentar".
// Usa un solo estado con `fase`: "cargando" | "error" | "listo".
//
//   <Carga cargar={() => fetch("/api/menu").then((r) => r.text())} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useCallback, useEffect, useState } from "react";

export function Carga({ cargar }) {
  // Tu código aquí
  return null;
}
