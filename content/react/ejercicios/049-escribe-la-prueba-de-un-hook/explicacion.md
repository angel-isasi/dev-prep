## Idea clave

Un hook propio se prueba **solo, sin interfaz**: `renderHook` lo ejecuta dentro de un componente invisible, `act` envuelve los cambios de estado y `result.current` te da siempre lo último que devolvió el hook.

## Paso a paso

1. **Ejecuta el hook** con `renderHook(() => useCarrito())`. No puedes llamar `useCarrito()` directamente en una prueba: los hooks solo funcionan dentro de un componente, y `renderHook` crea uno por ti.
2. **Comprueba el estado inicial**: `items` igual a `[]` (con `toEqual`, que compara contenido) y `total` igual a `0`.
3. **Cambia el estado dentro de `act`**: `act(() => result.current.agregar(...))`. `act` hace que React procese la actualización y vuelva a renderizar antes de seguir.
4. **Lee `result.current` otra vez** después de cada `act`. Es un objeto que React actualiza en cada render; si guardaras `const carrito = result.current` al inicio, te quedarías con la foto vieja.
5. **Comprueba las dos salidas** (cantidad de items y total) después de agregar, y otra vez después de vaciar.

```jsx
import { expect } from "vitest";
import { act, renderHook } from "@testing-library/react";

export function probarUseCarrito(useCarrito) {
  // renderHook ejecuta el hook dentro de un componente de prueba.
  // result.current siempre tiene lo que devolvió el ÚLTIMO render.
  const { result } = renderHook(() => useCarrito());

  // 1. Estado inicial: vacío y en cero.
  expect(result.current.items).toEqual([]);
  expect(result.current.total).toBe(0);

  // 2. Agregar dos items: se acumulan y el total suma precios.
  //    Todo lo que cambia el estado va dentro de act().
  act(() => result.current.agregar({ nombre: "Margarita", precio: 28 }));
  act(() => result.current.agregar({ nombre: "Pepperoni", precio: 32 }));
  expect(result.current.items.length).toBe(2);
  expect(result.current.total).toBe(60);

  // 3. Vaciar: vuelve a cero.
  act(() => result.current.vaciar());
  expect(result.current.items).toEqual([]);
  expect(result.current.total).toBe(0);
}
```

En un proyecto real, esto iría dentro de `test("useCarrito suma y vacía", () => { ... })` en `useCarrito.test.js`.

## Por qué funciona

Cada `expect` atrapa una versión rota distinta:

| Versión del hook | Qué ve tu prueba | `expect` que falla |
|---|---|---|
| Correcta | `[]`/0, luego 2 items/60, luego `[]`/0 | ninguno |
| Empieza con un item de regalo | `items` tiene 1 elemento al inicio | `items` `toEqual([])` del inicio |
| `agregar` reemplaza | Solo queda Pepperoni: 1 item, total 32 | `items.length` `toBe(2)` |
| `total` cuenta items | `total` es 2, no 60 | `total` `toBe(60)` |
| `vaciar` no hace nada | Siguen 2 items y 60 | `toEqual([])` del final |

Y así se mueve `result.current` en la versión correcta:

| Acción | Estado interno `items` | `result.current.total` |
|---|---|---|
| `renderHook` | `[]` | `0` |
| `act(agregar Margarita)` | `[Margarita]` | `28` |
| `act(agregar Pepperoni)` | `[Margarita, Pepperoni]` | `60` |
| `act(vaciar)` | `[]` | `0` |

## Errores comunes

- **Llamar al hook directamente** (`const c = useCarrito()`). React lanza "Invalid hook call" porque no hay componente.
- **Guardar `result.current` en una variable** al inicio y seguir usándola. Verás siempre el estado inicial y la prueba fallará aunque el hook esté bien.
- **Olvidar `act`.** React avisa en la consola ("not wrapped in act") y puede que el estado no se haya actualizado al momento de comprobar.
- **Usar `toBe([])` para arreglos.** `toBe` compara referencias: `[]` nunca es `toBe` otro `[]`. Para contenido se usa `toEqual`.
- **Comprobar solo el total o solo los items.** Si solo miras `items`, la versión con el total mal calculado pasa tu prueba; si solo miras `total`, un hook que guarde mal los items podría pasar. Revisa ambas salidas.

## Otra forma de resolverlo

Montando un **componente de prueba** con botones y probando por la interfaz:

```jsx
import { expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

export function probarUseCarrito(useCarrito) {
  function Prueba() {
    const { items, total, agregar, vaciar } = useCarrito();
    return (
      <div>
        <p>Items: {items.length}, total: {total}</p>
        <button onClick={() => agregar({ nombre: "Margarita", precio: 28 })}>Margarita</button>
        <button onClick={() => agregar({ nombre: "Pepperoni", precio: 32 })}>Pepperoni</button>
        <button onClick={vaciar}>Vaciar</button>
      </div>
    );
  }
  render(<Prueba />);
  expect(screen.getByText("Items: 0, total: 0")).toBeTruthy();
  fireEvent.click(screen.getByText("Margarita"));
  fireEvent.click(screen.getByText("Pepperoni"));
  expect(screen.getByText("Items: 2, total: 60")).toBeTruthy();
  fireEvent.click(screen.getByText("Vaciar"));
  expect(screen.getByText("Items: 0, total: 0")).toBeTruthy();
}
```

**¿Cuándo conviene?** Es lo que hacías antes de que existiera `renderHook`, y sigue siendo útil si quieres probar el hook **junto** con cómo se usa en pantalla. Para probar solo la lógica del hook, `renderHook` es más corto y directo.

## Cómo explicarlo en la entrevista

> "Para probar un hook propio uso `renderHook`, que lo ejecuta dentro de un componente de prueba. Leo siempre `result.current`, porque se actualiza en cada render. Los cambios de estado los envuelvo en `act` para que React termine de procesarlos antes de comprobar. Recorro el ciclo completo: estado inicial, agregar dos items comprobando cantidad y total, y vaciar. Compruebo las dos salidas en cada paso, porque un error puede esconderse en cualquiera."

## Conceptos

- **`renderHook`**: ejecuta un hook dentro de un componente de prueba.
- **`result.current`**: lo que devolvió el hook en el último render; se actualiza solo.
- **`act`**: hace que React procese las actualizaciones antes de seguir con la prueba.
- **`toEqual` vs `toBe`**: contenido vs misma referencia (o mismo valor primitivo).
- **Reglas de los hooks**: solo se llaman dentro de componentes u otros hooks.
- **Probar todas las salidas**: cada dato que devuelve el hook merece al menos un `expect`.
