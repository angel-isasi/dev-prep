Crea el hook personalizado `useLocalStorage(clave, inicial)`. Se usa **igual que `useState`** (devuelve `[valor, setValor]`), pero el valor **se guarda en `localStorage`** y sobrevive a recargar la página.

## Reglas

- Devuelve un arreglo `[valor, setValor]`, como `useState`.
- Al montarse, si en `localStorage` ya hay algo guardado en `clave`, **ese** es el valor inicial. Si no hay nada, usa `inicial`.
- Cada vez que el valor cambia, se guarda en `localStorage` como **JSON** (`JSON.stringify`). Así funciona con arreglos y objetos, no solo con textos.
- `setValor` acepta un valor o una función, igual que el de `useState`: `setValor((prev) => [...prev, "Terror"])`.
- Si lo guardado no es JSON válido (por ejemplo `"{malo"`), **no se rompe**: usa `inicial`.

## Ejemplo

```jsx
function Favoritos() {
  const [favoritos, setFavoritos] = useLocalStorage("favoritos", []);
  return (
    <button onClick={() => setFavoritos((f) => [...f, "Drama"])}>
      Favoritos: {favoritos.length}
    </button>
  );
}
```

| Acción | `favoritos` | `localStorage.getItem("favoritos")` |
|---|---|---|
| primera vez, sin nada guardado | `[]` | `"[]"` |
| clic | `["Drama"]` | `'["Drama"]'` |
| recargas la página | `["Drama"]` (leído del almacenamiento) | `'["Drama"]'` |

## Por qué importa

Es de los hooks personalizados más pedidos: evalúa la **inicialización perezosa** de `useState`, los efectos que sincronizan con algo externo y el manejo de errores. Además lo vas a usar de verdad (preferencias, carrito, borradores).
