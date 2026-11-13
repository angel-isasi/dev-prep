Haz que una preferencia del usuario (el tema claro u oscuro) **sobreviva a recargar la página** guardándola en `localStorage`, y que la app **no se rompa** si lo guardado está corrupto. Exporta dos cosas:

1. `leerGuardado(clave, respaldo)`: lee `localStorage.getItem(clave)` y lo convierte con `JSON.parse`.
   - Si la clave no existe, devuelve `respaldo`.
   - Si lo guardado no es JSON válido (por ejemplo `"{roto"`), **no lanza error**: devuelve `respaldo`.
2. `Preferencias`: componente con un botón que alterna el tema.
   - El tema inicial se lee con `leerGuardado("tema", "claro")`.
   - Cada vez que el tema cambia, se guarda en `localStorage` con la clave `"tema"`, **en formato JSON** (`JSON.stringify`).

## Reglas

- El botón muestra el texto **"Tema: claro"** o **"Tema: oscuro"**.
- Al hacer clic pasa de `claro` a `oscuro` y viceversa.
- Lo guardado debe ser JSON: después de pasar a oscuro, `localStorage.getItem("tema")` vale `'"oscuro"'` (con comillas, porque es un string en JSON).
- Lee `localStorage` **solo en el primer render**, no en cada render.

## Ejemplo

| Lo que hay en `localStorage["tema"]` | El botón arranca en | Después de un clic se guarda |
|---|---|---|
| (nada) | Tema: claro | `"oscuro"` |
| `"oscuro"` | Tema: oscuro | `"claro"` |
| `{roto` (corrupto) | Tema: claro | `"oscuro"` |

## Por qué importa

Guardar preferencias en `localStorage` es de lo más pedido en apps reales y en pruebas técnicas. El bug típico: alguien (otra versión de tu app, una extensión, tú mismo probando) deja un valor que no es JSON, `JSON.parse` lanza un error y la app queda **en blanco** para siempre en ese navegador. Un `try/catch` en un solo lugar lo evita.
