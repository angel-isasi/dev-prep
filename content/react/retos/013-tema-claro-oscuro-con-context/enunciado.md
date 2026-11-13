Crea un tema claro/oscuro compartido con **Context**, para que cualquier componente pueda leerlo y cambiarlo sin pasar props de mano en mano. Exporta cuatro cosas:

- `TemaProvider`: guarda el tema (empieza en `"claro"`) y se lo da a todos sus `children`.
- `useTema()`: hook que devuelve `{ tema, alternar }`. Si se usa **fuera** de `TemaProvider`, lanza un error que diga **"useTema debe usarse dentro de TemaProvider"**.
- `BotonTema`: un botón con el texto **"Tema: {tema}"** que al hacer clic alterna entre `"claro"` y `"oscuro"`.
- `Tarjeta`: un `<div>` con `data-testid="tarjeta"` y el texto `Hola`, cuya `className` es **`"bg-white"`** en tema claro y **`"bg-navy"`** en tema oscuro.

## Reglas

- `BotonTema` y `Tarjeta` **no reciben props**: leen el tema con `useTema()`.
- Todos los componentes dentro del mismo `TemaProvider` ven el mismo tema.
- La `className` de la tarjeta debe ser exactamente `bg-white` o `bg-navy`, sin otras clases.

## Ejemplo

```jsx
<TemaProvider>
  <BotonTema />
  <Tarjeta />
</TemaProvider>
```

| Acción | Botón | `className` de la tarjeta |
|---|---|---|
| (al inicio) | Tema: claro | bg-white |
| clic en el botón | Tema: oscuro | bg-navy |
| clic otra vez | Tema: claro | bg-white |

## Por qué importa

"¿Qué es el *prop drilling* y cómo lo evitas?" es una pregunta fija en entrevistas de React. El modo oscuro con Context, más un hook personalizado que lo envuelve, es la respuesta práctica que esperan ver.
