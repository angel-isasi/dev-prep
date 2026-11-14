// Hook useFetch tipado
//
// useFetch<T>(url, fetchFn) pide la url y devuelve su estado como una unión
// discriminada: cargando, exito (con los datos de tipo T) o error (con el mensaje).
// Después, ListaUsuarios lo usa para mostrar una lista de usuarios.
//
//   const r = useFetch<Usuario[]>("/api/usuarios", fetch);
//   if (r.estado === "exito") r.datos;   // Usuario[]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useEffect, useState } from "react";

// Cambia este tipo por una unión discriminada con tres variantes:
// "cargando" (sin datos), "exito" (con datos: T) y "error" (con error: string).
export type EstadoFetch<T> = { estado: string; datos?: any; error?: string };

// Lo mínimo que usamos de fetch. El `fetch` real encaja en este tipo.
export type FetchFn = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export function useFetch<T>(url: string, fetchFn: FetchFn): EstadoFetch<T> {
  // Tu código aquí
  return { estado: "cargando" };
}

export type Usuario = { id: number; nombre: string };

export function ListaUsuarios({ fetchFn }: { fetchFn: FetchFn }) {
  // Tu código aquí: usa useFetch<Usuario[]>("/api/usuarios", fetchFn)
  return null;
}
