// Tests para haceCuanto(fecha, ahora)

// Una hora fija: en los tests, tú decides qué hora es.
const AHORA = new Date("2026-03-10T12:00:00Z");
const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
// La fecha que está `ms` milisegundos antes de AHORA.
const antes = (ms) => new Date(AHORA.getTime() - ms);

export function misTests({ test, expect }, haceCuanto) {
  test("muestra los minutos", () => {
    expect(haceCuanto(antes(5 * MINUTO), AHORA)).toBe("hace 5 minutos");
  });

  test("menos de un minuto es 'hace un momento'", () => {
    expect(haceCuanto(antes(59 * SEGUNDO), AHORA)).toBe("hace un momento");
  });

  test("60 segundos justos ya es 'hace 1 minuto'", () => {
    expect(haceCuanto(antes(60 * SEGUNDO), AHORA)).toBe("hace 1 minuto");
  });

  test("cuenta minutos completos: 90 segundos es 1 minuto", () => {
    expect(haceCuanto(antes(90 * SEGUNDO), AHORA)).toBe("hace 1 minuto");
  });

  test("una hora justa va en singular", () => {
    expect(haceCuanto(antes(HORA), AHORA)).toBe("hace 1 hora");
  });

  test("varias horas van en plural", () => {
    expect(haceCuanto(antes(5 * HORA), AHORA)).toBe("hace 5 horas");
  });

  test("entre 24 y 48 horas es 'ayer'", () => {
    expect(haceCuanto(antes(30 * HORA), AHORA)).toBe("ayer");
  });

  test("desde 48 horas muestra los días", () => {
    expect(haceCuanto(antes(3 * 24 * HORA), AHORA)).toBe("hace 3 días");
  });

  test("una fecha en el futuro lanza un error", () => {
    const enUnMinuto = new Date(AHORA.getTime() + MINUTO);
    expect(() => haceCuanto(enUnMinuto, AHORA)).toThrow();
  });
}
