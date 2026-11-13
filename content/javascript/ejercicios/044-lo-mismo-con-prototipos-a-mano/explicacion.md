## Idea clave

Todo objeto en JavaScript tiene un enlace oculto a otro objeto: su **prototipo**. Si le pides una propiedad que no tiene, JavaScript la busca en el prototipo. Entonces pones `saludar` **una sola vez** en un objeto (`metodosUsuario`) y creas cada usuario con `Object.create(metodosUsuario)`: todos lo heredan y nadie tiene su propia copia. Esto es exactamente lo que `class` hace por debajo.

## Paso a paso

1. **Crea el objeto con los métodos compartidos**, fuera de la función: `metodosUsuario`, con `saludar`. Como está fuera, se crea una sola vez cuando se carga el archivo.
2. **En `saludar`, usa `this.nombre`**. No sabes de antemano qué usuario lo va a llamar; `this` será el objeto que está a la izquierda del punto en la llamada (`a.saludar()` → `this` es `a`).
3. **Dentro de `crearUsuario`, crea el objeto con `Object.create(metodosUsuario)`**. Te da un objeto vacío `{}` cuyo prototipo es `metodosUsuario`.
4. **Guarda el nombre** como propiedad propia: `usuario.nombre = nombre`. Los datos van en cada objeto; los métodos, en el prototipo.
5. **Devuelve el usuario.**

```js
const metodosUsuario = {
  saludar() {
    return `Hola, soy ${this.nombre}`;
  },
};

export function crearUsuario(nombre) {
  const usuario = Object.create(metodosUsuario);
  usuario.nombre = nombre;
  return usuario;
}
```

## Por qué funciona

Después de `const a = crearUsuario("Ana")` y `const b = crearUsuario("Luis")`, la memoria queda así:

```
a  = { nombre: "Ana" }   ──┐
                           ├──► metodosUsuario = { saludar() {...} } ──► Object.prototype ──► null
b  = { nombre: "Luis" }  ──┘
```

Cuando escribes `a.saludar()`, JavaScript recorre la **cadena de prototipos**:

| Paso | Dónde busca `saludar` | ¿Lo encuentra? |
|---|---|---|
| 1 | en `a` mismo (`{ nombre: "Ana" }`) | no |
| 2 | en el prototipo de `a`: `metodosUsuario` | sí, lo ejecuta |

Lo ejecuta con `this = a`, así que `this.nombre` es `"Ana"` y devuelve `"Hola, soy Ana"`. Con `b.saludar()` se usa **la misma función** pero con `this = b`.

Por eso los tests se cumplen:

- `a.saludar === b.saludar`: las dos búsquedas terminan en el mismo `metodosUsuario.saludar`.
- `Object.hasOwn(a, "saludar")` es `false`: `hasOwn` solo mira el objeto, no sube por la cadena.
- `Object.hasOwn(a, "nombre")` es `true`: el nombre sí se guardó en `a`.

Si buscas algo que no está en ningún lado, como `a.volar`, la búsqueda sube hasta `Object.prototype`, luego llega a `null` y devuelve `undefined`.

## Errores comunes

- **Definir `saludar` dentro del objeto literal que devuelves.** Funciona, pero cada usuario tiene su propia función. Lo reconoces porque fallan los tests "comparten la misma función" y "vive en el prototipo".
- **Crear `metodosUsuario` dentro de `crearUsuario`.** Cada llamada crea un prototipo nuevo con una función nueva, así que `a.saludar !== b.saludar`. El objeto de métodos tiene que estar fuera.
- **Usar una función flecha para `saludar`:** `saludar: () => ...`. Las flechas no tienen su propio `this`; `this.nombre` sería `undefined` y obtendrías `"Hola, soy undefined"`.
- **Escribir `nombre` en vez de `this.nombre` dentro de `saludar`.** `saludar` no ve el parámetro de `crearUsuario`; da "nombre is not defined".
- **Asignar el nombre en el prototipo:** `metodosUsuario.nombre = nombre`. Todos los usuarios comparten esa propiedad y el último creado "pisa" a los anteriores: `a.saludar()` diría `"Hola, soy Luis"`.

## Otra forma de resolverlo

Antes de que existiera `class` (2015), se usaba una **función constructora** con `new`. Cada función tiene una propiedad `prototype` que se convierte en el prototipo de los objetos que crea:

```js
function Usuario(nombre) {
  this.nombre = nombre;
}
Usuario.prototype.saludar = function () {
  return `Hola, soy ${this.nombre}`;
};

export function crearUsuario(nombre) {
  return new Usuario(nombre);
}
```

Y con `class`, que hace lo mismo con otra sintaxis:

```js
class Usuario {
  constructor(nombre) {
    this.nombre = nombre;
  }
  saludar() {
    return `Hola, soy ${this.nombre}`;
  }
}
// Usuario.prototype.saludar existe igual que en la versión anterior
```

**¿Cuál conviene?** En código real, usa `class`: es la más clara. `Object.create` es útil para entender el mecanismo y para crear objetos con un prototipo concreto sin constructor (por ejemplo, `Object.create(null)` crea un objeto sin ningún prototipo). La función constructora la vas a ver en código antiguo y en preguntas tipo "¿qué hace `new`?": crea un objeto vacío, le pone `Funcion.prototype` como prototipo, ejecuta la función con `this` apuntando a ese objeto y lo devuelve.

## Cómo explicarlo en la entrevista

> "Cada objeto tiene un prototipo, y si una propiedad no está en el objeto, JavaScript la busca subiendo por la cadena de prototipos. Pongo `saludar` una sola vez en un objeto de métodos y creo cada usuario con `Object.create` de ese objeto. Así el nombre es propio de cada usuario, pero el método se comparte, y uso `this` para que sepa qué usuario lo llamó. Es lo mismo que hace `class` por debajo: los métodos de una clase viven en `Clase.prototype`, no en cada instancia, y eso ahorra memoria."

## Conceptos

- **Prototipo**: objeto del que otro objeto hereda propiedades; se consulta cuando la propiedad no está en el propio objeto.
- **Cadena de prototipos**: la búsqueda sube de prototipo en prototipo hasta encontrar la propiedad o llegar a `null`.
- **`Object.create(proto)`**: crea un objeto nuevo cuyo prototipo es `proto`.
- **`Object.getPrototypeOf(obj)`**: devuelve el prototipo de un objeto.
- **`Object.hasOwn(obj, clave)`**: `true` solo si la propiedad está en el objeto mismo, no en su prototipo.
- **`this` en métodos**: es el objeto a la izquierda del punto al momento de llamar; las funciones flecha no tienen `this` propio.
- **Función constructora y `new`**: la forma antigua de crear objetos con métodos compartidos en `Funcion.prototype`.
