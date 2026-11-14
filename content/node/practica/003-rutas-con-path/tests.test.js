import { test, expect } from "vitest";
import path from "node:path";
import { rutaDeSubida, tipoDeArchivo, nombreSinExtension, cambiarExtension } from "./solucion.js";

test("rutaDeSubida arma la ruta con el separador del sistema", () => {
  expect(rutaDeSubida("datos", "ana", "foto.png")).toBe(path.join("datos", "subidas", "ana", "foto.png"));
});

test("rutaDeSubida no duplica separadores si la base termina en barra", () => {
  expect(rutaDeSubida("datos/", "luis", "cv.pdf")).toBe(path.join("datos", "subidas", "luis", "cv.pdf"));
});

test("tipoDeArchivo reconoce imágenes, sin importar mayúsculas", () => {
  for (const nombre of ["playa.jpg", "selfie.jpeg", "logo.PNG", "anim.gif", "banner.webp"]) {
    expect(tipoDeArchivo(nombre)).toBe("imagen");
  }
});

test("tipoDeArchivo reconoce documentos", () => {
  for (const nombre of ["cv.pdf", "informe.DOCX", "notas.txt"]) {
    expect(tipoDeArchivo(nombre)).toBe("documento");
  }
});

test("tipoDeArchivo devuelve \"otro\" si no conoce la extensión o no hay extensión", () => {
  expect(tipoDeArchivo("app.js")).toBe("otro");
  expect(tipoDeArchivo("LEEME")).toBe("otro");
  expect(tipoDeArchivo("copia.tar.gz")).toBe("otro");
});

test("nombreSinExtension quita carpetas y solo la última extensión", () => {
  expect(nombreSinExtension(path.join("fotos", "2026", "playa.jpg"))).toBe("playa");
  expect(nombreSinExtension("informe.final.pdf")).toBe("informe.final");
  expect(nombreSinExtension("LEEME")).toBe("LEEME");
});

test("cambiarExtension conserva la carpeta y cambia solo la extensión", () => {
  expect(cambiarExtension(path.join("fotos", "playa.png"), ".webp")).toBe(path.join("fotos", "playa.webp"));
  expect(cambiarExtension("cv.docx", ".pdf")).toBe("cv.pdf");
});
