Una billetera digital (como Yape o Plin) guarda un saldo que **solo** debe cambiar a través de operaciones válidas: nadie debería poder escribir `cuenta.saldo = 1000000` desde otra parte del código.

Escribe la clase `CuentaBancaria`:

- `titular`: texto, **solo lectura** (`readonly`): se asigna en el constructor y no cambia más.
- `saldo`: número, **privado** (`private`): solo se lee con `verSaldo()`.
- `movimientos`: lista privada de `Movimiento` (el tipo ya está declarado).
- `constructor(titular, saldoInicial = 0)`: si `saldoInicial` es negativo, lanza `Error("El saldo inicial no puede ser negativo")`.
- `depositar(monto)`: suma al saldo y registra `{ tipo: "deposito", monto }`.
- `retirar(monto)`: resta del saldo y registra `{ tipo: "retiro", monto }`. Si `monto` es mayor que el saldo, lanza `Error("Saldo insuficiente")`.
- En `depositar` y `retirar`, si `monto` es `0` o negativo, lanza `Error("El monto debe ser mayor que cero")`.
- `verSaldo()`: devuelve el saldo.
- `historial()`: devuelve una **copia** de los movimientos, para que nadie pueda alterarlos desde fuera.

## Reglas

- Si una operación lanza error, el saldo y el historial no cambian.
- `cuenta.saldo` y `cuenta.titular = "otro"` deben ser **errores de tipos**.

## Ejemplos

```ts
const cuenta = new CuentaBancaria("Ana", 100);
cuenta.depositar(50);
cuenta.retirar(30);
cuenta.verSaldo();   // 120
cuenta.historial();  // [{ tipo: "deposito", monto: 50 }, { tipo: "retiro", monto: 30 }]

cuenta.retirar(500); // Error: Saldo insuficiente
cuenta.depositar(0); // Error: El monto debe ser mayor que cero

cuenta.saldo;            // error de tipos: es privado
cuenta.titular = "Luis"; // error de tipos: es de solo lectura
```
