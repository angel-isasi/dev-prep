export async function conLimite(tareas, limite) {
  const resultados = new Array(tareas.length);
  let siguiente = 0;

  async function trabajador() {
    while (siguiente < tareas.length) {
      const i = siguiente++;
      resultados[i] = await tareas[i]();
    }
  }

  const cantidad = Math.min(limite, tareas.length);
  const trabajadores = Array.from({ length: cantidad }, () => trabajador());
  await Promise.all(trabajadores);
  return resultados;
}
