## En una frase

El **DOM** es tu HTML convertido en objetos que JavaScript puede leer y cambiar, y los **eventos** son los avisos del navegador (un clic, una tecla, un formulario enviado) a los que respondes con `addEventListener`.

## Lo esencial

### Seleccionar elementos

```js
document.querySelector("#titulo");      // por id: el primero que coincida, o null
document.querySelector(".tarjeta");     // por clase
document.querySelector("form input");   // cualquier selector CSS
document.querySelectorAll("li");        // TODOS: una NodeList

contenedor.querySelector("button");     // busca solo dentro de contenedor
```

`querySelectorAll` devuelve una `NodeList`: tiene `forEach` y `length`, pero **no** `map` ni `filter`. Para usarlos, conviértela en arreglo: `[...document.querySelectorAll("li")]`.

### Crear, agregar y quitar

```js
const li = document.createElement("li");   // existe en memoria, aún no se ve
li.textContent = "Comprar pan";
li.className = "tarea";

lista.append(li);          // lo agrega al final (ahora sí se ve)
lista.prepend(otroLi);     // al inicio
li.remove();               // lo quita de la página
lista.replaceChildren();   // vacía la lista
```

### `textContent` frente a `innerHTML` (y XSS)

| | `textContent` | `innerHTML` |
|---|---|---|
| Qué hace | pone texto plano | interpreta el texto como HTML |
| Con `"<b>hola</b>"` | se ve literal: `<b>hola</b>` | se ve **hola** en negrita |
| Con datos del usuario | seguro | peligroso: XSS |

```js
const comentario = '<img src="x" onerror="alert(document.cookie)">';
div.innerHTML = comentario;     // el navegador crea la imagen y ejecuta el código del atacante
div.textContent = comentario;   // se muestra el texto tal cual, inofensivo
```

Regla: lo que viene del usuario o de una API va con `textContent`. `innerHTML` solo con HTML fijo que escribiste tú.

### `classList`

```js
menu.classList.add("abierto");
menu.classList.remove("abierto");
menu.classList.toggle("abierto");          // si la tiene la quita, si no la pone
menu.classList.contains("abierto");        // true o false
boton.classList.toggle("activo", activo);  // con segundo argumento: pone si es true, quita si es false
```

Cambia clases y deja que el CSS haga el resto; es más ordenado que tocar `elemento.style` propiedad por propiedad.

### `addEventListener` y `event.target`

```js
boton.addEventListener("click", (event) => {
  console.log(event.target);          // el elemento exacto donde se hizo clic
  console.log(event.currentTarget);   // el elemento que tiene el listener (boton)
});

buscador.addEventListener("input", (event) => {
  console.log(event.target.value);    // el texto actual, en cada cambio
});
```

| Evento | Cuándo se dispara |
|---|---|
| `click` | clic (o Enter sobre un botón) |
| `input` | cada vez que cambia el valor de un campo |
| `change` | cuando confirmas el cambio (sales del campo, eliges una opción) |
| `submit` | al enviar un formulario (botón o Enter) |
| `keydown` | al presionar una tecla; mira `event.key` |

Se pasa la función, no se llama: `addEventListener("click", guardar)`, sin paréntesis.

### Bubbling: los eventos suben

Un evento ocurre en el elemento y luego **sube** por todos sus padres, hasta `document`.

```js
// <div id="tarjeta"><button id="comprar">Comprar</button></div>
tarjeta.addEventListener("click", () => console.log("tarjeta"));
comprar.addEventListener("click", () => console.log("botón"));

// Clic en el botón: "botón" y luego "tarjeta"
```

`event.stopPropagation()` corta la subida. Úsalo poco: rompe a quien escuche más arriba.

### Delegación de eventos

En vez de un listener por cada `<li>`, pones **uno solo en el padre** y aprovechas el bubbling:

```js
lista.addEventListener("click", (event) => {
  const boton = event.target.closest("button.borrar");
  if (!boton) return;              // el clic no fue en un botón de borrar
  boton.closest("li").remove();
});
```

Funciona también con los `<li>` que agregues después, y usa un solo listener. `closest(selector)` sube desde el elemento (incluido él mismo) hasta encontrar el primero que coincida, o devuelve `null`.

