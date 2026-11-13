export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...mas) => curried.apply(this, [...args, ...mas]);
  };
}
