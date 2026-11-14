// Cuenta bancaria
//
// Clase con titular (readonly), saldo y movimientos (private).
// depositar(monto) y retirar(monto) validan y registran el movimiento.
// verSaldo() devuelve el saldo; historial() devuelve una COPIA de los movimientos.
//
//   const cuenta = new CuentaBancaria("Ana", 100);
//   cuenta.depositar(50); cuenta.retirar(30); cuenta.verSaldo()  ->  120
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export type Movimiento = { tipo: "deposito" | "retiro"; monto: number };

export class CuentaBancaria {
  // Declara aquí titular (solo lectura), saldo y movimientos (privados).

  constructor(titular: string, saldoInicial = 0) {
    // Tu código aquí
  }

  depositar(monto: number): void {
    // Tu código aquí
  }

  retirar(monto: number): void {
    // Tu código aquí
  }

  verSaldo(): number {
    // Tu código aquí
    return 0;
  }

  historial(): Movimiento[] {
    // Tu código aquí
    return [];
  }
}
