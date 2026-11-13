Crea el hook personalizado `useDebounce(valor, ms)`. Devuelve una copia "retrasada" de `valor`: solo se actualiza cuando `valor` deja de cambiar durante `ms` milisegundos. Si no te pasan `ms`, usa **300**.

## Reglas

- En el primer render devuelve `valor` tal cual.
- Cuando `valor` cambia, el hook sigue devolviendo el valor **anterior** hasta que pasen `ms` milisegundos sin nuevos cambios.
- Si `valor` vuelve a cambiar antes de que se cumpla el tiempo, la espera **se reinicia** desde cero. Solo "sobrevive" el último valor.
- El tiempo de espera es el segundo parámetro, `ms` (por defecto `300`).
- Es un hook: su nombre empieza con `use` y puede usar otros hooks (`useState`, `useEffect`). No devuelve JSX.

## Ejemplo

```jsx
function Buscador() {
  const [texto, setTexto] = useState("");
  const textoDebounced = useDebounce(texto, 300);
  // Este efecto solo corre cuando el usuario deja de escribir 300 ms.
  useEffect(() => {
    if (textoDebounced) buscarEnServidor(textoDebounced);
  }, [textoDebounced]);
  return <input value={texto} onChange={(e) => setTexto(e.target.value)} />;
}
```

| Tiempo | `valor` | Lo que devuelve `useDebounce(valor, 300)` |
|---|---|---|
| 0 ms | `"a"` | `"a"` |
| 50 ms | `"ab"` | `"a"` |
| 100 ms | `"abc"` | `"a"` |
| 399 ms | `"abc"` | `"a"` (aún no pasan 300 ms desde el último cambio) |
| 400 ms | `"abc"` | `"abc"` |

## Por qué importa

Sin debounce, un buscador que consulta al servidor hace una petición **por cada tecla**: "react" serían 5 peticiones. Es una pregunta frecuente porque junta tres cosas que debes dominar: hooks personalizados, temporizadores y la función de limpieza de `useEffect`.
