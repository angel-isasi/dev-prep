export async function cargarTodo(tareas) {
  // map llama a cada tarea YA: todas empiezan en este momento.
  const promesas = tareas.map((tarea) => tarea());
  // Promise.all espera a todas, respeta el orden y rechaza con el primer error.
  return Promise.all(promesas);
}

export async function cargarLoQueSePueda(tareas) {
  const resultados = await Promise.allSettled(tareas.map((tarea) => tarea()));

  const exitos = [];
  const fallos = [];
  for (const r of resultados) {
    if (r.status === "fulfilled") exitos.push(r.value);
    else fallos.push(r.reason.message); // reason es el error con el que rechazó
  }
  return { exitos, fallos };
}
