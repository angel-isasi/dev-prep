## Idea clave

`setTexto(nuevo)` no cambia la variable `texto` en ese momento: **agenda** un nuevo render en el que `texto` tendrá el valor nuevo. En la línea siguiente, dentro del mismo manejador, `texto` sigue siendo el valor del render actual, es decir, el de **antes** de la tecla. Por eso `onBuscar(texto)` siempre va una letra atrasado. El valor nuevo ya está disponible en `e.target.value`.

## Paso a paso

1. **Lee el síntoma.** "Una letra atrasado" quiere decir que se usa el valor **anterior** del estado. Es el síntoma típico de leer el estado justo después de cambiarlo.
2. **Reprodúcelo.** Escribe "r" y luego "re": `onBuscar` recibe `""` y después `"r"`.
3. **Aísla.** Agrega `console.log(texto, e.target.value)` en `alEscribir`: el primero siempre va atrasado, el segundo es el correcto.
4. **Usa el valor del evento.**

```jsx
function alEscribir(e) {
  setTexto(e.target.value);
  onBuscar(e.target.value);
}
```

## Por qué funciona

| Tecla | `texto` en ese render | `e.target.value` | `onBuscar(texto)` | `onBuscar(e.target.value)` |
|---|---|---|---|---|
| `r` | `""` | `"r"` | `""` | `"r"` |
| `e` | `"r"` | `"re"` | `"r"` | `"re"` |
| borrar todo | `"re"` | `""` | `"re"` | `""` |

Cada render de un componente es como una foto: las variables de ese render (incluido `texto`) tienen valores fijos. `setTexto` pide una foto nueva, pero el código que ya está corriendo sigue usando la foto vieja.

El input se veía bien porque se pinta en el render **siguiente**, cuando `texto` ya tiene el valor nuevo.

## Errores comunes

- **Mover `onBuscar(texto)` antes del `setTexto`.** El orden no importa: `texto` vale lo mismo en todo el manejador.
- **Usar un `setTimeout(() => onBuscar(texto))`** para "esperar" a que se actualice. La flecha recuerda el `texto` de este render (closure), así que sigue atrasado.
- **Hacer `texto = e.target.value`**. Si `texto` es `const`, da error; y aunque fuera `let`, cambiar la variable no avisa a React ni cambia el estado.

## Otra forma de resolverlo

Avisar al padre desde un efecto, que corre **después** del render con el valor nuevo:

```jsx
useEffect(() => {
  onBuscar(texto);
}, [texto, onBuscar]);
```

Funciona, pero agrega un render de por medio, también avisa con `""` al montar y, si el padre no memoriza `onBuscar`, se ejecuta en cada render del padre. Para reaccionar a lo que hizo el usuario, lo más simple es hacerlo en el manejador del evento.

## Cómo explicarlo en la entrevista

> "`onBuscar` recibía el texto de antes porque leía `texto` justo después de `setTexto`. El estado no cambia en ese instante: `setTexto` agenda un render nuevo, y en el manejador actual `texto` sigue con el valor de este render. Lo arreglé pasando `e.target.value`, que ya es el valor nuevo. Si necesitas el valor nuevo dentro del mismo evento, lo calculas en una variable y la usas para las dos cosas."

## Conceptos

- **Input controlado**: su `value` viene del estado y cada cambio pasa por `onChange`.
- **Estado como foto**: dentro de un render, el estado tiene un valor fijo; `setX` afecta al próximo render.
- **`e.target.value`**: el valor actual del input en el momento del evento.
- **Manejador de eventos**: la función que corre cuando ocurre el evento; es el lugar ideal para reaccionar al usuario.
- **Comunicación hijo a padre**: el hijo avisa llamando a una función que recibió por props.
