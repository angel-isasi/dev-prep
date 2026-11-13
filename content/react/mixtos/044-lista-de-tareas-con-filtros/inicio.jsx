// Lista de tareas con filtros
//
// FILTROS es un objeto de funciones (todas, pendientes, hechas) que dicen si
// una tarea { id, texto, hecha } se ve. TareasConFiltro permite agregar,
// marcar, filtrar y borrar las hechas, con un contador de pendientes.
//
//   FILTROS.pendientes({ id: 1, texto: "Amasar", hecha: false }) // true
//   <TareasConFiltro />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useRef, useState } from "react";

export const FILTROS = {
  // todas, pendientes y hechas
};

export function TareasConFiltro() {
  // Tu código aquí
  return null;
}
