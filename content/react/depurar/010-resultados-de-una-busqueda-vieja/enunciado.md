## El problema

Varios usuarios con internet lento reportan: "Escribo **'react'** en el buscador de cursos, aparecen los resultados correctos, y un segundo después **cambian solos** por los resultados de **'re'**: salen cursos de Redes y Regex que no tienen nada que ver".

Con internet rápido casi nunca pasa. Tu compañero dice: "Ya puse una bandera `vigente` en la limpieza del efecto, como recomiendan".

## Qué debe hacer

`Resultados` recibe `consulta` y `buscar(consulta)`, que devuelve una promesa con un arreglo de textos. Cada vez que cambia la `consulta`, pide los resultados y los muestra en una lista.

- Siempre se muestran los resultados de la consulta **actual**.
- Si una respuesta de una consulta anterior llega (antes o después), se ignora.
- Si el componente se desmonta antes de la respuesta, no pasa nada.

```jsx
<Resultados consulta="re" buscar={buscar} />
// el usuario sigue escribiendo
<Resultados consulta="react" buscar={buscar} />
// llega "react": ["React básico"]  -> se muestra
// llega "re" (tarde): [...]         -> se ignora
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
