// @vitest-environment jsdom
import { test, expect, afterEach } from "vitest";
import { useEffect, useState } from "react";
import { probarPromo } from "./solucion.jsx";

// Tu función `probarPromo` se corre contra el componente correcto (debe pasar)
// y contra versiones con errores (debe fallar, o sea, lanzar un error).

const fetchOriginal = globalThis.fetch;

afterEach(() => {
  // Por si tu prueba no deja fetch como estaba.
  globalThis.fetch = fetchOriginal;
});

// ===== El componente correcto (el del enunciado) =====
function Promo() {
  const [estado, setEstado] = useState({ cargando: true, promo: null, error: false });
  useEffect(() => {
    fetch("/api/promo")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((promo) => setEstado({ cargando: false, promo, error: false }))
      .catch(() => setEstado({ cargando: false, promo: null, error: true }));
  }, []);
  if (estado.cargando) return <p>Cargando…</p>;
  if (estado.error) return <p role="alert">No pudimos cargar la promo</p>;
  return <p>Promo: {estado.promo.titulo}</p>;
}

// ===== Versiones con errores =====

// Pide una URL equivocada.
function PromoUrlEquivocada() {
  const [estado, setEstado] = useState({ cargando: true, promo: null, error: false });
  useEffect(() => {
    fetch("/api/promos")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((promo) => setEstado({ cargando: false, promo, error: false }))
      .catch(() => setEstado({ cargando: false, promo: null, error: true }));
  }, []);
  if (estado.cargando) return <p>Cargando…</p>;
  if (estado.error) return <p role="alert">No pudimos cargar la promo</p>;
  return <p>Promo: {estado.promo.titulo}</p>;
}

// No revisa `ok`: con un error del servidor no muestra la alerta.
function PromoIgnoraError() {
  const [estado, setEstado] = useState({ cargando: true, promo: null, error: false });
  useEffect(() => {
    fetch("/api/promo")
      .then(() => setEstado({ cargando: false, promo: { titulo: "" }, error: false }))
      .catch(() => setEstado({ cargando: false, promo: null, error: true }));
  }, []);
  if (estado.cargando) return <p>Cargando…</p>;
  if (estado.error) return <p role="alert">No pudimos cargar la promo</p>;
  return <p>Promo: {estado.promo.titulo}</p>;
}

// Muestra un campo que no existe: nunca aparece el título.
function PromoCampoEquivocado() {
  const [estado, setEstado] = useState({ cargando: true, promo: null, error: false });
  useEffect(() => {
    fetch("/api/promo")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((promo) => setEstado({ cargando: false, promo, error: false }))
      .catch(() => setEstado({ cargando: false, promo: null, error: true }));
  }, []);
  if (estado.cargando) return <p>Cargando…</p>;
  if (estado.error) return <p role="alert">No pudimos cargar la promo</p>;
  return <p>Promo: {estado.promo.nombre}</p>;
}

test("tu prueba pasa con el componente correcto", async () => {
  await probarPromo(Promo);
});

test("tu prueba detecta que se pide una URL equivocada", async () => {
  await expect(probarPromo(PromoUrlEquivocada)).rejects.toThrow();
});

test("tu prueba detecta que no se muestra la alerta cuando el servidor falla", async () => {
  await expect(probarPromo(PromoIgnoraError)).rejects.toThrow();
});

test("tu prueba detecta que no se muestra el título de la promo", async () => {
  await expect(probarPromo(PromoCampoEquivocado)).rejects.toThrow();
});
