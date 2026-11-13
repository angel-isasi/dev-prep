## Idea clave

Primero **cuentas** con `reduce` y un objeto (el patrón "contador"), después **conviertes** el objeto en texto con `Object.entries`, `map` y `join`. El componente solo une las piezas y cubre el caso vacío.

## Paso a paso

1. **Contador con `reduce`.** Empiezas con `{}`. Por cada pedido, lees lo que había para ese estado; si no había nada, `?? 0` lo trata como 0. Le sumas 1 y lo guardas.
2. **Devuelve el acumulador** en cada vuelta.
3. **Caso vacío primero.** En el componente, si no hay pedidos, devuelves `<p>Sin pedidos</p>` y terminas (un *early return*).
4. **Objeto a frases.** `Object.entries(conteo)` da `[["en horno", 2], ["listo", 1]]`; el `map` arma `"2 en horno"` y `"1 listo"`.
5. **Une** con `join(", ")`, que pone el separador **entre** elementos (no al final).

```jsx
export function contarPorEstado(pedidos) {
  return pedidos.reduce((conteo, pedido) => {
    conteo[pedido.estado] = (conteo[pedido.estado] ?? 0) + 1;
    return conteo;
  }, {});
}

export function ResumenEstados({ pedidos }) {
  if (pedidos.length === 0) return <p>Sin pedidos</p>;

  const conteo = contarPorEstado(pedidos);
  const texto = Object.entries(conteo)
    .map(([estado, cantidad]) => `${cantidad} ${estado}`)
    .join(", ");

  return <p>{texto}</p>;
}
```

## Por qué funciona

Con los 3 pedidos del ejemplo:

| Vuelta | `pedido.estado` | `conteo[estado] ?? 0` | `conteo` después |
|---|---|---|---|
| 1 | `"en horno"` | `0` | `{ "en horno": 1 }` |
| 2 | `"listo"` | `0` | `{ "en horno": 1, listo: 1 }` |
| 3 | `"en horno"` | `1` | `{ "en horno": 2, listo: 1 }` |

Las claves con espacio (`"en horno"`) funcionan sin problema con la notación de corchetes. El orden de las claves es el de inserción, por eso "en horno" va primero. Luego: `["2 en horno", "1 listo"].join(", ")` es `"2 en horno, 1 listo"`.

Sin el caso vacío, `Object.entries({})` es `[]`, `join` da `""` y se vería un párrafo vacío: el usuario no sabe si está cargando o si no hay nada.

## Errores comunes

- **`conteo[estado]++` sin inicializar.** `undefined + 1` es `NaN`, y verías "NaN en horno".
- **Usar `||` en vez de `??`.** Aquí da igual porque el conteo nunca es 0 antes de sumar, pero `??` es la elección correcta: solo reemplaza `null` y `undefined`, no el `0`.
- **Armar el texto con `+=` y una coma al final.** Te queda `"2 en horno, 1 listo, "`. `join` resuelve los separadores solo.
- **Escribir `conteo.estado`** en vez de `conteo[pedido.estado]`: crea una clave literal llamada "estado".
- **Olvidar el caso vacío.** Párrafo en blanco que no comunica nada.

## Otra forma de resolverlo

Sin mutar el acumulador, creando un objeto nuevo en cada vuelta (como en la fuente original):

```jsx
const conteo = pedidos.reduce(
  (c, p) => ({ ...c, [p.estado]: (c[p.estado] ?? 0) + 1 }),
  {}
);
```

Y con `Map`, útil si los estados pudieran no ser textos:

```jsx
const conteo = new Map();
for (const { estado } of pedidos) conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
const texto = [...conteo].map(([estado, n]) => `${n} ${estado}`).join(", ");
```

**¿Cuándo conviene?** La versión con spread es elegante y se ve mucho en React, pero copia el objeto en cada vuelta: con miles de pedidos es más lenta. Mutar el acumulador es seguro porque lo creó `reduce` y nadie más lo ve. `Map` conviene con claves que no son texto o cuando agregas y quitas claves seguido.

## Cómo explicarlo en la entrevista

> "Separé el conteo en una función pura que usa `reduce` con un objeto como acumulador: por cada pedido sumo 1 a su estado, empezando en 0 con `??`. Mutar el acumulador es seguro porque lo crea el propio `reduce`. En el componente, primero cubro el caso sin pedidos; después convierto el conteo en frases con `Object.entries` y `map`, y las uno con `join(', ')` para que no quede una coma al final."

## Conceptos

- **Patrón contador**: objeto donde cada clave guarda cuántas veces apareció.
- **`??` (nullish coalescing)**: valor por defecto solo para `null` o `undefined`.
- **Claves computadas**: `conteo[variable]` y `{ [variable]: valor }`.
- **`join(separador)`**: une un arreglo de textos con un separador entre ellos.
- **Early return**: devolver antes para los casos especiales.
- **`Map`**: diccionario que acepta cualquier tipo de clave.
