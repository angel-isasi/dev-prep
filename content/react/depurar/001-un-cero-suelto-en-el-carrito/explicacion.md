## Idea clave

`{condicion && <Algo />}` funciona porque React **no pinta** `false`, `null` ni `undefined`. Pero `&&` no devuelve `false`: devuelve **el lado izquierdo** cuando es falsy. Con `cantidad = 0`, la expresión vale `0`, y React sí pinta los números, incluido el cero. Por eso aparece el 0 suelto.

## Paso a paso

1. **Lee el síntoma.** Solo pasa con el carrito vacío y el valor que aparece es exactamente la cantidad. Eso apunta a la condición que usa `cantidad`.
2. **Reprodúcelo.** `render(<ResumenCarrito cantidad={0} />)` y el texto del contenedor es `"0Seguir comprando"`.
3. **Evalúa la expresión a mano.** `0 && <p>...</p>` da `0` (el primer valor falsy). Ese `0` queda como hijo del `<div>`.
4. **Usa una condición booleana.**

```jsx
{cantidad > 0 && <p>Productos en tu carrito: {cantidad}</p>}
```

## Por qué funciona

| `cantidad` | `cantidad && <p/>` | `cantidad > 0 && <p/>` | React pinta |
|---|---|---|---|
| `3` | `<p/>` | `<p/>` | el párrafo |
| `0` | `0` | `false` | con `&&` solo: un **0**; con `> 0`: nada |

`cantidad > 0` siempre da `true` o `false`, nunca un número. Y `false` es uno de los valores que React ignora al pintar.

Este error solo aparece con **números** (y con `NaN`). Con un texto vacío `""` no se ve nada, porque un texto vacío no muestra caracteres.

## Errores comunes

- **Esconder el 0 con CSS** o con un `<span>` vacío. El 0 sigue en el DOM, y un lector de pantalla lo leería.
- **Usar `!cantidad`** en vez de `cantidad`: invierte la lógica y muestra el resumen justo cuando el carrito está vacío.
- **Pensar que es un problema del padre** y pasar `cantidad={undefined}` cuando es 0. Funciona, pero obliga a todos los que usan el componente a recordar ese truco.

## Otra forma de resolverlo

Convertir a booleano con `!!` o usar un ternario con `null`:

```jsx
{!!cantidad && <p>Productos en tu carrito: {cantidad}</p>}
{cantidad > 0 ? <p>Productos en tu carrito: {cantidad}</p> : null}
```

`cantidad > 0` es la más clara porque dice en palabras lo que se quiere. El ternario es útil cuando hay algo que mostrar en los dos casos, por ejemplo "Tu carrito está vacío".

## Cómo explicarlo en la entrevista

> "El 0 venía del renderizado condicional con `&&`. `&&` devuelve el lado izquierdo si es falsy, así que con 0 la expresión vale 0, y React pinta los números aunque no pinte `false` ni `null`. Lo arreglé con `cantidad > 0`, que siempre es un booleano. Cuando la condición es un número, nunca la uso sola con `&&`."

## Conceptos

- **Renderizado condicional**: mostrar algo solo si se cumple una condición, con `&&` o con un ternario.
- **Cortocircuito de `&&`**: si el lado izquierdo es falsy, lo devuelve sin evaluar el derecho.
- **Qué pinta React**: textos y números sí; `false`, `null`, `undefined` y `true` no.
- **Falsy**: `0`, `""`, `null`, `undefined`, `NaN` y `false`.
- **`!!valor`**: convierte cualquier valor a su booleano equivalente.
