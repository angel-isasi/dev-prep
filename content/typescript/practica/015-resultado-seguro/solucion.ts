// Unión discriminada: `ok` es el "discriminante". Su valor (true o false)
// le dice a TypeScript en cuál de los dos casos estás.
export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

export function dividir(a: number, b: number): Resultado<number> {
  if (b === 0) {
    return { ok: false, error: "No se puede dividir entre cero" };
  }
  return { ok: true, valor: a / b };
}

export function parsearJSON(texto: string): Resultado<unknown> {
  // JSON.parse lanza un error si el texto no es JSON válido:
  // lo atrapamos aquí para que quien llame nunca tenga que usar try/catch.
  try {
    return { ok: true, valor: JSON.parse(texto) };
  } catch {
    return { ok: false, error: "JSON inválido" };
  }
}

// Genérica: el T del resultado y el del valor por defecto tienen que coincidir.
export function valorO<T>(resultado: Resultado<T>, porDefecto: T): T {
  // Dentro del if, TypeScript sabe que resultado es { ok: true; valor: T }.
  if (resultado.ok) {
    return resultado.valor;
  }
  return porDefecto;
}
