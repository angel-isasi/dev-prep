Crea un **almacén de estado fuera de React** (un *store* mínimo, como los de Zustand o Redux) y conéctalo a los componentes con `useSyncExternalStore`. Cualquier componente que lo lea se actualiza cuando el valor cambia, sin Context ni props.

Exporta tres cosas:

- `crearAlmacen(inicial)`: crea un almacén con un valor y una lista de oyentes.
- `almacen`: un almacén ya creado con `crearAlmacen(0)` (pedidos del día).
- `Visor()`: un componente que muestra el valor de `almacen`.

## Reglas

- `crearAlmacen(inicial)` devuelve un objeto con tres funciones:
  - `leer()`: devuelve el valor actual.
  - `cambiar(nuevo)`: guarda el nuevo valor y **avisa a todos los oyentes** (llama a cada uno, sin argumentos).
  - `suscribir(oyente)`: agrega la función `oyente` y **devuelve una función para desuscribirse** (que la quita).
- El valor y los oyentes viven en variables **privadas** del almacén (closure): desde fuera solo se accede con esas tres funciones.
- `Visor` usa `useSyncExternalStore(almacen.suscribir, almacen.leer)` y pinta un `<p>` con **"Pedidos hoy: N"**.

## Ejemplo

```jsx
const contador = crearAlmacen(5);
contador.leer();                       // 5
const salir = contador.suscribir(() => console.log("cambió"));
contador.cambiar(6);                   // imprime "cambió"
salir();
contador.cambiar(7);                   // ya no imprime nada

<>
  <Visor />
  <Visor />
</>
// almacen.cambiar(12) -> los dos muestran "Pedidos hoy: 12"
```

| Acción | `almacen.leer()` | Cada `Visor` muestra |
|---|---|---|
| (inicio) | `0` | Pedidos hoy: 0 |
| `almacen.cambiar(12)` | `12` | Pedidos hoy: 12 |

## Por qué importa

`useSyncExternalStore` es el hook que usan **por dentro** las librerías de estado global (Redux, Zustand) para conectarse con React. Entender el patrón "suscribirse, avisar, leer" (patrón observador) te permite explicar cómo funcionan esas librerías en vez de solo usarlas.
