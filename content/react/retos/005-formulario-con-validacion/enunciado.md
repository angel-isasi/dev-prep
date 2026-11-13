Crea el componente `Registro`: un formulario con **correo** y **contraseña** que valida los datos al enviarse. Recibe la prop `onSubmit`, una función que debes llamar **solo si todo es válido**, con el objeto `{ email, clave }`.

## Reglas

- Un input con la etiqueta **"Correo"** y otro con la etiqueta **"Contraseña"** (`type="password"`). Usa `<label htmlFor>` + `id` en cada uno.
- Un botón **`Crear cuenta`** que envía el formulario (`<form onSubmit>`).
- Al enviar se valida:
  - El correo debe tener la forma `algo@algo.algo` (sin espacios). Si no, muestra **`Ingresa un correo válido`**.
  - La contraseña debe tener **mínimo 8 caracteres**. Si no, muestra **`Mínimo 8 caracteres`**.
- Cada mensaje de error va en un elemento con `role="alert"`, para que el lector de pantalla lo anuncie.
- Un input con error lleva `aria-invalid="true"`.
- Si hay algún error, **no** se llama a `onSubmit`. Si todo está bien, se llama una vez con `{ email, clave }` y no se muestra ningún error.
- Los errores se recalculan en cada envío: si el usuario corrige y vuelve a enviar, los mensajes viejos desaparecen.

## Ejemplo

```jsx
<Registro onSubmit={(datos) => console.log(datos)} />
```

| Acción | Se ve |
|---|---|
| clic en `Crear cuenta` sin escribir nada | 2 alertas: `Ingresa un correo válido` y `Mínimo 8 caracteres` |
| correo `angel@unica.edu.pe`, clave `1234` y enviar | 1 alerta: `Mínimo 8 caracteres` |
| clave `12345678` y enviar | sin alertas, `onSubmit({ email: "angel@unica.edu.pe", clave: "12345678" })` |

## Por qué importa

Casi toda app tiene un formulario de registro o login. En la entrevista miran si manejas varios campos en el estado, si validas antes de enviar, si muestras los errores de forma clara y accesible y si evitas llamar al servidor con datos incorrectos.
