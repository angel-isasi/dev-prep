## Idea clave

La validación es una **función pura aparte** (`validarPedido`): recibe datos y devuelve errores. El componente solo guarda lo que se escribe, llama a esa función al enviar y pinta el resultado. Así puedes probar y reutilizar las reglas sin renderizar nada.

## Paso a paso

1. **Escribe `validarPedido` primero.** Empieza con `const errores = {}` y agrega una clave solo si ese campo está mal. Si no hay errores, el objeto queda vacío.
   - Nombre: `nombre.trim().length < 3`.
   - Celular: `telefono.replace(/\s/g, "")` quita todos los espacios y `/^9\d{8}$/` exige un 9 al inicio (`^9`), luego 8 dígitos (`\d{8}`) y nada más (`$`).
2. **Un solo estado para los datos**: `{ nombre, telefono, tamano }`, con `tamano: "M"` por defecto.
3. **Un solo manejador `cambiar`** para los tres campos. Cada input tiene `name`, y `[evento.target.name]` (propiedad calculada) decide qué clave actualizar.
4. **Al enviar**: `preventDefault()` para que el navegador no recargue la página, `validarPedido(datos)`, guardar los errores y marcar `enviado` si `Object.keys(errores).length === 0`.
5. **Accesibilidad**: `<label htmlFor="nombre">` + `<input id="nombre">` conecta la etiqueta con el campo (por eso funciona `getByLabelText`). `aria-invalid` avisa al lector de pantalla que el campo tiene error y `role="alert"` hace que lea el mensaje en cuanto aparece.
6. **`noValidate`** en el `<form>` apaga la validación nativa del navegador para que mande la tuya.

```jsx
import { useState } from "react";

export function validarPedido({ nombre, telefono }) {
  const errores = {};
  if (nombre.trim().length < 3) {
    errores.nombre = "Escribe tu nombre completo";
  }
  if (!/^9\d{8}$/.test(telefono.replace(/\s/g, ""))) {
    errores.telefono = "El celular debe tener 9 dígitos y empezar con 9";
  }
  return errores;
}

export function FormularioPedido() {
  const [datos, setDatos] = useState({ nombre: "", telefono: "", tamano: "M" });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const cambiar = (evento) =>
    setDatos((anteriores) => ({ ...anteriores, [evento.target.name]: evento.target.value }));

  function enviar(evento) {
    evento.preventDefault();
    const encontrados = validarPedido(datos);
    setErrores(encontrados);
    setEnviado(Object.keys(encontrados).length === 0);
  }

  if (enviado) {
    return (
      <p>
        Listo, {datos.nombre.trim()}. Tu pizza {datos.tamano} está en camino y te llamaremos al{" "}
        {datos.telefono}.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={datos.nombre} onChange={cambiar} aria-invalid={Boolean(errores.nombre)} />
      {errores.nombre && <p role="alert">{errores.nombre}</p>}

      <label htmlFor="telefono">Celular</label>
      <input id="telefono" name="telefono" inputMode="numeric" value={datos.telefono} onChange={cambiar} aria-invalid={Boolean(errores.telefono)} />
      {errores.telefono && <p role="alert">{errores.telefono}</p>}

      <label htmlFor="tamano">Tamaño</label>
      <select id="tamano" name="tamano" value={datos.tamano} onChange={cambiar}>
        <option value="M">Mediana</option>
        <option value="L">Familiar</option>
      </select>

      <button type="submit">Hacer pedido</button>
    </form>
  );
}
```

## Por qué funciona

Recorrido del ejemplo:

| Momento | `datos` | `validarPedido(datos)` | Se ve |
|---|---|---|---|
| Envía vacío | `{ nombre: "", telefono: "", tamano: "M" }` | `{ nombre: "...", telefono: "..." }` | 2 alertas, ambos `aria-invalid="true"` |
| Escribe nombre y reenvía | `{ nombre: "Angel Isasi", telefono: "", ... }` | `{ telefono: "..." }` | 1 alerta |
| Celular y tamaño L, envía | `{ nombre: "Angel Isasi", telefono: "987654321", tamano: "L" }` | `{}` | El resumen |

