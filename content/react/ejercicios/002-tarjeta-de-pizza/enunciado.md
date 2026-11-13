Crea el componente `Pizza`, una tarjeta para el menú de una pizzería. Recibe tres props: `nombre` (texto), `descripcion` (texto) y `precio` (número), y las muestra ordenadas.

## Reglas

- Todo va dentro de un `<article>` (una tarjeta es un contenido que tiene sentido por sí solo).
- El `nombre` va en un título `<h2>`.
- La `descripcion` va en un párrafo `<p>`.
- El precio va en otro `<p>` con el formato **`S/ 28.00`**: el símbolo `S/`, un espacio y el número **siempre con 2 decimales**.

## Ejemplo

```jsx
<Pizza nombre="Margarita" descripcion="Tomate y albahaca" precio={28} />
```

| Prop `precio` | Se ve |
|---|---|
| `28` | S/ 28.00 |
| `31.5` | S/ 31.50 |
| `19.9` | S/ 19.90 |

Resultado completo para el ejemplo:

```
Margarita            (h2)
Tomate y albahaca
S/ 28.00
```

## Por qué importa

Una tarjeta que recibe datos por props es el componente más común de cualquier web: productos, usuarios, publicaciones. Además, mostrar precios con 2 decimales es un detalle que el entrevistador nota.
