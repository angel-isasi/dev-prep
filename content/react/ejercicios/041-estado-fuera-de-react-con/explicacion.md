## Idea clave

Un **store externo** es un objeto común de JavaScript que guarda un valor y una lista de **oyentes** (patrón observador): cuando el valor cambia, avisa a todos. `useSyncExternalStore(suscribir, leer)` conecta ese objeto con React: se suscribe al montar, se desuscribe al desmontar, y cuando recibe un aviso vuelve a llamar a `leer()` y re-renderiza si el valor cambió.

## Paso a paso

1. **Variables privadas con closure**: dentro de `crearAlmacen`, `let estado = inicial` y `const oyentes = new Set()`. Nadie de afuera puede tocarlas directamente; solo las tres funciones que devuelves "las recuerdan".
2. **`leer()`** devuelve `estado`. Debe devolver siempre el mismo valor si nada cambió (aquí un número, así que es trivial).
3. **`cambiar(nuevo)`** guarda el valor y recorre los oyentes llamando a cada uno. El oyente no recibe el valor: solo se entera de que "algo cambió".
4. **`suscribir(oyente)`** lo agrega al `Set` y devuelve una función que lo quita. Usar `Set` evita duplicados y hace que borrar sea directo.
5. **`Visor`** llama a `useSyncExternalStore(almacen.suscribir, almacen.leer)`. React le pasa su propio oyente a `suscribir` y usa `leer` para obtener el valor en cada render.

```jsx
import { useSyncExternalStore } from "react";

export function crearAlmacen(inicial) {
  // Variables privadas: solo las ven estas tres funciones (closure).
  let estado = inicial;
  const oyentes = new Set();

  return {
    leer: () => estado,
    cambiar: (nuevo) => {
      estado = nuevo;
      oyentes.forEach((oyente) => oyente()); // avisa a todos
    },
    suscribir: (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente); // función para desuscribirse
    },
  };
}

export const almacen = crearAlmacen(0);

export function Visor() {
  // React se suscribe al montar, se desuscribe al desmontar
  // y vuelve a renderizar cuando un oyente avisa que algo cambió.
  const valor = useSyncExternalStore(almacen.suscribir, almacen.leer);
  return <p>Pedidos hoy: {valor}</p>;
}
```

## Por qué funciona

Con dos `<Visor />` montados:

| Acción | `estado` | `oyentes` | Lo que hace React | Se pinta |
|---|---|---|---|---|
| Montan los dos Visor | `0` | 2 (uno por Visor) | cada uno llama a `suscribir` | Pedidos hoy: 0 (x2) |
| `almacen.cambiar(12)` | `12` | 2 | cada oyente avisa; React llama a `leer()`, ve 12 y re-renderiza | Pedidos hoy: 12 (x2) |
| Se desmonta un Visor | `12` | 1 | llama a la función que devolvió `suscribir` | Pedidos hoy: 12 (x1) |

Los dos `Visor` muestran lo mismo porque leen **el mismo objeto** `almacen`, que vive fuera de React (en el módulo). No hace falta Context ni pasar props: cualquier componente de la app que llame al hook con ese almacén queda conectado.

En los tests, `almacen.cambiar(12)` va dentro de `act` porque provoca renders en React fuera de un evento del DOM; `act` hace que esos renders terminen antes de comprobar.

## Errores comunes

- **Olvidar devolver la función de desuscripción** en `suscribir`. React no puede limpiar al desmontar y los oyentes se acumulan (fuga de memoria); cada cambio intentaría actualizar componentes que ya no existen.
- **Llamar a los oyentes antes de actualizar `estado`.** React llama a `leer()` dentro del aviso y vería el valor viejo. Primero guarda, después avisa.
- **Que `leer()` devuelva un objeto nuevo en cada llamada** (por ejemplo `() => ({ ...estado })`). React compara con `Object.is`; un objeto nuevo siempre es "distinto", así que re-renderiza sin fin y React lanza un error. `leer` debe devolver la misma referencia mientras no haya cambios.
- **Pasar `suscribir` como función nueva en cada render** (`useSyncExternalStore((o) => almacen.suscribir(o), ...)`). Funciona, pero React se desuscribe y vuelve a suscribir en cada render. Pasa una función estable, como `almacen.suscribir`.
- **Guardar el valor en un `useState` y sincronizarlo con `useEffect`.** Es lo que se hacía antes; puede mostrar valores distintos en distintos componentes durante un mismo render (*tearing*). El hook existe para evitar eso.

## Otra forma de resolverlo

Envolver el hook en uno propio con un **selector**, que lee solo una parte de un estado más grande. Es como funciona `useStore` en Zustand:

```jsx
import { useSyncExternalStore } from "react";

const tienda = crearAlmacen({ pedidos: 0, abierto: true });

function useTienda(selector) {
  return useSyncExternalStore(tienda.suscribir, () => selector(tienda.leer()));
}

function Visor() {
  const pedidos = useTienda((s) => s.pedidos);
  return <p>Pedidos hoy: {pedidos}</p>;
}

// Para cambiar se crea un objeto nuevo (inmutable):
// tienda.cambiar({ ...tienda.leer(), pedidos: 12 });
```

**¿Cuándo conviene?** Cuando el estado global tiene varias partes y cada componente necesita solo una: si cambia `abierto`, el `Visor` no se re-renderiza porque su selector sigue devolviendo el mismo número. En la práctica, en lugar de escribir esto a mano usarías Zustand o Redux Toolkit; lo importante es saber que por dentro hacen esto.

## Cómo explicarlo en la entrevista

> "Creo un almacén fuera de React con un closure: guarda el valor y un `Set` de oyentes, y expone `leer`, `cambiar` y `suscribir`. Cambiar actualiza el valor y avisa a todos; suscribir devuelve la función para desuscribirse. Con `useSyncExternalStore` conecto ese almacén a React: se suscribe al montar, se limpia al desmontar y, cuando recibe un aviso, vuelve a leer y re-renderiza si el valor cambió. Así funcionan por dentro Redux y Zustand, y el hook evita inconsistencias entre componentes en el renderizado concurrente."

## Conceptos

- **Store externo**: estado que vive fuera de los componentes de React.
- **Patrón observador**: suscribirse, avisar a los suscriptores, desuscribirse.
- **Closure**: las funciones recuerdan las variables del lugar donde se crearon.
- **`Set`**: colección sin duplicados con `add`, `delete` y `forEach`.
- **`useSyncExternalStore(suscribir, leer)`**: conecta un store externo con React.
- **Referencia estable en `leer`**: mismo valor si no hubo cambios, o hay renders infinitos.
- **Selector**: función que elige qué parte del estado necesita un componente.
- **Tearing**: componentes que muestran valores distintos del mismo estado en un render.
