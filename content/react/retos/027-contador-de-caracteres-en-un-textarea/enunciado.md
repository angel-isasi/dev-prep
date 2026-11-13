Crea el componente `Comentario`: una caja de texto (`<textarea>`) para escribir un comentario, con un contador de **caracteres restantes** y un botón para publicar. Recibe la prop `max` (límite de caracteres), que por defecto vale **140**.

## Reglas

- Un `<textarea>` con la etiqueta **"Comentario"** (usa `<label htmlFor>` + `id`, o `aria-label`).
- El textarea no deja escribir más de `max` caracteres (atributo `maxLength`).
- Debajo, el texto exacto **"N caracteres restantes"**, donde `N = max - largo del texto`. Por ejemplo, con `max={20}` y "Gran corto" (10 letras): `10 caracteres restantes`.
- Un botón **"Publicar"**, deshabilitado si el texto está vacío **o solo tiene espacios**.
- Opcional (no se prueba): pinta el contador en rojo cuando quedan menos de 10.

## Ejemplo

```jsx
<Comentario max={20} />
```

| El usuario escribe | Se ve | "Publicar" |
|---|---|---|
| (nada) | 20 caracteres restantes | deshabilitado |
| `Gran corto` | 10 caracteres restantes | habilitado |
| `"   "` (solo espacios) | 17 caracteres restantes | deshabilitado |

## Por qué importa

Parece trivial, pero es un examen de **estado derivado**: el contador y el estado del botón no se guardan, se calculan del texto. Además muestra detalles de UX y accesibilidad que los entrevistadores valoran.
