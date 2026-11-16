## Idea clave

Es una **condición de carrera**: dos peticiones están en vuelo y gana la que **llega** última, no la que se **pidió** última. El patrón para evitarlo ya estaba a medias: la limpieza pone `vigente = false` cuando la consulta cambia, pero el `then` nunca revisaba esa bandera y guardaba cualquier respuesta. Basta con que el `then` ignore los datos si su búsqueda ya no es vigente.

## Paso a paso

1. **Lee el síntoma.** Pasa "con internet lento" y los resultados "cambian solos" después de estar bien. Es la firma de respuestas que llegan desordenadas.
2. **Reprodúcelo con tiempos controlados.** En el test, el "servidor" responde cuando tú decides: pide "re", pide "react", responde "react" y **después** "re". La lista termina con los resultados de "re".
3. **Sigue la bandera.** Cada vez que corre el efecto se crea **su propia** variable `vigente`. Al cambiar la consulta, React ejecuta la limpieza del efecto anterior y pone **esa** `vigente` en `false`. La información existe.
4. **Busca dónde se usa.** En ningún lado: el `then` hace `setResultados(datos)` sin preguntar.
5. **Revisa la bandera antes de guardar.**

```jsx
buscar(consulta).then((datos) => vigente && setResultados(datos));
```

## Por qué funciona

| Momento | `vigente` del efecto "re" | `vigente` del efecto "react" | Qué pasa |
|---|---|---|---|
| Se pide "re" | `true` | | |
| Cambia a "react": limpieza del efecto "re" | `false` | `true` | se pide "react" |
| Llega "react" | `false` | `true` | se guarda |
| Llega "re" (tarde) | `false` | `true` | **se ignora** |

Cada `then` recuerda (por closure) la `vigente` del efecto en el que se creó. Por eso la respuesta vieja ve `false` aunque la nueva vea `true`.

`vigente && setResultados(datos)` usa el cortocircuito de `&&`: si `vigente` es `false`, no evalúa la segunda parte. Es lo mismo que `if (vigente) setResultados(datos)`.

## Errores comunes

- **Comparar con la consulta actual**: `if (consulta === consultaActual)`. Dentro del `then`, `consulta` es la de **ese** efecto (closure), y no hay una "consulta actual" a mano sin agregar un `useRef`.
- **Agregar un debounce.** Reduce la cantidad de peticiones, pero si dos siguen en vuelo y responden desordenadas, el error vuelve a aparecer.
- **Quitar la limpieza** porque "no hace nada". Es la mitad de la solución: sin ella, nadie le avisa a la búsqueda vieja que ya no sirve.

## Otra forma de resolverlo

Cancelar de verdad la petición vieja con `AbortController`, si `buscar` usa `fetch`:

```jsx
useEffect(() => {
  const controlador = new AbortController();
  fetch(`/api/cursos?q=${consulta}`, { signal: controlador.signal })
    .then((r) => r.json())
    .then(setResultados)
    .catch((error) => {
      if (error.name !== "AbortError") throw error;
    });
  return () => controlador.abort();
}, [consulta]);
```

Así además se ahorra la descarga de una respuesta que nadie va a usar. Librerías como TanStack Query resuelven esto automáticamente.

## Cómo explicarlo en la entrevista

> "Era una condición de carrera: la respuesta de 're' llegaba después que la de 'react' y la pisaba. El efecto ya tenía una bandera `vigente` que la limpieza ponía en `false` al cambiar la consulta, pero el `then` no la revisaba. Agregué esa revisión: cada efecto tiene su propia bandera por closure, así que las respuestas viejas se ignoran. Con `fetch`, también se puede cancelar la petición con un `AbortController`."

## Conceptos

- **Condición de carrera**: el resultado depende del orden en que terminan tareas que corren al mismo tiempo.
- **Limpieza del efecto**: React la ejecuta antes de volver a correr el efecto y al desmontar.
- **Closure por ejecución**: cada vez que corre el efecto se crean variables nuevas; sus callbacks recuerdan las de esa ejecución.
- **Bandera de vigencia**: una variable booleana que indica si el resultado todavía sirve.
- **`AbortController`**: permite cancelar un `fetch` en curso.
