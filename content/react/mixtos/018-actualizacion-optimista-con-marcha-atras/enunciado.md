En las redes sociales, cuando das "Me gusta", el corazón se pinta **al instante**, sin esperar al servidor. Eso es una **actualización optimista**: asumes que todo saldrá bien. Pero si el servidor falla, hay que **dar marcha atrás** y avisar.

Crea el componente `MeGusta`.

## Reglas

- Exporta `MeGusta({ guardar })`. `guardar(nuevoValor)` es una función asíncrona que recibe `true` o `false`.
- Muestra un `<button>` con el texto `Me gusta` y el atributo `aria-pressed` que indica si está activo (`"true"` o `"false"`). Empieza en `false`.
- Al hacer clic:
  1. Cambia `aria-pressed` **inmediatamente** (antes de que responda el servidor).
  2. Llama a `guardar` con el **nuevo** valor.
  3. Si `guardar` falla, **vuelve** al valor anterior y muestra `<p role="alert">No se guardó. Inténtalo otra vez.</p>`.
- Si `guardar` sale bien, el botón se queda como está y no hay alerta.
- Al hacer un nuevo clic, el alerta anterior desaparece.

## Ejemplo

| Acción | `aria-pressed` | Alerta |
|---|---|---|
| inicio | `false` | no |
| clic (esperando al servidor) | `true` | no |
| el servidor falla | `false` | `No se guardó. Inténtalo otra vez.` |

## Por qué importa

Las interfaces optimistas se sienten rápidas y las piden mucho en productos reales. El truco está en **guardar el valor anterior en una variable** antes de cambiarlo: esa variable queda en el **closure** de esa llamada y te permite volver atrás aunque el estado ya haya cambiado. Además, `aria-pressed` es la forma accesible de hacer un botón que se activa y desactiva.