Detalle del regex con `"987 654 321"`: `replace(/\s/g, "")` da `"987654321"`; `^9` coincide con el primer 9, `\d{8}` con `87654321` y `$` confirma que no sobra nada. Con `"887654321"` falla en `^9`; con `"98765432"` (8 dígitos) falla porque `\d{8}` necesita 8 **después** del 9.

`aria-invalid={Boolean(errores.nombre)}`: si hay mensaje, `Boolean("Escribe...")` es `true`; si no, `Boolean(undefined)` es `false`. React lo escribe en el HTML como `"true"` o `"false"`.

## Errores comunes

- **Olvidar `preventDefault()`**: el navegador intenta enviar el formulario y recargar. En los tests no lo notas tanto, pero en el navegador la página parpadea y se pierde el estado.
- **Validar dentro del JSX o en cada `onChange`** con la lógica mezclada en el componente. Funciona, pero no puedes probar las reglas por separado y se repiten si otro formulario las necesita.
- **Regex sin `^` y `$`**: `/9\d{8}/` acepta `"abc9876543210xyz"` porque solo busca el patrón **en alguna parte**.
- **Un `useState` por campo y un manejador por campo**: tres estados, tres funciones casi iguales. Con un objeto y `[e.target.name]` lo resuelves una vez (y si olvidas el atributo `name`, el estado se llena con una clave `""`: así lo reconoces).
- **Mensajes de error sin `role="alert"` ni relación con el campo**: se ven, pero un lector de pantalla no los anuncia.

## Otra forma de resolverlo

Validar **en vivo**, sin guardar los errores en el estado: se derivan de los datos, y solo se muestran después del primer intento de envío.

```jsx
export function FormularioPedido() {
  const [datos, setDatos] = useState({ nombre: "", telefono: "", tamano: "M" });
  const [intentado, setIntentado] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const errores = intentado ? validarPedido(datos) : {}; // derivado, no estado

  function enviar(evento) {
    evento.preventDefault();
    setIntentado(true);
    if (Object.keys(validarPedido(datos)).length === 0) setEnviado(true);
  }
  // ... el mismo JSX
}
```

**¿Cuándo conviene?** Cuando quieres que el error desaparezca **mientras** el usuario corrige, sin esperar a que vuelva a enviar. Es mejor experiencia en formularios largos. La versión principal es más simple de explicar: los errores cambian solo al enviar. En proyectos reales se usan librerías como React Hook Form o Zod, pero en la entrevista te piden hacerlo a mano.

## Cómo explicarlo en la entrevista

> "Separé las reglas en una función pura, `validarPedido`, que recibe los datos y devuelve un objeto de errores: vacío si todo está bien. Eso me deja probarla sin renderizar y reutilizarla. El componente guarda los campos en un solo objeto con un manejador genérico que usa el `name` del input. Al enviar hago `preventDefault`, valido, guardo los errores y, si no hay ninguno, muestro el resumen. Para accesibilidad uso labels conectados con `htmlFor`, `aria-invalid` en los campos con error y `role='alert'` en los mensajes para que el lector de pantalla los anuncie."

## Conceptos

- **Función pura de validación**: datos de entrada, errores de salida; sin estado ni efectos.
- **Expresiones regulares**: `^` inicio, `$` fin, `\d` dígito, `{8}` exactamente 8 veces, `\s` espacio, `g` todas las coincidencias.
- **Propiedad calculada** `{ [clave]: valor }`: usar el contenido de una variable como nombre de propiedad.
- **Inputs y select controlados**: `value` + `onChange`.
- **`onSubmit` + `preventDefault()`**: manejar el envío sin recargar la página.
- **`noValidate`**: desactiva la validación nativa del navegador.
- **Accesibilidad en formularios**: `label htmlFor`, `aria-invalid`, `role="alert"`.
- **Renderizado condicional con `return` temprano**: si ya se envió, se muestra otra cosa.
