Vas a armar un pequeño sistema de validación de formularios hecho de piezas que se combinan. Exporta **cuatro** cosas:

- `requerido(valor)`: validador.
- `minimo(n)`: **fábrica** de validadores. Recibe un número y devuelve un validador.
- `esCorreo(valor)`: validador.
- `validar(valores, reglas)`: aplica las reglas y devuelve los errores.

Un **validador** es una función que recibe un valor y devuelve `null` si está bien, o un **texto con el mensaje de error** si está mal.

## Reglas

- `requerido`: error `"Este campo es obligatorio"` si el valor, convertido a texto y sin espacios en los extremos, queda vacío.
- `minimo(n)`: el validador que devuelve da error `"Escribe al menos n caracteres"` (con el número real, por ejemplo `"Escribe al menos 3 caracteres"`) si el valor sin espacios en los extremos tiene menos de `n` caracteres.
- `esCorreo`: error `"Ingresa un correo válido"` si el valor no tiene la forma `algo@algo.algo` (sin espacios).
- `validar(valores, reglas)`:
  - `reglas` es un objeto `{ campo: [validador1, validador2, ...] }`.
  - Para cada campo, aplica sus validadores **en orden** y se queda con el **primer** mensaje de error.
  - Si un campo no viene en `valores`, trátalo como `""`.
  - Devuelve un objeto `{ campo: mensaje }` solo con los campos que tienen error. Si todo está bien, devuelve `{}`.

## Ejemplo

```js
const reglas = {
  nombre: [requerido, minimo(3)],
  correo: [requerido, esCorreo],
};

validar({ nombre: "Al", correo: "" }, reglas);
// { nombre: "Escribe al menos 3 caracteres", correo: "Este campo es obligatorio" }

validar({ nombre: "Angel", correo: "a@b.pe" }, reglas);
// {}
```

Y en un componente:

```jsx
const errores = validar(datos, reglas);
// {errores.nombre && <p role="alert">{errores.nombre}</p>}
```

## Por qué importa

Casi toda app tiene formularios, y escribir un `if` por cada regla de cada campo se vuelve inmanejable. Con validadores pequeños que se combinan, agregar una regla es agregar una función a una lista. Además, `minimo(3)` es un ejemplo perfecto de **closure** para explicar en una entrevista.
