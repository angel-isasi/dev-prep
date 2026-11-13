## Idea clave

El saldo no es una propiedad del objeto: es una **variable local** de `crearCuenta`. Los tres métodos del objeto se crearon dentro de `crearCuenta`, así que comparten esa variable gracias al closure. Desde afuera solo ves los métodos; el saldo solo cambia a través de ellos, con sus validaciones. Eso es **encapsulamiento**.

## Paso a paso

1. **Guarda el saldo en una variable** con `let saldo = saldoInicial`. El `= 0` en el parámetro hace que, si no te pasan nada, empiece en 0.
2. **Devuelve un objeto** con tres métodos.
3. **`depositar(monto)`**: primero valida. Si `monto <= 0`, lanza el error con `throw`. Si no, suma y devuelve el saldo.
4. **`retirar(monto)`**: primero valida. Si `monto > saldo`, lanza "Saldo insuficiente". Si no, resta y devuelve el saldo.
5. **`verSaldo()`**: solo devuelve `saldo`.

```js
export function crearCuenta(saldoInicial = 0) {
  let saldo = saldoInicial;

  return {
    depositar(monto) {
      if (monto <= 0) throw new Error("El monto debe ser mayor que cero");
      saldo += monto;
      return saldo;
    },
    retirar(monto) {
      if (monto > saldo) throw new Error("Saldo insuficiente");
      saldo -= monto;
      return saldo;
    },
    verSaldo() {
      return saldo;
    },
  };
}
```

## Por qué funciona

Recorrido con `const cuenta = crearCuenta(100)`:

| Operación | Validación | `saldo` después | Resultado |
|---|---|---|---|
| `crearCuenta(100)` | | `100` | un objeto con 3 métodos |
| `cuenta.depositar(50)` | `50 <= 0` → no | `150` | `150` |
| `cuenta.retirar(30)` | `30 > 150` → no | `120` | `120` |
| `cuenta.retirar(999)` | `999 > 120` → sí, `throw` | `120` (no cambió) | Error "Saldo insuficiente" |
| `cuenta.saldo` | | `120` | `undefined` (no existe esa propiedad) |

**¿Qué variable queda recordada?** `saldo`. **¿Por qué sobrevive?** `crearCuenta` terminó hace rato, pero los tres métodos del objeto devuelto siguen usando `saldo`. Mientras guardes `cuenta`, esa variable sigue viva, y los tres métodos ven **la misma** (por eso un depósito se refleja en `verSaldo`).

**¿Por qué el saldo no cambia cuando hay error?** Porque `throw` detiene la función en ese instante: la línea `saldo -= monto` nunca se ejecuta. Por eso siempre se valida **antes** de modificar.

**¿Por qué `cuenta.saldo` es `undefined`?** Porque el objeto devuelto solo tiene las claves `depositar`, `retirar` y `verSaldo`. Aunque alguien escriba `cuenta.saldo = 1000000`, solo crea una propiedad nueva sin relación con la variable `saldo`: `verSaldo()` sigue devolviendo el valor real.

## Errores comunes

- **Guardar el saldo como propiedad: `return { saldo: saldoInicial, ... }`.** Funciona, pero cualquiera lo puede cambiar. El test "el saldo no se puede leer como propiedad" falla: recibe `100` en vez de `undefined`.
- **Restar antes de validar.** Si haces `saldo -= monto` y después el `if`, el error se lanza pero el saldo ya cambió. Lo reconoces porque `verSaldo()` devuelve `-879` en vez de `120`.
- **Devolver el error en vez de lanzarlo: `return new Error(...)` o `return "Saldo insuficiente"`.** La función no "falla", solo devuelve un valor. El test con `toThrow` dice "expected function to throw an error, but it didn't".
- **Mensaje distinto al pedido**, por ejemplo `"saldo insuficiente"` en minúsculas. `toThrow` compara el texto y el test falla mostrando ambos mensajes.
- **Usar `this.saldo` dentro de los métodos.** Eso lee una propiedad del objeto, no la variable del closure: obtienes `undefined` y operaciones con `NaN`.

## Otra forma de resolverlo

Con una clase y un **campo privado** (`#`), una sintaxis moderna de JavaScript:

```js
class Cuenta {
  #saldo;
  constructor(saldoInicial = 0) {
    this.#saldo = saldoInicial;
  }
  depositar(monto) {
    if (monto <= 0) throw new Error("El monto debe ser mayor que cero");
    this.#saldo += monto;
    return this.#saldo;
  }
  retirar(monto) {
    if (monto > this.#saldo) throw new Error("Saldo insuficiente");
    this.#saldo -= monto;
    return this.#saldo;
  }
  verSaldo() {
    return this.#saldo;
  }
}

export const crearCuenta = (saldoInicial) => new Cuenta(saldoInicial);
```

`#saldo` solo se puede usar dentro de la clase: desde afuera `cuenta.#saldo` es un error de sintaxis y `cuenta.saldo` es `undefined`.

**¿Cuál conviene?** El closure es la forma clásica y la que esperan cuando la pregunta es sobre closures. La clase con `#` es más moderna y conveniente si vas a crear muchas cuentas o usar herencia. Saber las dos y decir que logran lo mismo suma puntos.

## Cómo explicarlo en la entrevista

> "Guardo el saldo en una variable local de `crearCuenta`, no en el objeto. Devuelvo un objeto con tres métodos que, por el closure, comparten esa variable. Así el saldo es privado: solo cambia por `depositar` y `retirar`, que validan antes de tocarlo y lanzan un error si el monto no es válido. Como valido antes de modificar, un retiro fallido no deja el saldo a medias. Es encapsulamiento sin clases; con clases lo haría con un campo privado `#saldo`."

## Conceptos

- **Encapsulamiento**: esconder los datos internos y exponer solo las operaciones permitidas.
- **Closure compartido**: varias funciones creadas en el mismo lugar ven la misma variable.
- **`throw new Error("...")`**: lanza un error y corta la función en ese punto; quien llama puede atraparlo con `try...catch`.
- **Parámetro por defecto**: `saldoInicial = 0` se usa cuando no pasan ese argumento.
- **Métodos abreviados**: `depositar(monto) { ... }` dentro de un objeto es lo mismo que `depositar: function (monto) { ... }`.
- **Campos privados de clase (`#`)**: la alternativa con clases para tener datos privados.
