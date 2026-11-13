## Idea clave

**Rest** en los parámetros separa las props que tu componente maneja de "todo lo demás"; **spread** en el JSX reparte ese "todo lo demás" al `<button>` real. Así el componente acepta cualquier atributo de un botón sin listarlos.

## Paso a paso

1. **Desestructura lo que usas**: `variante`, `className` y `children`, con valores por defecto (`"primario"` y `""`).
2. **Junta el resto**: `...resto` es un objeto nuevo con todas las props que no nombraste (`onClick`, `disabled`, `type`, `aria-label`...).
3. **Arma la clase** con un template string. Si `className` es `""`, quedaría `"boton boton-peligro "` con un espacio al final; `trim()` lo quita.
4. **Reparte el resto** con `{...resto}` en el `<button>`. Es como escribir `onClick={resto.onClick} disabled={resto.disabled} ...` uno por uno.
5. **`children`** es lo que va entre `<Boton>` y `</Boton>`.

```jsx
export function Boton({ variante = "primario", className = "", children, ...resto }) {
  const clases = `boton boton-${variante} ${className}`.trim();

  return (
    <button className={clases} {...resto}>
      {children}
    </button>
  );
}
```

## Por qué funciona

Con `<Boton variante="peligro" disabled={false} onClick={fn} aria-label="Borrar pedido">Borrar</Boton>`, React llama a `Boton` con este objeto de props:

```js
{ variante: "peligro", disabled: false, onClick: fn, "aria-label": "Borrar pedido", children: "Borrar" }
```

La desestructuración lo reparte así:

| Variable | Valor |
|---|---|
| `variante` | `"peligro"` |
| `className` | `""` (valor por defecto) |
| `children` | `"Borrar"` |
| `resto` | `{ disabled: false, onClick: fn, "aria-label": "Borrar pedido" }` |

`clases` es `"boton boton-peligro "` y tras `trim()` queda `"boton boton-peligro"`. `{...resto}` pone `disabled`, `onClick` y `aria-label` en el `<button>`. Por eso el click llega a `fn` y `getByLabelText("Borrar pedido")` lo encuentra.

¿Por qué `className` no va en `resto`? Porque lo nombraste en la desestructuración; si no lo hicieras, el `{...resto}` traería el `className` del usuario y **pisaría** el tuyo (o el tuyo lo pisaría a él, según el orden).

## Errores comunes

- **No sacar `className` del resto.** Si escribes `<button className={clases} {...resto}>` y `resto` trae `className="ancho"`, el spread va después y reemplaza tus clases: el botón queda solo con `"ancho"`.
- **Poner `{...resto}` antes y luego `onClick={...}` propio.** El atributo que va **después** gana. El orden importa.
- **Olvidar `trim()`.** La clase termina en espacio y la comparación exacta falla (`"boton boton-peligro "`).
- **Usar `class` en vez de `className`.** En JSX el atributo es `className`.
- **Pasar props inventadas al DOM.** Si `resto` trae algo como `variante` (porque no lo sacaste), React lo pone como atributo HTML y muestra una advertencia en la consola. Saca siempre lo que no es un atributo válido.

## Otra forma de resolverlo

Construyendo las clases con un arreglo y `filter(Boolean)`, útil cuando hay varias clases opcionales:

```jsx
export function Boton({ variante = "primario", className, tamano, children, ...resto }) {
  const clases = ["boton", `boton-${variante}`, tamano && `boton-${tamano}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={clases} {...resto}>
      {children}
    </button>
  );
}
```

**¿Cuándo conviene?** Cuando hay muchas clases condicionales: `filter(Boolean)` descarta `undefined`, `""` y `false` sin `if`. En proyectos reales se usa la librería `clsx` para lo mismo. Con solo una clase opcional, el template string con `trim()` basta.

## Cómo explicarlo en la entrevista

> "Desestructuro las props que el componente usa, `variante`, `className` y `children`, con valores por defecto, y con rest junto todas las demás en `resto`. En el JSX hago spread de `resto` sobre el `<button>`, así acepta `onClick`, `disabled`, `type` o cualquier atributo de accesibilidad sin que yo los liste. Saco `className` del resto a propósito para combinarlo con mis clases en vez de pisarlas, y uso `trim()` para no dejar espacios sobrantes."

## Conceptos

- **Rest en desestructuración** (`...resto`): junta las propiedades no nombradas en un objeto.
- **Spread de props** (`{...resto}`): reparte un objeto como atributos en JSX.
- **Valores por defecto**: `variante = "primario"` cuando la prop no llega.
- **`children`**: contenido entre las etiquetas de apertura y cierre del componente.
- **Orden de props**: la última en escribirse gana.
- **Componente envoltorio**: agrega estilo o lógica a un elemento nativo sin limitarlo.
- **`filter(Boolean)` + `join`**: armar listas de clases condicionales.
