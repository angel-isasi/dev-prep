// Pantalla del catálogo: une la petición, los filtros y la lista.
// Lee el enunciado y los tests de tests/catalogo.test.jsx antes de empezar.

export default function App() {
  // TODO: usa el hook useProducts() (src/hooks/useProducts.js) para obtener
  //       { status, products, retry }.
  // TODO: guarda en estado los filtros: texto de búsqueda, categoría y orden.
  // TODO: calcula la lista visible con las funciones de src/lib/catalog.js.
  //       Es estado derivado: no la guardes en otro useState.
  // TODO: según status, muestra:
  //       "loading" -> <p>Cargando productos...</p>
  //       "error"   -> un mensaje con role="alert" y el botón "Reintentar"
  //       "success" -> <Filters />, el contador "Mostrando X de Y productos" y <ProductList />
  //                    (o el mensaje de "sin coincidencias" con el botón "Limpiar filtros")

  return (
    <main className="catalog">
      <h1>Catálogo Qhatu</h1>
    </main>
  );
}
