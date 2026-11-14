// Unión de literales: solo esos dos textos son válidos.
export type Direccion = "asc" | "desc";

export function ordenarPor<T, K extends keyof T>(lista: T[], campo: K, direccion: Direccion = "asc"): T[] {
  // sort modifica el arreglo sobre el que se llama: primero copiamos.
  const copia = [...lista];

  copia.sort((a, b) => {
    // a[campo] tiene tipo T[K]: el tipo de esa propiedad en T.
    const x = a[campo];
    const y = b[campo];

    let orden: number;
    if (typeof x === "string" && typeof y === "string") {
      // localeCompare devuelve negativo, 0 o positivo, y respeta tildes y ñ.
      orden = x.localeCompare(y);
    } else {
      orden = x < y ? -1 : x > y ? 1 : 0;
    }

    // Para "desc" basta con invertir el signo.
    return direccion === "asc" ? orden : -orden;
  });

  return copia;
}

// T[K][] = "un arreglo de lo que valga la propiedad K de T".
export function valoresDe<T, K extends keyof T>(lista: T[], campo: K): T[K][] {
  return lista.map((elemento) => elemento[campo]);
}
