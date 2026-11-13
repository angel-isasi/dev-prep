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
