## Idea clave

Abrir y cerrar es solo cambiar `fondo.hidden`. La parte que se evalúa en una entrevista es el **clic fuera de la caja**: como los eventos suben por los padres (bubbling), un clic en el texto también llega al listener del fondo. Lo distingues con `event.target`, que es el elemento exacto donde se hizo clic: solo cierras si `event.target === fondo`.

## Paso a paso

1. **Arma la estructura** con `createElement` y `append`: `h2`, `p` y el botón Cerrar dentro de `.modal`; `.modal` dentro de `.fondo`; el botón Abrir y `.fondo` dentro del contenedor. Título y texto con `textContent`.
2. **Empieza cerrado**: `fondo.hidden = true`.
3. **Dos funciones pequeñas**, `abrirModal` y `cerrarModal`, para no repetir `fondo.hidden = ...` en cuatro lugares.
4. **Botones**: Abrir llama a `abrirModal`; Cerrar, a `cerrarModal`.
5. **Clic en el fondo**: un listener en `fondo` que solo cierra si `event.target === fondo`.
6. **Escape**: un listener de `keydown` en `document` (las teclas llegan al documento, no a un div) que cierra si `event.key === "Escape"`.

```js
export function montarModal(contenedor, titulo, texto) {
  const abrir = document.createElement("button");
  abrir.className = "abrir";
  abrir.textContent = "Abrir";

  const fondo = document.createElement("div");
  fondo.className = "fondo";
  fondo.hidden = true;

  const modal = document.createElement("div");
  modal.className = "modal";

  const h2 = document.createElement("h2");
  h2.textContent = titulo;

  const p = document.createElement("p");
  p.textContent = texto;

  const cerrar = document.createElement("button");
  cerrar.className = "cerrar";
  cerrar.textContent = "Cerrar";

  modal.append(h2, p, cerrar);
  fondo.append(modal);
  contenedor.append(abrir, fondo);

  const abrirModal = () => {
    fondo.hidden = false;
  };
  const cerrarModal = () => {
    fondo.hidden = true;
  };

  abrir.addEventListener("click", abrirModal);
  cerrar.addEventListener("click", cerrarModal);

  fondo.addEventListener("click", (event) => {
    if (event.target === fondo) cerrarModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarModal();
  });
}
```

## Por qué funciona

Qué pasa con cada clic cuando el modal está abierto. El evento empieza en el elemento clicado y sube: `p`, luego `.modal`, luego `.fondo`, luego el contenedor, hasta `document`.

| Clic en | Listeners que se ejecutan al subir | `event.target` en el listener del fondo | ¿Cierra? |
|---|---|---|---|
| `<p>` | el del fondo | `p` | no |
| `.modal` (la caja) | el del fondo | `modal` | no |
| Cerrar | el de Cerrar y luego el del fondo | `cerrar` | sí, por el de Cerrar |
| `.fondo` (la parte oscura) | el del fondo | `fondo` | sí |

`event.target` es dónde **empezó** el evento y no cambia mientras sube. `event.currentTarget` es el elemento cuyo listener se está ejecutando ahora (en el listener del fondo, siempre `fondo`). Por eso comparamos `target` y no `currentTarget`.

El botón Cerrar también "sube" al fondo, pero ahí `target` es el botón y el listener del fondo no hace nada. Igual el modal ya se cerró por el listener del propio botón.

## Errores comunes

- **Cerrar con cualquier clic en el fondo**: `fondo.addEventListener("click", cerrarModal)`. Por el bubbling, un clic en el título o el texto también cierra el modal. Falla el test "un clic dentro de la caja no".
- **Arreglarlo con `stopPropagation` en la caja**: `modal.addEventListener("click", (e) => e.stopPropagation())`. Funciona, pero corta el evento para todo lo que esté más arriba (por ejemplo, un listener de analítica en `document`). Comparar `event.target` es más limpio.
- **Escuchar `keydown` en el fondo o en el modal**: un `div` normal no recibe el foco del teclado, así que nunca recibe la tecla. Escúchalo en `document`.
- **Comparar `event.keyCode === 27`**: `keyCode` está obsoleto. Usa `event.key === "Escape"`.
- **Abrir con `fondo.style.display = "block"`** y cerrar con `"none"`: funciona en el navegador, pero el test revisa `hidden`. Además mezcla estilos con lógica; `hidden` o una clase CSS es más ordenado.
- **Usar `innerHTML` con el título**: si el título viene de datos del usuario, es una puerta a XSS. El último test lo revisa.

## Otra forma de resolverlo

Con el elemento nativo `<dialog>`, que los navegadores modernos ya traen:

```js
const dialogo = document.createElement("dialog");
dialogo.append(h2, p, cerrar);
abrir.addEventListener("click", () => dialogo.showModal());
cerrar.addEventListener("click", () => dialogo.close());
dialogo.addEventListener("click", (event) => {
  if (event.target === dialogo) dialogo.close();   // clic en el fondo (::backdrop)
});
```

`showModal()` ya pone el fondo oscuro, cierra con Escape solo, mueve el foco dentro del modal y bloquea el resto de la página, lo cual mejora la accesibilidad. En una entrevista, mencionarlo suma puntos. Igual te piden hacerlo "a mano", porque así demuestras que entiendes eventos y bubbling, y por eso este ejercicio lo pide con `div`.

Un detalle de producción: el listener de `keydown` queda en `document` para siempre. En una app real devolverías una función para limpiarlo (`document.removeEventListener("keydown", alPresionar)`), igual que hace el `return` de un `useEffect` en React.

## Cómo explicarlo en la entrevista

> "El modal es un div de fondo con una caja adentro, oculto con `hidden`. Los botones lo abren y cierran cambiando esa propiedad. Para cerrar al hacer clic afuera, escucho el clic en el fondo, pero como los clics de adentro suben por bubbling, reviso `event.target`: solo cierro si el clic fue en el fondo mismo. Para Escape escucho `keydown` en `document` y reviso `event.key`. En producción usaría `<dialog>` con `showModal()`, que ya resuelve el foco y la accesibilidad."

## Conceptos

- **Bubbling**: un evento empieza en el elemento clicado y sube por todos sus padres.
- **`event.target`**: el elemento donde empezó el evento.
- **`event.currentTarget`**: el elemento cuyo listener se está ejecutando.
- **`hidden`**: atributo y propiedad que oculta un elemento.
- **`keydown` y `event.key`**: detectar teclas, escuchando en `document`.
- **`stopPropagation`**: corta la subida del evento; úsalo con cuidado.
- **`<dialog>` y `showModal()`**: el modal nativo y accesible del navegador.
