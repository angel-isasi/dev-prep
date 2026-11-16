# Etapa 7: un hook propio, useTasks (el hook de tareas)

`App` ya mezcla dos cosas: **cómo se ve** el tablero y **cómo se consiguen y cambian** los datos. En esta etapa separas la segunda en un hook propio. Es una refactorización: la app se ve y funciona igual, y todos los tests anteriores tienen que seguir pasando.

## Qué hacer

1. Crea `src/hooks/useTasks.js` y exporta `useTasks()`, que devuelve:

   | Valor | Qué es |
   |---|---|
   | `tasks` | Las tareas |
   | `loading` | `true` mientras carga |
   | `error` | `"No se pudieron cargar las tareas."` si falló la carga, si no `null` |
   | `reload()` | Vuelve a cargar |
   | `addTask({ title, topic })` | Crea en la API, agrega al estado y **devuelve** la tarea creada |
   | `toggleTask(id)` | Cambia `done` en la API y en el estado; devuelve la tarea actualizada |
   | `renameTask(id, title)` | Cambia el título; devuelve la tarea actualizada |
   | `removeTask(id)` | Borra en la API y luego del estado |

   - Carga sola al montarse.
   - Las acciones **no** atrapan los errores: si la API falla, la promesa se rechaza y el estado no cambia. Quien usa el hook decide qué mostrar.
2. En `App`, usa el hook y quita los `import` de `./api.js`. App conserva lo que es de la vista: filtro, búsqueda y el mensaje de error de las acciones (con `try`/`catch` alrededor de cada acción del hook).

## Conceptos que practicas

- Hooks propios: funciones que empiezan con `use` y usan otros hooks.
- Separar la lógica de datos de la presentación (lo mismo que hacen librerías como TanStack Query).
- Refactorizar con red de seguridad: los tests anteriores te dicen si rompiste algo.
- Probar un hook con `renderHook` y `act`.

## Pistas

1. Empieza copiando a `useTasks.js` todo lo de App que habla con la API (estado, `loadTasks`, `useEffect`) y al final del hook haz `return { tasks, loading: status === "loading", ... }`. Luego borra eso de App.
2. Que las acciones lancen el error (sin `catch` en el hook) deja al hook reutilizable: en App lo atrapas para mostrar la alerta, y en otra pantalla podrías mostrar otra cosa.
