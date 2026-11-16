## Idea clave

Un efecto se vuelve a ejecutar cuando cambia alguna de sus **dependencias**. Para reintentar no copias la lógica del `fetch` en el botón: creas un estado `intento` que solo sirve para "dar un golpecito" al efecto. Cada clic lo sube en 1, React ve que la dependencia cambió y el efecto pide de nuevo. Una sola fuente de verdad para pedir los datos.

## Paso a paso

1. **Dos estados.** `estado` con `{ cargando, error, tareas }` para lo que se ve, e `intento` (un número) para disparar la petición.
2. **Efecto con `[intento]`.** Corre al montar (intento 0) y cada vez que `intento` cambia.
3. **Arranca en cargando.** Lo primero que hace el efecto es `setEstado({ cargando: true, ... })`. En el montaje ya estaba así; en un reintento es lo que borra el error y el botón de la pantalla.
4. **Pide y revisa `ok`.** Si `ok` es `false`, lanzas un error para que el `.catch` lo trate igual que un fallo de red: en ambos casos el usuario puede reintentar.
5. **Bandera `ignorar`.** La limpieza la pone en `true`. Si el componente se desmonta mientras espera, la respuesta vieja no toca el estado.
6. **El botón.** `onClick={() => setIntento((n) => n + 1)}`. Usa la forma funcional para basarte siempre en el valor más reciente.

```jsx
const [intento, setIntento] = useState(0);

useEffect(() => {
  let ignorar = false;
  setEstado({ cargando: true, error: false, tareas: [] });
  fetch("/api/practica/tareas")
    .then((r) => {
      if (!r.ok) throw new Error(`Error ${r.status}`);
      return r.json();
    })
    .then((tareas) => { if (!ignorar) setEstado({ cargando: false, error: false, tareas }); })
    .catch(() => { if (!ignorar) setEstado({ cargando: false, error: true, tareas: [] }); });
  return () => { ignorar = true; };
}, [intento]);
```

## Por qué funciona

| Momento | `intento` | Estado | Se ve |
|---|---|---|---|
| monta, corre el efecto | 0 | cargando | `Cargando tareas...` |
| llega `500` | 0 | `error: true` | alerta y **Reintentar** |
| clic en Reintentar | 1 | el efecto corre de nuevo y pone cargando | `Cargando tareas...` |
| llega `200` | 1 | `tareas: [...]` | la lista |

El efecto **no** se repite solo cuando llegan los datos, porque `estado` no está en sus dependencias: solo `intento`. Por eso no hay bucle de peticiones. El número en sí no importa (nunca se muestra), lo que importa es que **cambie**.

## Errores comunes

- **Llamar `fetch` directo en el `onClick` copiando el código del efecto.** Funciona, pero ahora tienes dos lugares donde se pide y se maneja el error: cuando arreglas uno se te olvida el otro.
- **Poner `estado` en las dependencias** para "reaccionar al error". Cada `setEstado` vuelve a disparar el efecto y terminas con peticiones infinitas.
- **Usar un booleano `reintentar` que pasa de `false` a `true`.** El primer clic funciona, pero el segundo deja el valor en `true` (no cambia) y el efecto ya no corre. Un contador siempre cambia.
- **No volver a mostrar "cargando" al reintentar.** El usuario hace clic y no pasa nada visible: hace clic cinco veces más.
- **Dejar el botón visible mientras reintenta.** Permite varios clics seguidos y varias peticiones a la vez.

## Otra forma de resolverlo

Sacar la petición a una función con `useCallback` y llamarla desde el efecto y desde el botón:

```jsx
const cargar = useCallback(() => {
  setEstado({ cargando: true, error: false, tareas: [] });
  fetch("/api/practica/tareas")
    .then((r) => {
      if (!r.ok) throw new Error(`Error ${r.status}`);
      return r.json();
    })
    .then((tareas) => setEstado({ cargando: false, error: false, tareas }))
    .catch(() => setEstado({ cargando: false, error: true, tareas: [] }));
}, []);

useEffect(() => {
  cargar();
}, [cargar]);

// <button onClick={cargar}>Reintentar</button>
```

**¿Cuándo conviene?** Es más directo de leer, pero pierdes la bandera `ignorar` (la petición del botón no vive dentro de un efecto con limpieza). Con el contador, cada petición tiene su propia limpieza gratis. Las librerías de datos (TanStack Query, SWR) exponen exactamente esto como una función `refetch` o `mutate`.

## Cómo explicarlo en la entrevista

> "Cuando la carga falla muestro un mensaje y un botón Reintentar. En vez de duplicar el fetch en el botón, tengo un estado `intento` que es dependencia del efecto: cada clic lo incrementa y React vuelve a ejecutar el efecto, que primero pone el estado en cargando para que el usuario vea que algo pasa. Uso un contador y no un booleano porque necesito que cambie en cada clic. Y como el estado de los datos no está en las dependencias, no hay riesgo de un bucle de peticiones."

## Conceptos

- **Dependencias de `useEffect`**: el efecto corre de nuevo cuando alguna cambia.
- **Estado "disparador"**: un contador cuyo único fin es volver a ejecutar un efecto.
- **Actualización funcional**: `setIntento((n) => n + 1)`.
- **Bandera `ignorar`** en la limpieza: evita actualizar con respuestas que ya no importan.
- **`respuesta.ok`** y lanzar el error para unificar el manejo en el `.catch`.
- **Feedback inmediato**: volver a cargando al reintentar.
- **`refetch`**: el mismo concepto en TanStack Query.
