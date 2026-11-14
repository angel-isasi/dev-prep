export function sonIsomorfas(s, t) {
  const deSaT = new Map(); // carácter de s -> carácter de t
  const deTaS = new Map(); // carácter de t -> carácter de s

  for (let i = 0; i < s.length; i++) {
    const a = s[i];
    const b = t[i];

    // `a` ya tenía otro destino: un carácter iría a dos distintos.
    if (deSaT.has(a) && deSaT.get(a) !== b) return false;
    // `b` ya era el destino de otro: dos caracteres irían al mismo.
    if (deTaS.has(b) && deTaS.get(b) !== a) return false;

    deSaT.set(a, b);
    deTaS.set(b, a);
  }

  return true;
}
