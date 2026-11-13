Escribe la función `montarModal(contenedor, titulo, texto)` que arme un **botón que abre un modal** dentro de `contenedor`.

Tiene que agregar al contenedor esta estructura:

```html
<button class="abrir">Abrir</button>
<div class="fondo" hidden>
  <div class="modal">
    <h2>{titulo}</h2>
    <p>{texto}</p>
    <button class="cerrar">Cerrar</button>
  </div>
</div>
```

`.fondo` es la capa oscura que cubre toda la pantalla, y `.modal` es la caja blanca del centro. El atributo `hidden` oculta un elemento; desde JavaScript se controla con la propiedad `elemento.hidden = true` o `false`.

## Reglas

- Al montarlo, el modal está **cerrado**: `.fondo` tiene `hidden`.
- Clic en `.abrir`: lo abre (`hidden = false`).
- Clic en `.cerrar`: lo cierra.
- Clic en el **fondo oscuro**, fuera de la caja: lo cierra.
- Clic **dentro** de la caja (en el título, el texto o la caja misma): **no** lo cierra.
- Presionar **Escape** (evento `keydown` en `document`, con `event.key === "Escape"`): lo cierra. Otras teclas no hacen nada.
- El título y el texto se muestran con `textContent`.

## Ejemplos

```js
const caja = document.createElement("div");
document.body.append(caja);
montarModal(caja, "¿Eliminar tarea?", "Esta acción no se puede deshacer.");

const fondo = caja.querySelector(".fondo");
fondo.hidden;                              // true

caja.querySelector(".abrir").click();
fondo.hidden;                              // false

caja.querySelector(".modal p").click();
fondo.hidden;                              // false  (clic dentro de la caja)

fondo.click();
fondo.hidden;                              // true   (clic en el fondo)
```

## Por qué importa

El modal es un clásico de las entrevistas porque pone a prueba algo que muchos no entienden: **el bubbling**. Un clic dentro de la caja también "sube" hasta el fondo, así que si escuchas el clic en el fondo sin pensar, el modal se cierra al hacer clic en cualquier parte. La solución está en `event.target`.
