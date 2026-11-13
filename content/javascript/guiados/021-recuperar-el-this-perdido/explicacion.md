## Idea clave

`this` no viaja con la función. Si pasas `contador.sumar` como callback, pasas la función **sola**, y quien la llame decide su `this`. Para no perderlo, envuélvela en una flecha que la llame con el punto, `() => contador.sumar()`, o fija el `this` con `bind`.

## Paso a paso

1. **Entiende por qué falla** `emisor.on(contador.sumar)`: el emisor guarda la función y luego hace `fn()`. Sin objeto antes del punto, y como las clases siempre están en modo estricto, `this` es `undefined`. Entonces `this.clics++` lanza `TypeError`.
2. **Crea una función nueva** que haga la llamada correcta: `() => contador.sumar()`. Esa flecha no usa `this` para nada; usa la variable `contador`, que recuerda por closure.
3. **Regístrala** en el emisor: `emisor.on(() => contador.sumar())`.
4. Cuando el emisor haga `fn()`, se ejecuta la flecha, y la flecha ejecuta `contador.sumar()` **con el punto**: ahí `this` es `contador`.

```js
export function registrar(contador, emisor) {
  emisor.on(() => contador.sumar());
}
```

## Por qué funciona

Compara qué recibe el emisor en cada caso:

| Lo que registras | Cómo lo llama el emisor | `this` dentro de `sumar` | Resultado |
|---|---|---|---|
| `contador.sumar` | `fn()` | `undefined` | `TypeError` |
| `contador.sumar` | `this.fn()` (emisor del último test) | el emisor | suma en `emisor.clics` (queda `NaN`) y el contador no cambia |
| `() => contador.sumar()` | `fn()` o `this.fn()` | `contador` | suma 1 |
| `contador.sumar.bind(contador)` | `fn()` o `this.fn()` | `contador` | suma 1 |

El último test es el más interesante: el emisor llama `this.fn()`, así que una función normal recibiría al **emisor** como `this`. Con la flecha da igual cómo la llamen, porque por dentro siempre hace `contador.sumar()`. Con `bind` también, porque una función atada ignora el `this` con el que la llamen.

En el test de "cada contador lleva su propia cuenta", `registrar(b, emisor)` se llama dos veces: se guardan dos flechas que apuntan a `b`, así que cada emisión le suma 2.

## Errores comunes

- **Pasar el método directo**: `emisor.on(contador.sumar)`. Es el bug que el ejercicio quiere que veas: `TypeError: Cannot read properties of undefined (reading 'clics')`.
- **Llamarlo en vez de pasarlo**: `emisor.on(contador.sumar())`. Ejecuta `sumar` en ese momento (falla el test "registrar no llama a sumar todavía") y le pasa al emisor `undefined`, que es lo que devuelve `sumar`. Al emitir: `TypeError: fn is not a function`.
- **Confundir `bind` con `call`**: `emisor.on(contador.sumar.call(contador))`. `call` **ejecuta** la función ya; `bind` **devuelve** una función nueva sin ejecutarla. Es el mismo error que el anterior.
- **Usar una función normal en vez de flecha, con `this` adentro**: `emisor.on(function () { this.sumar(); })`. Esa función tiene su propio `this`, que lo pone el emisor. Usa la variable `contador`, no `this`.
- **Cambiar el método del objeto**: `contador.sumar = contador.sumar.bind(contador)`. Funciona, pero modifica un objeto que no es tuyo como efecto secundario. `registrar` solo debería registrar.

## Otra forma de resolverlo

Con `bind`:

```js
export function registrar(contador, emisor) {
  emisor.on(contador.sumar.bind(contador));
}
```

`bind(contador)` devuelve una **función nueva** igual a `sumar`, pero con `this` fijado en `contador` para siempre: ni `call`, ni otro `bind`, ni llamarla como método de otro objeto lo cambian.

**¿Cuál conviene?** Las dos son correctas. La flecha es la más usada hoy y permite pasar argumentos con claridad: `(evento) => contador.sumar(evento)`. `bind` es útil cuando necesitas **la misma función** para luego quitarla, por ejemplo con `removeEventListener`: guardas `const fn = contador.sumar.bind(contador)` y usas `fn` en los dos lados.

Una tercera forma, si pudieras cambiar la clase, es definir `sumar` como **campo con flecha**:

```js
class Contador {
  clics = 0;
  sumar = () => {
    this.clics++;
  };
}
```

Ahí cada instancia tiene su propia `sumar` atada a ella, y `emisor.on(contador.sumar)` funcionaría tal cual.

## Cómo explicarlo en la entrevista

> "El problema es que `this` se decide al momento de llamar la función, no al definirla. Si paso `contador.sumar` como callback, paso solo la función; el emisor la llama sin objeto delante y `this` queda `undefined` porque las clases están en modo estricto. Lo arreglo pasando una flecha, `() => contador.sumar()`, que llama al método con el punto, o con `contador.sumar.bind(contador)`, que fija el `this`. Es lo mismo que pasa con `addEventListener` o `setTimeout`."

## Conceptos

- **`this` dinámico**: depende de cómo se llama la función, no de dónde se escribió.
- **Perder el `this`**: pasar `obj.metodo` como callback separa la función de su objeto.
- **`bind`**: devuelve una función nueva con `this` fijo e inmutable.
- **Función flecha como envoltorio**: `() => obj.metodo()` conserva la llamada con el punto.
- **Closure**: la flecha recuerda la variable `contador` del lugar donde se creó.
- **Modo estricto**: en clases y módulos, una función llamada suelta recibe `this === undefined`.