### Formularios y `preventDefault`

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();            // sin esto, la página se recarga
  const datos = new FormData(form);
  const email = datos.get("email");  // según el atributo name del input
  console.log(email);
});
```

Escucha `submit` en el `<form>`, no `click` en el botón: así también funciona al presionar Enter.

## Errores típicos

**1. `querySelector` devuelve `null`.** Selector mal escrito (falta el `.` o el `#`), o el script corre antes de que exista el HTML.

```js
document.querySelector("boton").addEventListener("click", guardar);
// TypeError: Cannot read properties of null (reading 'addEventListener')
```

Revisa el selector y carga el script con `<script src="app.js" defer>` o al final del `<body>`.

**2. Llamar la función en vez de pasarla.**

```js
boton.addEventListener("click", guardar());   // guardar se ejecuta YA, una vez
```

Lo que se registra es lo que devuelve `guardar()` (normalmente `undefined`), así que los clics no hacen nada. Escribe `guardar` sin paréntesis.

**3. `innerHTML` con datos del usuario.** Es la puerta de entrada del XSS.

```js
li.innerHTML = comentario.texto;   // si el texto trae <img onerror=...>, se ejecuta
```

Usa `li.textContent = comentario.texto`. Y evita `lista.innerHTML += ...` en un bucle: además del riesgo, reconstruye todo el contenido en cada vuelta y borra los listeners de los hijos.

**4. Usar `map` sobre `querySelectorAll`.**

```js
document.querySelectorAll("li").map((li) => li.textContent);
// TypeError: document.querySelectorAll(...).map is not a function
```

Conviértela primero: `[...document.querySelectorAll("li")].map(...)`.

**5. Olvidar `preventDefault` en el `submit`.** La página se recarga, se pierde lo que hiciste y parece que "no pasó nada".

**6. Usar `event.target` cuando el botón tiene cosas adentro.**

```js
// <button class="borrar"><span>X</span> Borrar</button>
lista.addEventListener("click", (event) => {
  if (event.target.classList.contains("borrar")) { /* ... */ }
  // si haces clic en el span, target es el span y no entra
});
```

Usa `event.target.closest(".borrar")`.

## Chuleta

- `querySelector` = el primero o `null`; `querySelectorAll` = NodeList (sin `map`: usa `[...lista]`).
- Crear: `createElement`, luego `textContent` / `className`, y al final `append`.
- `textContent` para datos; `innerHTML` solo con HTML fijo tuyo. `innerHTML` + datos del usuario = XSS.
- `classList.add` / `remove` / `toggle` / `contains`.
- `addEventListener("evento", fn)`: pasa `fn`, no `fn()`.
- `event.target` = donde empezó; `event.currentTarget` = quien tiene el listener.
- Los eventos suben (bubbling). Delegación: un listener en el padre + `event.target.closest(...)`.
- Formularios: escucha `submit` y llama a `event.preventDefault()`.
- `input` en cada cambio; `change` al confirmar.

## En la entrevista

**¿Qué es el DOM?**
Es la representación del HTML como un árbol de objetos que el navegador expone a JavaScript. Con él puedo leer y modificar la página: buscar elementos, crear nuevos, cambiar textos y clases, y escuchar eventos.

**¿Diferencia entre `textContent` e `innerHTML`?**
`textContent` lee o escribe solo texto, así que cualquier etiqueta se muestra tal cual. `innerHTML` interpreta el texto como HTML. Con datos del usuario uso `textContent`, porque con `innerHTML` alguien podría inyectar un script (XSS). Existe también `innerText`, que devuelve solo el texto visible según el CSS y es más lento.

**¿Qué es el bubbling? ¿Y la diferencia entre `target` y `currentTarget`?**
Bubbling es que un evento, después de ocurrir en un elemento, sube por todos sus padres. `event.target` es el elemento donde empezó el evento, y `event.currentTarget` es el elemento cuyo listener se está ejecutando. Se diferencian justo cuando el evento viene subiendo desde un hijo.

**¿Qué es la delegación de eventos y para qué sirve?**
Es poner un solo listener en un elemento padre en vez de uno por cada hijo, y usar `event.target` (con `closest`) para saber qué hijo se tocó. Sirve para listas largas y para elementos que se agregan después, porque el listener ya está en el padre.

**¿Diferencia entre `preventDefault` y `stopPropagation`?**
`preventDefault` cancela la acción por defecto del navegador, como recargar la página al enviar un formulario o seguir un enlace. `stopPropagation` detiene la subida del evento hacia los padres. Son independientes: uno no hace lo del otro.
