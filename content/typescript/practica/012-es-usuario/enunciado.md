Cuando tu app recibe datos de una API o de `localStorage`, TypeScript **no sabe** qué forma tienen: `JSON.parse` podría devolver cualquier cosa. Lo seguro es tratarlos como `unknown` y comprobar su forma antes de usarlos.

Tienes esta interfaz:

```ts
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}
```

Escribe:

1. `esUsuario(dato: unknown)`: devuelve `true` si `dato` es un objeto (no `null`) con `id` de tipo número, `nombre` de tipo texto y `email` de tipo texto. En cualquier otro caso, `false`. Su tipo de retorno debe ser un **type guard**: `dato is Usuario`, para que TypeScript sepa que, dentro de un `if (esUsuario(x))`, `x` es un `Usuario`.
2. `nombresDeUsuarios(datos: unknown[])`: recibe una lista con datos de todo tipo y devuelve solo los nombres de los elementos que sí son usuarios, en el mismo orden.

## Reglas

- No uses `any` ni `as Usuario`: la idea es **comprobar**, no prometer.
- Las propiedades de más no molestan: un objeto con `id`, `nombre`, `email` y además `edad` sigue siendo un usuario.
- `null`, `undefined`, textos, números y arreglos no son usuarios.

## Ejemplos

```ts
esUsuario({ id: 1, nombre: "Ana", email: "ana@correo.com" });   // true
esUsuario({ id: "1", nombre: "Ana", email: "ana@correo.com" }); // false (id es texto)
esUsuario({ id: 1, nombre: "Ana" });                              // false (falta email)
esUsuario(null);                                                  // false

nombresDeUsuarios([
  { id: 1, nombre: "Ana", email: "ana@correo.com" },
  "hola",
  { id: 2, nombre: "Luis", email: "luis@correo.com" },
]); // ["Ana", "Luis"]

const dato: unknown = JSON.parse(texto);
if (esUsuario(dato)) {
  dato.nombre; // TypeScript sabe que es string
}
```
