## Idea clave

La lista de avisos es **estado** (se pinta). El contador de ids y los temporizadores son **refs** (se recuerdan, pero no se pintan). Guardar los temporizadores en un `Map` por id permite cancelar **justo** el del aviso que se cierra a mano, y la limpieza del efecto cancela todos al desmontar.

## Paso a paso

1. **Estado**: `avisos`, un arreglo de `{ id, texto }`.
2. **Ref para ids**: `siguienteId = useRef(1)`. `siguienteId.current++` devuelve 1 y deja 2, y así. Cambiar un ref no provoca render, que es justo lo que queremos.
3. **Ref para temporizadores**: `useRef(new Map())`. Cada entrada es `id del aviso -> lo que devolvió setTimeout`.
4. **`cerrar(id)`**: `clearTimeout` del temporizador de ese aviso (si ya se disparó, no pasa nada), lo borra del Map y quita el aviso con `filter`.
5. **`avisar(texto)`**: pide un id nuevo, agrega el aviso sin mutar y programa `setTimeout(() => cerrar(id), duracion)`. El `id` queda atrapado en el closure de la flecha: cada temporizador sabe qué aviso cerrar.
6. **`useCallback`**: `avisar` y `cerrar` mantienen la misma referencia entre renders. Importa en un hook reutilizable: si alguien las pone en las dependencias de un efecto o las pasa a un componente memorizado, no provocan trabajo extra.
7. **Limpieza al desmontar**: un `useEffect` con `[]` cuya limpieza recorre el Map y cancela todo. Copiamos `temporizadores.current` a una variable dentro del efecto (es el mismo Map, nunca lo reemplazamos), que es lo que recomienda React para refs en limpiezas.
8. **Accesibilidad**: `aria-live="polite"` hace que el lector de pantalla anuncie los avisos nuevos sin interrumpir; cada `×` tiene un `aria-label` que dice qué cierra.

