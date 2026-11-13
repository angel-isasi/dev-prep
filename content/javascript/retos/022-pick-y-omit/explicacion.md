## Idea clave

Conviertes a **pares `[clave, valor]`**, filtras los que quieres y vuelves a armar un objeto con `Object.fromEntries`. `pick` parte de las claves pedidas y se queda con las que existen; `omit` parte de todas las propiedades y descarta las de la lista.

## Paso a paso

1. **`pick`**: recorre el arreglo `claves`.
2. Filtra las que existen en el objeto con `clave in obj`.
3. Convierte cada una en un par `[clave, obj[clave]]` con `map`.
4. Arma el objeto con `Object.fromEntries`.
5. **`omit`**: convierte el objeto en pares con `Object.entries(obj)`.
6. Filtra los pares cuya clave **no** está en la lista: `!claves.includes(clave)`.
7. Arma el objeto con `Object.fromEntries`.

```js
export function pick(obj, claves) {
  return Object.fromEntries(claves.filter((clave) => clave in obj).map((clave) => [clave, obj[clave]]));
}

export function omit(obj, claves) {
  return Object.fromEntries(Object.entries(obj).filter(([clave]) => !claves.includes(clave)));
}
```

## Por qué funciona

`omit(u, ["clave"])` con `u = { id: 1, nombre: "Ana", clave: "secreta" }`:

| Paso | Resultado |
|---|---|
| `Object.entries(u)` | `[["id", 1], ["nombre", "Ana"], ["clave", "secreta"]]` |
| `filter(([clave]) => !["clave"].includes(clave))` | `[["id", 1], ["nombre", "Ana"]]` |
| `Object.fromEntries(...)` | `{ id: 1, nombre: "Ana" }` |

`pick(u, ["id", "edad"])`:

| Paso | Resultado |
|---|---|
| `filter((clave) => clave in u)` | `["id"]` (`"edad" in u` es `false`) |
| `map((clave) => [clave, u[clave]])` | `[["id", 1]]` |
| `Object.fromEntries(...)` | `{ id: 1 }` |

En `filter(([clave]) => ...)` se usa **desestructuración**: cada par `["id", 1]` se desarma y `clave` toma el primer elemento.

¿Por qué `clave in obj`? Porque responde "¿existe la propiedad?", aunque su valor sea `undefined`, `null` o `0`. Comprobar `obj[clave] !== undefined` dejaría fuera una propiedad que existe con valor `undefined`.

## Errores comunes

- **Usar `delete` sobre el objeto original.** `omit` funcionaría, pero rompes el original. Lo reconoces porque el test de inmutabilidad ve que `u` perdió `clave`.
- **En `pick`, no filtrar las claves inexistentes.** Aparece `{ id: 1, edad: undefined }`. Lo reconoces porque el test dice que `"edad" in resultado` es `true`.
- **Filtrar con `obj[clave]` (truthy).** Pierdes las propiedades con `0`, `""`, `null` o `false`. Lo reconoces porque falla el test de los falsy.
- **En `omit`, invertir la condición.** Si olvidas el `!`, `omit` hace lo mismo que `pick`. Lo reconoces porque recibes `{ clave: "secreta" }`.
- **Copiar con `const copia = obj` y luego `delete`.** Eso no es una copia: es otra variable que apunta al mismo objeto.

## Otra forma de resolverlo

`omit` con desestructuración y rest, cuando las claves se conocen al escribir el código:

```js
const { clave, ...sinClave } = usuario;
// sinClave: { id: 1, nombre: "Ana" }
```

Es la forma más usada en React para quitar una prop antes de pasar el resto a otro componente. Pero solo sirve si escribes la clave a mano; con una lista dinámica necesitas la función.

Y `pick` con un bucle clásico, sin `fromEntries`:

```js
export function pick(obj, claves) {
  const resultado = {};
  for (const clave of claves) {
    if (clave in obj) resultado[clave] = obj[clave];
  }
  return resultado;
}
```

Es más largo pero muy claro. Si la lista de claves es grande, en `omit` conviene convertirla en `Set` (`new Set(claves)`) para que cada búsqueda sea O(1) en vez de recorrer el arreglo con `includes`.

## Cómo explicarlo en la entrevista

> "Convierto el objeto en pares con `Object.entries`, filtro las claves que quiero o no quiero y lo vuelvo a armar con `Object.fromEntries`. Así nunca toco el original. En `pick` uso el operador `in` para incluir solo las claves que existen, aunque valgan `undefined` o `0`. `omit` es muy útil para no mandar campos sensibles, como una contraseña, al frontend. Si las claves son fijas, uso desestructuración con rest."

## Conceptos

- **`Object.entries(obj)`**: arreglo de pares `[clave, valor]`.
- **`Object.fromEntries(pares)`**: arma un objeto a partir de pares.
- **Operador `in`**: `"clave" in obj` dice si la propiedad existe (propia o heredada).
- **`includes`**: dice si un arreglo contiene un valor.
- **Desestructuración con rest**: `const { a, ...resto } = obj` separa `a` del resto.
- **Inmutabilidad**: crear objetos nuevos en vez de modificar los existentes.
