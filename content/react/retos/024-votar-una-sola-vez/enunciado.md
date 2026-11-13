Crea el componente `Votacion` que muestra una lista de cortometrajes para votar **una sola vez**. Recibe dos props:

- `cortos`: arreglo de objetos `{ id, titulo }`.
- `onVotar(id)`: función **asíncrona** (devuelve una promesa) que registra el voto en el servidor. Puede fallar (la promesa se rechaza).

## Reglas

- Un botón por corto con el texto **"Votar por título"** (por ejemplo, `Votar por Bajo la arena`).
- Al hacer clic se llama a `onVotar(id)` con el `id` del corto.
- **Mientras se envía** el voto, todos los botones están deshabilitados (nada de doble clic).
- Si `onVotar` **se resuelve**, el botón elegido pasa a decir **"✓ Votaste por título"** y todos los botones quedan deshabilitados para siempre.
- Si `onVotar` **falla**, muestra un mensaje de error con `role="alert"` y vuelve a habilitar los botones para reintentar. Al reintentar, el error anterior desaparece.

## Ejemplo

```jsx
<Votacion
  cortos={[{ id: 1, titulo: "Bajo la arena" }, { id: 2, titulo: "Luz de desierto" }]}
  onVotar={(id) => fetch(`/api/votar/${id}`, { method: "POST" })}
/>
```

| Acción | Se ve |
|---|---|
| (inicio) | "Votar por Bajo la arena", "Votar por Luz de desierto", habilitados |
| Clic en el primero, mientras responde | los dos botones deshabilitados |
| El servidor falla | mensaje de error (alert), botones habilitados otra vez |
| Clic de nuevo y el servidor responde bien | "✓ Votaste por Bajo la arena", todo deshabilitado |

## Por qué importa

Formularios de pago, likes, votaciones: en todos hay que evitar **envíos dobles** y manejar el error de red. Evalúan si manejas bien el flujo asíncrono con `try/catch/finally` y si distingues entre la experiencia de usuario y la validación real, que siempre se hace en el servidor.
