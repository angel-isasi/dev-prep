Escribe la función `crearCuenta(saldoInicial)` que devuelva un **objeto** con tres métodos para manejar una cuenta bancaria. El saldo debe ser **privado**: no puede existir una propiedad `saldo` que alguien cambie desde afuera.

- `depositar(monto)`: suma el monto al saldo y devuelve el saldo nuevo.
- `retirar(monto)`: resta el monto al saldo y devuelve el saldo nuevo.
- `verSaldo()`: devuelve el saldo actual.

## Reglas

- Si no se pasa `saldoInicial`, la cuenta empieza en `0`.
- `cuenta.saldo` debe ser `undefined`: el saldo solo se lee con `verSaldo()`.
- Si `depositar` recibe un monto menor o igual a 0, lanza un error con el mensaje exacto `"El monto debe ser mayor que cero"`.
- Si `retirar` recibe un monto mayor que el saldo, lanza un error con el mensaje exacto `"Saldo insuficiente"`. En ese caso el saldo **no cambia**.
- Para lanzar un error usa `throw new Error("mensaje")`.
- Cada cuenta tiene su propio saldo.

## Ejemplos

```js
const cuenta = crearCuenta(100);
cuenta.depositar(50);     // 150
cuenta.retirar(30);       // 120
cuenta.verSaldo();        // 120
cuenta.saldo;             // undefined

cuenta.retirar(999);      // Error: "Saldo insuficiente"
cuenta.verSaldo();        // 120 (no cambió)
cuenta.depositar(0);      // Error: "El monto debe ser mayor que cero"

crearCuenta().verSaldo(); // 0
```

## Por qué importa

Es el ejemplo típico para explicar **encapsulamiento** con closures: el dato se protege y solo cambia por los caminos que tú decides, con sus validaciones. En entrevistas te lo pueden pedir así o como "implementa un contador con métodos incrementar y decrementar".
