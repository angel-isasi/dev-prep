## Idea clave

Dos operadores modernos hacen todo el trabajo:

- **`?.` (encadenamiento opcional)**: si lo de la izquierda es `null` o `undefined`, se detiene y da `undefined` en lugar de lanzar un error.
- **`??` (fusión de nulos)**: devuelve el lado derecho solo si el izquierdo es `null` o `undefined`. El `0` lo deja pasar.

## Paso a paso

1. **Lee la ruta con `?.`** en cada paso que puede faltar: `producto?.inventario?.stock`.
2. **Pon el valor por defecto con `??`**: si lo anterior dio `null` o `undefined`, devuelve `null`.

```js
export function stockDe(producto) {
  return producto?.inventario?.stock ?? null;
}
```

## Por qué funciona

| `producto` | `producto?.inventario?.stock` | `... ?? null` |
|---|---|---|
| `{ inventario: { stock: 15 } }` | `15` | `15` |
| `{ inventario: { stock: 0 } }` | `0` | `0` (el `0` no es null ni undefined) |
| `{ nombre: "Casaca" }` | `producto.inventario` es `undefined`, se detiene: `undefined` | `null` |
| `{ inventario: {} }` | `undefined` (no hay `stock`) | `null` |
| `null` | se detiene en el primer `?.`: `undefined` | `null` |

Sin `?.`, `null.inventario` lanza `TypeError: Cannot read properties of null (reading 'inventario')`.

## Errores comunes

- **Usar `||` en vez de `??`.** `0 || null` da `null`, porque `||` reemplaza cualquier valor falsy. Lo reconoces porque el test del stock 0 recibe `null`.
- **Poner `?.` solo al final.** `producto.inventario?.stock` sigue explotando con `producto` en `null`: el `?.` protege solo el acceso que está justo después.
- **Encadenar `&&` a mano y caer en la misma trampa.** `producto && producto.inventario && producto.inventario.stock` funciona para leer, pero con `|| null` al final vuelves a perder el 0.
- **Envolver todo en `try/catch`.** Funciona, pero es usar un martillo para algo que el lenguaje ya resuelve en una línea.
- **Creer que `?.` cubre todo lo falsy.** Solo se detiene con `null` y `undefined`. `0?.toString()` sí se ejecuta y da `"0"`.

## Otra forma de resolverlo

La forma "antigua", antes de que existieran `?.` y `??` (ES2020):

```js
export function stockDe(producto) {
  if (producto === null || producto === undefined) return null;
  if (producto.inventario === null || producto.inventario === undefined) return null;
  const stock = producto.inventario.stock;
  return stock === undefined || stock === null ? null : stock;
}
```

Es exactamente lo que hacen `?.` y `??` por dentro, pero en cuatro líneas.

**¿Cuál conviene?** La de una línea. Es el estándar actual y lo verás en todo proyecto con React.

## Cómo explicarlo en la entrevista

> "Uso encadenamiento opcional para leer la ruta sin que explote si falta alguna parte: si encuentra `null` o `undefined`, se detiene y da `undefined`. Después uso `??` en lugar de `||` para el valor por defecto, porque `||` reemplazaría también el 0, y un stock de 0 es un dato válido."

## Conceptos

- **Encadenamiento opcional `?.`**: lee una propiedad solo si lo anterior no es `null` ni `undefined`. También sirve para métodos (`obj.metodo?.()`) y corchetes (`obj?.[clave]`).
- **Fusión de nulos `??`**: valor por defecto solo para `null` y `undefined`.
- **`||` como valor por defecto**: reemplaza cualquier falsy (`0`, `""`, `false`, `NaN`, `null`, `undefined`).
- **`TypeError: Cannot read properties of undefined`**: el error que aparece al leer una propiedad de `undefined` o `null`.
- **`null` vs `undefined`**: `undefined` es "no se asignó nada"; `null` es "vacío a propósito".
