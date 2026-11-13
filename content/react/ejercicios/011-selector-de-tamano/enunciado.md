Crea el componente `Tamano` (sin ñ, para evitar problemas con el nombre de la función): un selector desplegable para elegir el tamaño de una pizza que muestra el precio según lo elegido.

## Reglas

- Exporta la función `Tamano`. No recibe props.
- Un `<select>` con la etiqueta accesible **"Tamaño"** (usa `<label htmlFor="tamano">Tamaño</label>` y `id="tamano"` en el select).
- Tres opciones, con estos `value` y textos:

| `value` | Texto visible | Precio |
|---|---|---|
| `S` | Personal | 20 |
| `M` | Mediana | 28 |
| `L` | Familiar | 36 |

- Al inicio está elegida **Mediana** (`M`).
- Debajo, un párrafo con el texto exacto `Precio: S/ {precio}`, por ejemplo `Precio: S/ 28`.
- El select es **controlado**: su valor vive en el estado.

## Ejemplo

```jsx
<Tamano />
```

| Acción | Se ve |
|---|---|
| (al inicio) | select en Mediana, Precio: S/ 28 |
| elige Familiar | Precio: S/ 36 |
| elige Personal | Precio: S/ 20 |

## Por qué importa

Los selects aparecen en casi todos los formularios (país, talla, cantidad). En React se manejan distinto que en HTML puro, y la idea de usar un objeto como tabla de precios en vez de una cadena de `if` es algo que los entrevistadores valoran.
