El archivo de inicio trae un componente `Segundero` que debería contar segundos, pero **se queda pegado en 1**. Tu trabajo es encontrar el bug y arreglarlo.

```jsx
useEffect(() => {
  const id = setInterval(() => setSegundos(segundos + 1), 1000);
  return () => clearInterval(id);
}, []);
```

## Reglas

- Exporta `Segundero()` (sin props).
- Muestra un `<p>` con el texto `{segundos} s`: al inicio `0 s`, después de 3 segundos `3 s`.
- Usa **un solo** `setInterval` de 1000 ms, creado al montar el componente.
- Al desmontar el componente, el intervalo se limpia (no debe quedar ningún temporizador vivo).

## Ejemplo

| Tiempo | Se ve |
|---|---|
| 0 s | `0 s` |
| 1 s | `1 s` |
| 3 s | `3 s` |

## Por qué importa

Es **la** pregunta clásica de closures en React ("stale closure" o closure viejo). Cada render crea funciones nuevas que "recuerdan" los valores de ese render. Un intervalo creado una sola vez se queda con los valores del primer render para siempre. Entender por qué pasa y cómo lo arregla la forma funcional de `setState` demuestra que entiendes de verdad cómo funcionan los closures.
