export async function intentarEnOrden(fuentes) {
  let ultimoError = new Error("No hay fuentes");

  for (const fuente of fuentes) {
    try {
      return await fuente();
    } catch (error) {
      ultimoError = error;
    }
  }

  throw ultimoError;
}
