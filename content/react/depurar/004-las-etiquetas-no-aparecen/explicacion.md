## Idea clave

React decide si vuelve a pintar comparando el estado nuevo con el anterior con `Object.is`, que para arreglos compara **la referencia**, no el contenido. `push` modifica el arreglo que ya estaba en el estado y `setElegidas(elegidas)` le pasa ese mismo arreglo: para React, "nada cambió", y no pinta. El dato está guardado (el arreglo sí creció), por eso aparece de golpe cuando otra cosa provoca un render. La solución es **no mutar el estado**: crear un arreglo nuevo.

## Paso a paso

1. **Lee el síntoma.** "No pasa nada, pero después aparece de golpe" significa que el dato se guardó y lo que falta es el render. Es la firma de una mutación del estado.
2. **Reprodúcelo.** Clic en "CSS": el texto sigue en "ninguna".
3. **Aísla.** Agrega `console.log(elegidas)` en `elegir`: el arreglo sí tiene "CSS". El problema no es guardar, es avisar a React.
4. **Compara referencias.** Lo que le pasas a `setElegidas` es `elegidas`, exactamente el mismo objeto que ya estaba en el estado.
5. **Crea un arreglo nuevo.**

```jsx
function elegir(etiqueta) {
  const nuevas = [...elegidas, etiqueta];
  setElegidas(nuevas);
}
```

## Por qué funciona

| | Con `push` | Con spread |
|---|---|---|
| ¿Qué recibe `setElegidas`? | el mismo arreglo, modificado | un arreglo nuevo |
| `Object.is(nuevo, anterior)` | `true` | `false` |
| ¿React vuelve a pintar? | no | sí |

`[...elegidas, etiqueta]` copia las etiquetas que ya había y agrega la nueva al final, en otro arreglo. El estado anterior queda intacto, y React ve que la referencia cambió.

Esta comparación por referencia es lo que hace rápido a React: no tiene que revisar el contenido de cada arreglo para saber si algo cambió. A cambio, te pide que nunca modifiques el estado directamente.

## Errores comunes

- **Hacer `push` y luego `setElegidas([...elegidas])`.** Pinta, pero sigues modificando el arreglo del estado anterior: si algo lo guardó (para comparar o deshacer), también cambia. Y si el `push` va dentro de una función de actualización, StrictMode la ejecuta dos veces en desarrollo y la etiqueta aparece repetida.
- **Forzar el render con otro estado** (`setContador(c + 1)`). Es justo lo que hacía "aparecer de golpe" las etiquetas: un parche que esconde la mutación.
- **Usar `concat` pensando que muta.** `concat` no muta: `elegidas.concat(etiqueta)` también devuelve un arreglo nuevo y es una solución válida.

## Otra forma de resolverlo

Con la forma funcional, que además usa siempre el valor más reciente:

```jsx
function elegir(etiqueta) {
  setElegidas((anteriores) => [...anteriores, etiqueta]);
}
```

Es la forma más recomendada cuando el nuevo estado depende del anterior.

## Cómo explicarlo en la entrevista

> "El dato se guardaba pero no se pintaba, lo que me hizo pensar en una mutación. `push` modificaba el arreglo del estado y `setElegidas` recibía la misma referencia; React compara con `Object.is`, vio el mismo objeto y no hizo render. Lo arreglé creando un arreglo nuevo con spread. En React el estado se trata como inmutable: `push`, `splice` o `sort` sobre el estado son señales de alerta."

## Conceptos

- **Inmutabilidad del estado**: nunca modificar el estado directamente; crear un valor nuevo.
- **`Object.is`**: la comparación que usa React para decidir si el estado cambió; en objetos y arreglos compara referencias.
- **Referencia**: dos variables apuntan al mismo arreglo; modificarlo por una se ve desde la otra.
- **Spread (`...`)**: `[...arr, x]` crea un arreglo nuevo con lo de `arr` más `x`.
- **Métodos que mutan**: `push`, `pop`, `splice`, `sort` y `reverse`; los que no: `map`, `filter`, `concat`, `slice`.
