import path from "node:path";

const IMAGENES = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const DOCUMENTOS = [".pdf", ".docx", ".txt"];

export function rutaDeSubida(carpetaBase, usuario, archivo) {
  // join pone el separador correcto y limpia los que sobran ("datos/" + "subidas").
  return path.join(carpetaBase, "subidas", usuario, archivo);
}

export function tipoDeArchivo(nombre) {
  // extname devuelve la extensión CON el punto, o "" si no tiene.
  const ext = path.extname(nombre).toLowerCase();
  if (IMAGENES.includes(ext)) return "imagen";
  if (DOCUMENTOS.includes(ext)) return "documento";
  return "otro";
}

export function nombreSinExtension(ruta) {
  // parse separa la ruta en partes: dir, base, name, ext.
  return path.parse(ruta).name;
}

export function cambiarExtension(ruta, nuevaExtension) {
  const { dir, name } = path.parse(ruta);
  return path.join(dir, name + nuevaExtension);
}
