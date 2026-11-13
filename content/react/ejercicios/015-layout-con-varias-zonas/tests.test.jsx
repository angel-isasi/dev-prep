// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Layout } from "./solucion.jsx";

test("el encabezado va dentro del <header>", () => {
  render(<Layout encabezado={<h1>Padre Gino</h1>}><p>Menú</p></Layout>);
  expect(screen.getByRole("banner").textContent).toBe("Padre Gino");
});

test("los children van dentro del <main>", () => {
  render(
    <Layout encabezado={<h1>Padre Gino</h1>}>
      <p>Menú</p>
      <p>Promociones</p>
    </Layout>
  );
  expect(screen.getByRole("main").textContent).toBe("MenúPromociones");
});

test("sin pie no hay <footer>", () => {
  render(<Layout encabezado={<h1>Padre Gino</h1>}><p>Menú</p></Layout>);
  expect(screen.queryByRole("contentinfo")).toBeNull();
});

test("con pie se pinta el <footer> con su contenido", () => {
  render(
    <Layout encabezado={<h1>Padre Gino</h1>} pie={<small>Lima, 2026</small>}>
      <p>Menú</p>
    </Layout>
  );
  expect(screen.getByRole("contentinfo").textContent).toBe("Lima, 2026");
});

test("las zonas salen en orden: header, main y footer", () => {
  const { container } = render(
    <Layout encabezado={<h1>Padre Gino</h1>} pie={<small>Lima</small>}>
      <p>Menú</p>
    </Layout>
  );
  const etiquetas = [...container.children].map((el) => el.tagName);
  expect(etiquetas).toEqual(["HEADER", "MAIN", "FOOTER"]);
});
