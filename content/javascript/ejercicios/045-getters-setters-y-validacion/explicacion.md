## Idea clave

Un **setter** (`set precio(valor)`) es una función que se ejecuta cada vez que alguien escribe `producto.precio = algo`. Ahí validas y, si el valor no sirve, lanzas un error **antes** de guardarlo. El valor real se guarda en un campo privado (`#precio`) que nadie puede tocar directamente, así que la única forma de cambiarlo es pasando por tu validación.

## Paso a paso

1. **Declara el campo privado** `#precio = 0`. Es donde de verdad vive el precio.
2. **Getter `precio`**: `return this.#precio`. Cuando alguien lee `producto.precio`, se ejecuta este método.
3. **Setter `precio`**: recibe el valor que se quiere asignar.
   - `Number.isFinite(valor)` es `true` solo para números normales: descarta textos como `"50"`, `NaN`, `Infinity`, `null` y `undefined`.
   - Si no es finito **o** es menor que 0, `throw new Error("Precio inválido")`. El `throw` corta el método, así que la línea que guarda nunca se ejecuta y el precio anterior se conserva.
   - Si pasó la validación, `this.#precio = valor`.
4. **Constructor**: escribe `this.precio = precio` (sin `#`). Así usa el setter y el precio inicial también se valida. Validas en un solo lugar.
5. **Getter `conIgv`**: multiplica por `1.18`, redondea con `toFixed(2)` (que devuelve un **texto**, como `"35.40"`) y lo convierte de vuelta a número con `Number(...)`.

```js
export class Producto {
  #precio = 0;

  constructor(nombre, precio) {
    this.nombre = nombre;
    this.precio = precio; // pasa por el setter, así también se valida
  }

  get precio() {
    return this.#precio;
  }

  set precio(valor) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error("Precio inválido");
    }
    this.#precio = valor;
  }

  get conIgv() {
    return Number((this.#precio * 1.18).toFixed(2));
  }
}
```

## Por qué funciona

Sigue el estado de `#precio` con el ejemplo:

| Instrucción | Qué se ejecuta | `#precio` después | Resultado |
|---|---|---|---|
| `new Producto("Pizza", 30)` | constructor → setter con `30`: válido | `30` | el producto |
| `pizza.conIgv` | getter: `30 * 1.18` = `35.4`, `toFixed(2)` = `"35.40"`, `Number` = `35.4` | `30` | `35.4` |
| `pizza.precio = -5` | setter: `-5 < 0` → `throw` | `30` (no llegó a guardar) | Error "Precio inválido" |
| `pizza.precio = "50"` | setter: `Number.isFinite("50")` es `false` → `throw` | `30` | Error "Precio inválido" |
| `pizza.precio = 10` | setter: válido | `10` | |
| `pizza.conIgv` | `10 * 1.18` = `11.799999999999999`, `toFixed(2)` = `"11.80"` | `10` | `11.8` |

La fila de `11.799999999999999` muestra **por qué** hace falta redondear: los decimales en JavaScript (y en casi todos los lenguajes) no son exactos. Sin `toFixed`, el test esperaría `11.8` y recibiría `11.799999999999999`.

Fíjate también en que `conIgv` no se guarda en ningún lado: se calcula cada vez que lo lees. Por eso siempre está al día con el precio actual.

## Errores comunes

- **Guardar en `this.precio` dentro del setter** (sin `#`). Asignar `this.precio` vuelve a llamar al setter, que vuelve a asignar, y así sin fin: "Maximum call stack size exceeded". El valor real debe ir a otro sitio, como `this.#precio`.
- **Validar con `typeof valor !== "number"`.** Deja pasar `NaN` y `Infinity`, porque `typeof NaN` es `"number"`. `Number.isFinite` los descarta a los dos.
- **Usar `isFinite(valor)` (la función global) en vez de `Number.isFinite`.** La global convierte primero: `isFinite("50")` es `true`, así que el texto pasaría.
- **Usar `this.#precio = precio` en el constructor.** Te saltas el setter y `new Producto("Agua", -1)` se crea sin error.
- **Devolver `toFixed(2)` sin `Number(...)`.** Obtienes el texto `"35.40"`, y el test dice "expected '35.40' to be 35.4".
- **Rechazar el 0 con `valor <= 0`.** Un producto gratis es válido; la regla es "no negativo".

## Otra forma de resolverlo

Sin campo privado, con la convención del guion bajo y `Math.round` para redondear:

```js
export class Producto {
  constructor(nombre, precio) {
    this.nombre = nombre;
    this.precio = precio;
  }

  get precio() {
    return this._precio;
  }

  set precio(valor) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error("Precio inválido");
    }
    this._precio = valor;
  }

  get conIgv() {
    return Math.round(this._precio * 1.18 * 100) / 100;
  }
}
```

`Math.round(x * 100) / 100` redondea a 2 decimales sin pasar por texto.

**¿Cuál conviene?** La versión con `#precio` es más segura: con `_precio`, cualquiera puede escribir `producto._precio = -999` y saltarse la validación. El guion bajo es solo una convención que dice "no toques esto", y la vas a ver mucho en código antiguo. Para redondear, las dos maneras valen; `Math.round` evita la conversión a texto, `toFixed` se lee más claro.

## Cómo explicarlo en la entrevista

> "Uso un campo privado `#precio` para guardar el valor y lo expongo con un getter y un setter. En el setter valido con `Number.isFinite` y que no sea negativo, y si no cumple, lanzo un error antes de guardar, así el objeto nunca queda en un estado inválido. En el constructor asigno con `this.precio` para reutilizar esa validación. `conIgv` es un getter calculado: multiplica por 1.18 y redondea a dos decimales porque los decimales en punto flotante no son exactos."

## Conceptos

- **Getter (`get`)**: método que se ejecuta al leer una propiedad.
- **Setter (`set`)**: método que se ejecuta al asignar una propiedad; recibe el valor nuevo.
- **Encapsulamiento**: esconder el estado interno y controlar cómo se modifica.
- **`throw new Error(mensaje)`**: lanza un error y corta la ejecución de la función.
- **`Number.isFinite(x)`**: `true` solo si `x` es un número que no es `NaN` ni `Infinity`; no convierte textos.
- **`toFixed(n)`**: devuelve un **texto** con el número redondeado a `n` decimales.
- **Punto flotante**: los decimales se guardan de forma aproximada, por eso `10 * 1.18` no da exactamente `11.8`.
- **Propiedad calculada**: un getter que no guarda nada, calcula el valor cada vez que se lee.
