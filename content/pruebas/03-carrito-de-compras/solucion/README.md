# Café Altura: carrito de compras

Carrito con cantidades y límites, cupones con reglas, envío, total y persistencia en `localStorage`.

## Cómo correrlo

Usa las dependencias de dev-prep, así que no hace falta `npm install`. Desde esta carpeta:

```bash
npx vitest        # tests de aceptación en modo watch
npx vite          # la app en http://localhost:5173
```

Cupones para probar: `CAFE10`, `BIENVENIDA20` (desde S/ 100) y `ENVIOGRATIS`.

## Estructura

```
src/
  products.js                  catálogo (precios en céntimos)
  lib/money.js                 formatPrice
  lib/coupons.js               reglas de cada cupón y checkCoupon
  lib/cart.js                  cartReducer, getCartLines, getTotals
  lib/storage.js               loadCart y saveCart, a prueba de datos corruptos
  hooks/useCart.js             useReducer + persistencia + acciones
  components/                  ProductList, Cart, CartLine, CouponForm, OrderSummary
```

## Mis decisiones

- **Dinero en céntimos.** `0.1 + 0.2` en JavaScript da `0.30000000000000004`. Con enteros eso no pasa, y solo convierto a soles al mostrar (`formatPrice`).
- **El estado guarda lo mínimo:** `{ items: [{ productId, quantity }], couponCode }`. Las líneas, el subtotal, el descuento, el envío y el total se calculan en cada render con funciones puras. Si guardara el total en el estado, tendría que acordarme de actualizarlo en cada acción.
- **`useReducer`** porque hay varias acciones sobre el mismo estado. El reducer nunca muta: devuelve objetos y arreglos nuevos (`map`, `filter`, spread). Una acción desconocida lanza un error para detectar errores de tipeo.
- **Los límites viven en el reducer** (`clamp` entre 1 y 10), no solo en los botones deshabilitados: aunque alguien llame a la acción por otro camino, la cantidad nunca sale del rango.
- **Cupones como datos.** Cada cupón declara su mínimo, su descuento y si da envío gratis. Agregar uno nuevo es agregar una línea en `COUPONS`. `Object.hasOwn` evita que un código como `CONSTRUCTOR` encuentre algo heredado del objeto.
- **Un cupón con mínimo se valida dos veces:** al aplicarlo (para dar el error) y al calcular los totales (si el subtotal baja, deja de aplicar y aviso cuánto falta).
- **`localStorage` se lee una sola vez** con la inicialización perezosa de `useReducer(reducer, undefined, loadCart)` y se guarda en un `useEffect` cuando cambia el estado.
- **No confío en `localStorage`:** puede tener JSON roto, productos que ya no existen o cantidades editadas a mano. `loadCart` revisa todo y, ante cualquier problema, empieza con el carrito vacío. Guardo solo ids y cantidades: si el precio cambia, el carrito usa el precio nuevo.
- **Accesibilidad:** los botones `+` y `−` tienen `aria-label` con el nombre del producto, los errores del cupón usan `role="alert"` y el resumen es una lista de definiciones.

## Qué mejoraría con más tiempo

- Sincronizar el carrito entre pestañas con el evento `storage`.
- Un campo numérico para escribir la cantidad directamente.
- Tests unitarios del reducer y de `getTotals`.
- Mostrar un aviso cuando se descartan productos guardados que ya no existen.
