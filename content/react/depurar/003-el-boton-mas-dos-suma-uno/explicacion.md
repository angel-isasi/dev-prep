## Idea clave

En cada render, `total` es una **constante** con el valor de ese render. `setTotal(total + 1)` no cambia `total` al instante: **agenda** un nuevo valor para el próximo render. Si lo llamas dos veces en el mismo clic, las dos llamadas leen el mismo `total` viejo y las dos piden el mismo número. Con una **actualización funcional**, `setTotal((anterior) => anterior + 1)`, React encadena las actualizaciones: cada una recibe el resultado de la anterior.

## Paso a paso

1. **Lee el síntoma.** `+1` funciona y `+2` suma solo 1. Lo único distinto es que `+2` actualiza el estado **dos veces seguidas**.
2. **Reprodúcelo.** Desde 0, clic en `+2`: se ve `Asistentes: 1`.
3. **Sigue los valores.** En ese render, `total` vale `0`.
   - Primera llamada: `setTotal(0 + 1)`, agenda "1".
   - Segunda llamada: `total` **sigue valiendo 0**, así que agenda "1" otra vez.
   - React aplica las dos y el resultado es 1.
4. **Usa la forma funcional.**

```jsx
function sumarUno() {
  setTotal((anterior) => anterior + 1);
}
```

## Por qué funciona

Con una función, React no guarda un número sino "lo que hay que hacer". Al aplicar las actualizaciones pendientes, las ejecuta en orden:

| Actualización en la cola | Recibe | Devuelve |
|---|---|---|
| `(anterior) => anterior + 1` | `0` | `1` |
| `(anterior) => anterior + 1` | `1` | `2` |

Así se suma 2. React agrupa (batching) todas las actualizaciones de un mismo evento en un solo render; por eso las dos llamadas comparten el mismo `total` si no usas la forma funcional.

La regla práctica: **si el nuevo estado depende del anterior, usa la función**.

## Errores comunes

- **Escribir `setTotal(total + 2)` en `sumarDos`.** Funciona en este caso, pero deja `sumarUno` con el mismo problema para cualquier otro código que la llame dos veces o desde un `setTimeout`.
- **Leer `total` justo después del `setTotal`** para "confirmar" el cambio: sigue mostrando el valor viejo hasta el próximo render. No es que no funcione, es que el estado no cambia en ese mismo instante.
- **Usar una variable normal (`let total`) en vez de estado.** Cambia al instante, pero React no vuelve a pintar y además se reinicia en cada render.

## Otra forma de resolverlo

Si quieres que `+2` sea una sola actualización, pasa la cantidad como parámetro:

```jsx
function sumar(cantidad) {
  setTotal((anterior) => anterior + cantidad);
}
// <button onClick={() => sumar(1)}>+1</button>
// <button onClick={() => sumar(2)}>+2</button>
```

También es buena práctica, pero la forma funcional sigue siendo la que protege contra llamadas seguidas.

## Cómo explicarlo en la entrevista

> "El `+2` llamaba dos veces a `setTotal(total + 1)`, pero `total` es el valor de ese render y no cambia hasta el siguiente, así que las dos llamadas calculaban el mismo número. Lo cambié por `setTotal((anterior) => anterior + 1)`: React pone las funciones en cola y cada una recibe el resultado de la anterior. Siempre que el nuevo estado depende del anterior, uso la forma funcional."

## Conceptos

- **Estado como foto**: cada render ve un valor fijo del estado; cambiarlo agenda un render nuevo.
- **Actualización funcional**: `setX((anterior) => nuevo)` calcula a partir del valor más reciente.
- **Batching**: React junta las actualizaciones de un mismo evento y hace un solo render.
- **Cola de actualizaciones**: React aplica en orden los cambios pendientes antes de pintar.
- **`useState`**: devuelve el valor actual y la función para pedir un cambio.
