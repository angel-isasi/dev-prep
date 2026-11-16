# Wayra Pagos: formulario de registro

Registro con validación en vivo, mensajes accesibles y envío con estados de carga, éxito y error.

## Cómo correrlo

Usa las dependencias de dev-prep, así que no hace falta `npm install`. Desde esta carpeta:

```bash
npx vitest        # tests de aceptación en modo watch
npx vite          # la app en http://localhost:5173
```

Para ver el error del servidor, regístrate con `usado@wayra.pe`.

## Estructura

```
src/
  api.js                          API falsa
  App.jsx                         decide si mostrar el formulario o el éxito
  lib/validation.js               reglas puras: validateEmail, validatePassword, validateConfirm, validate
  components/TextField.jsx        label, input, ayuda y error con aria-invalid y aria-describedby
  components/RegisterForm.jsx     valores, campos tocados y envío
  components/SuccessMessage.jsx   confirmación (recibe el foco al aparecer)
```

## Mis decisiones

- **Los errores son estado derivado.** `validate(values)` se ejecuta en cada render. No hay un `useState` de errores que se pueda desincronizar: por eso, si cambias la contraseña, la confirmación se revisa sola.
- **"Tocado" separado de "inválido".** Un campo puede ser inválido desde el inicio (está vacío), pero solo muestro el error cuando el usuario ya salió de él. Así no se le regaña antes de que escriba.
- **Las reglas de la contraseña son una lista ordenada.** `PASSWORD_RULES.find(...)` devuelve la primera que falla. Agregar una regla nueva es agregar una línea.
- **Un `TextField` reutilizable** que arma solo los `id` (con `useId`), `aria-invalid` y `aria-describedby`. Los tres campos quedan iguales y accesibles sin repetir código.
- **Un solo estado de envío** (`"idle" | "submitting"`) y un `fieldset disabled` que bloquea todo mientras se envía. Además `handleSubmit` revisa `isSubmitting`, porque Enter en un campo también envía el formulario.
- **El correo se recorta con `trim()`** antes de validarlo y de enviarlo: un espacio copiado al pegar no debería impedir registrarse.
- **Tras el éxito el foco va al título**, para que el lector de pantalla anuncie el cambio.

## Qué mejoraría con más tiempo

- Mostrar las reglas de la contraseña como una lista que se marca a medida que se cumplen.
- Un botón para mostrar u ocultar la contraseña.
- Llevar el foco al primer campo con error si el servidor rechaza un dato concreto.
- Recordar que esto no reemplaza la validación del backend: el frontend ayuda al usuario, el backend protege los datos.
