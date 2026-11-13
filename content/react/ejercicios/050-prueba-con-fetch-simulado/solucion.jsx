import { expect, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

export async function probarPromo(Promo) {
  const fetchOriginal = globalThis.fetch;
  try {
    // 1. Respuesta buena: fetch falso que devuelve algo parecido a una Response.
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ titulo: "2x1 en familiares" }),
    }));
    render(<Promo />);
    expect(screen.getByText("Cargando…")).toBeTruthy();
    // findBy espera (hasta 1 segundo) a que el texto aparezca.
    expect(await screen.findByText("Promo: 2x1 en familiares")).toBeTruthy();
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/promo");

    // Desmonta lo anterior antes de probar otro caso.
    cleanup();

    // 2. Respuesta mala: el servidor responde con error (ok: false).
    globalThis.fetch = vi.fn(async () => ({ ok: false }));
    render(<Promo />);
    const alerta = await screen.findByRole("alert");
    expect(alerta.textContent).toBe("No pudimos cargar la promo");
  } finally {
    // Pase lo que pase, deja fetch como estaba.
    globalThis.fetch = fetchOriginal;
  }
}
