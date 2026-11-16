// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NuevaTarea } from "./solucion.jsx";

afterEach(() => {
  vi.unstubAllGlobals();
});

function respuesta(cuerpo, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => cuerpo };
}

/** fetch falso que queda pendiente hasta que llamas a `soltar(respuesta)`. */
function fetchManual() {
  let resolver;
  const fetchFalso = vi.fn(() => new Promise((r) => (resolver = r)));
  return { fetchFalso, soltar: (valor) => act(async () => resolver(valor)) };
}

const campo = () => screen.getByRole("textbox", { name: "Título" });
const escribir = (texto) => fireEvent.change(campo(), { target: { value: texto } });
const botonEnviar = () => screen.getByRole("button");

/** Lee un encabezado sea objeto simple o Headers, sin importar mayúsculas. */
function encabezado(opciones, nombre) {
  const h = opciones?.headers;
  if (!h) return undefined;
  if (typeof h.get === "function") return h.get(nombre);
  const clave = Object.keys(h).find((k) => k.toLowerCase() === nombre.toLowerCase());
  return clave ? h[clave] : undefined;
}

test("envía un POST a /api/practica/tareas con JSON y el título sin espacios a los lados", async () => {
  const fetchFalso = vi.fn(async () => respuesta({ id: 4, titulo: "Estudiar fetch", hecha: false }, 201));
  vi.stubGlobal("fetch", fetchFalso);
  render(<NuevaTarea />);

  escribir("  Estudiar fetch  ");
  fireEvent.click(screen.getByRole("button", { name: "Agregar" }));
  await screen.findByRole("status");

  expect(fetchFalso).toHaveBeenCalledTimes(1);
  const [url, opciones] = fetchFalso.mock.calls[0];
  expect(url).toBe("/api/practica/tareas");
  expect(opciones.method).toBe("POST");
  expect(encabezado(opciones, "Content-Type")).toContain("application/json");
  expect(JSON.parse(opciones.body)).toEqual({ titulo: "Estudiar fetch" });
});

test('mientras envía, el botón dice "Guardando..." y está deshabilitado (no hay doble envío)', async () => {
  const { fetchFalso, soltar } = fetchManual();
  vi.stubGlobal("fetch", fetchFalso);
  render(<NuevaTarea />);

  escribir("Estudiar fetch");
  fireEvent.click(botonEnviar());
  expect(botonEnviar().textContent).toBe("Guardando...");
  expect(botonEnviar().disabled).toBe(true);

  fireEvent.click(botonEnviar());
  fireEvent.submit(campo().closest("form"));
  expect(fetchFalso).toHaveBeenCalledTimes(1);

  await soltar(respuesta({ id: 4, titulo: "Estudiar fetch", hecha: false }, 201));
  expect(botonEnviar().textContent).toBe("Agregar");
  expect(botonEnviar().disabled).toBe(false);
});

test("si sale bien: limpia el campo, avisa y entrega a alCrear la tarea del servidor", async () => {
  const alCrear = vi.fn();
  vi.stubGlobal("fetch", vi.fn(async () => respuesta({ id: 7, titulo: "Estudiar fetch", hecha: false }, 201)));
  render(<NuevaTarea alCrear={alCrear} />);

  escribir("Estudiar fetch");
  fireEvent.click(botonEnviar());

  expect((await screen.findByRole("status")).textContent).toBe("Tarea creada: Estudiar fetch");
  expect(campo().value).toBe("");
  expect(alCrear).toHaveBeenCalledTimes(1);
  expect(alCrear).toHaveBeenCalledWith({ id: 7, titulo: "Estudiar fetch", hecha: false });
  expect(screen.queryByRole("alert")).toBeNull();
});

test("con un 400 muestra el mensaje del servidor y conserva lo escrito", async () => {
  const alCrear = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => respuesta({ error: "El título no puede pasar de 120 caracteres" }, 400)),
  );
  render(<NuevaTarea alCrear={alCrear} />);

  const largo = "Una tarea con un título larguísimo".repeat(5);
  escribir(largo);
  fireEvent.click(botonEnviar());

  expect((await screen.findByRole("alert")).textContent).toBe("El título no puede pasar de 120 caracteres");
  expect(campo().value).toBe(largo);
  expect(botonEnviar().disabled).toBe(false);
  expect(alCrear).not.toHaveBeenCalled();
  expect(screen.queryByRole("status")).toBeNull();
});

test('sin conexión muestra "No se pudo conectar con el servidor" y vuelve a habilitar el botón', async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }),
  );
  render(<NuevaTarea />);
  escribir("Estudiar fetch");
  fireEvent.click(botonEnviar());

  expect((await screen.findByRole("alert")).textContent).toBe("No se pudo conectar con el servidor");
  expect(botonEnviar().disabled).toBe(false);
  expect(campo().value).toBe("Estudiar fetch");
});

test('con el título vacío no llama al servidor y pide "Escribe un título"', async () => {
  const fetchFalso = vi.fn();
  vi.stubGlobal("fetch", fetchFalso);
  render(<NuevaTarea />);
  escribir("   ");
  fireEvent.click(botonEnviar());
  expect((await screen.findByRole("alert")).textContent).toBe("Escribe un título");
  expect(fetchFalso).not.toHaveBeenCalled();
});
