export function pipe(...fns) {
  return (valorInicial) => fns.reduce((valor, fn) => fn(valor), valorInicial);
}

export function compose(...fns) {
  return (valorInicial) => fns.reduceRight((valor, fn) => fn(valor), valorInicial);
}
