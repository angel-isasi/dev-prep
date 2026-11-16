## Idea clave

En una **actualización optimista** cambias la pantalla **antes** de que el servidor confirme, porque casi siempre dirá que sí. Si dice que no, haces **rollback**: deshaces el cambio y avisas. La parte delicada es qué deshacer: no restauras una foto vieja de toda la lista (borrarías cambios que el usuario hizo mientras tanto), sino **solo el campo de esa tarea**, aplicado sobre el estado más reciente con la forma funcional de `setState`.

## Paso a paso

1. **Carga inicial normal.** Un efecto con `[]` pide el `GET` y guarda la lista, con sus estados de cargando y error.
2. **Helper que toca una sola tarea.** `ponerHecha(id, hecha)` hace `setTareas((actuales) => actuales.map(...))`. La forma funcional recibe el estado **más reciente**, no el que existía cuando se creó la función.
3. **Al hacer clic, primero el estado.** `ponerHecha(tarea.id, !tarea.hecha)`: la casilla cambia en el siguiente render, sin esperar la red.
4. **Marca la tarea como pendiente.** Un `Set` de ids en el estado; la casilla usa `disabled={pendientes.has(tarea.id)}`. Así nadie la cambia otra vez mientras su PATCH viaja, pero las demás siguen libres.
5. **El `PATCH`.** Método, `Content-Type` y `JSON.stringify({ hecha })`. Si `!ok`, lanzas un error para que el fallo HTTP y el de red terminen en el mismo `catch`.
6. **Rollback quirúrgico.** En el `catch`, `ponerHecha(tarea.id, tarea.hecha)`: `tarea` es el objeto que se clicó, así que `tarea.hecha` es el valor de **antes** del clic.
7. **`finally`.** Quita el id de pendientes pase lo que pase.

```jsx
function ponerHecha(id, hecha) {
  setTareas((actuales) => actuales.map((t) => (t.id === id ? { ...t, hecha } : t)));
}

async function alternar(tarea) {
  ponerHecha(tarea.id, !tarea.hecha);   // optimista
  try {
    const r = await fetch(`/api/practica/tareas/${tarea.id}`, { method: "PATCH", /* ... */ });
    if (!r.ok) throw new Error(`Error ${r.status}`);
  } catch {
    ponerHecha(tarea.id, tarea.hecha);  // rollback de ESTA tarea
    setAviso(`No se pudo actualizar "${tarea.titulo}". Inténtalo de nuevo.`);
  }
}
```

## Por qué funciona

El caso difícil: marcas la tarea 2 y luego la 3; la 3 responde bien y la 2 falla.

| Momento | Tarea 2 hecha | Tarea 3 hecha | Rollback con "foto" de la lista | Rollback quirúrgico |
|---|---|---|---|---|
| inicio | no | no | | |
| clic en 2 (foto A: 2 no 3 no) | sí | no | | |
| clic en 3 (foto B: 2 sí 3 no) | sí | sí | | |
| la 3 responde bien | sí | sí | | |
| la 2 falla | | | restaura foto A: 2 no **3 no** (mal) | solo 2 vuelve a no: 2 no **3 sí** (bien) |

Con la foto, la tarea 3 se desmarca aunque el servidor la guardó: la pantalla queda mintiendo. Con `setTareas((actuales) => ...)` partes del estado real del momento en que llega el error y cambias una sola cosa.

## Errores comunes

- **Guardar `const anterior = tareas` y hacer `setTareas(anterior)` al fallar.** Es el error del cuadro: borra los cambios concurrentes.
- **Usar `setTareas(tareas.map(...))` sin la forma funcional.** `tareas` es el valor del render en que se creó la función: cuando llega la respuesta, puede estar desactualizado y pisas cambios.
- **Esperar la respuesta antes de cambiar la pantalla.** Funciona, pero ya no es optimista: con una red lenta la casilla tarda en reaccionar y el usuario hace clic dos veces.
- **Olvidar el rollback cuando `ok` es `false`.** Un 500 no rechaza la promesa: si solo deshaces en el `catch` de red, un error del servidor deja la pantalla diciendo algo que no se guardó.
- **No avisar.** El cambio "se deshace solo" y el usuario cree que la app tiene un bug.
- **Deshabilitar toda la lista** mientras hay un PATCH en curso: pierdes la sensación de rapidez que buscabas.

## Otra forma de resolverlo

React 19 trae `useOptimistic`, que muestra un valor "optimista" mientras dura una acción asíncrona y vuelve solo al valor real cuando termina:

```jsx
const [tareasVisibles, aplicarOptimista] = useOptimistic(
  tareas,
  (actuales, { id, hecha }) => actuales.map((t) => (t.id === id ? { ...t, hecha } : t)),
);

function alternar(tarea) {
  startTransition(async () => {
    aplicarOptimista({ id: tarea.id, hecha: !tarea.hecha });
    const r = await fetch(`/api/practica/tareas/${tarea.id}`, { method: "PATCH", /* ... */ });
    if (r.ok) {
      const guardada = await r.json();
      setTareas((actuales) => actuales.map((t) => (t.id === guardada.id ? guardada : t)));
    } else {
      setAviso(`No se pudo actualizar "${tarea.titulo}". Inténtalo de nuevo.`);
    }
  });
}
```

**¿Cuándo conviene?** `useOptimistic` hace el rollback por ti (si no actualizas `tareas`, el valor optimista desaparece al terminar la transición). En apps con TanStack Query se usa `onMutate` para aplicar el cambio y `onError` para deshacerlo, con la misma idea. Entender la versión a mano te permite usar cualquiera de las dos con criterio.

## Cómo explicarlo en la entrevista

> "Uso una actualización optimista: al hacer clic cambio el estado de inmediato y recién mando el `PATCH`, así la interfaz se siente instantánea. Si el servidor falla, por red o porque `ok` viene en `false`, hago rollback y aviso al usuario. El detalle importante es cómo deshago: no guardo una copia de toda la lista, porque si el usuario cambió otra tarea mientras tanto la estaría borrando. Deshago solo el campo de esa tarea con la forma funcional de `setState`, que parte del estado más reciente. Mientras su petición está en curso, deshabilito solo esa casilla."

## Conceptos

- **Actualización optimista**: actualizar la interfaz antes de la confirmación del servidor.
- **Rollback**: deshacer el cambio si el servidor lo rechaza, y avisar.
- **Forma funcional de `setState`**: `setX((actual) => ...)` parte del estado más reciente.
- **Closures y estado desactualizado** (*stale state*) en funciones asíncronas.
- **Cambios concurrentes**: varias peticiones en vuelo a la vez.
- **`PATCH`**: actualización parcial de un recurso.
- **`Set` en el estado**: crear uno nuevo en cada cambio (inmutabilidad).
- **`useOptimistic`** (React 19) y `onMutate`/`onError` de TanStack Query.
