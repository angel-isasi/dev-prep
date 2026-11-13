En tu archivo ya está la función `presentarse(saludo, signo)`. Usa `this.nombre`, pero las personas son objetos simples como `{ nombre: "Ana" }` que **no tienen** ese método. Vas a "prestárselo" sin meterlo dentro del objeto, de tres formas:

- `presentarCon(persona, saludo, signo)`: ejecuta `presentarse` con `this` igual a `persona`, pasando los argumentos **sueltos**. Usa `call`.
- `presentarConLista(persona, argumentos)`: igual, pero los argumentos llegan en un **arreglo** `[saludo, signo]`. Usa `apply`.
- `crearPresentador(persona)`: **no ejecuta nada**; devuelve una función nueva que, al llamarla con `(saludo, signo)`, presenta siempre a esa persona. Usa `bind`.

## Reglas

- No modifiques a la persona: nada de `persona.presentarse = presentarse`. Los tests revisan que el objeto quede igual.
- La función que devuelve `crearPresentador` debe seguir presentando a la misma persona aunque se use como callback o se guarde dentro de otro objeto.
- No cambies `presentarse`.

## Ejemplos

```js
const ana = { nombre: "Ana" };

presentarCon(ana, "Hola", "!");            // "Hola, soy Ana!"
presentarConLista(ana, ["Hola", "!"]);     // "Hola, soy Ana!"

const presentarAna = crearPresentador(ana);
presentarAna("Buenas", ".");               // "Buenas, soy Ana."

["Hola", "Qué tal"].map((s) => presentarAna(s, "!"));
// ["Hola, soy Ana!", "Qué tal, soy Ana!"]

const otro = { nombre: "Luis", hablar: presentarAna };
otro.hablar("Hola", "!");                  // "Hola, soy Ana!"  (bind gana)
```

## Por qué importa

"¿Cuál es la diferencia entre `call`, `apply` y `bind`?" es de las preguntas de JavaScript que más se repiten en entrevistas junior. Practicarlas una al lado de la otra es la forma más rápida de no confundirlas nunca.
