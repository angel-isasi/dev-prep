import { describe, expect, test } from "vitest";
import { avisoDe, procesoAbierto } from "./juego-vigilante.js";

describe("vigilante del juego", () => {
  test("avisa a los 10 minutos, al llegar a cero y al jugar sin haber cumplido", () => {
    expect(avisoDe({ restante: 12, bloqueado: false, jugando: true }, { restante: 10, bloqueado: false }, true)).toMatch(/10 minutos/);
    expect(avisoDe({ restante: 1, bloqueado: false, jugando: true }, { restante: 0, bloqueado: false }, true)).toMatch(/Se acabó/);
    expect(avisoDe({ restante: 0, bloqueado: true, jugando: false }, { restante: 0, bloqueado: true }, true)).toMatch(/meta/);
  });

  test("no repite avisos ni avisa si no estás jugando", () => {
    expect(avisoDe({ restante: 30, bloqueado: false, jugando: true }, { restante: 29, bloqueado: false }, true)).toBeNull();
    expect(avisoDe({ restante: 0, bloqueado: true, jugando: true }, { restante: 0, bloqueado: true }, true)).toBeNull();
    expect(avisoDe({ restante: 12, bloqueado: false }, { restante: 10, bloqueado: false }, false)).toBeNull();
  });

  test("detecta el proceso en la salida de tasklist", async () => {
    if (process.platform !== "win32") return;
    const falso = (_c, _a, _o, cb) => cb(null, '"System","4","Services","0","144 K"\r\n"dota2.exe","9000","Console","1","3,000,000 K"\r\n');
    expect(await procesoAbierto(["dota2.exe"], falso)).toBe(true);
    expect(await procesoAbierto(["otro.exe"], falso)).toBe(false);
  });
});
