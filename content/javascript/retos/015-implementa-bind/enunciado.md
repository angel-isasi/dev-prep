Agrega a todas las funciones el método `miBind(contexto, ...previos)`, que haga lo mismo que el `bind` nativo: devuelve una **función nueva** que, al llamarla, ejecuta la original con `this` igual a `contexto` y con los argumentos `previos` puestos **delante** de los que le pases después.

Para que todas las funciones lo tengan, se define en `Function.prototype`:

```js
Function.prototype.miBind = function (contexto, ...previos) {
  // aquí, `this` es la función sobre la que llamaste .miBind
};
```

## Reglas

- `miBind` **no ejecuta** la función: devuelve otra.
- La función devuelta usa siempre `contexto` como `this`, aunque la llames suelta o desde otro objeto.
- Los argumentos van en este orden: primero los `previos`, luego los nuevos.
- La función devuelta devuelve lo mismo que devuelva la original.
- No uses el `bind` nativo.

## Ejemplos

```js
function presentar(saludo, signo) {
  return `${saludo}, ${this.nombre}${signo}`;
}

const ligada = presentar.miBind({ nombre: "Ica" }, "Hola");
ligada("!");    // "Hola, Ica!"
ligada("?");    // "Hola, Ica?"

const sinPrevios = presentar.miBind({ nombre: "Lima" });
sinPrevios("Buenas", ".");   // "Buenas, Lima."
```

## Por qué importa

`bind` se usa para no perder el `this` al pasar un método como callback (eventos, `setTimeout`, componentes de clase en React). Implementarlo es una pregunta clásica porque obliga a entender `this`, `apply` y los closures, y a explicar la diferencia entre `call`, `apply` y `bind`.
