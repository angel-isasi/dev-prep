## Idea clave

`removeEventListener` solo quita un listener si recibe **la misma función** (la misma referencia) que se usó en `addEventListener`. El código agregaba una flecha `(e) => alPresionar(e)` y en la limpieza quitaba **otra** flecha, escrita igual pero distinta en memoria. No encontraba nada que quitar y no avisaba. Cada montaje (y cada cambio de `onCerrar`) sumaba un listener que nunca se iba, y todos seguían llamando a sus `onCerrar` viejos. La limpieza existía, pero no limpiaba nada.

## Paso a paso

1. **Lee el síntoma.** Escape actúa **después** de cerrar el modal y **varias veces**. Que se multiplique con cada apertura indica listeners que se acumulan: una limpieza que falla.
2. **Reprodúcelo.** Pinta el modal, desmóntalo y aprieta Escape: `onCerrar` se llama igual.
3. **Comprueba que la limpieza corre.** Pon un `console.log` dentro del `return () => ...`: se imprime al desmontar. La limpieza corre, pero no quita el listener.
4. **Compara las funciones.** `((e) => alPresionar(e)) === ((e) => alPresionar(e))` es `false`. Cada flecha es un objeto nuevo.
5. **Usa la misma referencia en los dos lugares.**

```jsx
window.addEventListener("keydown", alPresionar);
return () => window.removeEventListener("keydown", alPresionar);
```

## Por qué funciona

Cada vez que corre el efecto se crea **una** función `alPresionar`. La flecha de limpieza la recuerda por closure, así que al quitar usa exactamente la misma que se agregó:

| Momento | Con flechas nuevas | Con `alPresionar` |
|---|---|---|
| Montaje | listeners activos: 1 | listeners activos: 1 |
| Cambia `onCerrar` (limpieza + efecto) | 2 (no se quitó el viejo) | 1 |
| Desmontaje | 2, siguen vivos | 0 |

Por eso en el test de "cambiar `onCerrar`", con el error, Escape llamaba al viejo **y** al nuevo.

Las funciones en JavaScript son objetos: dos funciones con el mismo código son distintas, igual que `{} === {}` es `false`.

## Errores comunes

- **Guardar la flecha en una variable solo en el `add`**: `const fn = (e) => alPresionar(e); window.addEventListener("keydown", fn);` y quitar con `alPresionar`. Siguen siendo funciones distintas: hay que quitar `fn`.
- **Cambiar las dependencias a `[]`** para que el efecto corra una sola vez. Se acumula menos, pero al desmontar el listener sigue vivo, y además Escape seguiría llamando al primer `onCerrar` aunque el padre pase otro.
- **Poner un `if (abierto)` dentro de `alPresionar`.** Esconde el síntoma, pero los listeners siguen acumulándose en memoria cada vez que se abre el modal.

## Otra forma de resolverlo

Con un `AbortController`, que permite quitar el listener sin guardar la referencia:

```jsx
useEffect(() => {
  const controlador = new AbortController();
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") onCerrar();
    },
    { signal: controlador.signal },
  );
  return () => controlador.abort();
}, [onCerrar]);
```

Al llamar `abort()`, el navegador quita todos los listeners que se agregaron con esa `signal`. Es útil cuando registras varios listeners en el mismo efecto.

## Cómo explicarlo en la entrevista

> "Los listeners se acumulaban aunque el efecto tenía limpieza. El problema era que `addEventListener` y `removeEventListener` recibían dos flechas distintas, y `removeEventListener` solo quita la misma referencia; con otra función no hace nada y no avisa. Lo arreglé pasando `alPresionar` en los dos lugares. Siempre que agrego un listener en un efecto, guardo la función en una constante y la quito en la limpieza, o uso un `AbortController`."

## Conceptos

- **Limpieza de un efecto**: la función que devuelve `useEffect`; React la llama antes de volver a correr el efecto y al desmontar.
- **`addEventListener` y `removeEventListener`**: registran y quitan un listener; para quitarlo hace falta la misma función.
- **Referencia de una función**: cada función creada es un objeto distinto, aunque tenga el mismo código.
- **Fuga de listeners**: listeners que nadie quita; se acumulan y siguen ejecutándose.
- **`AbortController`**: objeto que permite cancelar listeners o peticiones con una sola llamada a `abort()`.
