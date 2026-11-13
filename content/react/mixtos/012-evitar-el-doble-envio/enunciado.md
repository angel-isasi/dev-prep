Un usuario impaciente hace doble clic en "Pagar" y se le cobra dos veces. Crea el componente `BotonPagar` que **impide el doble envío** mientras el pago está en curso.

## Reglas

- Exporta `BotonPagar({ pagar })`. `pagar` es una función asíncrona (devuelve una promesa).
- Muestra un `<button>` con el texto `Pagar`.
- Al hacer clic:
  - Llama a `pagar()` **una sola vez**, aunque se hagan más clics mientras espera.
  - Mientras espera, el botón dice `Pagando…` (con el carácter de puntos suspensivos `…`) y está **deshabilitado** (`disabled`).
- Cuando la promesa termina, **bien o mal**, el botón vuelve a decir `Pagar` y se habilita.
- Si `pagar()` falla, muestra un `<p role="alert">` con `No se pudo procesar el pago`. Al volver a intentar, el mensaje desaparece.

## Ejemplo

| Acción | Botón | `pagar` llamado |
|---|---|---|
| inicio | `Pagar` (habilitado) | 0 veces |
| clic | `Pagando…` (deshabilitado) | 1 vez |
| otro clic | `Pagando…` | sigue 1 vez |
| la promesa termina | `Pagar` (habilitado) | 1 vez |

## Por qué importa

Es un bug real que cuesta dinero, y la solución junta **estado** (para la interfaz), **async/await** dentro de un manejador de eventos y **`finally`** para no dejar el botón bloqueado si algo falla. Además, un error no capturado en un manejador async termina como "unhandled rejection": hay que manejarlo.
