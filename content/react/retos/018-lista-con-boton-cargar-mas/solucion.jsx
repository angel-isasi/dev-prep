import { useEffect, useState } from "react";

export function CargarMas({ obtenerPagina }) {
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(0); // última página cargada
  const [hayMas, setHayMas] = useState(true);
  const [cargando, setCargando] = useState(true); // empieza cargando la página 1

  // Primera página: al montar.
  useEffect(() => {
    let activo = true;
    obtenerPagina(1).then(({ datos, siguiente }) => {
      if (!activo) return; // el componente se desmontó o el efecto se repitió
      setItems(datos); // reemplaza: si el efecto corre dos veces, no se duplica
      setHayMas(siguiente);
      setPagina(1);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [obtenerPagina]);

  async function cargarSiguiente() {
    if (cargando) return; // evita dobles clics
    setCargando(true);
    const { datos, siguiente } = await obtenerPagina(pagina + 1);
    setItems((anteriores) => [...anteriores, ...datos]); // agrega al final
    setHayMas(siguiente);
    setPagina((p) => p + 1);
    setCargando(false);
  }

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {hayMas && (
        <button onClick={cargarSiguiente} disabled={cargando}>
          {cargando ? "Cargando…" : "Cargar más"}
        </button>
      )}
    </div>
  );
}
