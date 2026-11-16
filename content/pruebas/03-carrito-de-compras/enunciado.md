# Carrito de compras con cupones y localStorage

## Contexto

**Café Altura** es una tostaduría familiar de Chanchamayo (Junín) que vende café de especialidad a todo el Perú por su tienda en línea. Hoy el carrito se pierde al recargar la página, los cupones se validan a mano por WhatsApp y los totales a veces salen con decimales raros como `S/ 110.00000001`.

Te pedimos el carrito nuevo. Los productos están en `src/products.js`. **Los precios vienen en céntimos** (`3200` son `S/ 32.00`), como en la mayoría de pasarelas de pago, para no tener errores de decimales; `src/lib/money.js` ya trae `formatPrice()`.

Tiempo estimado: **3 horas**.

## Requisitos

### Productos y carrito

- [ ] Los productos se muestran en una lista con nombre accesible `Productos`; cada uno con su nombre en un `<h3>`, su precio y un botón **Agregar al carrito**.
- [ ] El carrito es una sección con el título **Tu carrito**. Si está vacío dice `Tu carrito está vacío.`
- [ ] Agregar un producto que ya está en el carrito suma 1 a su cantidad (no crea otra línea).
- [ ] Cada línea del carrito (en una lista con nombre accesible `Productos en tu carrito`) muestra el nombre, la cantidad, el total de la línea y estos botones, con estos nombres accesibles:
  - `Disminuir cantidad de <producto>`: deshabilitado cuando la cantidad es 1.
  - `Aumentar cantidad de <producto>`: deshabilitado cuando llega al máximo de **10 unidades** (y el botón Agregar al carrito de ese producto también).
  - `Quitar <producto>`: lo saca del carrito.
- [ ] La cantidad de cada línea tiene el nombre accesible `Cantidad de <producto>` (por ejemplo, un `<output aria-label="...">`).

### Resumen

- [ ] Si el carrito tiene productos, se muestra un resumen en una lista de definiciones (`<dl>` con `<dt>` y `<dd>`): **Subtotal**, **Descuento** (solo si hay descuento, con el formato `- S/ 11.00`), **Envío** y **Total**.
- [ ] El envío cuesta `S/ 10.00` y es `Gratis` si el subtotal es de S/ 150.00 o más.
- [ ] Total = subtotal - descuento + envío.

### Cupones

- [ ] Un campo con la etiqueta **Cupón de descuento** y un botón **Aplicar**. El código no distingue mayúsculas y se ignoran los espacios de los extremos.
- [ ] Cupones válidos:
  - `CAFE10`: 10% de descuento sobre el subtotal (redondeado al céntimo).
  - `BIENVENIDA20`: S/ 20.00 de descuento, solo con un subtotal de S/ 100.00 o más.
  - `ENVIOGRATIS`: el envío es gratis.
- [ ] Un código que no existe muestra `Cupón no válido.` con `role="alert"`.
- [ ] Aplicar `BIENVENIDA20` sin llegar al mínimo muestra `Este cupón requiere una compra mínima de S/ 100.00.` con `role="alert"`.
- [ ] Con un cupón aplicado se ve `Cupón CAFE10 aplicado` y un botón **Quitar cupón**. Solo hay un cupón a la vez: aplicar otro lo reemplaza.
- [ ] Si después de aplicar `BIENVENIDA20` el subtotal baja del mínimo, el descuento deja de aplicarse y se ve `Agrega S/ 36.00 más para usar BIENVENIDA20.` (con lo que falte).

### Persistencia

- [ ] El carrito y el cupón se guardan en `localStorage` con la clave `cafe-altura:cart` y se recuperan al volver a abrir la página.
- [ ] Guarda solo el id de cada producto y su cantidad, con este formato: `{ "items": [{ "productId": 1, "quantity": 2 }], "couponCode": "CAFE10" }` (`couponCode` es `null` si no hay cupón). Los precios salen siempre del catálogo.
- [ ] Si lo guardado está corrupto, la página no se rompe (empieza con el carrito vacío). Se descartan los productos que ya no existen y las cantidades mayores a 10 quedan en 10.

## Lo que se valora

- Que los tests de `tests/` pasen.
- Un reducer (`useReducer`) con acciones claras y sin mutar el estado.
- Cálculos (subtotal, descuento, envío, total) en funciones puras, con dinero en céntimos.
- No guardar en el estado lo que se puede calcular (el total no es estado).
- Leer `localStorage` una sola vez al iniciar y no confiar en lo que viene de ahí.
- Componentes pequeños: lista de productos, línea del carrito, cupón y resumen.

## Entrega

1. Completa los archivos con `// TODO` de `src/`.
2. Verifica que pasan todos los tests de `tests/carrito.test.jsx`.
3. Actualiza el `README.md` con tus decisiones y qué mejorarías.
4. Prepárate para explicar en la entrevista por qué los precios van en céntimos y qué pasaría si guardaras el precio en `localStorage`.
