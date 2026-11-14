export function transferir(db, origenId, destinoId, monto) {
  // Validaciones que no necesitan la base: se hacen antes de abrir la transacción.
  if (typeof monto !== "number" || !(monto > 0)) {
    throw new Error("El monto debe ser mayor que cero");
  }
  if (origenId === destinoId) {
    throw new Error("El origen y el destino deben ser distintos");
  }

  db.exec("BEGIN");
  try {
    const origen = db.prepare("SELECT saldo FROM billeteras WHERE cliente_id = ?").get(origenId);
    if (!origen) throw new Error("La billetera de origen no existe");
    if (origen.saldo < monto) throw new Error("Saldo insuficiente");

    // 1. Restar al origen.
    db.prepare("UPDATE billeteras SET saldo = saldo - ? WHERE cliente_id = ?").run(monto, origenId);

    // 2. Sumar al destino. Puede fallar de dos formas:
    //    - no existe la billetera (changes = 0), o
    //    - la base rechaza el UPDATE por el CHECK del tope de 5000 (lanza un error).
    const { changes } = db
      .prepare("UPDATE billeteras SET saldo = saldo + ? WHERE cliente_id = ?")
      .run(monto, destinoId);
    if (changes === 0) throw new Error("La billetera de destino no existe");

    // Todo salió bien: los dos cambios quedan guardados juntos.
    db.exec("COMMIT");
  } catch (error) {
    // Algo falló: se deshace TODO lo hecho desde el BEGIN (incluida la resta al origen).
    db.exec("ROLLBACK");
    throw error; // quien llamó a la función se entera del problema
  }
}
