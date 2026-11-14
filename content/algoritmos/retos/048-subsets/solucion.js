export function subconjuntos(nums) {
  const resultado = [];
  const camino = []; // el subconjunto que estoy armando

  // Decide qué hacer con nums[i]: tomarlo o no tomarlo.
  function explorar(i) {
    // Caso base: ya decidí sobre todos los elementos. `camino` es un subconjunto.
    if (i === nums.length) {
      resultado.push([...camino]); // guardo una COPIA
      return;
    }

    // Opción 1: tomar nums[i].
    camino.push(nums[i]); // elegir
    explorar(i + 1); // explorar
    camino.pop(); // deshacer

    // Opción 2: no tomarlo.
    explorar(i + 1);
  }

  explorar(0);
  return resultado;
}
