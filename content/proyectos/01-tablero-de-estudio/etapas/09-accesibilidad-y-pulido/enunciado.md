# Etapa 9: accesibilidad y pulido

Tu tablero ya hace todo. Ahora lo terminas como lo haría un profesional: que se pueda usar **solo con el teclado** y con un **lector de pantalla** (NVDA en Windows, VoiceOver en Mac). Es lo que separa un proyecto de tutorial de uno de portafolio, y en las entrevistas te preguntan cada vez más por esto.

Los tests anteriores tienen que seguir pasando: no cambies los textos ni los nombres que ya usan.

## Qué hacer

1. **Estructura con landmarks.** En `App`, el encabezado (`<header>` con el `<h1>` y la racha) va **fuera** de `<main>`, para que sea el landmark `banner`. Envuelve todo en un `<div className="app">` y pon las secciones dentro de `<main className="app__main">`.
2. **Regiones con nombre.** Cada `<section>` se une a su título con `aria-labelledby`: quedan las regiones **Agregar tarea** y **Mis tareas**. `TaskList` recibe una prop `labelledBy` y la pone como `aria-labelledby` del `<ul>`, para que la lista se llame **Mis tareas**.
3. **Filtros agrupados.** Los botones de filtro de `FilterBar` van en un contenedor con `role="group"` y `aria-label="Filtrar por estado"`.
4. **Carga.** La sección **Mis tareas** lleva `aria-busy` en `true` mientras carga y en `false` cuando termina.
5. **Errores unidos al campo.** En `TaskForm`, cuando hay un error, el campo **Tarea** lleva `aria-invalid="true"` y `aria-describedby` con el `id` del mensaje de error (el `<p role="alert">`). Sin error, ninguno de los dos atributos.
6. **Foco en el formulario.** Si el título no es válido, el foco vuelve al campo **Tarea**. Después de crear una tarea, el campo queda vacío **y con el foco**, listo para escribir la siguiente.
7. **Foco al editar.** Al pulsar **Editar**, el foco pasa al campo **Editar título** (con el texto seleccionado). La tecla **Escape** cancela la edición. Al guardar o cancelar, el foco vuelve al botón **Editar** de esa tarea.
8. **Foco al borrar.** El botón que pulsaste desaparece junto con la tarea, así que el foco se perdería. Después de borrar, llévalo al título **Mis tareas** (con `tabIndex={-1}` para que se pueda enfocar por código).
9. **Anuncios con `aria-live`.** Agrega en `App` un párrafo con `role="status"` (que ya implica `aria-live="polite"`) y la clase `sr-only`, que **siempre** está en la página (vacío al empezar). Al crear una tarea dice `Tarea creada: <título>` y al borrarla `Tarea borrada: <título>`.
10. En `src/styles.css`, agrega la clase `.sr-only` (visible solo para lectores de pantalla), `.app__main` y un contorno visible con `:focus-visible`.

## Conceptos que practicas

- Landmarks (`banner`, `main`, `region`) y cómo los usa un lector de pantalla para saltar por la página.
- `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-busy` y `role="group"`.
- Regiones vivas: `role="status"` (educado, espera a que termine de hablar) frente a `role="alert"` (interrumpe).
- Manejo del foco con `useRef` y `useEffect`: dónde debe quedar después de cada acción.
- Probar la accesibilidad con Testing Library: `getByRole` con `name` y `document.activeElement`.

## Pistas

1. La región viva tiene que existir **antes** de que cambie su texto: si la montas recién con el mensaje, muchos lectores de pantalla no la anuncian. Por eso va siempre en la página y solo cambias su contenido con un estado (`const [announcement, setAnnouncement] = useState("")`).
2. Para devolver el foco al botón **Editar**, recuerda en un `useRef` que la edición terminó (`returnFocus.current = true`) y, en un `useEffect` que depende de `editing`, haz `editButtonRef.current?.focus()` cuando `editing` vuelve a `false`. El botón es un elemento nuevo después de editar: por eso se enfoca en el efecto, cuando ya está en la página.
