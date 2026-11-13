export function fizzBuzz(n) {
  const resultado = [];

  for (let i = 1; i <= n; i++) {
    let texto = "";
    if (i % 3 === 0) texto += "Fizz";
    if (i % 5 === 0) texto += "Buzz";
    // Si no fue múltiplo de nada, `texto` sigue vacío y uso el número.
    resultado.push(texto || String(i));
  }

  return resultado;
}
