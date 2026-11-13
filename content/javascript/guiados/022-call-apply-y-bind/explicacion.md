## Idea clave

Las funciones de JavaScript son objetos y traen tres métodos para decidir **a mano** quién es `this`: `call` y `apply` ejecutan la función ya (cambia solo la forma de pasar los argumentos), y `bind` no ejecuta nada: devuelve una función nueva con `this` fijado para siempre.

## Paso a paso

1. **`presentarCon`**: `presentarse.call(persona, saludo, signo)`. El primer argumento de `call` es el `this`; los siguientes llegan sueltos a `presentarse`.
2. **`presentarConLista`**: `presentarse.apply(persona, argumentos)`. Igual que `call`, pero el segundo argumento es un arreglo que `apply` "desarma" en `saludo` y `signo`.
3. **`crearPresentador`**: `presentarse.bind(persona)`. Devuelve una función nueva; no se ejecuta hasta que alguien la llame.
4. En las dos primeras, **devuelve el resultado** con `return`.

```js
export function presentarCon(persona, saludo, signo) {
  return presentarse.call(persona, saludo, signo);
}

export function presentarConLista(persona, argumentos) {
  return presentarse.apply(persona, argumentos);
}

export function crearPresentador(persona) {
  return presentarse.bind(persona);
}
```

## Por qué funciona

| Llamada | ¿Ejecuta ya? | `this` | Argumentos que recibe `presentarse` | Devuelve |
|---|---|---|---|---|
| `presentarse.call(ana, "Hola", "!")` | sí | `ana` | `"Hola"`, `"!"` | `"Hola, soy Ana!"` |
| `presentarse.apply(ana, ["Hola", "!"])` | sí | `ana` | `"Hola"`, `"!"` | `"Hola, soy Ana!"` |
| `presentarse.bind(ana)` | no | queda guardado: `ana` | ninguno todavía | una función |
| `presentarAna("Buenas", ".")` | sí | `ana` (fijado por bind) | `"Buenas"`, `"."` | `"Buenas, soy Ana."` |

En el test `otro.hablar("Hola", "!")`, la regla del punto diría que `this` es `otro` (Luis). Pero una función creada con `bind` **ignora** el `this` con el que la llamen: siempre usa el que se fijó. Por eso sale "soy Ana". Por la misma razón funciona dentro de `map`, donde se llama suelta.

Ninguna de las tres toca a `persona`: le prestan la función por un momento, sin guardarla en el objeto.

## Errores comunes

- **Olvidar el `return`** en `presentarCon` o `presentarConLista`: la llamada se hace, pero tu función devuelve `undefined`.
- **Usar `call` con un arreglo**: `presentarse.call(persona, argumentos)`. `saludo` recibe el arreglo entero y `signo` queda `undefined`: sale `"Hola,!, soy Anaundefined"`.
- **Usar `apply` con argumentos sueltos**: `presentarse.apply(persona, saludo, signo)`. `apply` espera un arreglo como segundo argumento; con un texto lanza `TypeError: CreateListFromArrayLike called on non-object`.
- **Ejecutar en vez de atar**: `return presentarse.call(persona)` en `crearPresentador`. Devuelve un texto (`"undefined, soy Anaundefined"`), no una función, y el test falla con "presentarAna is not a function".
- **Meter el método en el objeto**: `persona.presentarse = presentarse; return persona.presentarse(saludo, signo)`. Da el texto correcto, pero ensucia el objeto y el test "no modifica a la persona" falla.

## Otra forma de resolverlo

Sin `call`, `apply` ni `bind`, armando un objeto temporal o una flecha:

```js
export function presentarConLista(persona, argumentos) {
  return presentarse.call(persona, ...argumentos);   // spread en vez de apply
}

export function crearPresentador(persona) {
  return (saludo, signo) => presentarse.call(persona, saludo, signo);
}
```

El spread `...argumentos` reparte el arreglo en argumentos sueltos, así que hoy `apply` se usa menos. Y la flecha de `crearPresentador` hace lo mismo que `bind`: cada vez que la llamas, ejecuta `presentarse` con `persona` como `this`.

**¿Cuál conviene?** En la entrevista usa los tres métodos, que es lo que te están preguntando. En código real verás `bind` en listeners de eventos y la flecha en casi todo lo demás.

**Dato que suma puntos**: un clásico de `apply` era sacar el máximo de un arreglo, `Math.max.apply(null, [3, 7, 2])` da 7. Hoy se escribe `Math.max(...[3, 7, 2])`.

## Cómo explicarlo en la entrevista

> "Los tres sirven para elegir el `this` de una función. `call` la ejecuta ya y recibe los argumentos separados por comas; `apply` también la ejecuta ya, pero recibe los argumentos en un arreglo; y `bind` no la ejecuta: devuelve una función nueva con el `this` fijado, que no cambia aunque la llames como método de otro objeto. Para acordarme: Apply, Arreglo; Call, Comas; Bind, para después."

## Conceptos

- **`Function.prototype.call`**: ejecuta con un `this` dado y argumentos sueltos.
- **`Function.prototype.apply`**: ejecuta con un `this` dado y argumentos en un arreglo.
- **`Function.prototype.bind`**: devuelve una función nueva con `this` fijo (y opcionalmente argumentos fijos).
- **Binding explícito**: elegir `this` a mano; le gana a la regla del punto.
- **Préstamo de métodos**: usar una función con un objeto que no la tiene como propiedad.
- **Spread `...`**: reparte un arreglo en argumentos sueltos, alternativa moderna a `apply`.
