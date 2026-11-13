La parte de una URL que va después del `?` se llama **query string**: `?q=cortos%20ica&pagina=2`. Escribe dos funciones para leerla y armarla:

- `parsearQuery(qs)`: convierte un query string en un **objeto**.
- `crearQuery(obj)`: convierte un objeto en un query string (sin el `?` inicial).

## Reglas

- `parsearQuery` acepta el texto con o sin `?` al inicio.
- Los valores se **decodifican**: `%20` y `+` son espacios, `%C3%B1` es `ñ`.
- Todos los valores leídos son textos: `pagina=2` da `"2"`, no el número 2.
- Un query string vacío (`""` o `"?"`) da `{}`.
- `crearQuery` **omite** las propiedades cuyo valor es `undefined` o `""`.
- `crearQuery` **codifica** los caracteres especiales: el espacio se vuelve `+`, `&` se vuelve `%26`, `ñ` se vuelve `%C3%B1`.
- Las claves salen en el orden del objeto, separadas por `&`.

## Ejemplos

```js
parsearQuery("?q=cortos%20ica&pagina=2");   // { q: "cortos ica", pagina: "2" }
parsearQuery("q=cortos+ica");               // { q: "cortos ica" }
parsearQuery("");                           // {}

crearQuery({ q: "cortos ica", pagina: 2, vacio: "" });   // "q=cortos+ica&pagina=2"
crearQuery({ q: "a&b" });                                // "q=a%26b"
crearQuery({});                                          // ""
```

## Por qué importa

Los filtros de una tienda online, la búsqueda y la página actual viven en la URL para que el usuario pueda compartir el enlace o volver con el botón "atrás". Leer y armar query strings es tarea diaria en el frontend, y hacerlo "a mano" con `split` y concatenaciones es una fuente clásica de errores con espacios y caracteres especiales.
