// Tests para haceCuanto(fecha, ahora)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 6 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

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

  // Agrega aquí más tests. Pistas: prueba cada fila de la tabla del enunciado,
  // los bordes entre filas (59 y 60 segundos, 1 minuto y medio, 1 hora justa,
  // ayer) y una fecha en el futuro.
}
