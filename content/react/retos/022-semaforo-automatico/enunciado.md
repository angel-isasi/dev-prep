Crea el componente `Semaforo` (sin props) que cambia de luz **solo**, con el paso del tiempo: rojo dura 3 segundos, verde 2 segundos, amarillo 1 segundo, y vuelve a empezar.

## Reglas

- Muestra el nombre de la luz actual en un elemento con `data-testid="luz"`. El texto es exactamente `rojo`, `verde` o `amarillo` (en minúsculas).
- Empieza en `rojo`.
- Orden y duración: `rojo` (3000 ms) → `verde` (2000 ms) → `amarillo` (1000 ms) → `rojo` otra vez, sin fin.
- Cuando el componente se desmonta no debe quedar ningún temporizador pendiente.

## Ejemplo

```jsx
<Semaforo />
```

| Tiempo transcurrido | Se ve |
|---|---|
| 0 ms | rojo |
| 2999 ms | rojo |
| 3000 ms | verde |
| 5000 ms | amarillo |
| 6000 ms | rojo (empieza otra vuelta) |
| 9000 ms | verde |

## Por qué importa

Es una **máquina de estados** pequeña: un estado actual y reglas de transición. Evalúan si sabes encadenar temporizadores con `useEffect` y limpiarlos, y si separas los datos (duraciones) de la lógica.
