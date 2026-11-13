Crea el componente `Etiqueta`, una pequeña insignia para las pizzas del menú ("nuevo", "agotado", "picante"). Recibe la prop `tipo`, muestra ese texto y le pone una **clase CSS distinta según el tipo**, para que cada una tenga su color.

## Reglas

- Devuelve un `<span>` cuyo texto es el propio `tipo`.
- Su atributo `className` depende del tipo:

| `tipo` | `className` |
|---|---|
| `"nuevo"` | `"etiqueta verde"` |
| `"agotado"` | `"etiqueta gris"` |
| `"picante"` | `"etiqueta roja"` |
| cualquier otro | `"etiqueta"` |

- No uses una cadena de `if` / `else if`: usa un **objeto como tabla de búsqueda** (clave = tipo, valor = clase).

## Ejemplo

```jsx
<Etiqueta tipo="picante" />
<Etiqueta tipo="vegano" />
```

Se pinta:

```html
<span class="etiqueta roja">picante</span>
<span class="etiqueta">vegano</span>
```

## Por qué importa

Cambiar estilos según un dato (estado de un pedido, tipo de alerta, prioridad) es constante en el frontend. Usar un objeto en lugar de muchos `if` es un patrón limpio que el entrevistador valora, y te obliga a pensar en el caso "no encontrado".
