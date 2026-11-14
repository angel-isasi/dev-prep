Crea el componente `Boton` de un sistema de diseño, con sus **props tipadas**. Es el primer componente que se escribe en casi cualquier proyecto con TypeScript, y en entrevistas lo usan para ver si sabes tipar props de verdad (sin `any`).

## Reglas

- Exporta el tipo `Variante`: una **unión de literales** con exactamente `"primario"`, `"secundario"` y `"peligro"`.
- Exporta el tipo `BotonProps` con estas props:
  - `variante` (opcional, tipo `Variante`, por defecto `"primario"`).
  - `children` (obligatorio): lo que va dentro del botón. Usa el tipo `ReactNode` de React.
  - `onClick` (opcional): una función sin parámetros que no devuelve nada.
  - `deshabilitado` (opcional, booleano, por defecto `false`).
- Renderiza un `<button>` con:
  - `type="button"` (para que dentro de un formulario no lo envíe por accidente).
  - `className` igual a `"boton boton--<variante>"`, por ejemplo `"boton boton--peligro"`.
  - `disabled` según `deshabilitado`.
  - `onClick` conectado a la prop.
- TypeScript debe **rechazar** una variante inventada (`variante="rojo"`) y un botón sin `children`. Los tests lo revisan con `@ts-expect-error`.

## Ejemplos

```tsx
<Boton onClick={guardar}>Guardar</Boton>
// <button type="button" class="boton boton--primario">Guardar</button>

<Boton variante="peligro" deshabilitado>Eliminar</Boton>
// <button type="button" class="boton boton--peligro" disabled>Eliminar</button>

<Boton variante="rojo">Hola</Boton>
// Error de TypeScript: "rojo" no es una Variante

<Boton />
// Error de TypeScript: falta la prop children
```

## Por qué importa

Un `variante: string` acepta cualquier texto y el error ("primarioo") recién se ve en pantalla, sin estilos. Con una unión de literales, VS Code te autocompleta las tres opciones y marca en rojo cualquier otra **antes** de ejecutar. Es la ventaja número uno que se menciona cuando preguntan "¿por qué TypeScript en React?".
