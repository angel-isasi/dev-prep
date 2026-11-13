// Se crea una sola vez: construir un formateador de Intl es costoso.
const formato = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

// De la unidad más grande a la más chica, con su tamaño en segundos.
const UNIDADES = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function haceCuanto(fecha, ahora = Date.now()) {
  // Negativo si la fecha ya pasó, positivo si es futura.
  const segundos = Math.round((new Date(fecha).getTime() - ahora) / 1000);

  for (const [unidad, tamano] of UNIDADES) {
    if (Math.abs(segundos) >= tamano) {
      return formato.format(Math.round(segundos / tamano), unidad);
    }
  }
  return "ahora mismo";
}

export function Publicado({ fecha, ahora }) {
  return <time dateTime={fecha}>{haceCuanto(fecha, ahora)}</time>;
}
