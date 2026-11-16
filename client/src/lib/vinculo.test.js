import { describe, expect, test } from "vitest";
import { decidirVinculo, tokenValido, urlDeVinculoValida } from "./vinculo.js";

const URL_OK = "https://abc123xyz.lambda-url.us-east-1.on.aws/";
const TOKEN_OK = "a".repeat(64);

describe("vincular", () => {
  test("solo acepta URLs de funciones Lambda de AWS", () => {
    expect(urlDeVinculoValida(URL_OK)).toBe(true);
    expect(urlDeVinculoValida("https://abc123xyz.lambda-url.us-east-1.on.aws")).toBe(true);
    expect(urlDeVinculoValida("https://atacante.com/")).toBe(false);
    expect(urlDeVinculoValida("https://abc.lambda-url.us-east-1.on.aws.atacante.com/")).toBe(false);
    expect(urlDeVinculoValida("http://abc.lambda-url.us-east-1.on.aws/")).toBe(false);
    expect(urlDeVinculoValida("https://abc.lambda-url.us-east-1.on.aws/robar")).toBe(false);
    expect(urlDeVinculoValida(null)).toBe(false);
  });

  test("el token debe tener el formato que genera aws:crear", () => {
    expect(tokenValido(TOKEN_OK)).toBe(true);
    expect(tokenValido("corto")).toBe(false);
    expect(tokenValido("Z".repeat(64))).toBe(false);
  });

  test("decide qué hacer con el enlace", () => {
    expect(decidirVinculo({ url: null, token: null }, null)).toBe("sin-datos");
    expect(decidirVinculo({ url: "https://atacante.com/", token: TOKEN_OK }, null)).toBe("invalido");
    expect(decidirVinculo({ url: URL_OK, token: TOKEN_OK }, null)).toBe("vincular");
    expect(decidirVinculo({ url: URL_OK, token: TOKEN_OK }, { url: URL_OK.slice(0, -1) })).toBe("mismo");
    expect(decidirVinculo({ url: URL_OK, token: TOKEN_OK }, { url: "https://otra1.lambda-url.us-east-1.on.aws/" })).toBe("confirmar");
  });
});
