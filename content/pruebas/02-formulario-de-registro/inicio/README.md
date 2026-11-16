# Wayra Pagos: formulario de registro

Prueba técnica para el puesto de **Desarrollador Frontend Junior**. Tiempo estimado: 2 horas.

Lee primero el enunciado completo: ahí están los textos exactos de cada mensaje de error. Al terminar, reemplaza la sección "Mis decisiones" con lo tuyo.

## Cómo correrlo

El proyecto usa las dependencias de dev-prep (React 19, Vite, Vitest y Testing Library), así que no hace falta `npm install`.

Desde esta carpeta, en una terminal:

```bash
npx vitest        # corre los tests y los repite cada vez que guardas
npx vite          # levanta la app en http://localhost:5173
```

Para probar el error del servidor en el navegador, regístrate con `usado@wayra.pe`.

## Qué hay en la carpeta

```
src/
  api.js                       API falsa: registerUser() tarda 800 ms (no la modifiques)
  App.jsx                      formulario o mensaje de éxito (TODO)
  lib/validation.js            reglas de validación, funciones puras (TODO)
  components/TextField.jsx     campo reutilizable con label, ayuda y error accesibles (TODO)
  components/RegisterForm.jsx  el formulario: valores, campos tocados y envío (TODO)
  main.jsx, styles.css         arranque y estilos base
tests/
  registro.test.jsx            tests de aceptación: tu entrega debe pasarlos todos
```

## Sugerencia de orden

1. `lib/validation.js`: cada regla es una función pequeña.
2. `TextField.jsx`: haz que un solo campo se vea bien y sea accesible.
3. `RegisterForm.jsx`: valores, campos tocados y el botón deshabilitado.
4. El envío con `Enviando...`, el error del servidor y la pantalla de éxito.
5. Estilos y este README.

## Mis decisiones

- (Escribe aquí qué decidiste y por qué.)

## Qué mejoraría con más tiempo

- (Escribe aquí.)
