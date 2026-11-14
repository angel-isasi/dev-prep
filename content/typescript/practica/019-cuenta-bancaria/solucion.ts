export type Movimiento = { tipo: "deposito" | "retiro"; monto: number };

export class CuentaBancaria {
  // readonly: se asigna una vez (aquí o en el constructor) y no se puede cambiar.
  readonly titular: string;
  // private: solo los métodos de esta clase pueden leerlo o cambiarlo.
  private saldo: number;
  private movimientos: Movimiento[] = [];

  constructor(titular: string, saldoInicial = 0) {
    if (saldoInicial < 0) {
      throw new Error("El saldo inicial no puede ser negativo");
    }
    this.titular = titular;
    this.saldo = saldoInicial;
  }

  // Método privado: una sola validación que usan depositar y retirar.
  private validarMonto(monto: number): void {
    if (monto <= 0) {
      throw new Error("El monto debe ser mayor que cero");
    }
  }

  depositar(monto: number): void {
    this.validarMonto(monto);
    this.saldo += monto;
    this.movimientos.push({ tipo: "deposito", monto });
  }

  retirar(monto: number): void {
    // Primero TODAS las validaciones, después los cambios:
    // así, si algo falla, el saldo y el historial quedan intactos.
    this.validarMonto(monto);
    if (monto > this.saldo) {
      throw new Error("Saldo insuficiente");
    }
    this.saldo -= monto;
    this.movimientos.push({ tipo: "retiro", monto });
  }

  verSaldo(): number {
    return this.saldo;
  }

  historial(): Movimiento[] {
    // Copia: si devolviéramos this.movimientos, desde fuera podrían hacer push.
    return [...this.movimientos];
  }
}
