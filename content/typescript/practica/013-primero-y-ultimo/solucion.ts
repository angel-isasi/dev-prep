// <T> declara un tipo "comodín". TypeScript lo deduce de lo que le pases:
// con number[] T es number, con Mensaje[] T es Mensaje.
export function primero<T>(lista: T[]): T | undefined {
  // Si la lista está vacía, lista[0] es undefined en JavaScript.
  // El tipo de retorno lo deja claro para quien use la función.
  return lista[0];
}

export function ultimo<T>(lista: T[]): T | undefined {
  // at(-1) cuenta desde el final; ya está tipado como T | undefined.
  return lista.at(-1);
}
