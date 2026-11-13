import { useState } from "react";

export function MenuFiltrable({ pizzas }) {
  // Lo único que se guarda: qué filtro eligió el usuario.
  const [categoria, setCategoria] = useState("todas");

  // Derivado: categorías sin repetir (Set conserva el orden de aparición).
  const categorias = ["todas", ...new Set(pizzas.map((p) => p.categoria))];

  // Derivado: pizzas visibles según el filtro.
  const visibles =
    categoria === "todas" ? pizzas : pizzas.filter((p) => p.categoria === categoria);

  return (
    <div>
      <div>
        {categorias.map((c) => (
          <button key={c} aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
            {c}
          </button>
        ))}
      </div>
      <ul>
        {visibles.map((p) => (
          <li key={p.nombre}>{p.nombre}</li>
        ))}
      </ul>
    </div>
  );
}
