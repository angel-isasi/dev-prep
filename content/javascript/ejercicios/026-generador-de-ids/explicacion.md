## Idea clave

Un contador privado en un closure. `crearIds` guarda el número `siguiente` y el `prefijo`; la función que devuelve arma el id con el número actual y luego lo aumenta para la próxima vez. Cada llamada a `crearIds` crea un contador nuevo que empieza en 1.

## Paso a paso

1. **Crea el contador** con `let siguiente = 1` dentro de `crearIds`.
2. **Devuelve una función** sin parámetros.
3. **Arma el id** con el número actual usando un template literal: `` `${prefijo}-${siguiente}` ``.
4. **Aumenta el contador** con `siguiente++`, para que la próxima llamada use el número siguiente.
5. **Devuelve el id** que armaste en el paso 3.

```js
export function crearIds(prefijo) {
  let siguiente = 1;

  return () => {
    const id = `${prefijo}-${siguiente}`;
    siguiente++;
    return id;
  };
}
```

## Por qué funciona

```js
const idPedido = crearIds("pedido");
idPedido();
idPedido();
const idVoto = crearIds("voto");
idVoto();
idPedido();
```

| Llamada | `siguiente` al entrar | id armado | `siguiente` al salir |
|---|---|---|---|
| `idPedido()` | `1` | `"pedido-1"` | `2` |
| `idPedido()` | `2` | `"pedido-2"` | `3` |
| `idVoto()` | `1` (es otro contador) | `"voto-1"` | `2` |
| `idPedido()` | `3` | `"pedido-3"` | `4` |

**¿Qué variables quedan recordadas?** `siguiente` y `prefijo`. **¿Por qué sobreviven?** La función devuelta las usa, y está guardada en `idPedido`. Aunque `crearIds("pedido")` terminó, JavaScript mantiene vivo **ese** `siguiente`. Cuando llamas `crearIds("voto")`, se ejecuta la función otra vez desde cero y se crea **otro** `siguiente`, por eso no se mezclan.

## Errores comunes

- **Aumentar antes de armar el id.** Si haces `siguiente++` primero, el primer id sale `"pedido-2"`. Lo reconoces en el test "el primer id termina en 1": recibe `"voto-2"`.
- **Declarar `siguiente` dentro de la función devuelta.** Se reinicia en cada llamada y siempre devuelve `"pedido-1"`. El test de la secuencia recibe `["tarea-1", "tarea-1", "tarea-1"]`.
- **Usar una variable global para el contador.** Todos los generadores comparten la numeración: `idVoto()` devuelve `"voto-3"` en vez de `"voto-1"`.
- **Concatenar mal: `prefijo + siguiente`.** Te falta el guion: recibes `"pedido1"` en vez de `"pedido-1"`.
- **Usar comillas normales en vez de backticks: `"${prefijo}-${siguiente}"`.** Las comillas dobles no interpretan `${}`; recibes literalmente el texto `"${prefijo}-${siguiente}"`.

## Otra forma de resolverlo

En una línea, aprovechando que `siguiente++` (con los `++` después) **devuelve el valor viejo** y después aumenta:

```js
export function crearIds(prefijo) {
  let siguiente = 1;
  return () => `${prefijo}-${siguiente++}`;
}
```

En la primera llamada, `siguiente++` vale `1` (por eso el id es `"pedido-1"`) y deja `siguiente` en `2`. Si usaras `++siguiente`, primero aumentaría y el primer id sería `"pedido-2"`.

**¿Cuál conviene?** La de una línea es la de la fuente original y es muy común, pero depende de entender bien `x++` vs `++x`. La de tres pasos es imposible de malinterpretar. En una entrevista puedes escribir la corta y explicar en voz alta por qué `siguiente++` devuelve el valor viejo: eso suma puntos.

## Cómo explicarlo en la entrevista

> "Uso un closure con un contador privado que empieza en 1. La función devuelta arma el id con el prefijo y el número actual, y después aumenta el contador para la próxima llamada. Como el contador se declara dentro de `crearIds`, cada generador tiene el suyo y nadie de afuera puede alterarlo. En React lo usaría, por ejemplo, para darle un id a cada tarea nueva."

## Conceptos

- **Closure**: la función devuelta recuerda `siguiente` y `prefijo`.
- **Estado privado**: el contador solo cambia al llamar a la función.
- **Template literal**: texto entre backticks (`` ` ``) donde `${expresion}` se reemplaza por su valor.
- **`x++` vs `++x`**: los dos suman 1; `x++` devuelve el valor de antes y `++x` el de después.
- **Instancias independientes**: cada llamada a `crearIds` crea un contador nuevo.
