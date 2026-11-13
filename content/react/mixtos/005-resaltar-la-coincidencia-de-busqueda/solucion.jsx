// Antepone "\" a cada carácter especial de las regex: "(" -> "\(".
function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function Resaltar({ texto, busqueda }) {
  if (!busqueda.trim()) return <>{texto}</>;

  // El grupo ( ) hace que split CONSERVE las coincidencias en el resultado.
  const patron = new RegExp(`(${escaparRegex(busqueda)})`, "gi");
  const partes = texto.split(patron);
  const buscado = busqueda.toLowerCase();

  return (
    <>
      {partes.map((parte, indice) =>
        parte.toLowerCase() === buscado ? <mark key={indice}>{parte}</mark> : parte
      )}
    </>
  );
}
