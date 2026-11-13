## Idea clave

Los objetos no tienen `map`, pero puedes convertirlos en un **arreglo de pares** con `Object.entries`, transformar los pares con `map` y volver a armar el objeto con `Object.fromEntries`. Para invertir, cada par `[clave, valor]` pasa a ser `[valor, clave]`.

## Paso a paso

1. **Convierte el objeto en pares**: `Object.entries({ pe: "Perú", gt: "Guatemala" })` da `[["pe", "Perú"], ["gt", "Guatemala"]]`.
2. **Invierte cada par** con `map`. La función recibe cada par y lo **desestructura**: `([clave, valor])` saca el primer y el segundo elemento en dos variables. Devuelves `[valor, clave]`.
3. **Vuelve a objeto** con `Object.fromEntries`, que hace lo contrario de `Object.entries`: recibe pares y crea un objeto.

```js
export function invertirObjeto(obj) {
  const pares = Object.entries(obj);
  const invertidos = pares.map(([clave, valor]) => [valor, clave]);
  return Object.fromEntries(invertidos);
}
```

## Por qué funciona

Recorrido con `invertirObjeto({ pe: "Perú", gt: "Guatemala" })`:

| Paso | Valor |
|---|---|
| `Object.entries(obj)` | `[["pe", "Perú"], ["gt", "Guatemala"]]` |
| `.map(([clave, valor]) => [valor, clave])` | `[["Perú", "pe"], ["Guatemala", "gt"]]` |
| `Object.fromEntries(...)` | `{ Perú: "pe", Guatemala: "gt" }` |

Con valores repetidos, `{ a: "x", b: "x" }`: los pares invertidos son `[["x", "a"], ["x", "b"]]`. `fromEntries` los asigna en orden: primero `x: "a"` y luego `x: "b"` **sobrescribe** la misma clave. Queda `{ x: "b" }`.

Con `{ a: 1, b: 2 }`, las claves nuevas serían `1` y `2`, pero JavaScript convierte toda clave de objeto en texto: quedan `"1"` y `"2"`.

Nunca se escribe en `obj`: `entries` y `map` crean arreglos nuevos y `fromEntries` crea un objeto nuevo.

## Errores comunes

- **Olvidar invertir el par** y devolver `[clave, valor]`. Recibes el mismo objeto que entró: `{ pe: "Perú", gt: "Guatemala" }`.
- **Usar `obj.clave` en vez de `obj[clave]`** en la versión con bucle. Lee una propiedad llamada literalmente "clave", que no existe, y terminas con `{ undefined: "gt" }`.
- **Modificar el original**: agregar las claves invertidas a `obj` y borrar las viejas. Lo reconoces porque falla "no modifica el objeto original".
- **Usar `Object.keys` y olvidar el valor**: `Object.keys(obj)` solo da las claves. Si haces `map` sobre ellas y devuelves `[clave, clave]`, recibes `{ pe: "pe", gt: "gt" }`.
- **Llamar `obj.map(...)`**: lanza **TypeError: obj.map is not a function**, porque los objetos no tienen `map`. Primero conviértelo con `Object.entries`.

## Otra forma de resolverlo

Con un objeto vacío y un bucle `for...in`, que recorre las claves de un objeto:

```js
export function invertirObjeto(obj) {
  const resultado = {};
  for (const clave in obj) {
    resultado[obj[clave]] = clave;
  }
  return resultado;
}
```

En cada vuelta, `obj[clave]` es el valor original, y lo usas como clave del resultado. Los corchetes son obligatorios porque la clave está en una variable.

**¿Cuál conviene?** El bucle es más directo y fácil de explicar paso a paso. `entries` + `map` + `fromEntries` es el patrón moderno y se reutiliza para cualquier transformación de objetos (filtrar propiedades, cambiar valores). Vale la pena dominarlo. Ambas son O(n), donde n es la cantidad de claves.

## Cómo explicarlo en la entrevista

> "Como los objetos no tienen `map`, convierto el objeto en un arreglo de pares con `Object.entries`. Con `map` invierto cada par usando desestructuración, y con `Object.fromEntries` lo vuelvo a convertir en objeto. Si dos claves comparten valor, la última sobrescribe a la anterior, porque un objeto no puede tener claves repetidas; si eso importara, guardaría un arreglo de claves por cada valor. Es O(n) y no modifica el original."

## Conceptos

- **`Object.entries(obj)`**: convierte un objeto en un arreglo de pares `[clave, valor]`.
- **`Object.fromEntries(pares)`**: hace lo inverso, crea un objeto a partir de pares.
- **`Object.keys(obj)`**: devuelve solo las claves; `Object.values(obj)` solo los valores.
- **Desestructuración de arreglos**: `([clave, valor]) => ...` saca los elementos de un arreglo en variables.
- **Claves de objeto**: siempre son textos; los números se convierten en texto.
- **Claves únicas**: asignar una clave que ya existe sobrescribe su valor.
- **`for...in`**: recorre las claves de un objeto.
