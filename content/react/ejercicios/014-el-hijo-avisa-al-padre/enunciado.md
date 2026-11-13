Crea dos componentes que se comunican: un hijo `BotonAgregar` que **avisa** cuando lo presionan, y un padre `Tienda` que **recuerda** cuál fue la última pizza agregada y la muestra.

Los datos bajan del padre al hijo por props. Para que el hijo le diga algo al padre, el padre le pasa una **función** por props y el hijo la llama.

## Reglas

Exporta **los dos** componentes:

**`BotonAgregar({ pizza, onAgregar })`**
- Un `<button>` con el texto `Agregar {pizza}`, por ejemplo `Agregar Pepperoni`.
- Al hacer clic, llama a `onAgregar(pizza)`, pasándole el nombre de la pizza.
- No tiene estado propio.

**`Tienda()`**
- Muestra dos `BotonAgregar`: uno para `"Margarita"` y otro para `"Pepperoni"`.
- Guarda en su estado la última pizza agregada (al inicio, `null`: ninguna).
- Si hay una última pizza, muestra un párrafo `Agregaste {pizza}`, por ejemplo `Agregaste Pepperoni`. Si no hay ninguna, no muestra ese párrafo.

## Ejemplo

```jsx
<Tienda />
```

| Acción | Se ve |
|---|---|
| (al inicio) | botones "Agregar Margarita" y "Agregar Pepperoni", sin mensaje |
| clic en "Agregar Pepperoni" | Agregaste Pepperoni |
| clic en "Agregar Margarita" | Agregaste Margarita |

## Por qué importa

"¿Cómo le pasa un dato un hijo a su padre?" es una de las preguntas más comunes de React en entrevistas junior. La respuesta (el padre le pasa una función callback) es la base de todos los formularios, listas con botones de borrar y modales que avisan que se cerraron.
