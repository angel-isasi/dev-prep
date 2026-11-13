## Idea clave

La cuenta vive en una **variable local** de `crearContador`, no en el objeto. Las tres funciones que devuelves se crearon ahí dentro, así que la recuerdan (closure) y son las únicas que pueden tocarla. Eso es **estado privado**.

## Paso a paso

1. **Recibe `inicial` con valor por defecto 0**: `crearContador(inicial = 0)`.
2. **Crea la variable privada** con `let cuenta = inicial`. Es `let` porque va a cambiar.
3. **Devuelve un objeto** con tres funciones flecha.
4. `incrementar` usa `++cuenta`: suma 1 y devuelve el valor **ya sumado**.
5. `decrementar` usa `--cuenta`: resta 1 y devuelve el valor ya restado.
6. `valor` solo devuelve `cuenta`.

```js
export function crearContador(inicial = 0) {
  let cuenta = inicial;

  return {
    incrementar: () => ++cuenta,
    decrementar: () => --cuenta,
    valor: () => cuenta,
  };
}
```

## Por qué funciona

Normalmente, cuando una función termina, sus variables locales desaparecen. Pero si dentro de ella creaste funciones que **usan** esas variables y las devolviste, JavaScript mantiene viva la variable mientras esas funciones existan.

Recorrido con `const c = crearContador(5)`:

| Acción | `cuenta` (privada) | Devuelve |
|---|---|---|
| `crearContador(5)` | 5 | el objeto `{ incrementar, decrementar, valor }` |
| `c.incrementar()` | 6 | 6 |
| `c.incrementar()` | 7 | 7 |
| `c.decrementar()` | 6 | 6 |
| `c.valor()` | 6 | 6 |
| `c.cuenta` | 6 | `undefined`: el objeto no tiene esa propiedad |

Cada llamada a `crearContador` ejecuta la función de nuevo y crea **otra** variable `cuenta`. Por eso dos contadores no se mezclan: cada uno tiene su propio closure.

## Errores comunes

- **Guardar la cuenta en el objeto: `return { cuenta: inicial, ... }`.** Funciona, pero no es privada y el test de privacidad falla: `c.cuenta` es 5 en vez de `undefined`.
- **Usar `cuenta++` (sufijo) en vez de `++cuenta`.** `cuenta++` devuelve el valor **anterior** a sumar. Lo reconoces porque `incrementar()` devuelve 10 en vez de 11.
- **Declarar `cuenta` fuera de `crearContador`, a nivel del módulo.** Todos los contadores compartirían la misma variable. Lo reconoces porque el test de independencia da valores mezclados.
- **Escribir `valor: cuenta` en vez de `valor: () => cuenta`.** Guardas el número del momento de crear el objeto, no una función. Lo reconoces por el error "c.valor is not a function".
- **Usar `const cuenta`.** Al sumar salta "Assignment to constant variable".

## Otra forma de resolverlo

Con una clase y un campo privado `#`, la sintaxis moderna para lo mismo:

```js
export function crearContador(inicial = 0) {
  return new Contador(inicial);
}

class Contador {
  #cuenta;

  constructor(inicial) {
    this.#cuenta = inicial;
  }

  incrementar() {
    return ++this.#cuenta;
  }

  decrementar() {
    return --this.#cuenta;
  }

  valor() {
    return this.#cuenta;
  }
}
```

Los campos que empiezan con `#` no se pueden leer desde fuera de la clase. Conviene si vas a crear miles de contadores, porque los métodos se comparten en el prototipo en vez de crearse tres funciones nuevas por contador. La versión con closure es más corta y es la que esperan cuando la pregunta es "explícame los closures".

## Cómo explicarlo en la entrevista

> "Un closure es una función que recuerda las variables del lugar donde fue creada, aunque ese lugar ya haya terminado de ejecutarse. Aquí `cuenta` es una variable local de `crearContador`, y las tres funciones que devuelvo la siguen viendo. Como no la pongo en el objeto, nadie más puede tocarla: es estado privado. Cada llamada a `crearContador` crea un closure nuevo, así que cada contador es independiente. Es el mismo principio que usa React para que `useState` recuerde el estado entre renderizados."

## Conceptos

- **Closure**: una función junto con las variables del lugar donde fue creada.
- **Estado privado**: datos que solo pueden modificarse a través de funciones controladas.
- **Parámetros por defecto**: `function f(x = 0)` usa 0 si no te pasan nada (o si te pasan `undefined`).
- **`++x` vs `x++`**: el prefijo devuelve el valor nuevo; el sufijo, el anterior.
- **Función fábrica**: una función que crea y devuelve objetos nuevos.
- **Campos privados `#`**: la forma de tener estado privado en una clase.
