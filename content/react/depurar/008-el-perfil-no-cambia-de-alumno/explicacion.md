## Idea clave

El segundo argumento de `useEffect` es la lista de **dependencias**: React vuelve a ejecutar el efecto solo cuando alguna de ellas cambia. Con `[]`, el efecto corre una sola vez, al montar. El efecto usa `id`, pero como `id` no está en la lista, cuando el padre pasa otro `id` React no vuelve a cargar nada. La regla: **todo valor de afuera que use el efecto va en las dependencias**.

## Paso a paso

1. **Lee el síntoma.** El primer alumno carga bien y en Red hay **una sola** petición. El efecto funciona, pero no se repite.
2. **Reprodúcelo.** Pinta `<Perfil id={1} />`, espera el nombre y vuelve a pintar con `id={2}`: sigue "Ana Torres", y `cargarAlumno` se llamó una vez.
3. **Lee el efecto como una frase.** "Cada vez que cambie *[nada]*, carga al alumno `id`". La parte de "cada vez que cambie" está vacía.
4. **Agrega lo que el efecto usa.** Usa `id` y `cargarAlumno` (que viene por props). `setAlumno` no hace falta: React garantiza que no cambia.

```jsx
useEffect(() => {
  setAlumno(null);
  cargarAlumno(id).then(setAlumno);
}, [id, cargarAlumno]);
```

## Por qué funciona

| Render | `id` | ¿Cambió alguna dependencia? | ¿Corre el efecto? |
|---|---|---|---|
| Primero (montaje) | 1 | siempre corre al montar | sí, carga a Ana |
| El padre pasa `id={2}` | 2 | sí, `id` | sí, carga a Luis |
| El padre vuelve a pintar con `id={2}` | 2 | no | no |

React compara cada dependencia con la del render anterior usando `Object.is`. Si son iguales, se salta el efecto. Por eso el último test (mismo `id`, misma función) solo llama una vez a `cargarAlumno`.

El linter de React (`eslint-plugin-react-hooks`, regla `exhaustive-deps`) detecta este error automáticamente: marca que el efecto usa `id` y no está en la lista.

## Errores comunes

- **Quitar el arreglo de dependencias.** El efecto correría en **cada** render. Aquí cada carga hace `setAlumno`, que provoca otro render, que vuelve a cargar: un bucle de peticiones.
- **Poner solo `[id]`.** Funciona en este caso, pero el linter avisará, y si el padre cambia `cargarAlumno` (por ejemplo, por otra API), el efecto seguiría usando la vieja.
- **Forzar que el componente se vuelva a montar con `key={id}` en el padre.** Funciona, pero es un parche: el efecto sigue mintiendo sobre lo que usa.

## Otra forma de resolverlo

Desde el padre, `<Perfil key={id} id={id} ... />` hace que cada alumno sea un componente nuevo (se desmonta el anterior y se monta otro), y el efecto con `[]` corre de nuevo. Sirve cuando quieres **reiniciar todo el estado** al cambiar de elemento, pero no reemplaza tener las dependencias correctas.

En proyectos reales, librerías como TanStack Query o SWR manejan la carga de datos por id, el caché y las respuestas viejas.

## Cómo explicarlo en la entrevista

> "Solo había una petición, así que el efecto no se repetía al cambiar el `id`. Tenía `[]` como dependencias, entonces corría solo al montar. El efecto usaba `id` y `cargarAlumno`, que vienen de props, y los agregué a la lista; ahora React lo vuelve a correr cuando el `id` cambia. La regla es que todo lo de afuera que usa el efecto va en las dependencias, y el linter de hooks lo avisa."

## Conceptos

- **`useEffect`**: ejecuta código después de pintar, para sincronizar el componente con algo externo (una API, un temporizador).
- **Dependencias**: la lista de valores que, si cambian, hacen que el efecto vuelva a correr.
- **`[]`**: el efecto corre solo al montar.
- **Sin arreglo**: el efecto corre después de cada render.
- **`exhaustive-deps`**: regla del linter que avisa cuando falta una dependencia.
