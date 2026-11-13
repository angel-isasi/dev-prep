## Idea clave

Construyes el HTML con objetos, no con texto: creas el `<ul>`, creas cada `<li>` con `document.createElement`, le pones el contenido con `textContent` (siempre texto, nunca HTML) y lo cuelgas del padre con `append`.

## Paso a paso

1. **Crea el contenedor**: `const ul = document.createElement("ul")`. Existe en memoria, pero todavía no está en la página.
2. **Recorre el arreglo** con `for...of`.
3. **Crea un `<li>`** en cada vuelta.
4. **Ponle el texto** con `li.textContent = item`. Si `item` es un número, se convierte solo a texto.
5. **Cuélgalo** del `<ul>` con `ul.append(li)`, que lo agrega al final y respeta el orden.
6. **Devuelve el `<ul>`**. Quien llame a la función decide dónde mostrarlo, por ejemplo con `document.body.append(ul)`.

```js
export function crearLista(items) {
  const ul = document.createElement("ul");

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    ul.append(li);
  }

  return ul;
}
```

## Por qué funciona

Recorrido con `crearLista(["Pan", "<b>hola</b>"])`:

| Vuelta | `item` | Lo que se agrega | `ul.outerHTML` al terminar la vuelta |
|---|---|---|---|
| antes | | | `<ul></ul>` |
| 1 | `"Pan"` | un `<li>` con el texto `Pan` | `<ul><li>Pan</li></ul>` |
| 2 | `"<b>hola</b>"` | un `<li>` con el texto `<b>hola</b>` | `<ul><li>Pan</li><li>&lt;b&gt;hola&lt;/b&gt;</li></ul>` |

En la vuelta 2, `textContent` no interpreta las etiquetas: el navegador las escapa (`&lt;` es `<`) y en pantalla se ve `<b>hola</b>` literal. No se crea ningún elemento `<b>`, por eso `li.children.length` es 0. Lo mismo con el `<img onerror=...>` del test: queda como texto inofensivo y el código del atacante nunca se ejecuta.

Con el arreglo vacío el bucle no da vueltas y se devuelve `<ul></ul>`.

## Errores comunes

- **Usar `innerHTML` con los datos**: `li.innerHTML = item`. Con `"<b>hola</b>"` crea una negrita real, y con `<img src="x" onerror="...">` ejecuta el código del atacante. Es un **XSS**. Lo reconoces porque falla el test de las etiquetas.
- **Armar todo como texto**: `ul.innerHTML += "<li>" + item + "</li>"`. Tiene el mismo problema de XSS y, además, en cada vuelta el navegador vuelve a leer y reconstruir todo el contenido del `<ul>`.
- **Olvidar el `return ul`**: la función devuelve `undefined` y los tests fallan con "Cannot read properties of undefined (reading 'tagName')".
- **Crear un solo `<li>` fuera del bucle** y reutilizarlo: `append` **mueve** el elemento, no lo copia. Al final solo queda un `<li>`, con el último texto.
- **Agregarlo a `document.body` dentro de la función**: el enunciado pide devolverlo. Una función que solo crea es más fácil de probar y de reutilizar.

## Otra forma de resolverlo

Con `map` y `append` con spread:

```js
export function crearLista(items) {
  const ul = document.createElement("ul");
  const lis = items.map((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  });
  ul.append(...lis);
  return ul;
}
```

`append` acepta varios nodos a la vez, así que `ul.append(...lis)` los agrega todos en una sola operación.

Si fueran cientos de elementos y el `<ul>` ya estuviera en la página, convendría un `DocumentFragment` (`document.createDocumentFragment()`): armas todo en el fragmento y lo agregas una vez, para que el navegador redibuje una sola vez. Aquí el `<ul>` todavía no está en la página, así que no hace falta.

## Cómo explicarlo en la entrevista

> "Creo el `<ul>` con `createElement`, recorro el arreglo y por cada elemento creo un `<li>`, le pongo el contenido con `textContent` y lo agrego con `append`. Uso `textContent` y no `innerHTML` porque los datos pueden venir del usuario o de una API: con `innerHTML` alguien podría inyectar HTML con un script, que es un ataque XSS. Devuelvo el elemento en vez de pegarlo en la página, así la función es reutilizable y fácil de testear."

## Conceptos

- **DOM**: el HTML convertido en objetos que JavaScript puede crear y modificar.
- **`document.createElement(etiqueta)`**: crea un elemento en memoria.
- **`textContent`**: lee o escribe solo texto; escapa cualquier etiqueta.
- **`innerHTML`**: interpreta el texto como HTML; peligroso con datos externos.
- **`append(...nodos)`**: agrega uno o varios nodos al final de un elemento; si el nodo ya estaba en otro lugar, lo mueve.
- **XSS (Cross-Site Scripting)**: inyectar código en una página a través de datos que se muestran como HTML.
