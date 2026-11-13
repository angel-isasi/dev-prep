Crea un temporizador **Pomodoro**: alterna bloques de trabajo y de descanso. Toda la lógica vive en un reducer puro; el componente solo manda un "tic" cada segundo. Exporta tres piezas:

- `crearInicial({ trabajo, descanso })`: devuelve el estado inicial
  `{ modo: "trabajo", restante: trabajo, corriendo: false, duraciones: { trabajo, descanso } }`.
- `pomodoro(estado, accion)`: el reducer.
- `Pomodoro({ trabajo = 25 * 60, descanso = 5 * 60 })`: el componente. Las duraciones están en **segundos**.

## Reglas

**Reducer** (`accion.tipo`):

- `"alternar"`: cambia `corriendo` de `false` a `true` o al revés.
- `"tic"`: resta 1 a `restante`. Si `restante` era 1 (iba a llegar a 0), cambia de modo (`trabajo` a `descanso` o al revés) y `restante` pasa a ser la duración del nuevo modo. Sigue corriendo.
- `"reiniciar"`: vuelve al estado inicial con las mismas duraciones (modo trabajo, detenido).
- Otro tipo: lanza un error.
- Nunca modifica el estado que recibe.

**Componente**:

- Un texto **"A trabajar"** o **"Descanso"** según el modo.
- El tiempo restante en formato **mm:ss** (con ceros a la izquierda) dentro de un elemento con `role="timer"`.
- Un botón que dice **"Iniciar"** si está detenido y **"Pausar"** si está corriendo (despacha `alternar`).
- Un botón **"Reiniciar"**.
- Mientras corre, se despacha `{ tipo: "tic" }` cada 1000 ms. Al pausar o reiniciar, el intervalo se detiene.

## Ejemplo

```jsx
<Pomodoro trabajo={3} descanso={2} />
```

| Tiempo | Acción | Modo | Timer |
|---|---|---|---|
| 0 s | Clic en "Iniciar" | A trabajar | 00:03 |
| 2 s | | A trabajar | 00:01 |
| 3 s | (cambia de modo) | Descanso | 00:02 |
| 3 s | Clic en "Pausar" | Descanso | 00:02 |
| 8 s | (sigue pausado) | Descanso | 00:02 |
| 8 s | Clic en "Reiniciar" | A trabajar | 00:03 |

Con los valores por defecto se ve `25:00`.

## Por qué importa

Los temporizadores son una trampa clásica en React: closures viejos dentro de `setInterval`, intervalos que no se limpian, lógica de tiempo mezclada con la interfaz. Poner las reglas en un reducer puro (fácil de probar sin esperar) y dejar al efecto solo el trabajo de "avisar que pasó un segundo" es un diseño que vale la pena saber defender.
