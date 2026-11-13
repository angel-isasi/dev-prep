Crea y exporta el hook `useAsync(fn)`. Recibe **cualquier función asíncrona** y te da sus fases (inicial, cargando, listo, error) para que los componentes no repitan el mismo `try/catch` y los mismos `useState` cada vez que llaman a una API.

`useAsync(fn)` devuelve un objeto con:

- `fase`: `"inicial"`, `"cargando"`, `"listo"` o `"error"`.
- `dato`: lo que devolvió `fn` la última vez que salió bien (o `null`).
- `error`: el error que lanzó `fn` (o `null`).
- `ejecutar(...args)`: función que llama a `fn(...args)` y actualiza las fases.

## Reglas

- Al inicio: `{ fase: "inicial", dato: null, error: null }`.
- Al llamar `ejecutar`: pasa a `"cargando"` (con `dato` y `error` en `null`).
- Si `fn` termina bien: `{ fase: "listo", dato: resultado, error: null }`, y `ejecutar` **devuelve** el resultado.
- Si `fn` lanza un error: `{ fase: "error", dato: null, error }`. `ejecutar` **no** debe relanzar el error.
- `ejecutar` debe ser **la misma función** entre renders mientras `fn` no cambie (usa `useCallback`), para que se pueda poner en dependencias de efectos sin crear bucles.

## Ejemplo

```jsx
async function doble(n) {
  if (n < 0) throw new Error("negativo");
  return n * 2;
}

function Calculadora() {
  const { fase, dato, error, ejecutar } = useAsync(doble);
  return (
    <div>
      <button onClick={() => ejecutar(21)}>Calcular</button>
      {fase === "cargando" && <p>Calculando…</p>}
      {fase === "listo" && <p>Resultado: {dato}</p>}
      {fase === "error" && <p role="alert">{error.message}</p>}
    </div>
  );
}
```

## Por qué importa

Cargar datos con "cargando / listo / error" es lo más repetido del frontend. Saber extraerlo a un hook personalizado demuestra que entiendes qué es un hook (una función que usa otros hooks) y cuándo vale la pena reutilizar lógica. Es una pregunta frecuente en entrevistas de React.
