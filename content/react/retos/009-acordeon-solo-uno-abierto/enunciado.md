Crea el componente `Acordeon`, que recibe la prop `items`: un arreglo de objetos `{ pregunta, respuesta }` (por ejemplo, unas preguntas frecuentes). Cada pregunta se puede abrir para ver su respuesta, pero **solo una puede estar abierta a la vez**.

## Reglas

- Cada pregunta es un `<button>` con el texto de la `pregunta`.
- Al inicio, todas están **cerradas**: no se ve ninguna respuesta.
- Clic en una pregunta cerrada la **abre** y muestra su `respuesta` debajo (por ejemplo, en un `<p>`).
- Si había otra abierta, se **cierra** (la respuesta anterior desaparece del DOM).
- Clic en la pregunta que ya está abierta la **cierra**, y no queda ninguna abierta.
- Cada botón lleva `aria-expanded` con `"true"` si su respuesta está visible y `"false"` si no.

## Ejemplo

```jsx
<Acordeon
  items={[
    { pregunta: "¿Quién vota?", respuesta: "Cualquiera con Google" },
    { pregunta: "¿Cuántas veces?", respuesta: "Una sola" },
  ]}
/>
```

| Acción | Respuesta visible |
|---|---|
| (inicio) | ninguna |
| clic en `¿Quién vota?` | `Cualquiera con Google` |
| clic en `¿Cuántas veces?` | `Una sola` (la otra se cerró) |
| clic en `¿Cuántas veces?` otra vez | ninguna |

## Por qué importa

Es el ejercicio típico para evaluar **levantar el estado**: si cada sección guardara su propio "abierto", no podría enterarse de que otra se abrió. Entender dónde debe vivir el estado es uno de los conceptos que más preguntan en entrevistas de React.
