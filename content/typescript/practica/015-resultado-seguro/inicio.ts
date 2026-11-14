// Resultado seguro
//
// Resultado<T>: unión discriminada { ok: true; valor: T } | { ok: false; error: string }.
// dividir(a, b): Resultado<number>; con b = 0, error "No se puede dividir entre cero".
// parsearJSON(texto): Resultado<unknown>; si falla, error "JSON inválido".
// valorO(resultado, porDefecto): el valor si salió bien, si no porDefecto.
//
//   valorO(dividir(1, 0), 0)  ->  0
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Este tipo deja leer `valor` sin comprobar `ok`. Cámbialo por una unión discriminada.
export type Resultado<T> = { ok: boolean; valor?: T; error?: string };

export function dividir(a: number, b: number): Resultado<number> {
  // Tu código aquí
  return { ok: false };
}

export function parsearJSON(texto: string): Resultado<unknown> {
  // Tu código aquí
  return { ok: false };
}

// Hazla genérica: recibe un Resultado<T> y un porDefecto de tipo T, devuelve T.
export function valorO(resultado: Resultado<any>, porDefecto: any): any {
  // Tu código aquí
}
