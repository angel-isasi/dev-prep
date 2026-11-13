Crea el componente `Buscador` que recibe una lista de textos en la prop `items` y la filtra **mientras el usuario escribe**.

## Reglas

- Un `<input>` con la etiqueta accesible **"Buscar"** (usa `aria-label="Buscar"` o un `<label>`).
- Debajo, una lista `<ul>` con un `<li>` por cada item que coincide.
- Al inicio, con el buscador vacío, se muestran **todos** los items.
- La búsqueda no distingue mayúsculas ni **tildes**: `"comunicacion"` encuentra `"Comunicación"`.
- Ignora los espacios al inicio y al final de lo que se escribe.
- Si nada coincide, en lugar de la lista muestra un texto que empiece con **"Sin resultados"**.

## Ejemplo

```jsx
<Buscador items={["Arqueología", "Turismo", "Comunicación"]} />
```

| El usuario escribe | Se ve |
|---|---|
| (nada) | Arqueología, Turismo, Comunicación |
| `arqueo` | Arqueología |
| `TURISMO` | Turismo |
| `comunicacion` | Comunicación |
| `xyz` | Sin resultados para "xyz" |

## Por qué importa

"Haz un buscador que filtre una lista" es de los ejercicios en vivo más pedidos en entrevistas junior de React. Evalúan si sabes qué guardar en el estado y qué calcular.