```jsx
import { useCallback, useEffect, useRef, useState } from "react";

export function useAvisos(duracion = 3000) {
  const [avisos, setAvisos] = useState([]);
  const siguienteId = useRef(1);
  const temporizadores = useRef(new Map());

  const cerrar = useCallback((id) => {
    clearTimeout(temporizadores.current.get(id));
    temporizadores.current.delete(id);
    setAvisos((lista) => lista.filter((aviso) => aviso.id !== id));
  }, []);

  const avisar = useCallback(
    (texto) => {
      const id = siguienteId.current++;
      setAvisos((lista) => [...lista, { id, texto }]);
      temporizadores.current.set(
        id,
        setTimeout(() => cerrar(id), duracion),
      );
    },
    [cerrar, duracion],
  );

  useEffect(() => {
    const pendientes = temporizadores.current;
    return () => pendientes.forEach((temporizador) => clearTimeout(temporizador));
  }, []);

  return { avisos, avisar, cerrar };
}

export function Avisos() {
  const { avisos, avisar, cerrar } = useAvisos();

  return (
    <div>
      <button onClick={() => avisar("Pizza agregada")}>Agregar pizza</button>
      <ul aria-live="polite">
        {avisos.map((aviso) => (
          <li key={aviso.id}>
            {aviso.texto}{" "}
            <button aria-label={`Cerrar aviso ${aviso.id}`} onClick={() => cerrar(aviso.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Por qué funciona

Recorrido del ejemplo con `duracion = 3000`:

| Tiempo | Acción | `avisos` | `temporizadores` (Map) |
|---|---|---|---|
| 0 ms | avisar | `[{1}]` | 1 -> vence a los 3000 |
| 2000 ms | avisar | `[{1}, {2}]` | 1 -> 3000, 2 -> vence a los 5000 |
| 3000 ms | vence el del 1: `cerrar(1)` | `[{2}]` | 2 -> 5000 |
| 3000 ms | clic "Cerrar aviso 2": `cerrar(2)` | `[]` | (vacío: se canceló el de 5000) |

Si en la última fila **no** cancelaras el temporizador, a los 5000 ms se llamaría `cerrar(2)` de nuevo. Aquí sería inofensivo (el `filter` no encuentra nada), pero es un temporizador fantasma; con muchos avisos o si el componente ya no existe, se acumulan. En los tests lo comprobamos con `vi.getTimerCount()`, que cuenta los temporizadores pendientes.

¿Por qué `cerrar` puede tener `[]` como dependencias? Solo usa el ref (que es el mismo objeto siempre) y `setAvisos` con función (que React garantiza estable). No lee ningún valor que cambie.

## Errores comunes

- **Guardar los ids o los temporizadores en `useState`**: cada `avisar` provoca renders extra y, peor, dentro del `setTimeout` lees un valor viejo del estado (closure viejo).
- **Un solo temporizador para todos** (por ejemplo, un `setTimeout` que borra el primer aviso): si creas dos avisos seguidos, el segundo se cierra antes de tiempo. Lo reconoces en el test "cada aviso tiene su propio temporizador".
- **`setAvisos(avisos.filter(...))` dentro del `setTimeout`**: usa la lista del momento en que se programó, y al ejecutarse borra avisos que se agregaron después. Usa siempre la forma con función.
- **No cancelar al cerrar a mano ni al desmontar**: quedan temporizadores vivos que intentan actualizar estado. El test de `vi.getTimerCount()` lo detecta.
- **Usar `Date.now()` o el índice como id**: dos avisos en el mismo milisegundo chocan; el índice cambia cuando se cierra uno.

## Otra forma de resolverlo

Que **cada aviso maneje su propio temporizador** con un componente y su efecto:

```jsx
function Aviso({ aviso, duracion, alCerrar }) {
  useEffect(() => {
    const id = setTimeout(() => alCerrar(aviso.id), duracion);
    return () => clearTimeout(id);
  }, [aviso.id, duracion, alCerrar]);

  return (
    <li>
      {aviso.texto}{" "}
      <button aria-label={`Cerrar aviso ${aviso.id}`} onClick={() => alCerrar(aviso.id)}>×</button>
    </li>
  );
}
```

El hook solo maneja la lista, y React cancela el temporizador cuando el `<Aviso>` se desmonta (al cerrarlo a mano o al desmontar todo).

**¿Cuándo conviene?** Es más "React": no hay Map ni limpieza manual, y cada aviso es independiente. Su punto débil es que depende de que `alCerrar` sea estable (con `useCallback`); si no, el temporizador se reinicia en cada render del padre y el aviso nunca se cierra. La versión con Map deja toda la lógica dentro del hook, que funciona igual sin importar cómo se pinten los avisos.

## Cómo explicarlo en la entrevista

> "Hice un hook `useAvisos` que guarda la lista en el estado, porque se pinta, y los ids y los temporizadores en refs, porque solo necesito recordarlos. Los temporizadores van en un `Map` por id del aviso: así, al cerrar uno a mano, cancelo exactamente el suyo. Cada `setTimeout` tiene el id en su closure y llama a `cerrar`, que actualiza con la forma de función para no usar una lista vieja. Las funciones van en `useCallback` para que sean estables, y un efecto con limpieza cancela todos los pendientes al desmontar, para no dejar fugas."

## Conceptos

- **Hook personalizado**: encapsula estado y lógica reutilizable (`useAvisos`).
- **`useRef` para valores que no se pintan**: contador de ids y temporizadores.
- **`Map`**: diccionario clave a valor con `get`, `set`, `delete` y `forEach`.
- **`setTimeout` / `clearTimeout`**: programar y cancelar.
- **Closure**: cada temporizador recuerda el `id` de su aviso.
- **Actualización con función**: `setAvisos((lista) => ...)` evita listas viejas.
- **`useCallback`**: funciones con referencia estable.
- **Limpieza de efectos al desmontar**.
- **`aria-live="polite"`**: anuncia cambios sin interrumpir.
- **Fake timers** (`vi.useFakeTimers`, `advanceTimersByTime`, `getTimerCount`): probar código con tiempo sin esperar.
