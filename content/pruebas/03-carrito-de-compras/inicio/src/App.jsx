// Tienda de Café Altura: catálogo a la izquierda y carrito a la derecha.
import { Cart } from "./components/Cart.jsx";
import { ProductList } from "./components/ProductList.jsx";
import { useCart } from "./hooks/useCart.js";
import { PRODUCTS } from "./products.js";

export default function App() {
  const cart = useCart();

  // TODO: pasa a cada componente solo lo que necesita.
  return (
    <main className="shop">
      <h1>Café Altura</h1>
      <ProductList products={PRODUCTS} quantityOf={cart.quantityOf} onAdd={cart.add} />
      <Cart cart={cart} />
    </main>
  );
}
