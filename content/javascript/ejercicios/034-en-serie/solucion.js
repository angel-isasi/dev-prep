export async function enSerie(tareas) {
  const resultados = [];
  for (const tarea of tareas) {
    resultados.push(await tarea());
  }
  return resultados;
}
