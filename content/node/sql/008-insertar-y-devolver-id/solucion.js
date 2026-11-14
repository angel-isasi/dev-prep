export function crearCliente(db, datos) {
  // 1. Limpia los textos. `?? ""` evita un error si falta la propiedad.
  const nombre = (datos.nombre ?? "").trim();
  const email = (datos.email ?? "").trim();
  const ciudad = (datos.ciudad ?? "").trim();

  // 2. Valida ANTES de tocar la base, en el orden pedido.
  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!email.includes("@")) throw new Error("El email no es válido");
  if (!ciudad) throw new Error("La ciudad es obligatoria");

  // 3. ¿Ya existe ese email? .get() devuelve la fila o undefined.
  const existente = db.prepare("SELECT id FROM clientes WHERE email = ?").get(email);
  if (existente) throw new Error("El email ya está registrado");

  // 4. Inserta sin id: la base lo genera. .run() informa cuántas filas cambió
  //    y el id de la última fila insertada.
  const resultado = db
    .prepare("INSERT INTO clientes (nombre, email, ciudad) VALUES (?, ?, ?)")
    .run(nombre, email, ciudad);

  return Number(resultado.lastInsertRowid);
}
