// T: el tipo de cada elemento (Producto, Tarea...).
// K extends keyof T: K solo puede ser el nombre de una propiedad de T.
export function agruparPor<T, K extends keyof T>(lista: T[], clave: K): Record<string, T[]> {
  const grupos: Record<string, T[]> = {};

  for (const elemento of lista) {
    // elemento[clave] tiene tipo T[K]: el tipo de esa propiedad.
    // String() lo convierte en texto para usarlo como clave del objeto.
    const grupo = String(elemento[clave]);

    // Si el grupo todavía no existe, lo creamos vacío.
    if (!grupos[grupo]) {
      grupos[grupo] = [];
    }
    grupos[grupo].push(elemento);
  }

  return grupos;
}
