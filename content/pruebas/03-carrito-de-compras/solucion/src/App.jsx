// Tienda de Café Altura: catálogo a la izquierda y carrito a la derecha.
import { Cart } from "./components/Cart.jsx";
import { ProductList } from "./components/ProductList.jsx";
import { useCart } from "./hooks/useCart.js";
import { PRODUCTS } from "./products.js";

export default function App() {
  const cart = useCart();

  return (
    <main className="shop">
      <h1>Café Altura</h1>
      <div className="shop__layout">
        <ProductList products={PRODUCTS} quantityOf={cart.quantityOf} onAdd={cart.add} />
        <Cart cart={cart} />
      </div>
    </main>
  );
}
