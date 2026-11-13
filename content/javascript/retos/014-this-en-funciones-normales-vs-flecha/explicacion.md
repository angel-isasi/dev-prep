## Idea clave

En una **función normal**, `this` se decide **al llamarla**: es el objeto que está antes del punto. Una **función flecha** no tiene `this` propio: usa el `this` del lugar donde fue escrita. Y `bind` crea una función con el `this` **fijado para siempre**.

## Paso a paso

1. **`saludar`** es un método normal: al llamar `usuario.saludar()`, `this` es `usuario` y `this.nombre` es `"Angel"`.
2. **`saludarLuego`** también es un método normal, así que su `this` es el objeto que lo llamó.
3. Dentro, el callback del `setTimeout` es una **flecha**: no tiene `this` propio, así que usa el `this` de `saludarLuego`. Cuando el temporizador la ejecuta 100 ms después, `this.nombre` sigue siendo el nombre correcto.
4. **`saludoLigado`** se crea con `usuario.saludar.bind(usuario)`: una copia de `saludar` cuyo `this` siempre es `usuario`, la llames como la llames.

```js
export const usuario = {
  nombre: "Angel",

  saludar() {
    return `Hola, soy ${this.nombre}`;
  },

  saludarLuego() {
    return new Promise((resolver) => setTimeout(() => resolver(this.nombre), 100));
  },
};

export const saludoLigado = usuario.saludar.bind(usuario);
```

## Por qué funciona

Cuánto vale `this` según cómo llamas a la función:

| Llamada | Tipo de función | `this` | Resultado |
|---|---|---|---|
| `usuario.saludar()` | normal | `usuario` | `"Hola, soy Angel"` |
| `rosa.saludar()` | normal (la misma función) | `rosa` | `"Hola, soy Rosa"` |
| `const s = usuario.saludar; s()` | normal, llamada suelta | `undefined` (en módulos) | TypeError |
| flecha dentro de `saludarLuego` | flecha | el de `saludarLuego` | el nombre correcto |
| `saludoLigado()` | ligada con `bind` | `usuario`, siempre | `"Hola, soy Angel"` |
| `otro.saludar()` con `saludoLigado` | ligada | `usuario` (ignora a `otro`) | `"Hola, soy Angel"` |

¿Por qué la llamada suelta da `undefined`? Porque `s()` no tiene nada antes del punto. Este archivo es un **módulo**, que siempre corre en modo estricto, y en modo estricto una llamada suelta tiene `this = undefined`. Leer `undefined.nombre` lanza "Cannot read properties of undefined". En scripts antiguos sin modo estricto, `this` sería el objeto global y obtendrías `"Hola, soy undefined"`.

¿Y si el callback del `setTimeout` fuera `function () { resolver(this.nombre) }`? Lo llama el temporizador como función suelta: `this` sería `undefined` y fallaría. La flecha lo evita.

## Errores comunes

- **Escribir `saludar: () => ...` como flecha.** La flecha toma el `this` del módulo (`undefined`), no el del objeto. Lo reconoces por el error "Cannot read properties of undefined (reading 'nombre')".
- **Usar `function` normal dentro del `setTimeout`.** Pierde el `this`. Lo reconoces porque el test de `saludarLuego` falla con el mismo error de lectura.
- **Escribir `"Angel"` a mano.** Pasa el primer test, pero `rosa.saludar()` también dice "Angel". Lo reconoces porque falla el test de Rosa.
- **`saludoLigado = usuario.saludar` sin `bind`.** Es la misma función suelta: al llamarla, `this` es `undefined`.
- **`saludoLigado = usuario.saludar()`.** Guardas el texto, no una función. Lo reconoces porque el test dice que `typeof` es `"string"`.

## Otra forma de resolverlo

Antes de que existieran las flechas, se guardaba el `this` en una variable para usarlo dentro del callback:

```js
saludarLuego() {
  const self = this;
  return new Promise(function (resolver) {
    setTimeout(function () {
      resolver(self.nombre);
    }, 100);
  });
},
```

Y `saludoLigado` también se puede escribir con una flecha que llama al método con su dueño:

```js
export const saludoLigado = () => usuario.saludar();
```

Las dos funcionan. `const self = this` lo verás en código antiguo; hoy se prefiere la flecha. La versión `() => usuario.saludar()` es común en React para pasar callbacks (`onClick={() => usuario.saludar()}`), y hace lo mismo que `bind`.

## Cómo explicarlo en la entrevista

> "En una función normal, `this` depende de cómo se llama: si la llamo como `usuario.saludar()`, `this` es `usuario`; si la separo y la llamo sola, se pierde, y en modo estricto es `undefined`. Una función flecha no tiene `this` propio: usa el del lugar donde se escribió. Por eso dentro del `setTimeout` uso flecha, para conservar el `this` del método. Y si necesito pasar un método como callback, lo fijo con `bind` o lo envuelvo en una flecha."

## Conceptos

- **`this` en funciones normales**: lo decide la llamada; es el objeto antes del punto.
- **`this` en funciones flecha**: no tienen uno propio; usan el del ámbito donde se escribieron.
- **Llamada suelta**: `fn()` sin objeto; en modo estricto `this` es `undefined`.
- **Modo estricto**: los módulos ES y las clases lo activan siempre.
- **`fn.bind(obj)`**: devuelve una función nueva con `this` fijado en `obj`.
- **Sintaxis de método**: `saludar() { ... }` dentro de un objeto es una función normal.
