export function montarBuscador(contenedor, nombres) {
  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Buscar...";

  const lista = document.createElement("ul");

  function pintar() {
    const busqueda = input.value.trim().toLowerCase();
    const visibles = nombres.filter((nombre) => nombre.toLowerCase().includes(busqueda));

    lista.replaceChildren();

    if (visibles.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "Sin resultados";
      lista.append(vacio);
      return;
    }

    for (const nombre of visibles) {
      const li = document.createElement("li");
      li.textContent = nombre;
      lista.append(li);
    }
  }

  input.addEventListener("input", pintar);
  pintar();

  contenedor.append(input, lista);
}
