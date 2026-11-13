Escribe y exporta la clase `Pila`. Una **pila** guarda elementos uno encima de otro, como una pila de platos: el último que pones es el primero que sacas (en inglés se le dice LIFO, *last in, first out*).

## Reglas

- `apilar(elemento)`: pone el elemento encima de la pila y **devuelve la misma pila** (`this`), para poder encadenar llamadas: `pila.apilar("a").apilar("b")`.
- `desapilar()`: saca el elemento de arriba y lo devuelve. Si la pila está vacía, devuelve `undefined`.
- `verTope()`: devuelve el elemento de arriba **sin sacarlo**. Si la pila está vacía, devuelve `undefined`.
- `tamano`: cuántos elementos hay. Es una **propiedad**, no un método: se lee como `pila.tamano`, sin paréntesis.
- Los elementos se guardan en un arreglo interno que no se debe poder tocar desde fuera de la clase.

## Ejemplos

```js
const pila = new Pila().apilar("a").apilar("b");

pila.verTope();    // "b"  (no lo saca)
pila.desapilar();  // "b"
pila.verTope();    // "a"
pila.tamano;       // 1

const vacia = new Pila();
vacia.desapilar(); // undefined
vacia.tamano;      // 0
```

## Por qué importa

La pila está en todos lados: el botón "deshacer" de un editor, el historial "atrás" del navegador y la pila de llamadas de JavaScript (*call stack*), que es la que ves en los mensajes de error. En entrevistas junior es muy común que te pidan implementarla con una clase, y de paso revisan si sabes usar campos privados y getters.
