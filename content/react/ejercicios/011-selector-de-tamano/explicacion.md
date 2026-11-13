## Idea clave

Guarda en el estado **solo el tamaño elegido** y conecta el `<select>` a ese estado (componente **controlado**). El precio no es estado: se busca en una **tabla de precios** (un objeto) a partir del tamaño.

## Paso a paso

1. **Tabla de precios fuera del componente.** `const PRECIOS = { S: 20, M: 28, L: 36 }`. Va fuera porque nunca cambia: así no se vuelve a crear en cada render.
2. **Estado del tamaño.** `const [tamano, setTamano] = useState("M")`. `useState` devuelve el valor actual y una función para cambiarlo; `"M"` es el valor inicial.
3. **Select controlado.** En React el valor elegido se pone en el propio `<select>` con `value={tamano}`, no con `selected` en cada `<option>`. Y `onChange` lee la opción elegida en `evento.target.value` y la guarda en el estado.
4. **Etiqueta unida al select.** `<label htmlFor="tamano">` apunta al `id="tamano"`. En JSX se escribe `htmlFor` porque `for` es palabra reservada de JavaScript. Gracias a eso, `getByLabelText("Tamaño")` encuentra el select y un lector de pantalla lo anuncia bien.
5. **Precio derivado.** `PRECIOS[tamano]` busca la propiedad cuyo nombre es el valor de `tamano`: con `"L"` da `36`.

```jsx
import { useState } from "react";

// Tabla de precios: fuera del componente porque no cambia nunca.
const PRECIOS = { S: 20, M: 28, L: 36 };

export function Tamano() {
  const [tamano, setTamano] = useState("M");

  return (
    <div>
      <label htmlFor="tamano">Tamaño</label>
      <select
        id="tamano"
        value={tamano}
        onChange={(evento) => setTamano(evento.target.value)}
      >
        <option value="S">Personal</option>
        <option value="M">Mediana</option>
        <option value="L">Familiar</option>
      </select>

      <p>Precio: S/ {PRECIOS[tamano]}</p>
    </div>
  );
}
```

## Por qué funciona

Cada vez que llamas a `setTamano`, React vuelve a ejecutar `Tamano` con el nuevo valor y pinta de nuevo:

| Acción | `tamano` | `PRECIOS[tamano]` | Se pinta |
|---|---|---|---|
| Primer render | `"M"` | `28` | select en Mediana, Precio: S/ 28 |
| Elige Familiar | `"L"` | `36` | select en Familiar, Precio: S/ 36 |
| Elige Personal | `"S"` | `20` | select en Personal, Precio: S/ 20 |

El flujo siempre es el mismo: el usuario cambia el select, `onChange` actualiza el estado, React renderiza otra vez y tanto el `value` del select como el precio salen del estado nuevo. El estado es la **única fuente de verdad**.

## Errores comunes

- **Poner `selected` en una `<option>`.** En React se usa `value` en el `<select>`. Si pones `selected`, React muestra una advertencia en la consola.
- **`value` sin `onChange`.** El select queda "congelado": el usuario elige otra opción y vuelve sola a Mediana. React también avisa en la consola.
- **Guardar el precio en otro `useState`.** Tienes que acordarte de actualizar los dos a la vez; si se te olvida uno, el precio no coincide con el tamaño. El precio se calcula, no se guarda.
- **Usar `for` en vez de `htmlFor`.** La etiqueta no queda unida al select y `getByLabelText("Tamaño")` falla.
- **Escribir los precios con `if` o `switch` dentro del render.** Funciona, pero es más largo y más fácil de equivocar que un objeto. Si mañana agregan un tamaño XL, con el objeto solo agregas una línea.

## Otra forma de resolverlo

Generar las opciones desde un arreglo de datos, con el precio incluido:

```jsx
import { useState } from "react";

const TAMANOS = [
  { valor: "S", texto: "Personal", precio: 20 },
  { valor: "M", texto: "Mediana", precio: 28 },
  { valor: "L", texto: "Familiar", precio: 36 },
];

export function Tamano() {
  const [tamano, setTamano] = useState("M");
  const elegido = TAMANOS.find((t) => t.valor === tamano);

  return (
    <div>
      <label htmlFor="tamano">Tamaño</label>
      <select id="tamano" value={tamano} onChange={(e) => setTamano(e.target.value)}>
        {TAMANOS.map((t) => (
          <option key={t.valor} value={t.valor}>{t.texto}</option>
        ))}
      </select>
      <p>Precio: S/ {elegido.precio}</p>
    </div>
  );
}
```

**¿Cuándo conviene?** Cuando las opciones vienen de una API o son muchas: tienes todo en un solo lugar y el JSX no se repite. Con tres opciones fijas, escribirlas a mano es igual de claro.

## Cómo explicarlo en la entrevista

> "Guardo en el estado solo el tamaño elegido, con `useState('M')`, y hago el select controlado: el `value` va en el select y `onChange` actualiza el estado. El precio no lo guardo, lo calculo buscando en un objeto `PRECIOS` que está fuera del componente porque no cambia. Así el estado es la única fuente de verdad y el precio nunca puede quedar desincronizado. La etiqueta la uno con `htmlFor` e `id` para que sea accesible."

## Conceptos

- **`useState`**: guarda un valor entre renders y avisa a React para volver a pintar cuando cambia.
- **Componente controlado**: el valor del campo vive en el estado (`value` + `onChange`).
- **`<select>` en React**: el valor elegido se pone con `value` en el select, no con `selected`.
- **Estado derivado**: el precio se calcula a partir del tamaño, no se guarda aparte.
- **Tabla de búsqueda**: un objeto que reemplaza una cadena de `if` (`PRECIOS[tamano]`).
- **`htmlFor`**: el `for` de HTML escrito en JSX; une una etiqueta con su campo.
