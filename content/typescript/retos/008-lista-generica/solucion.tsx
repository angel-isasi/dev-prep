import type { ReactNode } from "react";

// T es el tipo de cada elemento: lo infiere TypeScript a partir de `items`.
export type ListaProps<T> = {
  items: T[];
  renderItem: (item: T, indice: number) => ReactNode;
  obtenerClave: (item: T) => string | number;
  vacio?: ReactNode;
};

// Un componente genérico es una función genérica que devuelve JSX.
export function Lista<T>({ items, renderItem, obtenerClave, vacio = "No hay elementos" }: ListaProps<T>) {
  if (items.length === 0) return <p>{vacio}</p>;

  return (
    <ul>
      {items.map((item, indice) => (
        <li key={obtenerClave(item)}>{renderItem(item, indice)}</li>
      ))}
    </ul>
  );
}
