# Tablero de estudio

App React para organizar tareas de aprendizaje: crear, editar, borrar, filtrar y buscar tareas que vienen de una API, con estados de carga y error, preferencias guardadas, racha diaria y accesibilidad cuidada.

## Estructura

```
index.html
src/
  main.jsx        monta la app
  App.jsx         pantalla principal
  data.js         temas y tareas de ejemplo
  api.js          API falsa (GET, POST, PATCH, DELETE en memoria)
  styles.css      estilos (modo oscuro)
  components/     aquí van tus componentes
  hooks/          aquí van tus hooks propios
tests/            tests de cada etapa (los pone dev-prep)
```

## Cómo verlo en el navegador

Abre una terminal en esta carpeta y corre:

```
npx vite
```

Vite usa los paquetes de dev-prep (no hace falta `npm install`). Abre la dirección que te muestra, normalmente `http://localhost:5173`.

## Tests

Los tests corren solos en dev-prep cada vez que guardas. Cada etapa suma tests nuevos y los anteriores se siguen corriendo.

## Cuando lo publiques

Reemplaza este README por uno tuyo: qué hace la app, una captura, qué aprendiste (componentes, estado, efectos, hooks propios, accesibilidad) y cómo correr los tests.
