import { describe, expect, test } from "vitest";
import { cabeceraVapid, cifrarAviso, deB64url, generarClavesVapid, verificarVapid } from "./webpush.js";

describe("Web Push sin librerías", () => {
  test("cifrado aes128gcm: coincide con el ejemplo del RFC 8291 (sección 5)", () => {
    const cuerpo = cifrarAviso(
      "When I grow up, I want to be a watermelon",
      { p256dh: "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4", auth: "BTBZMqHH6r4Tts7J_aSIgg" },
      { privadaEfimera: deB64url("yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw"), sal: deB64url("DGv6ra1nlYgDCS1FRnbzlw") },
    );
    expect(cuerpo.toString("base64url")).toBe(
      "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN",
    );
  });

  test("VAPID: firma ES256 válida, para el origen del servicio y con vencimiento", () => {
    const claves = generarClavesVapid();
    expect(deB64url(claves.publica)).toHaveLength(65);
    const cabecera = cabeceraVapid("https://fcm.googleapis.com/fcm/send/abc", claves, "https://dev-prep.angel-isasi.com", 1_700_000_000_000);
    expect(cabecera).toMatch(/^vapid t=.+, k=/);
    const { valida, carga } = verificarVapid(cabecera, claves);
    expect(valida).toBe(true);
    expect(carga).toMatchObject({ aud: "https://fcm.googleapis.com", sub: "https://dev-prep.angel-isasi.com", exp: 1_700_000_000 + 12 * 3600 });
  });
});
