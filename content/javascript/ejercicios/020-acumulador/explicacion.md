## Idea clave

La variable `total` vive **dentro** de `crearAcumulador`, y la función que devuelves la sigue usando. Por el closure, `total` no se borra cuando `crearAcumulador` termina: queda guardada junto a la función devuelta y sobrevive entre llamadas. Cada llamada a `crearAcumulador` crea su propio `total`, independiente de los demás.

## Paso a paso

1. **Declara el estado** con `let total = 0` dentro de `crearAcumulador`. Usa `let` porque va a cambiar.
2. **Devuelve una función** que recibe `n`.
3. **Dentro, actualiza** el total con `total += n`.
4. **Devuelve** el total actualizado.

```js
export function crearAcumulador() {
  let total = 0;

  return (n) => {
    total += n;
    return total;
  };
}
```

## Por qué funciona

```js
const sumar = crearAcumulador();
sumar(10);
sumar(5);
const otro = crearAcumulador();
otro(1);
```

| Llamada | `total` de `sumar` | `total` de `otro` | Devuelve |
|---|---|---|---|
| `crearAcumulador()` | `0` (se crea) | | una función |
| `sumar(10)` | `0 + 10 = 10` | | `10` |
| `sumar(5)` | `10 + 5 = 15` | | `15` |
| `crearAcumulador()` | `15` (no se toca) | `0` (se crea otro) | otra función |
| `otro(1)` | `15` | `0 + 1 = 1` | `1` |

**¿Qué variable queda recordada?** `total`. **¿Por qué sobrevive?** Cuando `crearAcumulador` termina, normalmente su `total` se descartaría. Pero la función devuelta todavía lo usa, y tú guardaste esa función en `sumar`. Mientras `sumar` exista, JavaScript mantiene vivo **ese** `total`.

Además, `total` es **privado**: desde afuera no hay forma de escribir `sumar.total = 999` y alterar la suma. El único camino para cambiarlo es llamar a `sumar(n)`.

## Errores comunes

- **Declarar `total` dentro de la función devuelta.** Se reinicia en 0 en cada llamada y nunca acumula. Lo reconoces porque `sumar(5)` devuelve `5` en vez de `15`.
- **Declarar `total` fuera, como variable global.** Parece funcionar con un solo acumulador, pero todos comparten el mismo total. El test "dos acumuladores no comparten el total" falla: `b(1)` devuelve `101` en vez de `1`.
- **Usar `const total = 0`.** Al hacer `total += n` JavaScript lanza "TypeError: Assignment to constant variable.".
- **Actualizar sin devolver.** Si solo haces `total += n` dentro de llaves sin `return`, la función devuelve `undefined`. Recibes `undefined` en vez de `10`.
- **Guardar el total como propiedad: `sumar.total`.** Funciona, pero cualquiera puede cambiarlo desde afuera, y pierdes la privacidad. El último test lo detecta.

## Otra forma de resolverlo

En una sola línea, aprovechando que una asignación también devuelve un valor:

```js
export function crearAcumulador() {
  let total = 0;
  return (n) => (total += n);
}
```

`total += n` actualiza `total` y, como expresión, vale el nuevo `total`. Los paréntesis dejan claro que es a propósito.

**¿Cuál conviene?** La versión con llaves y `return` separado es más fácil de leer y de explicar. La de una línea es la de la fuente original y es común en código real, pero esconde dos cosas en una. En una entrevista, escribe la versión clara.

## Cómo explicarlo en la entrevista

> "Uso un closure para tener estado privado. Dentro de `crearAcumulador` declaro `total` en 0 y devuelvo una función que le suma `n` y devuelve el resultado. Como la función interna sigue usando `total`, esa variable no se borra cuando la externa termina. Cada vez que llamo a `crearAcumulador` se crea un `total` nuevo, así que los acumuladores son independientes, y nadie de afuera puede modificar el total sin pasar por la función."

## Conceptos

- **Closure**: la función devuelta recuerda las variables del lugar donde se creó.
- **Estado privado**: datos que solo se pueden cambiar a través de las funciones que tú expones.
- **`+=`**: `total += n` es lo mismo que `total = total + n`.
- **Instancias independientes**: cada llamada a la fábrica crea variables nuevas.
- **Variable global**: declarada fuera de toda función; todos la comparten, por eso se evita para guardar estado.
