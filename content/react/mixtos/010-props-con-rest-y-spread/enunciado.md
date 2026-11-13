Crea un componente `Boton` reutilizable. Maneja él mismo algunas props (la variante de color y las clases) y **pasa todo lo demás tal cual** al `<button>` real: `onClick`, `disabled`, `type`, `aria-label`, etc.

## Reglas

- Exporta el componente `Boton`. Las props que maneja él mismo son `variante`, `className` y `children`.
- Renderiza un `<button>` con `children` adentro.
- Su `className` es `boton boton-{variante}`. Si no pasan `variante`, usa `"primario"`.
- Si pasan `className`, se agrega al final separado por un espacio: `boton boton-primario ancho`.
- **Nunca** debe quedar un espacio sobrante al final: sin `className` extra, la clase es exactamente `boton boton-peligro`.
- Cualquier otra prop (`onClick`, `disabled`, `type`, `aria-label`...) llega al `<button>` sin que tengas que nombrarla.

## Ejemplo

```jsx
<Boton variante="peligro" onClick={borrar} aria-label="Borrar pedido">
  Borrar
</Boton>
// <button class="boton boton-peligro" aria-label="Borrar pedido">Borrar</button>

<Boton className="ancho" type="submit">Enviar</Boton>
// <button class="boton boton-primario ancho" type="submit">Enviar</button>
```

## Por qué importa

Es la base de cualquier librería de componentes (botones, inputs, tarjetas). Si tuvieras que listar a mano cada prop posible del `<button>`, nunca terminarías. Con **rest** (`...resto`) en la desestructuración y **spread** (`{...resto}`) en el JSX, tu componente acepta todo lo que acepta un botón normal. Te lo preguntarán como "¿cómo harías un componente envoltorio?".
