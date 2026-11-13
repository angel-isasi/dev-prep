export function crearLista(items) {
  const ul = document.createElement("ul");

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    ul.append(li);
  }

  return ul;
}
