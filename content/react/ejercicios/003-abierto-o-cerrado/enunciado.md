Crea el componente `Estado`, que indica si la pizzería está atendiendo. Recibe la prop booleana `abierto` y muestra un texto distinto según su valor.

## Reglas

- Devuelve un párrafo `<p>`.
- Si `abierto` es `true`, el texto es exactamente **"Abierto ahora"**.
- Si `abierto` es `false`, el texto es exactamente **"Cerrado"**.
- Solo se muestra uno de los dos textos, nunca ambos.
- Decide el texto con el **operador ternario** (`condición ? a : b`) dentro del JSX.

## Ejemplo

```jsx
<Estado abierto={true} />
<Estado abierto={false} />
```

| Prop `abierto` | Se ve |
|---|---|
| `true` | Abierto ahora |
| `false` | Cerrado |

## Por qué importa

Mostrar una cosa u otra según un dato (logueado o no, cargando o listo, con stock o agotado) es lo que más vas a hacer en React. Se llama **renderizado condicional** y el ternario es su herramienta básica.
