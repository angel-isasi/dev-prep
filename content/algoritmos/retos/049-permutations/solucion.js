export function permutaciones(nums) {
  const resultado = [];
  const camino = []; // la permutación que estoy armando
  const usado = new Array(nums.length).fill(false); // usado[i]: ¿nums[i] ya está en camino?

  function explorar() {
    // Caso base: ya puse todos los números. Es una permutación completa.
    if (camino.length === nums.length) {
      resultado.push([...camino]); // guardo una COPIA
      return;
    }

    // Para el siguiente lugar, pruebo cada número que todavía no usé.
    for (let i = 0; i < nums.length; i++) {
      if (usado[i]) continue;

      usado[i] = true; // elegir
      camino.push(nums[i]);

      explorar(); // explorar

      camino.pop(); // deshacer
      usado[i] = false;
    }
  }

  explorar();
  return resultado;
}
