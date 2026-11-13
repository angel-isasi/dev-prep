Crea el componente `Modal`, una ventana que se muestra encima del contenido. Recibe estas props:

- `abierto` (booleano): si es `false`, el modal no se pinta.
- `titulo` (texto): el título del modal.
- `onCerrar` (función): la llamas cuando el usuario quiere cerrarlo. El modal **no** se cierra solo: avisa al padre y el padre decide (cambia `abierto` a `false`).
- `children`: el contenido que va dentro.

## Reglas

- Si `abierto` es `false`, el componente devuelve `null`.
- Si está abierto, pinta:
  - un **fondo** que cubre la pantalla: un `<div>` con `data-testid="fondo"`;
  - dentro del fondo, la caja del modal con `role="dialog"`, `aria-modal="true"` y `aria-label` igual al `titulo`;
  - dentro de la caja: un `<h2>` con el `titulo`, los `children` y un botón **`Cerrar`**.
- Se llama a `onCerrar`:
  - al presionar la tecla **Escape** en cualquier parte de la página (escucha `keydown` en `document`);
  - al hacer **clic en el fondo**;
  - al hacer clic en el botón `Cerrar`.
- Un clic **dentro** de la caja del modal **no** lo cierra.
- Otras teclas (Enter, letras) no hacen nada.
- El listener de teclado solo existe mientras el modal está abierto, y se quita al cerrarlo o desmontarlo.

## Ejemplo

```jsx
<Modal abierto={mostrar} titulo="Votar" onCerrar={() => setMostrar(false)}>
  <p>¿Confirmas tu voto?</p>
</Modal>
```

| Acción | ¿Se llama a `onCerrar`? |
|---|---|
| clic en `¿Confirmas tu voto?` | no |
| presionar Escape | sí |
| presionar Enter | no |
| clic en el fondo oscuro | sí |
| clic en `Cerrar` | sí |

## Por qué importa

"Construye un modal" aparece en muchísimas entrevistas junior. Junta tres temas que suelen preguntar: eventos globales con `useEffect` y su limpieza, la **propagación** de eventos (`stopPropagation`) y la accesibilidad de un diálogo.
