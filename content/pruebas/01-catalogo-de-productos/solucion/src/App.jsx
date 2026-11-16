// Pantalla del catálogo: une la petición, los filtros y la lista.
import { useMemo, useState } from "react";
import { Filters } from "./components/Filters.jsx";
import { ProductList } from "./components/ProductList.jsx";
import { useProducts } from "./hooks/useProducts.js";
import { filterProducts, getCategories, sortProducts } from "./lib/catalog.js";

const INITIAL_FILTERS = { query: "", category: "", sort: "relevance" };

export default function App() {
  const { status, products, retry } = useProducts();
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Estado derivado: se recalcula a partir de los productos y los filtros.
  // useMemo evita repetir el cálculo en renders que no cambian ninguno de los dos.
  const categories = useMemo(() => getCategories(products), [products]);
  const visible = useMemo(
    () => sortProducts(filterProducts(products, filters), filters.sort),
    [products, filters],
  );

  const updateFilter = (key) => (value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <main className="catalog">
      <h1>Catálogo Qhatu</h1>

      {status === "loading" && <p className="catalog__status">Cargando productos...</p>}

      {status === "error" && (
        <div className="catalog__error" role="alert">
          <p>No pudimos cargar los productos. Revisa tu conexión e inténtalo otra vez.</p>
          <button type="button" onClick={retry}>
            Reintentar
          </button>
        </div>
      )}

      {status === "success" && (
        <>
          <Filters
            query={filters.query}
            category={filters.category}
            sort={filters.sort}
            categories={categories}
            onQueryChange={updateFilter("query")}
            onCategoryChange={updateFilter("category")}
            onSortChange={updateFilter("sort")}
          />

          <p className="catalog__count" aria-live="polite">
            Mostrando {visible.length} de {products.length} productos
          </p>

          {visible.length > 0 ? (
            <ProductList products={visible} />
          ) : (
            <div className="catalog__empty">
              <p>No encontramos productos que coincidan con tu búsqueda.</p>
              <button type="button" onClick={() => setFilters(INITIAL_FILTERS)}>
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
