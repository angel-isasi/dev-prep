// Tests para conReintentos(pedir, intentos)

export function misTests({ test, expect }, conReintentos) {
  test("si funciona a la primera, devuelve los datos", async () => {
    const pedir = async () => "datos";
    expect(await conReintentos(pedir, 3)).toBe("datos");
  });

  test("si funciona a la primera, no vuelve a llamar", async () => {
    let llamadas = 0;
    const pedir = async () => {
      llamadas++;
      return "datos";
    };
    await conReintentos(pedir, 3);
    expect(llamadas).toBe(1);
  });

  test("si falla 2 veces y a la tercera funciona, devuelve los datos", async () => {
    let llamadas = 0;
    const pedir = async () => {
      llamadas++;
      if (llamadas < 3) throw new Error(`fallo ${llamadas}`);
      return "datos";
    };
    expect(await conReintentos(pedir, 3)).toBe("datos");
    expect(llamadas).toBe(3);
  });

  test("si todas fallan, la promesa se rechaza", async () => {
    const pedir = async () => {
      throw new Error("sin conexión");
    };
    await expect(conReintentos(pedir, 3)).rejects.toThrow("sin conexión");
  });

  test("si todas fallan, llama exactamente `intentos` veces", async () => {
    let llamadas = 0;
    const pedir = async () => {
      llamadas++;
      throw new Error(`fallo ${llamadas}`);
    };
    await conReintentos(pedir, 3).catch(() => {}); // ya sabemos que rechaza
    expect(llamadas).toBe(3);
  });

  test("rechaza con el error del último intento", async () => {
    let llamadas = 0;
    const pedir = async () => {
      llamadas++;
      throw new Error(`fallo ${llamadas}`);
    };
    await expect(conReintentos(pedir, 3)).rejects.toThrow("fallo 3");
  });
}
