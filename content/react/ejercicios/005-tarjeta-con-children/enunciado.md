Crea el componente `Tarjeta`, un "marco" reutilizable: recibe un `titulo` y muestra **cualquier contenido que le pongas adentro**, entre `<Tarjeta>` y `</Tarjeta>`. Ese contenido llega en la prop especial **`children`**.

## Reglas

- Devuelve un `<section>`.
- Dentro, primero un título `<h2>` con el `titulo`.
- Debajo del título, el contenido que llega en `children`, tal cual (puede ser un párrafo, varios elementos o solo texto).
- El título y el contenido van dentro del **mismo** `<section>`.

## Ejemplo

```jsx
<Tarjeta titulo="Promo">
  <p>2x1 los martes</p>
</Tarjeta>
```

Se pinta:

```html
<section>
  <h2>Promo</h2>
  <p>2x1 los martes</p>
</section>
```

| Uso | Se ve |
|---|---|
| `<Tarjeta titulo="Promo"><p>2x1 los martes</p></Tarjeta>` | **Promo** / 2x1 los martes |
| `<Tarjeta titulo="Horario"><p>Lun a vie</p><p>12 a 23 h</p></Tarjeta>` | **Horario** / Lun a vie / 12 a 23 h |

## Por qué importa

`children` es la base de la **composición** en React: modales, tarjetas, layouts y botones reciben su contenido así. Te van a preguntar "¿qué es `children`?" y te van a pedir componentes contenedores reutilizables.
