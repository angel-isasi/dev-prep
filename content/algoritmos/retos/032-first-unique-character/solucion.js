export function primerUnico(s) {
  // Primera pasada: cuántas veces aparece cada carácter.
  const conteo = new Map();
  for (const c of s) {
    conteo.set(c, (conteo.get(c) || 0) + 1);
  }

  // Segunda pasada, en el orden de la cadena: el primero con conteo 1 gana.
  for (let i = 0; i < s.length; i++) {
    if (conteo.get(s[i]) === 1) return i;
  }

  return -1;
}
