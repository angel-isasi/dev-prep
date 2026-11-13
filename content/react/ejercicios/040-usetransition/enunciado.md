Crea unas pestañas donde el cambio de pestaña se marque como **transición** (actualización no urgente) con `useTransition`. Así, si el contenido de una pestaña es pesado de dibujar, la interfaz sigue respondiendo mientras React lo prepara.

## Reglas

- Exporta `Pestanas()`.
- Guarda en un estado la pestaña actual: `"menu"` o `"pedidos"`. Empieza en `"menu"`.
- Dos botones: **"Menú"** y **"Pedidos"**.
  - Al hacer clic, cambian la pestaña **dentro de una transición**: `iniciarTransicion(() => setPestana(...))`.
  - El botón de la pestaña actual tiene `aria-pressed="true"`; el otro, `"false"`.
- Debajo, un `<p>`:
  - Mientras la transición está pendiente: **"Cambiando…"**.
  - Si no: **"Viendo: "** + la pestaña, por ejemplo **"Viendo: menu"** o **"Viendo: pedidos"**.

## Ejemplo

```jsx
<Pestanas />
```

| Acción | Botón activo | Se ve |
|---|---|---|
| (inicio) | Menú | Viendo: menu |
| Clic en "Pedidos" | Pedidos | (un instante) Cambiando…, luego Viendo: pedidos |
| Clic en "Menú" | Menú | Viendo: menu |

## Por qué importa

Con React 18 y 19 llegó el **renderizado concurrente**, y `useTransition` es su herramienta principal: permite decir "esta actualización puede esperar". Se usa en navegación entre pestañas o páginas, filtros pesados y formularios con acciones. Saber explicar qué es una transición es un plus claro en una entrevista junior.
