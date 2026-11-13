## Idea clave

`miBind` guarda en un **closure** tres cosas: la función original, el contexto y los argumentos previos. Devuelve una función nueva que, al llamarla, ejecuta la original con `apply`, usando ese contexto como `this` y los argumentos previos delante de los nuevos.

## Paso a paso

1. **Define el método en `Function.prototype`** con una `function` normal (no flecha), para que `this` sea la función sobre la que se llama `.miBind`.
2. **Guarda la original**: `const original = this`. Hace falta porque dentro de la función que vas a devolver, `this` será otra cosa.
3. **Devuelve una función** que recibe `...args`.
4. **Ejecuta la original con `apply`**: `original.apply(contexto, [...previos, ...args])`. El primer argumento de `apply` es el `this`; el segundo, el arreglo de argumentos.
5. **Devuelve el resultado** de esa ejecución.

```js
Function.prototype.miBind = function (contexto, ...previos) {
  const original = this;

  return function (...args) {
    return original.apply(contexto, [...previos, ...args]);
  };
};
```

## Por qué funciona

Recorrido con `const ligada = presentar.miBind({ nombre: "Ica" }, "Hola")`:

| Momento | Variable | Valor |
|---|---|---|
| dentro de `miBind` | `this` / `original` | la función `presentar` |
| | `contexto` | `{ nombre: "Ica" }` |
| | `previos` | `["Hola"]` |
| `ligada("!")` | `args` | `["!"]` |
| | se ejecuta | `presentar.apply({ nombre: "Ica" }, ["Hola", "!"])` |
| | devuelve | `"Hola, Ica!"` |

Cuando haces `otro.presentar("!")` con la función ligada, el `this` de la **función devuelta** sí es `otro`, pero esa función no lo usa: llama a `original.apply(contexto, ...)` con el contexto guardado. Por eso el resultado sigue siendo `"Hola, Ica!"`.

Cada objeto función hereda de `Function.prototype`, así que al agregar `miBind` ahí, todas las funciones lo tienen, igual que tienen `call`, `apply` y `bind`.

## Errores comunes

- **Definir `miBind` como flecha.** La flecha no recibe como `this` la función original, sino el `this` del módulo (`undefined`). Lo reconoces por "Cannot read properties of undefined (reading 'apply')".
- **Usar `this.apply` dentro de la función devuelta en vez de guardar `original`.** Ahí `this` ya no es la función original. Lo reconoces por "this.apply is not a function" o un `this` inesperado.
- **Ejecutar la función en vez de devolver otra: `return original.apply(contexto, previos)`.** Eso es `call`/`apply`, no `bind`. Lo reconoces porque el test dice que se llamó al ligarla.
- **Poner los argumentos al revés: `[...args, ...previos]`.** Recibes `"!, IcaHola"` en vez de `"Hola, Ica!"`.
- **Olvidar el `return`.** La función ligada devuelve `undefined`.

## Otra forma de resolverlo

Con `call` y spread en vez de `apply`:

```js
Function.prototype.miBind = function (contexto, ...previos) {
  const original = this;
  return (...args) => original.call(contexto, ...previos, ...args);
};
```

`call` recibe los argumentos sueltos y `apply` en un arreglo; con spread son equivalentes. Aquí la función devuelta puede ser flecha porque no usa su propio `this`. Detalle avanzado: el `bind` nativo además funciona con `new` (si haces `new ligada()`, ignora el contexto y crea un objeto nuevo) y ajusta la propiedad `length` y el nombre de la función (`"bound presentar"`). Mencionarlo suma puntos, pero rara vez lo piden implementado.

## Cómo explicarlo en la entrevista

> "`bind` devuelve una nueva función con el `this` fijado y, opcionalmente, algunos argumentos ya puestos. Dentro de `miBind`, `this` es la función original, así que la guardo en una variable para que la función devuelta la recuerde por closure. Cuando me llaman, ejecuto la original con `apply`, pasando el contexto guardado y los argumentos previos seguidos de los nuevos. La diferencia con `call` y `apply` es que esos ejecutan la función de inmediato; `bind` la prepara para después."

## Conceptos

- **`Function.prototype`**: el objeto del que heredan todas las funciones; ahí viven `call`, `apply` y `bind`.
- **`fn.call(ctx, a, b)`**: ejecuta `fn` ya, con `this = ctx` y argumentos sueltos.
- **`fn.apply(ctx, [a, b])`**: igual que `call`, pero con los argumentos en un arreglo.
- **`fn.bind(ctx, a)`**: no ejecuta; devuelve una función con `this` y algunos argumentos fijados.
- **Closure**: la función devuelta recuerda `original`, `contexto` y `previos`.
- **Aplicación parcial**: fijar algunos argumentos ahora y recibir el resto después.
