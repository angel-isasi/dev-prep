Crea el componente `ArmarPizza`: un pequeño formulario con dos selectores (tipo y tamaño) cuyo estado se guarda en **un solo objeto** `{ tipo, tamano }`. Debajo muestra lo elegido.

El reto es actualizar **un campo** del objeto sin perder el otro, y hacerlo con **un solo manejador** para los dos selects.

## Reglas

- Exporta la función `ArmarPizza`. No recibe props.
- El estado inicial es `{ tipo: "margarita", tamano: "M" }`.
- Un `<select>` con `aria-label="Tipo"` y `name="tipo"`, con opciones:
  - `value="margarita"`, texto `Margarita`
  - `value="pepperoni"`, texto `Pepperoni`
- Un `<select>` con `aria-label="Tamaño"` y `name="tamano"`, con opciones:
  - `value="M"`, texto `Mediana`
  - `value="L"`, texto `Familiar`
- Un párrafo con `{tipo} {tamano}` separados por un espacio, por ejemplo `margarita M`.
- Los dos selects usan **la misma función** `onChange`, que lee `evento.target.name` para saber qué campo cambiar.

## Ejemplo

```jsx
<ArmarPizza />
```

| Acción | Estado | Se ve |
|---|---|---|
| (al inicio) | `{ tipo: "margarita", tamano: "M" }` | margarita M |
| elige Pepperoni | `{ tipo: "pepperoni", tamano: "M" }` | pepperoni M |
| luego elige Familiar | `{ tipo: "pepperoni", tamano: "L" }` | pepperoni L |

## Por qué importa

Los formularios reales tienen muchos campos y es común guardarlos en un objeto. El error típico de junior es hacer `setPizza({ tipo: "pepperoni" })` y perder el tamaño. Saber copiar con spread y usar una **propiedad calculada** (`[name]`) es lo que se espera en una entrevista.
