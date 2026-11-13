Escribe la función `crearLista(items)` que reciba un arreglo y devuelva un elemento **`<ul>`** con un **`<li>`** por cada elemento, en el mismo orden.

## Reglas

- Devuelve el `<ul>` creado; no hace falta agregarlo a la página (eso lo decide quien llame a tu función).
- Cada `<li>` muestra el elemento como **texto**. Si un elemento trae etiquetas, como `"<b>hola</b>"`, se deben ver tal cual, no como HTML.
- Con un arreglo vacío, devuelve un `<ul>` sin hijos.
- Los elementos pueden ser textos o números.

## Ejemplos

```js
const ul = crearLista(["Pan", "Leche", "Huevos"]);
ul.outerHTML;
// "<ul><li>Pan</li><li>Leche</li><li>Huevos</li></ul>"

crearLista([]).outerHTML;            // "<ul></ul>"
crearLista([1, 2]).outerHTML;        // "<ul><li>1</li><li>2</li></ul>"

crearLista(["<b>hola</b>"]).outerHTML;
// "<ul><li>&lt;b&gt;hola&lt;/b&gt;</li></ul>"   (se ve el texto, no la negrita)

// Para mostrarla en la página:
document.body.append(crearLista(["Pan", "Leche"]));
```

## Por qué importa

"Pinta esta lista de productos que te llega de la API" es el ejercicio de DOM más pedido en entrevistas junior. Además, te obliga a elegir entre `textContent` e `innerHTML`, y esa elección es justo lo que separa una página segura de una con un agujero XSS.
