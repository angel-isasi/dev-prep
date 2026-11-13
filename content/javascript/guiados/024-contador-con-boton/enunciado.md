Escribe la función `montarContador(contenedor, inicial = 0)` que arme un **contador con botones** dentro del elemento `contenedor` que recibe.

Tiene que agregar al contenedor, en este orden:

```html
<span class="valor">0</span>
<button class="sumar">+1</button>
<button class="reiniciar">Reiniciar</button>
```

## Reglas

- El `<span class="valor">` empieza mostrando `inicial` (0 si no te lo pasan).
- Cada clic en `.sumar` suma 1 y actualiza el texto del `<span>`.
- Un clic en `.reiniciar` vuelve al valor **inicial** (no a 0), y los siguientes clics en `.sumar` siguen desde ahí.
- La función no devuelve nada: solo arma el contador dentro del contenedor.
- Si montas dos contadores en dos contenedores distintos, cada uno lleva su propia cuenta.

## Ejemplos

```js
const caja = document.createElement("div");
montarContador(caja, 5);

caja.querySelector(".valor").textContent;   // "5"
caja.querySelector(".sumar").click();
caja.querySelector(".sumar").click();
caja.querySelector(".valor").textContent;   // "7"
caja.querySelector(".reiniciar").click();
caja.querySelector(".valor").textContent;   // "5"

// En una página real:
montarContador(document.querySelector("#app"));
```

## Por qué importa

El contador es el "hola mundo" de la interactividad: estado (un número), un evento (el clic) y actualizar la pantalla cuando el estado cambia. Es exactamente lo que después hace React con `useState`, así que entenderlo sin React te ayuda a entender qué hace React por ti.
