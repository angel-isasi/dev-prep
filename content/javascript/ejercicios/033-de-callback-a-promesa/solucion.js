export function promisificar(fn) {
  return (...args) =>
    new Promise((resolver, rechazar) => {
      fn(...args, (error, dato) => {
        if (error) rechazar(error);
        else resolver(dato);
      });
    });
}
