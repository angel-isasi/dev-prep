# MesaYa · Panel de pedidos

Panel interno que usan los mozos y la cocina de **Sabor Norteño (Miraflores)** para seguir los pedidos del día y marcar los platos agotados de la carta. Lo mantiene el equipo de frontend de MesaYa.

> Bienvenido al equipo. Antes de tocar nada, lee este README, abre la app y corre los tests. Si algo no está claro, pregunta en el canal #frontend.

## Cómo correrlo

Abre una terminal en esta carpeta y corre:

```
npx vite
```

Abre `http://localhost:5173`. Los datos vienen de un mock en memoria (`src/api.js`), así que puedes romper lo que quieras: al recargar la página vuelve a como estaba.

Los tests corren solos en dev-prep cada vez que guardas un archivo.

## Cómo está organizado

```
src/
  main.jsx              monta la app
  App.jsx               pantalla principal: trae los pedidos y arma el layout
  api.js                cliente de la API (hoy es un mock con setTimeout)
  styles.css            estilos (modo oscuro)
  data/
    orders.js           pedidos de ejemplo
    menu.js             carta de ejemplo
  components/
    Header.jsx          nombre del local y contadores por estado
    OrderList.jsx       lista de pedidos
    OrderCard.jsx       tarjeta de un pedido (items, total, botón para avanzar)
    StatusBadge.jsx     etiqueta de color con el estado
    MenuPanel.jsx       carta del día: búsqueda y platos agotados
    SearchInput.jsx     campo de búsqueda reutilizable (design system)
  hooks/
    useSearch.js        búsqueda sobre cualquier lista (sin tildes ni mayúsculas)
  utils/
    money.js            formatPrice y calcOrderTotal
    status.js           estados del pedido, en qué orden avanzan y textos
    text.js             normalize y matchesQuery
tests/                  tests del equipo (y los de cada ticket)
```

## El flujo de un pedido

```
pendiente  ->  en_cocina  ->  listo  ->  entregado
```

Cada tarjeta tiene un botón que lo lleva al siguiente estado (`Enviar a cocina`, `Marcar como listo`, `Marcar como entregado`). El orden y los textos viven en `src/utils/status.js`: no los escribas a mano en los componentes.

## Convenciones del equipo

- **Componentes** en `src/components/`, uno por archivo, con `export function NombreEnPascalCase`. Solo `App` es `export default`.
- **Lógica sin React** (cálculos, formatos) en `src/utils/`, como funciones puras. Son las más fáciles de probar.
- **Hooks propios** en `src/hooks/`, empiezan con `use`.
- **Estado inmutable**: nunca cambies un objeto o un array que está en el estado; crea uno nuevo (`map`, `filter`, spread).
- **Reutiliza antes de crear**: si ya hay un componente o un hook que hace lo que necesitas (por ejemplo, un buscador), úsalo.
- **Accesibilidad**: cada sección tiene un título y los botones tienen un texto claro. Los tests buscan por rol y por nombre, como lo haría un lector de pantalla.
- **Textos de la interfaz** en español; código, nombres y comentarios técnicos en inglés o español, pero claros.
- **Pull requests pequeños**: un ticket por PR, con una descripción de qué cambió y cómo probarlo. No mezcles refactors con arreglos de bugs.

## Tests

- `tests/utils.test.js`: funciones de `src/utils/`.
- `tests/App.test.jsx` y `tests/MenuPanel.test.jsx`: lo que ve el usuario.

Si un test del equipo se rompe con tu cambio, **no lo borres ni lo cambies para que pase**: primero entiende qué protegía.

## Pendientes conocidos

- Si la API falla al traer los pedidos, la pantalla no avisa (hay un `TODO` en `App.jsx`).
- Falta un buscador de pedidos; negocio lo pidió para la hora punta.
