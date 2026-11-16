## El problema

Una profesora reporta: "En la lista de mi salón hago clic en un alumno y veo su perfil. Pero si después hago clic en **otro alumno**, el perfil **sigue mostrando al primero**. Si recargo la página con el otro alumno elegido, ahí sí sale bien".

No hay errores en la consola, y en la pestaña Red solo aparece **una** petición.

## Qué debe hacer

`Perfil` recibe `id` y `cargarAlumno(id)`, una función que devuelve una promesa con `{ nombre }`.

- Mientras carga, muestra `Cargando…`.
- Cuando llegan los datos, muestra el nombre en un `<h2>`.
- Si el `id` cambia, vuelve a mostrar `Cargando…`, pide los datos del alumno nuevo y lo muestra.
- Si el componente se vuelve a pintar con el mismo `id`, no repite la petición.

```jsx
<Perfil id={1} cargarAlumno={cargarAlumno} />  // Ana Torres
<Perfil id={2} cargarAlumno={cargarAlumno} />  // Luis Paredes
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
