Crea el componente `Cantidad`: un botón que cuenta cuántas veces pediste una pizza. Recibe la prop `nombre` y muestra `{nombre}: {cantidad}`. Cada clic suma 1.

Lo interesante es lo que pasa cuando pones **dos** `Cantidad` en la misma pantalla: cada una lleva su propia cuenta.

## Reglas

- Exporta la función `Cantidad`, que recibe la prop `nombre`.
- Devuelve un `<button>` cuyo texto es exactamente `{nombre}: {cantidad}`, por ejemplo `Margarita: 0`.
- La cantidad empieza en `0` y cada clic en el botón suma `1`.
- Si hay varias `Cantidad` en pantalla, el clic en una **no** cambia las demás.

## Ejemplo

```jsx
<>
  <Cantidad nombre="Margarita" />
  <Cantidad nombre="Hawaiana" />
</>
```

| Acción | Se ve |
|---|---|
| (al inicio) | `Margarita: 0` y `Hawaiana: 0` |
| clic en Margarita | `Margarita: 1` y `Hawaiana: 0` |
| otro clic en Margarita | `Margarita: 2` y `Hawaiana: 0` |
| clic en Hawaiana | `Margarita: 2` y `Hawaiana: 1` |

## Por qué importa

Es una pregunta conceptual clásica: "si renderizo el mismo componente dos veces, ¿comparten el estado?". La respuesta (no, cada copia tiene el suyo) explica por qué los componentes son reutilizables, y también por qué a veces hay que **subir** el estado al padre cuando dos componentes sí deben compartirlo.
