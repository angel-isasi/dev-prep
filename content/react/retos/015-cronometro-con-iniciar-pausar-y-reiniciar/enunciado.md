Crea el componente `Cronometro` (sin props): un cronómetro que cuenta en **décimas de segundo** y se puede iniciar, pausar y reiniciar.

## Reglas

- Muestra el tiempo con **un decimal** seguido de `" s"`: `0.0 s`, `1.5 s`, `12.3 s`.
- Un botón que dice **"Iniciar"** cuando está detenido y **"Pausar"** cuando está corriendo. Al hacer clic alterna entre los dos estados.
- Mientras corre, el tiempo sube **0.1 s cada 100 ms**.
- Al pausar, el tiempo se congela. Al volver a "Iniciar", **sigue** desde donde quedó.
- Un botón **"Reiniciar"** que vuelve a `0.0 s` y detiene el cronómetro.
- Al desmontarse, no deben quedar temporizadores vivos.

## Ejemplo

```jsx
<Cronometro />
```

| Acción | Se ve | Botón |
|---|---|---|
| (al inicio) | 0.0 s | Iniciar |
| clic en Iniciar y pasan 1.5 s | 1.5 s | Pausar |
| clic en Pausar y pasa 1 s | 1.5 s | Iniciar |
| clic en Iniciar y pasan 0.5 s | 2.0 s | Pausar |
| clic en Reiniciar | 0.0 s | Iniciar |

## Por qué importa

Los temporizadores son la forma más directa de ver si entiendes `useEffect`: **cuándo** se crea el intervalo, **cuándo** se limpia y por qué dentro de un intervalo hay que usar la actualización funcional del estado.
