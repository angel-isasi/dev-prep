// Un oyente recibe el estado nuevo y el anterior.
export type Oyente<S> = (estado: S, anterior: S) => void;

// Un cambio puede ser un objeto parcial o una función que calcula el cambio desde el estado actual.
export type Cambio<S> = Partial<S> | ((actual: S) => Partial<S>);

export type Store<S> = {
  getState: () => S;
  setState: (cambio: Cambio<S>) => void;
  subscribe: (oyente: Oyente<S>) => () => void;
};

export function crearStore<S extends object>(inicial: S): Store<S> {
  // Variables del closure: nadie de afuera puede tocarlas directamente.
  let estado = inicial;
  const oyentes = new Set<Oyente<S>>();

  return {
    getState: () => estado,

    setState(cambio) {
      const anterior = estado;
      // Si es función, la llamamos con el estado actual para obtener el parcial.
      const parcial = typeof cambio === "function" ? cambio(anterior) : cambio;
      estado = { ...anterior, ...parcial }; // objeto NUEVO: el anterior queda intacto
      oyentes.forEach((oyente) => oyente(estado, anterior));
    },

    subscribe(oyente) {
      oyentes.add(oyente);
      return () => {
        oyentes.delete(oyente);
      };
    },
  };
}
