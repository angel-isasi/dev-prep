## Idea clave

Todo componente interactivo tiene tres piezas: un **estado** (aquí, `let cuenta`), una **vista** (los elementos del DOM) y **eventos** que cambian el estado y luego actualizan la vista. Gracias al closure, cada listener recuerda la `cuenta` y el `<span>` de su propio contador.

## Paso a paso

1. **Estado**: `let cuenta = inicial`. Es `let` porque va a cambiar.
2. **Vista**: crea el `<span>` y los dos `<button>` con `createElement`; pon la clase con `className` y el texto con `textContent`.
3. **Evento de `+1`**: `addEventListener("click", ...)` con una función que hace `cuenta++` y luego `valor.textContent = cuenta`.
4. **Evento de reiniciar**: `cuenta = inicial` y actualiza el texto. Como `inicial` es un parámetro, el listener lo recuerda.
5. **Montaje**: `contenedor.append(valor, sumar, reiniciar)` agrega los tres en orden.

```js
export function montarContador(contenedor, inicial = 0) {
  let cuenta = inicial;

  const valor = document.createElement("span");
  valor.className = "valor";
  valor.textContent = cuenta;

  const sumar = document.createElement("button");
  sumar.className = "sumar";
  sumar.textContent = "+1";

  const reiniciar = document.createElement("button");
  reiniciar.className = "reiniciar";
  reiniciar.textContent = "Reiniciar";

  sumar.addEventListener("click", () => {
    cuenta++;
    valor.textContent = cuenta;
  });

  reiniciar.addEventListener("click", () => {
    cuenta = inicial;
    valor.textContent = cuenta;
  });

  contenedor.append(valor, sumar, reiniciar);
}
```

## Por qué funciona

Recorrido con `montarContador(caja, 2)`:

| Acción | `cuenta` | `valor.textContent` |
|---|---|---|
| al montar | 2 | `"2"` |
| clic en `+1` | 3 | `"3"` |
| clic en `+1` | 4 | `"4"` |
| clic en Reiniciar | 2 | `"2"` |
| clic en `+1` | 3 | `"3"` |

`textContent` siempre guarda texto: al asignarle el número 3, lo convierte en `"3"`. Por eso los tests comparan con textos.

`montarContador` termina de ejecutarse apenas arma todo, pero los listeners siguen vivos y siguen viendo `cuenta`, `valor` e `inicial`: es un **closure**. Y como cada llamada a `montarContador` crea su propia `cuenta`, dos contadores nunca se mezclan.

En los tests, `boton.click()` dispara un evento `click` igual que si el usuario hiciera clic. Funciona aunque el contenedor no esté en la página.

## Errores comunes

- **Guardar la cuenta fuera de la función** (`let cuenta = 0` arriba del archivo): todos los contadores comparten el mismo número y falla el test de los dos contadores.
- **Cambiar la cuenta pero no la vista**: `cuenta++` sin `valor.textContent = cuenta`. El número cambia en memoria, pero la pantalla sigue en "0". El DOM no se actualiza solo (eso es justo lo que React automatiza).
- **Llamar la función en vez de pasarla**: `sumar.addEventListener("click", incrementar())`. Se ejecuta una vez al montar y se registra lo que devuelve (`undefined`), así que los clics no hacen nada.
- **Reiniciar a 0 en vez de a `inicial`**: falla con `montar(2)`, que debe volver a "2".
- **Reiniciar solo el texto**: `valor.textContent = inicial` sin `cuenta = inicial`. Se ve bien, pero el siguiente clic sigue desde el número viejo.
- **Buscar con `document.querySelector(".valor")`** en vez de usar la variable: si hay dos contadores en la página, siempre encuentras el primero.

## Otra forma de resolverlo

Con una función `pintar()` que centraliza la actualización de la vista, el mismo patrón que usan los frameworks:

```js
export function montarContador(contenedor, inicial = 0) {
  let cuenta = inicial;

  contenedor.innerHTML = `
    <span class="valor"></span>
    <button class="sumar">+1</button>
    <button class="reiniciar">Reiniciar</button>
  `;
  const valor = contenedor.querySelector(".valor");

  function pintar() {
    valor.textContent = cuenta;
  }

  contenedor.querySelector(".sumar").addEventListener("click", () => {
    cuenta++;
    pintar();
  });
  contenedor.querySelector(".reiniciar").addEventListener("click", () => {
    cuenta = inicial;
    pintar();
  });

  pintar();
}
```

Aquí `innerHTML` es seguro porque el HTML es **fijo**, escrito por ti, sin datos del usuario. El número se pone con `textContent`. Ojo: esta versión **reemplaza** lo que hubiera en el contenedor, mientras que `append` lo conserva.

## Cómo explicarlo en la entrevista

> "Separo estado, vista y eventos. El estado es una variable `cuenta`. Creo el span y los botones con `createElement` y los agrego al contenedor. En cada botón registro un listener de click que cambia la cuenta y actualiza el `textContent` del span. Los listeners recuerdan su cuenta por closure, así que puedo montar varios contadores independientes. Es lo mismo que hace React con `useState`, solo que aquí actualizo el DOM a mano."

## Conceptos

- **Estado, vista y eventos**: las tres piezas de cualquier componente interactivo.
- **`addEventListener("click", fn)`**: registra una función que se ejecuta en cada clic.
- **`element.click()`**: dispara un clic desde código; útil en tests.
- **`className` y `textContent`**: asignan la clase y el texto de un elemento.
- **Closure**: los listeners recuerdan las variables de `montarContador` después de que terminó.
- **Parámetro por defecto**: `inicial = 0` se usa cuando no pasan el argumento (o pasan `undefined`).
