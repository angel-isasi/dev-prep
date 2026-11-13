## Idea clave

Separa **datos**, **validación** y **presentación**. Los datos del formulario viven en un objeto en el estado; la validación es una función pura que devuelve un objeto de errores; el JSX solo muestra lo que dice ese objeto. Al enviar: validar, guardar los errores y llamar a `onSubmit` solo si no hay ninguno.

## Paso a paso

1. **Un objeto para el formulario.** `useState({ email: "", clave: "" })` en vez de un estado por campo: escala mejor si agregas más campos.
2. **Un solo manejador.** Cada input tiene un `name` igual a su clave en el objeto. En `cambiar`, `[name]: value` (propiedad computada) actualiza el campo correcto. Se usa spread para copiar los demás campos.
3. **Validación pura.** `validar(datos)` está fuera del componente: no usa estado, solo recibe datos y devuelve `{}` o `{ email: "...", clave: "..." }`. Se puede probar sola.
   - `/^\S+@\S+\.\S+$/` significa: uno o más caracteres sin espacio, `@`, uno o más, un punto, uno o más. No es perfecta, pero en una entrevista es suficiente.
4. **Enviar.** `preventDefault()` evita la recarga. Calculas los errores, los guardas con `setErrores` (para pintarlos) y decides con el **valor recién calculado** si llamas a `onSubmit`.
5. **Mostrar errores.** `{errores.email && <p role="alert">...</p>}`: si no hay mensaje, no se pinta nada. `role="alert"` hace que el lector de pantalla lo lea en voz alta.
6. **Accesibilidad.** `aria-invalid` marca el campo con error y `aria-describedby` lo conecta con su mensaje. `noValidate` en el `<form>` desactiva la validación nativa del navegador para que mande la tuya.

```jsx
import { useState } from "react";

// Devuelve un objeto con un mensaje por cada campo inválido.
// Si todo está bien, devuelve {}.
function validar(datos) {
  const errores = {};
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) errores.email = "Ingresa un correo válido";
  if (datos.clave.length < 8) errores.clave = "Mínimo 8 caracteres";
  return errores;
}

export function Registro({ onSubmit }) {
  const [datos, setDatos] = useState({ email: "", clave: "" });
  const [errores, setErrores] = useState({});

  // Un solo manejador para todos los campos: usa el atributo `name`.
  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
  }

  function enviar(evento) {
    evento.preventDefault();
    const encontrados = validar(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length === 0) onSubmit(datos);
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="email">Correo</label>
      <input
        id="email"
        name="email"
        type="email"
        value={datos.email}
        onChange={cambiar}
        aria-invalid={Boolean(errores.email)}
        aria-describedby="error-email"
      />
      {errores.email && (
        <p id="error-email" role="alert">
          {errores.email}
        </p>
      )}

      <label htmlFor="clave">Contraseña</label>
      <input
        id="clave"
        name="clave"
        type="password"
        value={datos.clave}
        onChange={cambiar}
        aria-invalid={Boolean(errores.clave)}
        aria-describedby="error-clave"
      />
      {errores.clave && (
        <p id="error-clave" role="alert">
          {errores.clave}
        </p>
      )}

      <button>Crear cuenta</button>
    </form>
  );
}
```

## Por qué funciona

| Acción | `datos` | `errores` | Lo que se pinta / pasa |
|---|---|---|---|
| (inicio) | `{ email: "", clave: "" }` | `{}` | formulario sin mensajes |
| enviar vacío | igual | `{ email: "Ingresa...", clave: "Mínimo..." }` | 2 alertas, `onSubmit` no se llama |
| escribir correo y clave `1234` | `{ email: "angel@unica.edu.pe", clave: "1234" }` | sin cambios (aún se ven los 2 mensajes) | se ven los valores en los inputs |
| enviar | igual | `{ clave: "Mínimo..." }` | 1 alerta |
| clave `12345678` y enviar | `{ ..., clave: "12345678" }` | `{}` | sin alertas, `onSubmit(datos)` |

Detalle importante: dentro de `enviar` uso `encontrados` (la variable local) para decidir, no `errores`. `setErrores` no cambia `errores` en ese mismo instante: el nuevo valor recién estará disponible en el **siguiente** render.

## Errores comunes

- **Decidir con el estado recién "seteado":** `setErrores(validar(datos)); if (Object.keys(errores).length === 0) onSubmit(datos);`. `errores` todavía tiene el valor del render anterior, así que el formulario se envía con datos inválidos o no se envía cuando sí debería. Usa la variable local.
- **Olvidar `preventDefault()`.** El navegador recarga la página y se pierde todo.
- **Pisar los otros campos:** `setDatos({ [name]: value })` sin el spread borra el resto del objeto. Lo notas porque al escribir la contraseña se vacía el correo.
- **Mostrar los errores con un `<span>` sin `role="alert"`** ni `aria-invalid`. Visualmente se ve bien, pero un usuario de lector de pantalla nunca se entera del error.
- **Validar en cada tecla desde el primer momento.** El usuario ve "correo inválido" apenas escribe la primera letra. Validar al enviar (o al salir del campo, con `onBlur`) es mejor experiencia.

## Otra forma de resolverlo

**Formulario no controlado** con `FormData`: no guardas los valores en el estado, los lees del formulario al enviarlo.

```jsx
import { useState } from "react";

// validar(datos) es la misma función de arriba.

export function Registro({ onSubmit }) {
  const [errores, setErrores] = useState({});

  function enviar(evento) {
    evento.preventDefault();
    const formulario = new FormData(evento.currentTarget);
    const datos = { email: formulario.get("email"), clave: formulario.get("clave") };
    const encontrados = validar(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length === 0) onSubmit(datos);
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="email">Correo</label>
      <input id="email" name="email" />
      {errores.email && <p role="alert">{errores.email}</p>}
      <label htmlFor="clave">Contraseña</label>
      <input id="clave" name="clave" type="password" />
      {errores.clave && <p role="alert">{errores.clave}</p>}
      <button>Crear cuenta</button>
    </form>
  );
}
```

**¿Cuándo conviene?** Cuando no necesitas reaccionar a cada tecla (sin vista previa ni validación en vivo): hay menos estado y menos renders. Si necesitas validar mientras se escribe o deshabilitar el botón según los valores, usa la versión controlada. En proyectos grandes se suele usar una librería como React Hook Form con un esquema de Zod.

## Cómo explicarlo en la entrevista

> "Guardo todo el formulario en un objeto y uso el atributo `name` para actualizar el campo correcto con un solo manejador. La validación es una función pura que devuelve un objeto de errores, así la puedo probar aparte. Al enviar, valido, guardo los errores para mostrarlos y solo llamo a `onSubmit` si no hay ninguno; para decidir uso el resultado recién calculado, no el estado, porque el setter no lo actualiza al instante. Los mensajes tienen `role='alert'` y los inputs `aria-invalid` para que se entiendan con lector de pantalla. Igual, la validación real también va en el servidor."

## Conceptos

- **Formulario controlado** con un objeto en el estado.
- **Propiedad computada** `[name]: value` para un solo manejador.
- **Función pura de validación**, fuera del componente.
- **El setter no es inmediato**: el nuevo estado llega en el siguiente render.
- **`preventDefault()`** en el `onSubmit`.
- **Expresión regular** `\S+@\S+\.\S+` para un correo básico.
- **`role="alert"`, `aria-invalid`, `aria-describedby`**: errores accesibles.
- **`noValidate`**: desactiva la validación nativa del navegador.
- **`FormData`**: leer un formulario no controlado.
