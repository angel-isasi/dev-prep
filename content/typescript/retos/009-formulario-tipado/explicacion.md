## Idea clave

Tres piezas tipadas: el **estado** con `useState<Formulario>` (TypeScript conoce cada campo), los **eventos** con los tipos de React (`ChangeEvent<HTMLInputElement>` te da `e.target.value` como `string`) y la **validación** como función pura que devuelve `Partial<Record<keyof Formulario, string>>`. El componente solo conecta: guarda lo que escribes, valida al enviar y decide si muestra errores o llama a `onRegistrar`.

## Paso a paso

1. **Los tipos.** `Formulario` con los tres campos y `ErroresFormulario = Partial<Record<keyof Formulario, string>>`: "un texto opcional por campo".
2. **`validarFormulario`.** Tres `if` independientes (no `else if`), para que se acumulen todos los errores. El `trim()` hace que `"  "` cuente como vacío. Para el email, la expresión regular `/^\S+@\S+\.\S+$/` pide "algo sin espacios, arroba, algo, punto, algo".
3. **Dos estados.** `useState<Formulario>(VACIO)` y `useState<ErroresFormulario>({})`. El genérico explícito es importante en el segundo: con `useState({})` TypeScript deduciría el tipo `{}` y no podrías leer `errores.nombre`.
4. **Un solo manejador de cambios.** Los inputs tienen `name` igual a su campo. `e.target.name` es `string`, así que lo conviertes con `as keyof Formulario`. Luego actualizas con una **propiedad computada**: `{ ...anterior, [campo]: valor }`.
5. **El envío.** `e.preventDefault()` evita que el navegador recargue la página (el comportamiento por defecto de un `<form>`). Validas, guardas los errores y solo si no hay ninguno llamas a `onRegistrar(datos)`.
6. **Mostrar errores.** `{errores.nombre && <p>{errores.nombre}</p>}`: si no hay mensaje (`undefined`), no se pinta nada.
7. **`noValidate`** desactiva la validación propia del navegador (por el `type="email"`), para que mande la tuya y los mensajes sean siempre los mismos.

```tsx
function manejarCambio(e: ChangeEvent<HTMLInputElement>) {
  const campo = e.target.name as keyof Formulario;
  const valor = e.target.value;
  setDatos((anterior) => ({ ...anterior, [campo]: valor }));
}

function manejarEnvio(e: SubmitEvent<HTMLFormElement>) {
  e.preventDefault();
  const nuevosErrores = validarFormulario(datos);
  setErrores(nuevosErrores);
  if (Object.keys(nuevosErrores).length === 0) onRegistrar(datos);
}
```

Sobre el tipo del envío: en las versiones anteriores de los tipos de React se usaba `FormEvent<HTMLFormElement>`. En React 19 está marcado como obsoleto y el tipo correcto para `onSubmit` es `SubmitEvent`. Si en un proyecto ves `FormEvent`, es lo mismo con el nombre viejo.

## Por qué funciona

Recorrido del test "con datos válidos llama a onRegistrar y borra los errores":

| Acción | `datos` | `errores` | Se ve |
|---|---|---|---|
| (inicio) | `{ nombre: "", email: "", password: "" }` | `{}` | inputs vacíos |
| clic en Registrarme | igual | los 3 mensajes | 3 `<p>` de error; `onRegistrar` no se llama |
| escribe "Angel" en Nombre | `{ nombre: "Angel", ... }` | igual (aún no revalida) | |
| escribe email y contraseña | los tres llenos | igual | |
| clic en Registrarme | igual | `{}` | sin errores; `onRegistrar(datos)` |

¿Por qué `e.target.value` es `string` sin hacer nada? Porque `ChangeEvent<HTMLInputElement>` dice que `e.target` es un `HTMLInputElement`, y su `value` es `string`. Con `any` perderías esa información (y el autocompletado de `e.target.checked`, `e.target.files`, etc.).

¿Y por qué guardar el valor en `const valor` antes del `setDatos`? La función que le pasas a `setDatos` puede ejecutarse un poco después; leer el evento antes es más seguro y más claro.

## Errores comunes

- **`useState({})` para los errores**, sin genérico. TypeScript deduce el tipo `{}` (un objeto sin propiedades conocidas) y `errores.nombre` da error de tipos: "La propiedad 'nombre' no existe en el tipo '{}'".
- **`(e: any)` en los manejadores.** Compila, pero pierdes la revisión de tipos justo donde entran los datos del usuario.
- **Olvidar `e.preventDefault()`.** En el navegador real la página se recarga y pierdes el estado. (En los tests no se nota tanto, pero es el bug clásico.)
- **Usar `else if` en la validación.** Solo verías el primer error y el test "enviar vacío muestra los tres errores" falla.
- **Llamar a `onRegistrar` aunque haya errores**, o revisar `errores` (el estado viejo) en vez de `nuevosErrores`. `setErrores` no cambia `errores` en este render: el valor nuevo llega en el siguiente. Por eso se decide con la variable local.
- **Inputs no controlados mezclados** (`value` sin `onChange`). React avisa que el campo es de solo lectura y no puedes escribir.
- **`<label>` sin `htmlFor`.** El clic en la etiqueta no enfoca el input, los lectores de pantalla no lo asocian y `getByLabelText` no lo encuentra.

## Otra forma de resolverlo

**Un manejador por campo**, sin `name` ni `as`:

```tsx
<input
  id="email"
  value={datos.email}
  onChange={(e) => setDatos({ ...datos, email: e.target.value })}
/>
```

Aquí no hace falta tipar `e`: como la función está escrita **dentro** de `onChange`, TypeScript la tipa por contexto (`ChangeEvent<HTMLInputElement>`). Es más explícito y no necesita la conversión `as keyof Formulario`, a cambio de repetir el patrón en cada input.

**Con React Hook Form**, en proyectos reales:

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<Formulario>();
<input {...register("email", { pattern: /^\S+@\S+\.\S+$/ })} />
```

**¿Cuándo conviene?** El manejador único escala mejor con formularios largos. El manejador por campo es más fácil de leer con 2 o 3 campos y no tiene conversiones. React Hook Form conviene en formularios grandes (menos renders, validación integrada), pero en una prueba técnica casi siempre piden hacerlo a mano para ver que entiendes los inputs controlados.

## Cómo explicarlo en la entrevista

> "Tipé el estado con `useState<Formulario>` y los errores con `Partial<Record<keyof Formulario, string>>`, porque solo existen los campos que fallan. Los inputs son controlados y comparten un manejador tipado con `ChangeEvent<HTMLInputElement>`: uso el `name` del input como clave, con una propiedad computada. La validación está en una función pura aparte, así la pruebo sin renderizar y la puedo reutilizar. Al enviar hago `preventDefault`, valido, guardo los errores y solo llamo a `onRegistrar` si no hay ninguno, usando el resultado local y no el estado, que todavía no se actualizó."

## Conceptos

- **`useState<T>`** con genérico explícito (tema de Aprender: React con TypeScript).
- **Tipos de eventos de React**: `ChangeEvent<HTMLInputElement>`, `SubmitEvent<HTMLFormElement>`.
- **Inputs controlados**: `value` + `onChange`.
- **Propiedades computadas** `{ [campo]: valor }`.
- **`Partial`, `Record` y `keyof`** (tema de Aprender: utility types).
- **Funciones puras** para la lógica, separadas del componente.
- **`preventDefault`** en el envío de formularios.
- **Renderizado condicional** con `&&`.
- **Accesibilidad**: `<label htmlFor>` asociado al `id` del input.
- **Expresiones regulares** básicas para validar un email.
