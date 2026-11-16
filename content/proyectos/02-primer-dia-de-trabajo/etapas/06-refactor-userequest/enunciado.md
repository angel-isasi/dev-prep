## TICKET-106: extraer la carga de datos a un hook useRequest

**Tipo:** deuda técnica · **Prioridad:** baja · **Reportado por:** Diego Salazar, tech lead, en la revisión de tu pull request del TICKET-105

> Buen trabajo con la carga y el error, funciona bien. Lo aprobé para no bloquear a Rosa, pero dejo este ticket: ahora `App.jsx` y `MenuPanel.jsx` tienen **la misma lógica copiada** (el estado `status`, la función de carga con `try`/`catch`, el `useCallback` y el `useEffect`). Si mañana cambiamos cómo se maneja un error, hay que acordarse de cambiarlo en dos lugares, y la próxima pantalla la va a copiar una tercera vez. Sácala a un hook. **Es un refactor: el usuario no debe notar ningún cambio.**

### Lo que pide el ticket

Crea `src/hooks/useRequest.js` y exporta `useRequest(request, initialData)`:

| Recibe | Qué es |
|---|---|
| `request` | Una función que devuelve una promesa, por ejemplo `getOrders` o `getMenu` de `api.js` |
| `initialData` | El valor de `data` antes de que llegue la respuesta (por ejemplo, `[]`) |

| Devuelve | Qué es |
|---|---|
| `data` | Los datos que respondió la API (o `initialData` mientras tanto) |
| `setData` | Para actualizar los datos después de un cambio (avanzar un pedido, marcar un plato agotado). Acepta un valor o una función, igual que el `set` de `useState` |
| `status` | `"loading"`, `"error"` o `"ready"` |
| `reload()` | Vuelve a hacer la petición (lo usa el botón `Reintentar`) |

Hace la petición sola al montarse.

### Criterios de aceptación

- [ ] Existe `src/hooks/useRequest.js` con `useRequest` y se comporta como dice la tabla.
- [ ] `App.jsx` y `MenuPanel.jsx` usan `useRequest` y ya no tienen su propio `useEffect` de carga.
- [ ] Todos los tests anteriores (los del equipo y los de los tickets 101 a 105) siguen pasando **sin cambiarlos**.
- [ ] Los textos de cada pantalla no cambian: `Cargando pedidos...` y `No se pudieron cargar los pedidos.` en Pedidos, `Cargando carta...` y `No se pudo cargar la carta.` en la Carta. El hook no sabe de textos: eso queda en cada componente.

### Qué entrenas

- Refactorizar con red de seguridad: los tests que ya tienes te avisan si cambiaste el comportamiento.
- Diseñar un hook reutilizable: qué recibe, qué devuelve y qué deja en manos de quien lo usa.
- Recibir feedback de un code review y responderlo con un cambio limpio.

## Pistas

1. Empieza por `MenuPanel.jsx`, que es el más simple: copia su estado, su función de carga y su `useEffect` a `useRequest.js`, cambia `getMenu` por el parámetro `request` y devuelve `{ data, setData, status, reload }`. Cuando la carta pase sus tests, haz lo mismo en `App.jsx`.
2. `useCallback(..., [request])`: la función de carga depende de `request`. Por eso conviene pasar funciones estables como las de `api.js`, y no una flecha nueva en cada render. Con la desestructuración puedes renombrar: `const { data: menu, setData: setMenu, status, reload } = useRequest(getMenu, []);`.
