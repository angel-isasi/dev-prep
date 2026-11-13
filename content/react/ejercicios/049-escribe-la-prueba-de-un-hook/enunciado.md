Te damos el hook propio `useCarrito` y tú escribes **su prueba**. Completa la función `probarUseCarrito(useCarrito)` para que compruebe que el carrito empieza vacío, que agregar suma items y precios, y que vaciar lo deja en cero.

```jsx
// El hook que vas a probar (no lo modificas).
function useCarrito() {
  const [items, setItems] = useState([]);
  const agregar = (item) => setItems((i) => [...i, item]);
  const vaciar = () => setItems([]);
  const total = items.reduce((s, i) => s + i.precio, 0);
  return { items, total, agregar, vaciar };
}
```

## Reglas

- Exporta `function probarUseCarrito(useCarrito)`. Recibe el hook como parámetro: **prueba ese**.
- Un hook no se puede llamar fuera de un componente. Usa `renderHook(() => useCarrito())`, que lo ejecuta dentro de un componente de prueba y te da `result.current` (lo que devolvió el hook en el último render).
- Todo lo que cambia el estado (`agregar`, `vaciar`) va dentro de `act(() => ...)`.
- Comprueba con `expect`:
  - Al inicio: `items` es `[]` y `total` es `0`.
  - Tras agregar `{ nombre: "Margarita", precio: 28 }` y `{ nombre: "Pepperoni", precio: 32 }`: hay **2** items y el total es **60**.
  - Tras `vaciar()`: `items` vuelve a `[]` y `total` a `0`.
- La app corre tu prueba contra el hook correcto (no debe fallar) y contra 4 versiones con errores (debe fallar en cada una).

## Ejemplo

| Paso | `result.current.items` | `result.current.total` |
|---|---|---|
| Inicio | `[]` | `0` |
| `agregar(Margarita, 28)` | 1 item | `28` |
| `agregar(Pepperoni, 32)` | 2 items | `60` |
| `vaciar()` | `[]` | `0` |

| Versión del hook | Tu prueba debe... |
|---|---|
| Correcta | pasar |
| `agregar` reemplaza en vez de sumar | fallar |
| `total` cuenta items en vez de sumar precios | fallar |
| `vaciar` no hace nada | fallar |
| Empieza con un item que nadie pidió | fallar |

## Por qué importa

Los hooks propios se prueban **sin interfaz**: es más rápido y más directo que montar un componente con botones. `renderHook` y `act` son preguntas típicas de entrevista cuando el puesto pide pruebas.
