export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

// extends: un ItemCarrito tiene todo lo de Producto, más la cantidad.
export interface ItemCarrito extends Producto {
  cantidad: number;
}

export interface EstadoCarrito {
  items: ItemCarrito[];
}

// Unión discriminada: cada acción tiene su `tipo` y solo los datos que necesita.
export type AccionCarrito =
  | { tipo: "agregar"; producto: Producto }
  | { tipo: "quitar"; id: number }
  | { tipo: "cambiarCantidad"; id: number; cantidad: number }
  | { tipo: "vaciar" };

// Solo se puede llamar con un valor de tipo `never`, es decir, con algo que
// "no puede existir". Si llega aquí una acción real, es que falta su case.
export function asegurarNunca(valor: never): never {
  throw new Error(`Acción desconocida: ${JSON.stringify(valor)}`);
}

export function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  switch (accion.tipo) {
    case "agregar": {
      const { producto } = accion; // aquí accion es la variante "agregar"
      const yaEsta = estado.items.some((item) => item.id === producto.id);
      if (yaEsta) {
        return {
          ...estado,
          // map crea un array nuevo; el ítem que cambia también es un objeto nuevo.
          items: estado.items.map((item) =>
            item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
          ),
        };
      }
      return { ...estado, items: [...estado.items, { ...producto, cantidad: 1 }] };
    }

    case "quitar": {
      const { id } = accion;
      return { ...estado, items: estado.items.filter((item) => item.id !== id) };
    }

    case "cambiarCantidad": {
      const { id, cantidad } = accion;
      if (cantidad <= 0) {
        return { ...estado, items: estado.items.filter((item) => item.id !== id) };
      }
      return {
        ...estado,
        items: estado.items.map((item) => (item.id === id ? { ...item, cantidad } : item)),
      };
    }

    case "vaciar":
      return { ...estado, items: [] };

    default:
      // Si cubriste todas las acciones, aquí `accion` es de tipo never y esto compila.
      // Si falta un case, `accion` es esa acción y tsc da error en esta línea.
      return asegurarNunca(accion);
  }
}
