import { test, expect, expectTypeOf } from "vitest";
import {
  NotificadorEmail,
  NotificadorSMS,
  NotificadorPush,
  notificarATodos,
  type Notificador,
  type Canal,
} from "./solucion";

test("NotificadorEmail envía con el formato correcto", () => {
  const email = new NotificadorEmail("ana@correo.com");
  expect(email.enviar("Tu pedido salió")).toBe("Email a ana@correo.com: Tu pedido salió");
  expect(email.canal).toBe("email");
});

test("NotificadorEmail rechaza un email sin @", () => {
  expect(() => new NotificadorEmail("ana-correo.com")).toThrow("Email inválido");
});

test("NotificadorSMS envía y recorta el mensaje a 160 caracteres", () => {
  const sms = new NotificadorSMS("987654321");
  expect(sms.enviar("Tu pedido salió")).toBe("SMS a 987654321: Tu pedido salió");
  expect(sms.enviar("x".repeat(200))).toBe("SMS a 987654321: " + "x".repeat(160));
  expect(sms.canal).toBe("sms");
});

test("NotificadorPush envía con el formato correcto", () => {
  const push = new NotificadorPush("celular-ana");
  expect(push.enviar("Llegó")).toBe("Push a celular-ana: Llegó");
  expect(push.canal).toBe("push");
});

test("notificarATodos llama a enviar en cada uno, en orden", () => {
  const lista = [new NotificadorEmail("ana@correo.com"), new NotificadorSMS("987654321"), new NotificadorPush("celular-ana")];
  expect(notificarATodos(lista, "Llegó")).toEqual([
    "Email a ana@correo.com: Llegó",
    "SMS a 987654321: Llegó",
    "Push a celular-ana: Llegó",
  ]);
  expect(notificarATodos([], "Hola")).toEqual([]);
});

test("notificarATodos funciona con cualquier objeto que cumpla la interfaz", () => {
  const deMentira: Notificador = { canal: "push", enviar: (mensaje) => `Prueba: ${mensaje}` };
  expect(notificarATodos([deMentira], "ok")).toEqual(["Prueba: ok"]);
});

test("las tres clases son Notificador y la interfaz exige enviar (lo revisa tsc)", () => {
  const lista: Notificador[] = [new NotificadorEmail("a@b.pe"), new NotificadorSMS("999"), new NotificadorPush("x")];
  expectTypeOf(lista[0].canal).toEqualTypeOf<Canal>();
  expectTypeOf(lista[0].enviar).toEqualTypeOf<(mensaje: string) => string>();
  expectTypeOf(notificarATodos).returns.toEqualTypeOf<string[]>();
  const probar = () => {
    // @ts-expect-error a este objeto le falta el método enviar
    const incompleto: Notificador = { canal: "email" };
    // @ts-expect-error "paloma" no es un Canal
    const canalInventado: Notificador = { canal: "paloma", enviar: (m: string) => m };
    return [incompleto, canalInventado];
  };
  expect(typeof probar).toBe("function");
});
