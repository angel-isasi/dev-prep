## En una frase

Un formulario en React se maneja de dos formas: **controlado** (React guarda cada valor en el estado y el input solo lo muestra) o **no controlado** (el DOM guarda los valores y tú los lees al enviar con `FormData`).

## Lo esencial

### Input controlado: `value` + `onChange`

```jsx
function Buscador() {
  const [texto, setTexto] = useState("");

  return (
    <input
      value={texto}                              // el input muestra lo que dice el estado
      onChange={(e) => setTexto(e.target.value)} // cada tecla actualiza el estado
    />
  );
}
```

El ciclo es: escribes, `onChange` llama a `setTexto`, React vuelve a renderizar y el input muestra el nuevo `texto`. El estado es la **única fuente de verdad**. Úsalo cuando necesites el valor **mientras** el usuario escribe: contador de caracteres, filtro en vivo, validar al vuelo, deshabilitar un botón.

### Input no controlado: `FormData` y `defaultValue`

```jsx
function Contacto({ onEnviar }) {
  function manejarEnvio(e) {
    e.preventDefault();                          // sin esto el navegador recarga la página
    const datos = new FormData(e.currentTarget); // lee todos los campos que tengan name
    onEnviar({ nombre: datos.get("nombre"), mensaje: datos.get("mensaje") });
  }

  return (
    <form onSubmit={manejarEnvio}>
      <input name="nombre" defaultValue="Ana" required />  {/* valor inicial, luego manda el DOM */}
      <textarea name="mensaje" />
      <button>Enviar</button>
    </form>
  );
}
```

Sin `useState`: el DOM guarda los valores y los lees solo al enviar. Es más simple cuando no necesitas reaccionar a cada tecla. `Object.fromEntries(new FormData(form))` te da un objeto con todo de una vez.

| | Controlado | No controlado |
|---|---|---|
| Dónde vive el valor | estado de React | el DOM |
| Valor inicial | `useState("Ana")` + `value` | `defaultValue="Ana"` |
| Lees el valor | siempre, en `texto` | al enviar, con `FormData` |

### Checkbox, select y textarea

```jsx
// checkbox: se usa checked y e.target.checked (un booleano), NO value
<input
  type="checkbox"
  checked={acepta}
  onChange={(e) => setAcepta(e.target.checked)}
/>

// select: value va en el <select>, no en <option selected>
<select value={tamano} onChange={(e) => setTamano(e.target.value)}>
  <option value="m">Mediana</option>
  <option value="f">Familiar</option>
</select>

// textarea: en React usa value, no texto entre las etiquetas
<textarea value={comentario} onChange={(e) => setComentario(e.target.value)} />
```

Ojo: `e.target.value` **siempre es string**, incluso en `type="number"`. Convierte con `Number(e.target.value)` si vas a sumar.

### `onSubmit` en el `<form>`, no `onClick` en el botón

```jsx
<form onSubmit={(e) => {
  e.preventDefault();   // evita la recarga de la página
  guardar();
}}>
  <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
  <button>Guardar</button>   {/* dentro de un form, un button es type="submit" */}
</form>
```

Con `onSubmit` también se envía al presionar **Enter** dentro de un input. Con `onClick` en el botón, Enter no funcionaría igual.

Dato de React 19: también puedes pasar una función a `<form action={fn}>`. React la llama con el `FormData` (no necesitas `preventDefault`) y, al terminar, limpia los campos no controlados.

### Un solo estado objeto para varios campos

```jsx
const [form, setForm] = useState({ nombre: "", email: "", promo: false });

function cambiar(e) {
  const { name, type, value, checked } = e.target;
  setForm((anterior) => ({
    ...anterior,                                   // copia los demás campos
    [name]: type === "checkbox" ? checked : value, // propiedad computada: la clave sale de name
  }));
}

<input name="nombre" value={form.nombre} onChange={cambiar} />
<input name="email" value={form.email} onChange={cambiar} />
<input name="promo" type="checkbox" checked={form.promo} onChange={cambiar} />
```

Un solo manejador sirve para todos los campos porque cada input tiene su `name`, igual a la clave del objeto.

### Validación con errores accesibles

