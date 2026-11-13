En tu archivo ya están hechos (no los cambies):

- La clase `Contador`, con la propiedad `clics` (empieza en 0) y el método `sumar()`, que hace `this.clics++`.
- `crearEmisor()`, que simula una librería de eventos: `on(fn)` guarda una función y `emitir()` llama a todas las funciones guardadas.

Escribe `registrar(contador, emisor)` para que **cada vez que el emisor emita, se ejecute `contador.sumar()`** y suba `contador.clics`.

## El problema

Lo primero que se le ocurre a cualquiera falla:

```js
export function registrar(contador, emisor) {
  emisor.on(contador.sumar);
}

registrar(contador, emisor);
emisor.emitir();
// TypeError: Cannot read properties of undefined (reading 'clics')
```

`emisor.on(contador.sumar)` le pasa **solo la función**, sin el objeto. Cuando el emisor la llama, ya no hay un `contador.` delante y `this` deja de ser el contador. Tu trabajo es que `this` siga siendo el contador.

## Reglas

- `registrar` no llama a `sumar` en ese momento: solo deja todo listo para cuando el emisor emita.
- Cada emisión suma exactamente 1.
- Debe funcionar con cualquier emisor, aunque llame a la función de otra forma (por ejemplo, como método suyo, `this.fn()`).
- No cambies `Contador` ni `crearEmisor`.

## Ejemplos

```js
const contador = new Contador();
const emisor = crearEmisor();

registrar(contador, emisor);
contador.clics;    // 0  (todavía nadie emitió)

emisor.emitir();
emisor.emitir();
contador.clics;    // 2
```

## Por qué importa

Es exactamente lo que pasa con `addEventListener("click", this.sumar)`, `setTimeout(obj.metodo, 1000)` o `array.forEach(obj.metodo)`. "Perder el `this`" es uno de los bugs más comunes de JavaScript y una pregunta clásica de entrevista. En React con clases era el pan de cada día (`this.handleClick = this.handleClick.bind(this)`).
