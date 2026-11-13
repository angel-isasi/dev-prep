export async function secuencial(tareas) {
  const resultados = [];
  for (const tarea of tareas) {
    resultados.push(await tarea());
  }
  return resultados;
}

export async function paralelo(tareas) {
  return Promise.all(tareas.map((tarea) => tarea()));
}
