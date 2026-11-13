Crea el hook propio `useAlternar` para manejar un valor **verdadero/falso** que se prende y se apaga, como un menú abierto o cerrado, o "mostrar contraseña".

```jsx
const [valor, alternar] = useAlternar(inicial);
```

## Reglas

- Recibe un valor inicial opcional. Si no lo pasas, empieza en `false`.
- Devuelve un **arreglo de dos elementos**, igual que `useState`:
  - `valor`: el booleano actual.
  - `alternar`: una función sin argumentos que invierte el valor (`true` pasa a `false` y al revés).
- `alternar` debe ser **la misma función** en todos los renders (misma referencia). Así se puede pasar a componentes memorizados o a dependencias de `useEffect` sin causar trabajo extra.

## Ejemplo

```jsx
function Menu() {
  const [abierto, alternar] = useAlternar();
  return (
    <>
      <button onClick={alternar}>Menú</button>
      {abierto && <nav>...</nav>}
    </>
  );
}
```

| Acción | `valor` |
|---|---|
| `useAlternar()` | `false` |
| `useAlternar(true)` | `true` |
| `alternar()` desde `false` | `true` |
| `alternar()` otra vez | `false` |

## Por qué importa

Es el hook propio más simple que existe y por eso aparece en entrevistas: muestra si entiendes que un hook propio es **una función que empieza con `use` y usa otros hooks**, y si sabes por qué a veces conviene `useCallback`.