```jsx
function Registro({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function enviar(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Ingresa un correo válido");
      return;                              // no envía si hay error
    }
    setError("");
    onSubmit({ email });
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="email">Correo</label>
      <input
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={error ? "true" : "false"}           // el lector de pantalla dice "inválido"
        aria-describedby={error ? "email-error" : undefined} // y lee el mensaje
      />
      {error && <p id="email-error" role="alert">{error}</p>}
      <button>Crear cuenta</button>
    </form>
  );
}
```

- `htmlFor` + `id` une la etiqueta con el input (en JSX es `htmlFor`, no `for`).
- `aria-invalid` marca el campo con error; `aria-describedby` apunta al mensaje.
- `role="alert"` hace que el mensaje se anuncie apenas aparece.
- Separa la validación en una **función pura** (`validar(datos)` que devuelve un objeto de errores): es fácil de probar sola.

## Errores típicos

**1. `value` sin `onChange`.** El input queda congelado: escribes y no cambia nada, y React avisa en la consola.

```jsx
<input value={nombre} />   // solo lectura sin querer
```

Agrega `onChange`, o usa `defaultValue` si no quieres controlarlo.

**2. Olvidar `preventDefault`.** El navegador envía el formulario a la manera antigua y **recarga la página**: se pierde todo el estado.

```jsx
<form onSubmit={() => guardar(datos)}>   // recarga la página
```

**3. Reemplazar el objeto en vez de copiarlo.** `setForm` no mezcla: reemplaza.

```jsx
setForm({ [e.target.name]: e.target.value });
// form era { nombre, email } y ahora es solo { nombre }: email desapareció
```

Siempre `{ ...anterior, [name]: value }`.

**4. Checkbox con `value` en vez de `checked`.**

```jsx
<input type="checkbox" value={acepta} onChange={(e) => setAcepta(e.target.value)} />
// e.target.value es un texto, no true/false: acepta nunca será un booleano real
```

Usa `checked={acepta}` y `e.target.checked`.

**5. Sumar el valor de un input numérico sin convertirlo.**

```jsx
setCantidad(e.target.value);   // "2" (string)
cantidad + 1;                  // "21", no 3
```

Usa `Number(e.target.value)`.

**6. Pasar de `undefined` a un valor.** Si el estado empieza en `undefined`, el input nace no controlado y luego pasa a controlado: React lanza una advertencia. Inicia siempre con `""` (o `false` en un checkbox).

## Chuleta

- **Controlado**: `value={estado}` + `onChange={(e) => setEstado(e.target.value)}`. El estado manda.
- **No controlado**: `name` en cada campo + `defaultValue` + `new FormData(e.currentTarget)` al enviar.
- Checkbox: `checked` y `e.target.checked`. Select: `value` en el `<select>`. Textarea: `value`.
- `e.target.value` siempre es string: convierte con `Number()`.
- `onSubmit` en el `<form>` + `e.preventDefault()`. Enter también envía.
- Varios campos: un objeto, un manejador, `{ ...anterior, [name]: valor }`.
- Errores: `htmlFor` + `id`, `aria-invalid`, `aria-describedby`, `role="alert"`. Valida con una función pura.

## En la entrevista

**¿Qué es un componente controlado?**
Un input cuyo valor vive en el estado de React: le pasas `value` y lo actualizas en `onChange`. El estado es la única fuente de verdad, así que puedes validar, transformar o reaccionar a cada tecla.

**¿Cuándo usarías uno no controlado?**
Cuando solo necesito los valores al enviar, por ejemplo un formulario de contacto simple. Pongo `name` en cada campo y leo todo con `FormData` en el `onSubmit`. Es menos código y menos renders. También en un `<input type="file">`, que siempre es no controlado.

**¿Por qué `e.preventDefault()` en el submit?**
Porque el comportamiento por defecto de un `<form>` es enviar los datos y recargar la página. En una SPA eso borraría el estado; lo evitamos y manejamos el envío con JavaScript.

**¿Cómo manejas un formulario con muchos campos?**
Con un solo estado objeto y un solo manejador que usa `e.target.name` como clave: `setForm(f => ({ ...f, [name]: value }))`. Para formularios grandes en un proyecto real se usa una librería como React Hook Form.

**¿Cómo haces accesible un mensaje de error?**
Uno el label con el input usando `htmlFor` e `id`, marco el campo con `aria-invalid="true"`, conecto el mensaje con `aria-describedby` y le pongo `role="alert"` para que el lector de pantalla lo anuncie.
