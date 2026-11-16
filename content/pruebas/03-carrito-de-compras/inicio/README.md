# Café Altura: carrito de compras

Prueba técnica para el puesto de **Desarrollador Frontend Junior**. Tiempo estimado: 3 horas.

Lee primero el enunciado completo: ahí están las reglas de los cupones, del envío y el formato de `localStorage`. Al terminar, reemplaza la sección "Mis decisiones" con lo tuyo.

## Cómo correrlo

El proyecto usa las dependencias de dev-prep (React 19, Vite, Vitest y Testing Library), así que no hace falta `npm install`.

Desde esta carpeta, en una terminal:

```bash
npx vitest        # corre los tests y los repite cada vez que guardas
npx vite          # levanta la app en http://localhost:5173
```

## Qué hay en la carpeta

```
src/
  products.js                  catálogo, precios en céntimos (no lo modifiques)
  lib/money.js                 formatPrice(3200) -> "S/ 32.00" (ya está hecho)
  lib/coupons.js               cupones y checkCoupon() (TODO)
  lib/cart.js                  reducer, líneas y totales (TODO)
  lib/storage.js               leer y guardar en localStorage (TODO)
  hooks/useCart.js             une el reducer, la persistencia y las acciones (TODO)
  components/ProductList.jsx   catálogo (TODO)
  components/Cart.jsx          sección del carrito (TODO)
  components/CartLine.jsx      una línea con sus botones (TODO)
  components/CouponForm.jsx    cupón (TODO)
  components/OrderSummary.jsx  resumen con <dl> (TODO)
  App.jsx, main.jsx, styles.css
tests/
  carrito.test.jsx             tests de aceptación: tu entrega debe pasarlos todos
```

## Sugerencia de orden

1. `lib/cart.js`: el reducer y `getTotals()`. Son funciones puras: piensa los casos antes de escribir.
2. `hooks/useCart.js` sin persistencia, y `ProductList`, `Cart` y `CartLine`.
3. `OrderSummary` y el envío.
4. `lib/coupons.js` y `CouponForm`.
5. `lib/storage.js`: guardar y recuperar, con los casos de datos corruptos.
6. Estilos y este README.

## Mis decisiones

- (Escribe aquí qué decidiste y por qué.)

## Qué mejoraría con más tiempo

- (Escribe aquí.)
