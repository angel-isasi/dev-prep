# Etapa 3: formulario para crear con validación

El formulario con validación sale en casi todas las pruebas técnicas. Aquí haces uno bien hecho.

## Qué hacer

1. Crea `src/components/TaskForm.jsx` y exporta `TaskForm({ onAdd, topics })` (si no llega `topics`, usa `TOPICS` de `src/data.js`):
   - Un campo de texto con la etiqueta `Tarea` (usa `<label htmlFor>` y el `id` del input).
   - Un `<select>` con la etiqueta `Tema` y una opción por tema.
   - Un botón `Agregar` de tipo `submit`.
2. Al enviar (`onSubmit` del `<form>`, con `event.preventDefault()`), valida el título **sin espacios al inicio ni al final**:
   - Vacío: muestra `Escribe un título para la tarea`.
   - Menos de 3 caracteres: muestra `El título debe tener al menos 3 caracteres`.
   - Más de 80 caracteres: muestra `El título no puede pasar de 80 caracteres`.
   - El error va en un párrafo con `role="alert"` y en ese caso **no** llames a `onAdd`.
3. Si es válido: borra el error, llama a `onAdd({ title, topic })` con el título ya limpio y, después, vacía el campo.
   - Usa `await onAdd(...)` y vacía el campo solo si `onAdd` no devolvió `false`. En la etapa 5 la API puede fallar y no querrás perder lo que escribiste.
4. En `App`, muestra el formulario y escribe `addTask({ title, topic })`, que agrega al estado una tarea nueva pendiente (`done: false`) con un `id` único (por ahora `Date.now()` sirve).

## Conceptos que practicas

- Formularios controlados (`value` + `onChange`).
- `onSubmit` y `preventDefault`, en vez de `onClick` en el botón (así funciona también con Enter).
- Validación y mensajes de error accesibles (`role="alert"`).
- Etiquetas asociadas a sus campos.

## Pistas

1. Escribe la validación como una función pura fuera del componente, `validateTitle(title)`, que devuelve el mensaje de error o `""`. Es fácil de leer y de probar.
2. Pon `noValidate` en el `<form>` si usas atributos como `required`: así el navegador no muestra sus propios globos y tu mensaje es el único.
