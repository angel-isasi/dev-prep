## Idea clave

**Currying** es transformar una función de varios argumentos en una cadena de funciones de un argumento: en vez de `cambiar(campo, evento)`, escribes `cambiar(campo)(evento)`. Así `cambiar("nombre")` te devuelve un manejador **ya configurado** para ese campo, que es justo lo que `onChange` espera: una función que recibe el evento.

## Paso a paso

1. **Un solo estado para el formulario**: `useState({ nombre: "", distrito: "" })`. Cada clave es un campo.
2. **La fábrica de manejadores**: `const cambiar = (campo) => (evento) => ...`. Son dos flechas seguidas:
   - La de afuera recibe `campo` y **devuelve** la de adentro.
   - La de adentro recibe el `evento` (la llama React cuando el usuario escribe) y actualiza el estado.
3. **Actualización inmutable con clave dinámica**: `{ ...anteriores, [campo]: evento.target.value }`.
   - `...anteriores` copia todos los campos (por eso no se borra el otro).
   - `[campo]` entre corchetes es una **propiedad computada**: usa el **valor** de la variable como nombre de la clave. Si `campo` es `"nombre"`, equivale a `nombre: ...`.
4. **Forma funcional de `setDatos`**: `setDatos((anteriores) => ...)` recibe siempre el estado más reciente, aunque se disparen varios cambios seguidos.
5. **Conectar**: `onChange={cambiar("nombre")}`. Fíjate en que aquí **sí** llamas a `cambiar` (con paréntesis), porque lo que quieres pasarle a `onChange` es lo que `cambiar` devuelve.

```jsx
import { useState } from "react";

export function Registro() {
  const [datos, setDatos] = useState({ nombre: "", distrito: "" });

  const cambiar = (campo) => (evento) =>
    setDatos((anteriores) => ({ ...anteriores, [campo]: evento.target.value }));

  return (
    <form>
      <input aria-label="Nombre" value={datos.nombre} onChange={cambiar("nombre")} />
      <input aria-label="Distrito" value={datos.distrito} onChange={cambiar("distrito")} />
      <output>
        {datos.nombre} / {datos.distrito}
      </output>
    </form>
  );
}
```

## Por qué funciona

Recorrido escribiendo "Ana" y luego "Ica":

1. En el render, `cambiar("nombre")` se ejecuta y devuelve una función nueva. Esa función recuerda `campo = "nombre"` gracias al **closure**. Lo mismo para `"distrito"`.
2. El usuario escribe "Ana". React llama al manejador del nombre con el evento:

| Paso | `anteriores` | `campo` | Nuevo estado |
|---|---|---|---|
| Escribe "Ana" en Nombre | `{ nombre: "", distrito: "" }` | `"nombre"` | `{ nombre: "Ana", distrito: "" }` |
| Escribe "Ica" en Distrito | `{ nombre: "Ana", distrito: "" }` | `"distrito"` | `{ nombre: "Ana", distrito: "Ica" }` |

3. Tras cada cambio React vuelve a renderizar, los inputs muestran los valores del estado y el `<output>` pinta `Ana / Ica`.

¿Por qué el `<output>` inicial es `" / "`? Porque `{datos.nombre}` y `{datos.distrito}` son textos vacíos y lo único que queda es el texto fijo `" / "` del JSX.

## Errores comunes

- **Pasar la función sin llamarla en el lugar equivocado.** `onChange={cambiar}` haría que React llame `cambiar(evento)`: el "campo" sería el evento y devolvería una función que nunca se ejecuta. Nada se actualiza.
- **Olvidar el spread** (`setDatos({ [campo]: valor })`). El estado queda con un solo campo y el otro input pasa a `undefined`; React avisa que el input cambió de controlado a no controlado.
- **Escribir `campo:` sin corchetes** (`{ ...anteriores, campo: valor }`). Crea una clave llamada literalmente `"campo"`. Lo reconoces porque los inputs no cambian y el estado tiene una propiedad extraña.
- **Leer `evento.target.value` dentro de un updater asíncrono en versiones viejas de React.** En React 16 el evento se reciclaba y daba `null`. En React 17+ ya no pasa, pero si quieres ser explícito, guarda el valor en una constante antes de llamar a `setDatos`.
- **Un manejador por campo.** No es un error, pero con diez campos son diez funciones casi iguales.

## Otra forma de resolverlo

Usar el atributo `name` del input en vez de currying:

```jsx
const cambiar = (evento) => {
  const { name, value } = evento.target;
  setDatos((anteriores) => ({ ...anteriores, [name]: value }));
};

<input name="nombre" aria-label="Nombre" value={datos.nombre} onChange={cambiar} />
<input name="distrito" aria-label="Distrito" value={datos.distrito} onChange={cambiar} />
```

**¿Cuándo conviene?** Es la forma más común en formularios HTML normales: un solo manejador, sin crear funciones nuevas por campo. El currying conviene cuando el "campo" no es un input con `name` (por ejemplo, un componente propio como `<SelectorDeColor onChange={cambiar("color")} />` que te devuelve un valor y no un evento), o cuando el manejador necesita más configuración que solo el nombre.

## Cómo explicarlo en la entrevista

> "Guardo el formulario en un solo objeto de estado y creo los manejadores con una función currificada: `cambiar('nombre')` devuelve el `onChange` de ese campo. Funciona porque la función interna es un closure que recuerda el campo. Dentro actualizo de forma inmutable con spread y una propiedad computada, `[campo]: valor`, usando la forma funcional del setter para partir siempre del estado más reciente. Así tengo un solo manejador para todos los campos. Otra opción equivalente es leer `name` del input."

## Conceptos

- **Currying**: convertir `f(a, b)` en `f(a)(b)`, una función que devuelve otra.
- **Closure**: la función devuelta recuerda `campo` aunque `cambiar` ya terminó.
- **Input controlado**: `value` viene del estado y `onChange` lo actualiza.
- **Propiedad computada**: `{ [variable]: valor }` usa el contenido de la variable como clave.
- **Spread de objetos**: `{ ...obj }` copia sus propiedades en un objeto nuevo.
- **Setter funcional**: `setDatos((anterior) => nuevo)` parte del estado más reciente.
- **`<output>`**: elemento HTML para mostrar el resultado de un cálculo o de un formulario.
