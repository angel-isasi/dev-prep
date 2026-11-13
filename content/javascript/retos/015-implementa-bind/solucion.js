Function.prototype.miBind = function (contexto, ...previos) {
  const original = this;

  return function (...args) {
    return original.apply(contexto, [...previos, ...args]);
  };
};
