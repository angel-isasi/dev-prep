Crea el componente `TareasConReintento`, que pide tus tareas a **`/api/practica/tareas`** y, si algo falla, muestra un botón **Reintentar** que vuelve a pedirlas. No recibe props.

Las APIs fallan a veces por un instante (el servidor se reinicia, el wifi parpadea). Pedirle al usuario que recargue toda la página es mala experiencia: lo normal es ofrecer reintentar **solo esa parte**.

La API responde un arreglo:

```json
[
  { "id": 1, "titulo": "Repasar closures", "hecha": true },
  { "id": 2, "titulo": "Resolver un reto de React", "hecha": false }
]
```

## Reglas

- Al montar, pide `"/api/practica/tareas"` **una vez**.
- **Cargando:** `<p role="status">Cargando tareas...</p>`.
- **Datos:** una `<ul>` con un `<li>` por tarea con su `titulo`. Si la tarea está hecha, agrega ` (hecha)` al final, por ejemplo `Repasar closures (hecha)`.
- **Error:** si la respuesta no es `ok` o `fetch` se rechaza, muestra:
  - un `<p role="alert">` con `No se pudieron cargar las tareas.`
  - un `<button>` con el texto **`Reintentar`**.
- Al hacer clic en **Reintentar**: vuelve a mostrarse `Cargando tareas...` (el error y el botón desaparecen) y se hace **una petición nueva**. Si esta sale bien, aparece la lista; si falla, otra vez el error con el botón.
- Nunca deben quedar peticiones en bucle: solo se pide al montar y en cada clic.

## Ejemplo

| Paso | Se ve |
|---|---|
| Monta y la API responde `500` | `No se pudieron cargar las tareas.` y el botón **Reintentar** |
| Clic en Reintentar | `Cargando tareas...` |
| La API ahora responde `200` | la lista de tareas |

## Pruébalo con la API de práctica

Abre `http://localhost:4321/api/practica/tareas?fallo=0.5` en el navegador y recarga varias veces: la mitad de las veces responde `500` con `{ "error": "Error del servidor" }`. Es justo el caso en que un botón Reintentar salva la pantalla. Si usas esa URL en tu componente, verás cómo a veces carga al primer intento y a veces necesitas reintentar.

## Por qué importa

"¿Y si la API falla?" es pregunta clásica en las entrevistas junior. Responder "muestro el error y un botón para reintentar, que vuelve a disparar el efecto" demuestra que sabes controlar **cuándo** corre un efecto, no solo escribirlo.
