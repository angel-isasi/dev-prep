export function puedeTerminarCursos(numCursos, prerrequisitos) {
  // Lista de adyacencia: habilita[r] = cursos que tienen a `r` como requisito.
  const habilita = Array.from({ length: numCursos }, () => []);
  // pendientes[c] = cuántos requisitos le faltan al curso c.
  const pendientes = new Array(numCursos).fill(0);

  for (const [curso, requisito] of prerrequisitos) {
    habilita[requisito].push(curso);
    pendientes[curso]++;
  }

  // Empiezo por los cursos que no piden nada.
  const cola = [];
  for (let c = 0; c < numCursos; c++) {
    if (pendientes[c] === 0) cola.push(c);
  }

  let tomados = 0;
  while (cola.length > 0) {
    const actual = cola.shift();
    tomados++; // llevo este curso

    // Aprobarlo le quita un requisito pendiente a cada curso que habilita.
    for (const siguiente of habilita[actual]) {
      pendientes[siguiente]--;
      if (pendientes[siguiente] === 0) cola.push(siguiente); // ya puedo llevarlo
    }
  }

  // Si algún curso nunca quedó libre, es porque está atrapado en un círculo.
  return tomados === numCursos;
}
