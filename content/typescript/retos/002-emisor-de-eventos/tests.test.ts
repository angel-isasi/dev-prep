import { test, expect, expectTypeOf, vi } from "vitest";
import { Emisor } from "./solucion";

type EventosChat = {
  mensaje: { de: string; texto: string };
  conectado: { usuario: string };
  escribiendo: boolean;
};

test("on registra un oyente y emit lo llama con el payload", () => {
  const chat = new Emisor<EventosChat>();
  const oyente = vi.fn();
  chat.on("mensaje", oyente);
  chat.emit("mensaje", { de: "Ana", texto: "Hola" });
  expect(oyente).toHaveBeenCalledWith({ de: "Ana", texto: "Hola" });
});

test("varios oyentes del mismo evento se llaman en el orden en que se registraron", () => {
  const chat = new Emisor<EventosChat>();
  const orden: string[] = [];
  chat.on("conectado", ({ usuario }) => orden.push(`primero ${usuario}`));
  chat.on("conectado", ({ usuario }) => orden.push(`segundo ${usuario}`));
  chat.emit("conectado", { usuario: "Luis" });
  expect(orden).toEqual(["primero Luis", "segundo Luis"]);
});

test("cada evento llama solo a sus oyentes", () => {
  const chat = new Emisor<EventosChat>();
  const alMensaje = vi.fn();
  const alEscribir = vi.fn();
  chat.on("mensaje", alMensaje);
  chat.on("escribiendo", alEscribir);
  chat.emit("escribiendo", true);
  expect(alEscribir).toHaveBeenCalledWith(true);
  expect(alMensaje).not.toHaveBeenCalled();
});

test("emitir un evento sin oyentes no falla", () => {
  const chat = new Emisor<EventosChat>();
  expect(() => chat.emit("conectado", { usuario: "Ana" })).not.toThrow();
});

test("on devuelve una función para darse de baja", () => {
  const chat = new Emisor<EventosChat>();
  const oyente = vi.fn();
  const darseDeBaja = chat.on("escribiendo", oyente);
  chat.emit("escribiendo", true);
  darseDeBaja();
  chat.emit("escribiendo", false);
  expect(oyente).toHaveBeenCalledTimes(1);
});

test("off quita solo ese oyente", () => {
  const chat = new Emisor<EventosChat>();
  const a = vi.fn();
  const b = vi.fn();
  chat.on("conectado", a);
  chat.on("conectado", b);
  chat.off("conectado", a);
  chat.emit("conectado", { usuario: "Ana" });
  expect(a).not.toHaveBeenCalled();
  expect(b).toHaveBeenCalledTimes(1);
});

test("el payload queda tipado según el evento (lo revisa tsc)", () => {
  const chat = new Emisor<EventosChat>();
  chat.on("mensaje", (payload) => {
    expectTypeOf(payload).toEqualTypeOf<{ de: string; texto: string }>();
  });
  chat.on("escribiendo", (payload) => {
    expectTypeOf(payload).toEqualTypeOf<boolean>();
  });
  const probar = () => {
    // @ts-expect-error a un mensaje le falta "texto"
    chat.emit("mensaje", { de: "Ana" });
    // @ts-expect-error "escribiendo" lleva un boolean, no un texto
    chat.emit("escribiendo", "sí");
    // @ts-expect-error "desconectado" no es un evento de EventosChat
    chat.on("desconectado", () => {});
  };
  expect(typeof probar).toBe("function");
});
