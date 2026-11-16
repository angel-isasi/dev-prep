// @vitest-environment jsdom
// Tests de aceptación: prueban lo que ve y hace el usuario, no cómo está hecho por dentro.
import { test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { registerUser } from "../src/api.js";

// Reemplazamos la API falsa por una controlada, sin esperas.
vi.mock("../src/api.js", () => ({ registerUser: vi.fn() }));

beforeEach(() => {
  registerUser.mockReset();
});

const email = () => screen.getByLabelText("Correo electrónico");
const password = () => screen.getByLabelText("Contraseña");
const confirm = () => screen.getByLabelText("Confirmar contraseña");
const terms = () => screen.getByRole("checkbox", { name: "Acepto los términos y condiciones" });
const submit = () => screen.getByRole("button", { name: "Crear cuenta" });

/** Texto de los elementos a los que apunta aria-describedby (lo que lee un lector de pantalla). */
function description(element) {
  const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
}

function setup() {
  const user = userEvent.setup();
  render(<App />);
  return user;
}

async function fillValidForm(user, values = {}) {
  await user.type(email(), values.email ?? "angel@wayra.pe");
  await user.type(password(), values.password ?? "Wayra2026");
  await user.type(confirm(), values.confirm ?? values.password ?? "Wayra2026");
  await user.click(terms());
}

test("al inicio el botón está deshabilitado y ningún campo muestra error", () => {
  setup();
  expect(submit().disabled).toBe(true);
  for (const field of [email(), password(), confirm()]) {
    expect(field.getAttribute("aria-invalid")).not.toBe("true");
  }
  expect(screen.queryByText(/Ingresa|debe tener|no coinciden|Confirma tu/)).toBeNull();
  expect(description(password())).toContain("Mínimo 8 caracteres, con al menos una mayúscula y un número.");
});

test("el error del correo aparece al salir del campo y luego se actualiza mientras escribes", async () => {
  const user = setup();

  await user.click(email());
  expect(screen.queryByText("Ingresa tu correo electrónico.")).toBeNull();
  await user.tab();
  expect(screen.getByText("Ingresa tu correo electrónico.")).toBeTruthy();
  expect(email().getAttribute("aria-invalid")).toBe("true");
  expect(description(email())).toContain("Ingresa tu correo electrónico.");

  await user.type(email(), "angel@wayra");
  expect(description(email())).toContain("Ingresa un correo válido, por ejemplo nombre@dominio.com.");

  await user.type(email(), ".pe");
  expect(email().getAttribute("aria-invalid")).not.toBe("true");
  expect(screen.queryByText(/correo válido/)).toBeNull();
});

test("la contraseña muestra en vivo la primera regla que no cumple", async () => {
  const user = setup();

  await user.type(password(), "abc");
  expect(screen.queryByText(/debe tener/)).toBeNull(); // todavía no sales del campo
  await user.tab();
  expect(description(password())).toContain("La contraseña debe tener al menos 8 caracteres.");
  expect(description(password())).toContain("Mínimo 8 caracteres"); // la ayuda sigue asociada

  await user.type(password(), "defgh");
  expect(description(password())).toContain("La contraseña debe tener al menos una letra mayúscula.");

  await user.clear(password());
  expect(description(password())).toContain("Ingresa una contraseña.");

  await user.type(password(), "Abcdefgh");
  expect(description(password())).toContain("La contraseña debe tener al menos un número.");

  await user.type(password(), "1");
  expect(password().getAttribute("aria-invalid")).not.toBe("true");
  expect(screen.queryByText(/debe tener/)).toBeNull();
  // El correo no se tocó: no debe mostrar error.
  expect(screen.queryByText("Ingresa tu correo electrónico.")).toBeNull();
});

test("confirmar contraseña avisa si no coinciden y se revisa otra vez al cambiar la contraseña", async () => {
  const user = setup();

  await user.type(password(), "Wayra2026");
  await user.click(confirm());
  await user.tab();
  expect(description(confirm())).toContain("Confirma tu contraseña.");

  await user.type(confirm(), "Wayra2025");
  expect(description(confirm())).toContain("Las contraseñas no coinciden.");
  expect(confirm().getAttribute("aria-invalid")).toBe("true");

  await user.clear(confirm());
  await user.type(confirm(), "Wayra2026");
  expect(screen.queryByText("Las contraseñas no coinciden.")).toBeNull();

  await user.type(password(), "!");
  expect(screen.getByText("Las contraseñas no coinciden.")).toBeTruthy();
});

test("el botón solo se habilita con todo válido y los términos aceptados", async () => {
  const user = setup();

  await user.type(email(), "angel@wayra.pe");
  await user.type(password(), "Wayra2026");
  await user.type(confirm(), "Wayra2026");
  expect(submit().disabled).toBe(true);

  await user.click(terms());
  expect(submit().disabled).toBe(false);

  await user.click(terms());
  expect(submit().disabled).toBe(true);

  await user.click(terms());
  await user.clear(email());
  await user.type(email(), "angel@");
  expect(submit().disabled).toBe(true);
});

test("al enviar muestra Enviando..., no envía dos veces y luego muestra el éxito", async () => {
  let respond;
  registerUser.mockReturnValue(new Promise((resolve) => (respond = resolve)));
  const user = setup();
  await fillValidForm(user, { email: "  angel@wayra.pe  " });

  await user.click(submit());
  const sending = screen.getByRole("button", { name: "Enviando..." });
  expect(sending.disabled).toBe(true);
  await user.click(sending);

  expect(registerUser).toHaveBeenCalledTimes(1);
  expect(registerUser).toHaveBeenCalledWith({ email: "angel@wayra.pe", password: "Wayra2026" });

  respond({ id: "usr_1", email: "angel@wayra.pe" });
  expect(await screen.findByRole("heading", { name: "¡Cuenta creada!" })).toBeTruthy();
  expect(screen.getByText("Te enviamos un correo de confirmación a angel@wayra.pe.")).toBeTruthy();
  expect(screen.queryByLabelText("Correo electrónico")).toBeNull();
});

test("si el servidor rechaza el registro muestra su mensaje y permite volver a enviar", async () => {
  registerUser.mockRejectedValueOnce(new Error("Este correo ya está registrado. Inicia sesión o usa otro correo."));
  const user = setup();
  await fillValidForm(user, { email: "usado@wayra.pe" });

  await user.click(submit());
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain("Este correo ya está registrado.");
  expect(email().value).toBe("usado@wayra.pe");
  expect(submit().disabled).toBe(false);

  registerUser.mockResolvedValueOnce({ id: "usr_2", email: "angel@wayra.pe" });
  await user.clear(email());
  await user.type(email(), "angel@wayra.pe");
  await user.click(submit());
  expect(await screen.findByRole("heading", { name: "¡Cuenta creada!" })).toBeTruthy();
  expect(registerUser).toHaveBeenCalledTimes(2);
});
