export function ejecutar(generadorFn) {
  return new Promise((resolver, rechazar) => {
    const generador = generadorFn();

    function avanzar(valorAnterior) {
      let paso;
      try {
        paso = generador.next(valorAnterior);
      } catch (error) {
        rechazar(error); // el generador lanzó un error
        return;
      }

      if (paso.done) {
        resolver(paso.value); // llegó al return
        return;
      }

      // Espera la promesa del yield y vuelve a avanzar con su resultado
      Promise.resolve(paso.value).then(avanzar, rechazar);
    }

    avanzar();
  });
}
