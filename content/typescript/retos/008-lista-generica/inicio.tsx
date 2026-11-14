// Lista genérica
//
// Un componente <Lista> que sirve para cualquier tipo de elemento: recibe
// `items`, cómo pintar cada uno (`renderItem`) y cómo sacar su clave
// (`obtenerClave`). Sin elementos, muestra un mensaje.
//
//   <Lista items={productos} obtenerClave={(p) => p.id} renderItem={(p) => p.nombre} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import type { ReactNode } from "react";

// Cambia los `any` por un genérico T, para que TypeScript sepa el tipo
// de cada elemento dentro de renderItem y obtenerClave.
export type ListaProps = {
  items: any[];
  renderItem: (item: any, indice: number) => ReactNode;
  obtenerClave: (item: any) => string | number;
  vacio?: ReactNode;
};

export function Lista(props: ListaProps) {
  // Tu código aquí
  return null;
}
