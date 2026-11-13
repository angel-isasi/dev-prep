## Idea clave

Un `Map` **a nivel de módulo** guarda, por cada clave, la **promesa** de su petición. La primera vez se llama a `cargar`; las siguientes se devuelve la misma promesa. Como se guarda la promesa y no el valor, incluso dos pedidos **simultáneos** comparten una sola petición.

## Paso a paso

1. **Caché fuera del componente**: `const cache = new Map()`. Las variables del módulo se crean una vez, cuando se importa el archivo, y no se reinician en cada render.
2. **`obtenerConCache`**: si la clave no está (`!cache.has(clave)`), guarda `cargar(clave)` **sin `await`**: es una promesa pendiente. Luego devuelve `cache.get(clave)`.
3. **En el componente**, estado `dato` que empieza en `null`.
4. **Efecto con `[id, cargar]`**: pone `dato` en `null` (para ver "Cargando…" al cambiar de id), pide con `obtenerConCache` y guarda el resultado si el efecto sigue vigente.
5. **Render**: `dato ?? "Cargando…"` muestra el dato o, si es `null`, el texto de carga.

```jsx
import { useEffect, useState } from "react";

const cache = new Map();

export function obtenerConCache(clave, cargar) {
  if (!cache.has(clave)) {
    cache.set(clave, cargar(clave));
  }
  return cache.get(clave);
}

export function Detalle({ id, cargar }) {
  const [dato, setDato] = useState(null);

  useEffect(() => {
    let vigente = true;
    setDato(null);

    obtenerConCache(id, cargar).then((resultado) => {
      if (vigente) setDato(resultado);
    });

    return () => {
      vigente = false;
    };
  }, [id, cargar]);

  return <p>{dato ?? "Cargando…"}</p>;
}
```

## Por qué funciona

Recorrido de id 1, luego 2, luego 1:

| Paso | `cache` antes | ¿Llama a `cargar`? | `cache` después | Se ve |
|---|---|---|---|---|
| id = 1 | vacía | sí, `cargar(1)` | `{1 → promesa1}` | Cargando…, luego Pizza 1 |
| id = 2 | `{1}` | sí, `cargar(2)` | `{1, 2 → promesa2}` | Cargando…, luego Pizza 2 |
| id = 1 | `{1, 2}` | **no** | igual | Pizza 1 (casi al instante) |

`cargar` se llama 2 veces, no 3.

¿Por qué guardar la **promesa** y no el resultado? Imagina dos `Detalle` con `id={50}` que se montan juntos:

| Guardando... | Primer componente | Segundo componente (mismo instante) | Peticiones |
|---|---|---|---|
| el resultado (después del `await`) | no está, pide | todavía no está (la primera no terminó), **pide otra vez** | 2 |
| la promesa (inmediatamente) | no está, pide y guarda la promesa | ya está la promesa, la reutiliza | **1** |

Una promesa ya cumplida se puede volver a usar con `.then` todas las veces que quieras: siempre entrega el mismo valor.

Detalle: incluso con caché, el dato llega en un `.then`, que siempre es asíncrono. Por eso, al volver al id 1, hay un instante (imperceptible) en "Cargando…".

## Errores comunes

- **Crear el `Map` dentro del componente.** Se crea uno nuevo en cada render: la caché siempre está vacía.
- **Guardar el resultado con `await` antes de `set`.** Funciona para visitas posteriores, pero dos pedidos simultáneos hacen dos peticiones.
- **Cachear también los errores para siempre.** Si `cargar(1)` falla, la promesa rechazada queda en la caché y el id 1 nunca se vuelve a intentar. En una app real, si la promesa falla, se borra la clave: `promesa.catch(() => cache.delete(clave))`.
- **Olvidar `setDato(null)` al cambiar de id.** Durante la carga verías los datos de la pizza anterior.
- **Olvidar `vigente`.** Si el usuario cambia rápido de 1 a 2 y la 1 tarda más, la respuesta de la 1 pisaría a la 2.

## Otra forma de resolverlo

Encapsulando la caché en una **fábrica** con closure, para tener varias cachés independientes (y poder limpiarlas):

```jsx
function crearCache() {
  const memoria = new Map();
  return {
    obtener(clave, cargar) {
      if (!memoria.has(clave)) {
        const promesa = cargar(clave);
        promesa.catch(() => memoria.delete(clave)); // si falla, se podrá reintentar
        memoria.set(clave, promesa);
      }
      return memoria.get(clave);
    },
    limpiar: () => memoria.clear(),
  };
}

const cachePizzas = crearCache();
```

**¿Cuándo conviene?** Cuando necesitas más de una caché, poder vaciarla (por ejemplo, al cerrar sesión) o probarla aislada en los tests. Aquí el `Map` está "escondido" en el closure de `crearCache`: nadie de afuera puede tocarlo salvo con `obtener` y `limpiar`. En proyectos grandes, en vez de escribir esto a mano se usa TanStack Query, que además maneja expiración y reintentos.

## Cómo explicarlo en la entrevista

> "Uso un `Map` a nivel de módulo como caché, así sobrevive a los renders y lo comparten todos los componentes. Guardo la promesa, no el resultado: si dos componentes piden el mismo id al mismo tiempo, el segundo encuentra la promesa pendiente y la reutiliza, así que solo hay una petición. En el componente, un `useEffect` con el id como dependencia muestra 'Cargando…', pide a la caché y usa una bandera `vigente` para ignorar respuestas viejas. En producción borraría de la caché las promesas que fallan para poder reintentar."

## Conceptos

- **Caché (memoización de peticiones)**: recordar resultados para no repetir trabajo.
- **`Map`**: diccionario con `has`, `get`, `set`, `delete` y `clear`.
- **Estado de módulo**: variables fuera del componente que viven mientras la app esté abierta.
- **Guardar promesas**: deduplica pedidos simultáneos.
- **Una promesa se puede consumir muchas veces** con `.then`.
- **Closure en una fábrica**: encapsular datos privados.
- **Bandera `vigente`**: ignorar respuestas de un efecto ya limpiado.
