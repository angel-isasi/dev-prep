// Aplica un operador. `a` es el número de la izquierda y `b` el de la derecha.
function operar(a, b, operador) {
  switch (operador) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return Math.trunc(a / b); // división entera, truncando hacia cero
  }
}

export function evaluarRPN(tokens) {
  const pila = [];

  for (const token of tokens) {
    if (token === "+" || token === "-" || token === "*" || token === "/") {
      // El ÚLTIMO que entró es el de la derecha: lo saco primero.
      const b = pila.pop();
      const a = pila.pop();
      pila.push(operar(a, b, token));
    } else {
      // Es un número (puede ser "-3" o "13"): lo convierto y lo guardo.
      pila.push(Number(token));
    }
  }

  return pila.pop(); // al final queda un solo número: el resultado
}
