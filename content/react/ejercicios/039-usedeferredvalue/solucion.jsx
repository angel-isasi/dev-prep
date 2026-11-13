import { memo, useDeferredValue, useState } from "react";

// memo: si `texto` e `items` no cambiaron, React reutiliza el render anterior.
export const ListaPesada = memo(function ListaPesada({ texto, items }) {
  const buscado = texto.trim().toLowerCase();
  const visibles = items.filter((item) => item.toLowerCase().includes(buscado));

  if (visibles.length === 0) return <p>Sin resultados</p>;
  return (
    <ul>
      {visibles.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
});

export function BuscadorFluido({ items }) {
  const [texto, setTexto] = useState("");

  // Copia "atrasada" de texto: React la actualiza cuando no hay nada urgente.
  const textoDiferido = useDeferredValue(texto);
  const desactualizado = texto !== textoDiferido;

  return (
    <div>
      <input aria-label="Buscar" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <div style={{ opacity: desactualizado ? 0.5 : 1 }}>
        <ListaPesada texto={textoDiferido} items={items} />
      </div>
    </div>
  );
}
