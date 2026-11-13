Crea el hook propio `useIntervalo(callback, ms)`: una versión de `setInterval` que funciona bien con React. Es más difícil de lo que parece, porque un `setInterval` dentro de un `useEffect` suele quedarse con **valores viejos** del estado.

```jsx
useIntervalo(() => setSegundos(segundos + 1), 1000);
```

## Reglas

- Llama a `callback` cada `ms` milisegundos.
- Siempre usa **el callback más reciente**: si el componente se vuelve a renderizar con otro callback (que ve valores nuevos del estado), el intervalo debe llamar a ese, no al primero.
- Cambiar el callback **no reinicia** el intervalo (si no, con callbacks nuevos en cada render nunca llegaría a dispararse).
- Si `ms` cambia, reinicia el intervalo con el nuevo tiempo.
- Si `ms` es `null`, el intervalo está **pausado** (no se llama nada).
- Al desmontar el componente, el intervalo se **limpia** (`clearInterval`).
- No devuelve nada.

## Ejemplo

```jsx
function Reloj() {
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(true);

  // Ojo: usa `segundos` directamente, sin forma funcional.
  useIntervalo(() => setSegundos(segundos + 1), corriendo ? 1000 : null);

  return (
    <button onClick={() => setCorriendo(!corriendo)}>{segundos} s</button>
  );
}
```

| Tiempo | `ms` | `segundos` |
|---|---|---|
| 0 s | 1000 | 0 |
| 1 s | 1000 | 1 |
| 2 s | 1000 | 2 |
| pausado (`null`) | `null` | 2 (no avanza) |

## Por qué importa

Es un clásico popularizado por Dan Abramov (del equipo de React): "Making setInterval Declarative with React Hooks". Resolverlo bien demuestra que entiendes **closures viejos** (*stale closures*), la diferencia entre `useRef` y `useState`, y cómo funcionan las dependencias de `useEffect`.
