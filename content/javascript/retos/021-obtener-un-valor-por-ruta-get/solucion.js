export function obtener(obj, ruta, porDefecto) {
  // "a.b[0].c" -> "a.b.0.c" -> ["a", "b", "0", "c"]
  const partes = ruta.replace(/\[(\d+)\]/g, ".$1").split(".");

  let actual = obj;
  for (const parte of partes) {
    if (actual == null) return porDefecto;
    actual = actual[parte];
  }

  return actual === undefined ? porDefecto : actual;
}
