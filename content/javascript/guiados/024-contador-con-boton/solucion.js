export function montarContador(contenedor, inicial = 0) {
  let cuenta = inicial;

  const valor = document.createElement("span");
  valor.className = "valor";
  valor.textContent = cuenta;

  const sumar = document.createElement("button");
  sumar.className = "sumar";
  sumar.textContent = "+1";

  const reiniciar = document.createElement("button");
  reiniciar.className = "reiniciar";
  reiniciar.textContent = "Reiniciar";

  sumar.addEventListener("click", () => {
    cuenta++;
    valor.textContent = cuenta;
  });

  reiniciar.addEventListener("click", () => {
    cuenta = inicial;
    valor.textContent = cuenta;
  });

  contenedor.append(valor, sumar, reiniciar);
}
