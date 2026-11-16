// Resumen del carrito
//
// Si hay productos, muestra "Productos en tu carrito: N".
// Si el carrito está vacío, muestra solo el botón "Seguir comprando".
//
//   <ResumenCarrito cantidad={3} />  ->  Productos en tu carrito: 3 + botón
//   <ResumenCarrito cantidad={0} />  ->  solo el botón

export function ResumenCarrito({ cantidad }) {
  return (
    <div>
      {cantidad > 0 && <p>Productos en tu carrito: {cantidad}</p>}
      <button>Seguir comprando</button>
    </div>
  );
}
