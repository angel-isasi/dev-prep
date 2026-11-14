## Idea clave

Los filtros opcionales viajan en la **query string** (`?categoria=audio&max=100`) y Express los deja en `req.query`, siempre como texto. Primero **validas** (si algo no tiene sentido, `400` y terminas) y después **filtras** encadenando un `filter` por cada parámetro que sí vino.

## Paso a paso

1. **Leer los parámetros.** `const { categoria, max } = req.query;`. Si no vinieron, valen `undefined`.
2. **Validar `max` primero.** Si vino, conviértelo con `Number`. Si da `NaN`, respondes `400` con el mensaje y haces `return`. Validar antes de filtrar evita trabajar con datos malos.
3. **Decidir qué es "vino".** `if (max)` es `false` para `undefined` y para `""` (el caso `?max=`), y `true` para `"0"`, porque un texto no vacío siempre es truthy. Justo lo que pide el enunciado.
4. **Filtrar de forma acumulativa.** Empiezas con `let resultado = PRODUCTOS` y, por cada filtro presente, lo reemplazas por `resultado.filter(...)`. Así se combinan solos: el segundo filtro trabaja sobre lo que dejó el primero.
5. **Responder.** `res.json(resultado)`. Si quedó vacío, igual es `200`: la búsqueda fue válida, solo que no hay coincidencias.

```js
app.get("/productos", (req, res) => {
  const { categoria, max } = req.query;

  let precioMaximo = null;
  if (max) {
    precioMaximo = Number(max);
    if (Number.isNaN(precioMaximo)) {
      return res.status(400).json({ error: "max debe ser un número" });
    }
  }

  let resultado = PRODUCTOS;
  if (categoria) resultado = resultado.filter((p) => p.categoria === categoria);
  if (precioMaximo !== null) resultado = resultado.filter((p) => p.precio <= precioMaximo);

  res.json(resultado);
});
```

## Por qué funciona

Recorrido con `GET /productos?categoria=perifericos&max=150`:

| Paso | Valor |
|---|---|
| `req.query` | `{ categoria: "perifericos", max: "150" }` |
| `precioMaximo` | `Number("150")` = `150`, no es `NaN`, sigue |
| Tras filtrar por categoría | Teclado (120), Mouse (45), Webcam (200) |
| Tras filtrar por precio `<= 150` | Teclado (120), Mouse (45) |
| Respuesta | `200` con esos dos |

Con `?max=barato`: `Number("barato")` es `NaN`, entra al `if`, responde `400` y el `return` evita llegar al filtro.

Con `?max=`: `req.query.max` es `""`, que es falsy, así que `precioMaximo` se queda en `null` y no se filtra por precio. Si hubieras hecho `Number("")` sin preguntar, te daría `0` y no devolverías nada.

## Errores comunes

- **No convertir a número**: `p.precio <= "100"` funciona por casualidad (JavaScript convierte), pero `"barato"` nunca da error y devuelve `[]` con 200. El test del 400 falla.
- **Comprobar `isNaN` en vez de `Number.isNaN`**: `isNaN("barato")` también funciona, pero `Number.isNaN` no convierte nada y es lo que se espera ver hoy.
- **Usar `if (max !== undefined)`** y olvidar el caso vacío: `?max=` se convierte en `0` y filtras todo. Lo reconoces en el test del parámetro vacío.
- **Usar `<` en vez de `<=`**: el Parlante de 150 desaparece con `?max=150`.
- **Hacer `PRODUCTOS = PRODUCTOS.filter(...)`** o modificar el arreglo original: la siguiente petición ya no ve todos los productos. Por eso `resultado` es una variable nueva.
- **Responder 404 cuando no hay resultados**: una lista vacía es un resultado válido. 404 es para un recurso que no existe, como `/productos/99`.

## Otra forma de resolverlo

Un solo `filter` con todas las condiciones:

```js
const resultado = PRODUCTOS.filter(
  (p) =>
    (!categoria || p.categoria === categoria) &&
    (precioMaximo === null || p.precio <= precioMaximo),
);
```

Cada condición dice "o no vino el filtro, o el producto lo cumple". Recorre la lista una sola vez y es compacto. La versión encadenada se lee mejor cuando los filtros crecen (cinco o seis), porque cada uno queda en su línea y es fácil agregar o quitar. Para este tamaño, cualquiera de las dos.

## Cómo explicarlo en la entrevista

> "Los filtros opcionales van en la query string porque no cambian el recurso, solo qué parte de la lista quiero. Express los deja en req.query como strings, así que primero valido: si max vino y Number da NaN, respondo 400 Bad Request, porque el error es del cliente. Luego filtro de forma acumulativa, aplicando cada filter solo si el parámetro vino. Si no hay coincidencias devuelvo 200 con un arreglo vacío, porque la búsqueda en sí era válida."

## Conceptos

- **Query string y `req.query`**: parámetros opcionales para filtrar, ordenar o paginar.
- **`req.params` vs `req.query`**: `/productos/:id` identifica un recurso; `?max=` filtra una lista.
- **Conversión de tipos**: todo lo de la URL es texto; `Number` y `Number.isNaN`.
- **400 Bad Request**: la petición del cliente es inválida.
- **Truthy y falsy**: `""` es falsy, `"0"` es truthy.
- **`filter` encadenado**: combinar condiciones opcionales sin modificar el original.
