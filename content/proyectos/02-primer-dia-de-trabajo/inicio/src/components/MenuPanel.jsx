import { useCallback, useEffect, useState } from "react";
import { getMenu, setDishAvailability } from "../api.js";
import { useSearch } from "../hooks/useSearch.js";
import { formatPrice } from "../utils/money.js";
import { SearchInput } from "./SearchInput.jsx";

// Carta del día: la cocina marca aquí los platos que se agotaron para que los mozos no los ofrezcan.
export function MenuPanel() {
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "ready"
  const { query, setQuery, results } = useSearch(menu, ["name", "category"]);

  const loadMenu = useCallback(async () => {
    setStatus("loading");
    try {
      setMenu(await getMenu());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  async function handleToggle(dish) {
    const updated = await setDishAvailability(dish.id, !dish.available);
    setMenu((current) => current.map((d) => (d.id === updated.id ? updated : d)));
  }

  return (
    <section className="panel" aria-labelledby="menu-title">
      <h2 id="menu-title">Carta</h2>
      <SearchInput label="Buscar platos" placeholder="Plato o categoría" value={query} onChange={setQuery} />

      {status === "loading" && <p className="info">Cargando carta...</p>}

      {status === "error" && (
        <div className="alert" role="alert">
          <p>No se pudo cargar la carta.</p>
          <button type="button" onClick={loadMenu}>
            Reintentar
          </button>
        </div>
      )}

      {status === "ready" && (
        <ul className="menu-list">
          {results.map((dish) => (
            <li key={dish.id} className={dish.available ? "dish" : "dish dish--out"}>
              <span className="dish__name">{dish.name}</span>
              <span className="dish__price">{formatPrice(dish.price)}</span>
              {!dish.available && <span className="badge badge--agotado">Agotado</span>}
              <button type="button" className="btn-ghost" onClick={() => handleToggle(dish)} aria-label={`${dish.available ? "Marcar agotado" : "Marcar disponible"}: ${dish.name}`}>
                {dish.available ? "Marcar agotado" : "Marcar disponible"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
