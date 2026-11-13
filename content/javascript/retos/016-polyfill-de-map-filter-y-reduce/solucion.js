Array.prototype.miMap = function (callback) {
  const resultado = [];
  for (let i = 0; i < this.length; i++) {
    resultado.push(callback(this[i], i, this));
  }
  return resultado;
};

Array.prototype.miFilter = function (callback) {
  const resultado = [];
  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) resultado.push(this[i]);
  }
  return resultado;
};

Array.prototype.miReduce = function (callback, inicial) {
  let i = 0;
  let acumulador = inicial;

  // arguments.length distingue "no me pasaron inicial" de "me pasaron undefined".
  if (arguments.length < 2) {
    if (this.length === 0) throw new TypeError("reduce de un arreglo vacío sin valor inicial");
    acumulador = this[0];
    i = 1;
  }

  for (; i < this.length; i++) {
    acumulador = callback(acumulador, this[i], i, this);
  }
  return acumulador;
};
