// Una regla recibe el valor de UN campo y devuelve el mensaje de error, o null si está bien.
export type Regla<V> = (valor: V) => string | null;

// Para cada campo K de T (opcional), una lista de reglas que reciben T[K].
export type Reglas<T> = { [K in keyof T]?: Regla<T[K]>[] };

// Como mucho un mensaje por campo; los campos sin error no aparecen.
export type Errores<T> = Partial<Record<keyof T, string>>;

export function validar<T>(datos: T, reglas: Reglas<T>): Errores<T> {
  const errores: Errores<T> = {};
  // Object.keys devuelve string[]; le decimos a TypeScript que son claves de T.
  for (const campo of Object.keys(reglas) as (keyof T)[]) {
    const reglasDelCampo = reglas[campo] ?? [];
    for (const regla of reglasDelCampo) {
      const mensaje = regla(datos[campo]);
      if (mensaje !== null) {
        errores[campo] = mensaje;
        break; // solo el primer error de cada campo
      }
    }
  }
  return errores;
}

// Reglas reutilizables para textos.
export function requerido(mensaje = "Este campo es obligatorio"): Regla<string> {
  return (valor) => (valor.trim() === "" ? mensaje : null);
}

export function minLargo(n: number): Regla<string> {
  return (valor) => (valor.length < n ? `Debe tener al menos ${n} caracteres` : null);
}
