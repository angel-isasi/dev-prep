Crea el componente `CampoClave`: un campo de contraseña con un botón que alterna entre **ver** y **ocultar** lo que se escribió. No recibe props.

## Reglas

- Un `<input>` con la etiqueta **"Contraseña"** (usa un `<label htmlFor>` o `aria-label`).
- Al inicio el input es `type="password"` (se ven puntitos).
- Un botón con el texto **`Mostrar`**. Al hacer clic, el input pasa a `type="text"` y el botón cambia su texto a **`Ocultar`**.
- Otro clic vuelve todo al estado inicial.
- El botón lleva `aria-pressed` con `true` cuando la contraseña se está mostrando y `false` cuando no.
- El botón es `type="button"`, para que no envíe el formulario si el campo está dentro de un `<form>`.
- Lo que el usuario ya escribió no se pierde al alternar.

## Ejemplo

```jsx
<CampoClave />
```

| Acción | `type` del input | Texto del botón | `aria-pressed` |
|---|---|---|---|
| (inicio) | `password` | `Mostrar` | `false` |
| clic en el botón | `text` | `Ocultar` | `true` |
| otro clic | `password` | `Mostrar` | `false` |

## Por qué importa

Está en casi todos los formularios de login. En la entrevista sirve para ver si manejas un estado booleano, si cambias atributos según el estado y si conoces dos detalles que separan a un junior cuidadoso: `type="button"` dentro de formularios y la accesibilidad con `label` y `aria-pressed`.
