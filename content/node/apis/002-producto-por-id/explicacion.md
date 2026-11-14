## Idea clave

Un **parámetro de ruta** (`/productos/:id`) captura una parte variable de la URL en `req.params.id`, siempre como **texto**. Lo conviertes a número, buscas el producto y, si no existe, respondes tú mismo `404` con `res.status(404).json(...)`.

## Paso a paso

1. **La lista completa** es la ruta fácil: `app.get("/productos", ...)` con `res.json(PRODUCTOS)`. `res.json` acepta arreglos igual que objetos.
2. **La ruta con hueco.** `app.get("/productos/:id", ...)` coincide con `/productos/1`, `/productos/99` y también con `/productos/abc`. Los dos puntos marcan el nombre del parámetro.
3. **Leer y convertir.** `req.params` es un objeto como `{ id: "2" }`. Como `PRODUCTOS` guarda ids numéricos, haces `Number(req.params.id)`.
4. **Buscar.** `PRODUCTOS.find((p) => p.id === id)` devuelve el producto o `undefined`.
5. **Responder según el caso.** Si no hay producto, `return res.status(404).json({ error: "Producto no encontrado" })`. El `return` corta el handler. Si sí hay, `res.json(producto)` con 200.

```js
app.get("/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const producto = PRODUCTOS.find((p) => p.id === id);
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(producto);
});
```

## Por qué funciona

| Petición | `req.params.id` | `Number(...)` | `find` | Respuesta |
|---|---|---|---|---|
| `GET /productos/2` | `"2"` | `2` | Mouse | `200` + el Mouse |
| `GET /productos/99` | `"99"` | `99` | `undefined` | `404` + error |
| `GET /productos/abc` | `"abc"` | `NaN` | `undefined` (NaN no es igual a nada) | `404` + error |
| `GET /productos` | (no aplica) | | | `200` + arreglo |

`res.status(404)` no envía nada todavía: solo guarda el código y devuelve el mismo `res`. Por eso puedes encadenar `.json(...)`, que es el que envía. Sin el `status`, el cuerpo de error saldría con 200 y el cliente creería que todo salió bien.

`GET /productos` no choca con `/productos/:id` porque `:id` exige un segmento más después de la barra.

## Errores comunes

- **Comparar sin convertir**: `p.id === req.params.id` compara `2 === "2"`, que es `false`. Ningún producto aparece y todo da 404. Lo reconoces porque falla "GET /productos/2 devuelve el Mouse".
- **Usar `==` para "arreglarlo"**: funciona, pero esconde el problema del tipo. En una entrevista se ve mejor convertir explícitamente.
- **Olvidar `res.status(404)`**: el cuerpo de error sale con código 200. El test del 404 lo detecta.
- **No poner `return`** y después llamar otra vez a `res.json(producto)`: Express lanza "Cannot set headers after they are sent to the client".
- **Usar `req.query.id`** en vez de `req.params.id`. `query` es para lo que va después del `?` (lo verás en el siguiente ejercicio).
- **Usar `parseInt`** sin pensar: `parseInt("2abc")` da `2` y encontraría el Mouse con una URL rara. `Number("2abc")` da `NaN`, que es más estricto.

## Otra forma de resolverlo

Con un `if / else` en vez del `return` temprano:

```js
if (producto) {
  res.json(producto);
} else {
  res.status(404).json({ error: "Producto no encontrado" });
}
```

Las dos son correctas. El `return` temprano ("guard clause") se usa mucho en APIs porque cuando hay varias validaciones (id inválido, sin permiso, no existe) cada una corta ahí mismo y el camino feliz queda al final sin anidar.

Si quisieras distinguir "id con formato inválido" de "id que no existe", podrías responder `400 Bad Request` cuando `Number.isNaN(id)`. Es más preciso, pero muchos equipos responden 404 en ambos casos.

## Cómo explicarlo en la entrevista

> "Defino la ruta /productos/:id, donde :id es un parámetro de ruta que Express me deja en req.params.id. Como viene de la URL es un string, lo convierto con Number antes de comparar con triple igual. Busco con find; si no encuentro nada respondo 404 con un JSON de error usando res.status(404).json y hago return para no responder dos veces. Si lo encuentro, respondo con el producto y código 200."

## Conceptos

- **Parámetros de ruta**: `/recurso/:id` y `req.params`.
- **Todo lo de la URL es texto**: convierte con `Number` antes de comparar.
- **`res.status(codigo).json(...)`**: elegir el código y luego enviar.
- **404 Not Found**: el recurso pedido no existe.
- **Guard clause**: `return` temprano después de responder.
- **`Array.prototype.find`**: primer elemento que cumple, o `undefined`.
