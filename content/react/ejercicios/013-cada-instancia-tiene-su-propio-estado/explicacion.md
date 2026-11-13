## Idea clave

El estado **pertenece a cada copia** del componente que está en pantalla, no a la función. Si renderizas `<Cantidad />` dos veces, React guarda dos estados distintos, uno por cada posición en el árbol.

## Paso a paso

1. **Recibe `nombre` por props.** Solo sirve para el texto del botón.
2. **Crea el estado.** `const [cantidad, setCantidad] = useState(0)`. La primera vez vale `0`; en los siguientes renders, React te devuelve el último valor guardado.
3. **Maneja el clic.** `onClick={() => setCantidad(cantidad + 1)}`. Ojo: le pasas una **función** a `onClick`; si escribieras `onClick={setCantidad(cantidad + 1)}`, se ejecutaría al renderizar.
4. **Pinta el texto.** `{nombre}: {cantidad}` dentro del botón.

```jsx
import { useState } from "react";

export function Cantidad({ nombre }) {
  // Cada <Cantidad> en pantalla tiene su propio `cantidad`.
  const [cantidad, setCantidad] = useState(0);

  return (
    <button onClick={() => setCantidad(cantidad + 1)}>
      {nombre}: {cantidad}
    </button>
  );
}
```

## Por qué funciona

React identifica cada componente por **su lugar en el árbol**. Con dos `Cantidad`, hay dos "cajones" de estado:

| Acción | Estado de Margarita | Estado de Hawaiana | Se pinta |
|---|---|---|---|
| Primer render | `0` | `0` | Margarita: 0, Hawaiana: 0 |
| Clic en Margarita | `1` | `0` | Margarita: 1, Hawaiana: 0 |
| Clic en Hawaiana | `1` | `1` | Margarita: 1, Hawaiana: 1 |

Cuando haces clic en Margarita, solo su `setCantidad` se ejecuta, y ese setter apunta al cajón de Margarita. React vuelve a renderizar esa copia; la de Hawaiana sigue con su `0`.

Por eso los componentes son reutilizables: puedes poner diez contadores y ninguno pisa al otro.

## Errores comunes

- **Usar una variable normal** (`let cantidad = 0` y `cantidad++`). Cambia la variable, pero React no se entera y no vuelve a pintar; y en el siguiente render vuelve a `0`. Lo reconoces porque el botón siempre dice `: 0`.
- **Poner el `useState` fuera del componente** o usar una variable global para "compartir" el contador. Todas las copias mostrarían lo mismo y React tampoco volvería a pintar.
- **Llamar al setter directamente en `onClick`**: `onClick={setCantidad(cantidad + 1)}`. Se ejecuta durante el render y React lanza "Too many re-renders".
- **Cambiar el texto** (`Margarita - 0` o `Margarita 0`). Los tests buscan exactamente `Margarita: 0`.

## Otra forma de resolverlo

Con la **forma funcional** del setter, que recibe el valor anterior:

```jsx
import { useState } from "react";

export function Cantidad({ nombre }) {
  const [cantidad, setCantidad] = useState(0);

  return (
    <button onClick={() => setCantidad((anterior) => anterior + 1)}>
      {nombre}: {cantidad}
    </button>
  );
}
```

**¿Cuándo conviene?** Siempre que el nuevo valor dependa del anterior y puedas llamar al setter varias veces seguidas en el mismo evento. Por ejemplo, `setCantidad(cantidad + 1)` dos veces seguidas suma solo 1 (las dos leen el mismo `cantidad`), mientras que `setCantidad((a) => a + 1)` dos veces suma 2. Para un solo clic, las dos formas dan lo mismo.

Y si alguna vez necesitas que dos contadores **compartan** el número, la solución es **subir el estado** al padre y pasarlo por props.

## Cómo explicarlo en la entrevista

> "El estado en React es local a cada instancia: React lo asocia a la posición del componente en el árbol. Si renderizo `Cantidad` dos veces, cada una tiene su propio `useState` y el clic en una no afecta a la otra. Si necesitara que compartan el valor, subiría el estado al componente padre y se lo pasaría por props. Para incrementar uso el setter; si el valor dependiera de varias actualizaciones seguidas, usaría la forma funcional `setCantidad(a => a + 1)`."

## Conceptos

- **`useState`**: memoria del componente que sobrevive entre renders.
- **Instancia**: cada uso de `<Cantidad />` en pantalla es una copia con su propio estado.
- **Posición en el árbol**: así identifica React a qué copia pertenece cada estado.
- **Manejador de eventos**: `onClick` recibe una función, no el resultado de llamarla.
- **Setter funcional**: `setX((anterior) => anterior + 1)` usa siempre el valor más reciente.
- **Subir el estado**: moverlo al padre cuando varios hijos deben compartirlo.
