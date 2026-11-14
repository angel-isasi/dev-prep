// Transferencia con transacción
//
// transferir(db, origenId, destinoId, monto): resta al origen y suma al destino,
// las dos cosas o ninguna. Si algo falla: ROLLBACK y vuelve a lanzar el error.
// Errores: "El monto debe ser mayor que cero", "El origen y el destino deben ser distintos",
//   "La billetera de origen no existe", "Saldo insuficiente", "La billetera de destino no existe".
//
//   transferir(db, 1, 2, 200)   // Ana: 1200 -> 1000, Luis: 300 -> 500
//
// Transacciones: db.exec("BEGIN"), db.exec("COMMIT"), db.exec("ROLLBACK")
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function transferir(db, origenId, destinoId, monto) {
  // Tu código aquí
}
