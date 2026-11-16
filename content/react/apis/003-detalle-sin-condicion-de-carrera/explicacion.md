## Idea clave

Una **condición de carrera** ocurre cuando el resultado depende de qué tarea termina primero, y tú no controlas ese orden. Si pides el producto 1 y luego el 2, nada garantiza que las respuestas lleguen en ese orden. La solución: cada ejecución del efecto lleva su propia bandera `ignorar`, y la **limpieza** la marca cuando el `id` cambia. Así solo la respuesta del `id` actual puede tocar el estado.

## Paso a paso

1. **Efecto con `[id]`.** Corre al montar y cada vez que cambia el `id`.
2. **Bandera local.** `let ignorar = false;` dentro del efecto. Como es una variable nueva en cada ejecución, cada `fetch` "recuerda" la suya gracias al closure.
3. **Vuelve a cargando.** `setEstado({ cargando: true, ... })` al inicio, para que no quede a la vista el producto anterior mientras llega el nuevo.
4. **Distingue el 404.** Revisa `respuesta.status === 404` antes que `ok`: no encontrar un producto es un caso esperado con su propio mensaje; cualquier otro error usa el genérico.
5. **Protege cada `setEstado`.** En el `.then` y en el `.catch`, solo actualizas si `!ignorar`. Ojo: el error también puede llegar tarde.
6. **Limpieza.** `return () => { ignorar = true; }`. React la ejecuta justo **antes** de correr el efecto con el `id` nuevo, y al desmontar.

```jsx
useEffect(() => {
  let ignorar = false;
  setEstado({ cargando: true, error: null, producto: null });

  fetch(`/api/practica/productos/${id}`)
    .then((r) => {
      if (r.status === 404) throw new Error("Producto no encontrado");
      if (!r.ok) throw new Error("No se pudo cargar el producto");
      return r.json();
    })
    .then((producto) => { if (!ignorar) setEstado({ cargando: false, error: null, producto }); })
    .catch((error) => { if (!ignorar) setEstado({ cargando: false, error: /* ... */, producto: null }); });

  return () => { ignorar = true; };
}, [id]);
```

## Por qué funciona

Sigue el caso del test: `id` pasa de 1 a 2, y el 2 responde primero.

| Momento | Efecto del id 1 | Efecto del id 2 | Pantalla |
|---|---|---|---|
| monta con `id=1` | `ignorar₁ = false`, pide /1 | | cargando |
| cambia a `id=2` | limpieza: `ignorar₁ = true` | `ignorar₂ = false`, pide /2 | cargando |
| llega /2 | | `!ignorar₂` es `true`: guarda | Mouse inalámbrico |
| llega /1 tarde | `!ignorar₁` es `false`: no hace nada | | Mouse inalámbrico |

Sin la bandera, el último en llegar (el 1) ganaría, y verías el Teclado aunque el usuario eligió el Mouse. La bandera no cancela la petición (el servidor igual responde), solo hace que su respuesta se descarte.

## Errores comunes

- **Una sola bandera fuera del efecto** (`let activo = true` a nivel de módulo o en un `useRef` compartido). Todas las peticiones comparten la misma variable: al cambiar el id, la nueva petición la vuelve a poner en `true` y la vieja también pasa.
- **Proteger solo el `.then`.** El error viejo llega al `.catch` y muestra "No se pudo cargar el producto" encima del producto correcto.
- **No volver a cargando al cambiar de id.** Durante un momento la pantalla muestra el nombre del producto 1 con el id 2 seleccionado: confunde y en una tienda puede terminar en una compra equivocada.
- **Olvidar `id` en las dependencias.** El componente pide solo la primera vez y nunca se actualiza.
- **Comparar con el `id` dentro del `.then`** (`if (producto.id === id)`). El `id` de ese closure es el viejo, así que siempre coincide: no protege nada.

## Otra forma de resolverlo

Con `AbortController`, que además **cancela** la petición en el navegador (ahorra datos y trabajo del servidor):

```jsx
useEffect(() => {
  const control = new AbortController();
  setEstado({ cargando: true, error: null, producto: null });

  fetch(`/api/practica/productos/${id}`, { signal: control.signal })
    .then((r) => {
      if (r.status === 404) throw new Error("Producto no encontrado");
      if (!r.ok) throw new Error("No se pudo cargar el producto");
      return r.json();
    })
    .then((producto) => setEstado({ cargando: false, error: null, producto }))
    .catch((error) => {
      if (error.name === "AbortError") return; // la cancelamos nosotros
      const mensaje = error.message === "Producto no encontrado" ? error.message : "No se pudo cargar el producto";
      setEstado({ cargando: false, error: mensaje, producto: null });
    });

  return () => control.abort();
}, [id]);
```

**¿Cuándo conviene?** `AbortController` es mejor cuando las respuestas son pesadas o hay muchas peticiones seguidas (un buscador). La bandera es más simple y sirve también para cosas que no se pueden cancelar (un `setTimeout`, una promesa de otra librería). En la práctica, muchos equipos usan las dos juntas.

## Cómo explicarlo en la entrevista

> "Cuando el `id` cambia, la petición anterior puede llegar después de la nueva y pisarla: es una condición de carrera. Para evitarla uso la función de limpieza del efecto: cada ejecución tiene su bandera `ignorar`, y React corre la limpieza del efecto anterior antes del nuevo, así que la respuesta vieja queda marcada y no actualiza el estado. Protejo tanto los datos como el error. Otra opción es `AbortController`, que además cancela la petición en el navegador; ahí solo tengo que ignorar el `AbortError`."

## Conceptos

- **Condición de carrera**: el resultado depende del orden en que terminan tareas asíncronas.
- **Función de limpieza** de `useEffect`: corre antes del siguiente efecto y al desmontar.
- **Closure**: cada ejecución del efecto recuerda su propia variable `ignorar`.
- **`AbortController` y `signal`**: cancelan un `fetch` en curso; el rechazo llega como `AbortError`.
- **Dependencias `[id]`**: volver a pedir cuando cambia la prop.
- **404 como caso esperado**: mensaje propio frente al error genérico.
- **Resetear a cargando** al cambiar de recurso para no mostrar datos de otro.
