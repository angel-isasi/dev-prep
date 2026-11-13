Crea el componente `CuentaRegresiva` que recibe en la prop `hasta` una fecha en texto (formato ISO, por ejemplo `"2026-11-17T12:00:00-05:00"`) y muestra **cuánto falta** para esa fecha, actualizándose **cada segundo**.

## Reglas

- Mientras falte tiempo, muestra un `<p>` con el formato exacto **`{días}d {horas}h {minutos}m {segundos}s`**, sin ceros a la izquierda: `2d 1h 29m 45s`, `0d 0h 0m 2s`.
- Las horas van de 0 a 23, los minutos y segundos de 0 a 59 (lo que sobra pasa a la unidad mayor).
- Cuando llega la fecha, o si ya pasó, muestra **"¡Ya empezó!"**.
- Se actualiza una vez por segundo.
- Al desmontarse, no debe quedar ningún temporizador vivo.

## Ejemplo

```jsx
<CuentaRegresiva hasta="2026-11-17T12:00:00-05:00" />
```

| Hora actual | Se ve |
|---|---|
| 15 nov, 10:30:15 | 2d 1h 29m 45s |
| 17 nov, 11:59:58 | 0d 0h 0m 2s |
| 17 nov, 11:59:59 | 0d 0h 0m 1s |
| 17 nov, 12:00:00 o después | ¡Ya empezó! |

## Por qué importa

Cuentas regresivas hay en lanzamientos, ofertas y eventos. El reto evalúa si calculas el tiempo restante a partir de **la hora real** (estado derivado) en vez de restar un segundo a un contador, y si limpias el intervalo.
