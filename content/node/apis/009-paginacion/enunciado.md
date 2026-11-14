Exporta `crearApp()` con la ruta `GET /articulos`, que devuelve los artículos **por páginas**. El archivo de inicio trae 23 artículos: `{ id: 1, titulo: "Artículo 1" }` hasta `{ id: 23, titulo: "Artículo 23" }`.

Una API nunca devuelve miles de filas de golpe: el cliente pide una **página** y el servidor le dice, además, cuántas hay en total para que el frontend pueda dibujar los botones "Anterior / Siguiente".

## Parámetros (query string)

- `page`: número de página, empezando en **1**. Por defecto `1`.
- `limit`: cuántos artículos por página. Por defecto `10`. **Máximo 50**: si piden más, usa 50 (así nadie te tumba el servidor pidiendo `limit=1000000`).

## Respuesta

Siempre `200` con este objeto:

```js
{
  datos: [/* los artículos de esa página */],
  pagina: 2,      // la página que se devolvió
  limite: 10,     // el límite que se usó (ya recortado a 50 si hacía falta)
  total: 23,      // cuántos artículos hay en total
  paginas: 3,     // cuántas páginas hay con ese límite
}
```

## Reglas

- `page` y `limit` deben ser **enteros mayores o iguales a 1**. Si no (`0`, `-1`, `abc`, `2.5`), responde `400` con `{ "error": "page y limit deben ser enteros positivos" }`.
- Una página que se pasa del final (por ejemplo `page=9`) **no es error**: responde `200` con `datos: []` y los demás datos normales.
- Para calcular desde dónde cortar: los artículos de la página `p` empiezan en la posición `(p - 1) * limite`.

## Ejemplos

```js
// GET /articulos
{ datos: [ids 1 a 10], pagina: 1, limite: 10, total: 23, paginas: 3 }

// GET /articulos?page=3
{ datos: [ids 21, 22, 23], pagina: 3, limite: 10, total: 23, paginas: 3 }

// GET /articulos?page=2&limit=5
{ datos: [ids 6 a 10], pagina: 2, limite: 5, total: 23, paginas: 5 }

// GET /articulos?limit=100
{ datos: [los 23], pagina: 1, limite: 50, total: 23, paginas: 1 }

// GET /articulos?page=0
// 400 { "error": "page y limit deben ser enteros positivos" }
```
