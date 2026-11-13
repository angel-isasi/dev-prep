Escribe y exporta la función `crearUsuario(nombre)`, que devuelve un objeto usuario con un método `saludar()`. La condición: **no puedes usar `class`**, y todos los usuarios deben **compartir la misma función** `saludar` en vez de que cada uno tenga su propia copia.

## Reglas

- `crearUsuario(nombre)` devuelve un objeto con la propiedad `nombre`.
- `usuario.saludar()` devuelve `"Hola, soy <nombre>"`.
- El método `saludar` **no** debe ser una propiedad propia del objeto: tiene que vivir en su **prototipo**, un objeto aparte del que el usuario hereda. Por eso `Object.hasOwn(usuario, "saludar")` debe ser `false`.
- Dos usuarios distintos usan exactamente la misma función: `a.saludar === b.saludar` es `true`.
- El `nombre` sí es propio de cada usuario.

## Ejemplos

```js
const a = crearUsuario("Ana");
const b = crearUsuario("Luis");

a.saludar();                    // "Hola, soy Ana"
b.saludar();                    // "Hola, soy Luis"
a.saludar === b.saludar;        // true  (es la misma función)
Object.hasOwn(a, "saludar");    // false (vive en el prototipo)
Object.hasOwn(a, "nombre");     // true
```

Un objeto literal no cumple la regla:

```js
// ❌ Cada usuario tiene su propia copia de saludar
function crearUsuario(nombre) {
  return { nombre, saludar() { return `Hola, soy ${this.nombre}`; } };
}
```

## Por qué importa

`class` es una forma bonita de escribir lo que JavaScript hace con **prototipos**. En entrevistas preguntan "¿qué es la cadena de prototipos?" o "¿qué hace `class` por debajo?", y la mejor manera de responder es haberlo hecho a mano una vez. Además, explica por qué funcionan cosas como `[1, 2].map(...)`: `map` no está en tu arreglo, está en su prototipo.
