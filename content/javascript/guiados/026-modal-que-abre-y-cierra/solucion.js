export function montarModal(contenedor, titulo, texto) {
  const abrir = document.createElement("button");
  abrir.className = "abrir";
  abrir.textContent = "Abrir";

  const fondo = document.createElement("div");
  fondo.className = "fondo";
  fondo.hidden = true;

  const modal = document.createElement("div");
  modal.className = "modal";

  const h2 = document.createElement("h2");
  h2.textContent = titulo;

  const p = document.createElement("p");
  p.textContent = texto;

  const cerrar = document.createElement("button");
  cerrar.className = "cerrar";
  cerrar.textContent = "Cerrar";

  modal.append(h2, p, cerrar);
  fondo.append(modal);
  contenedor.append(abrir, fondo);

  const abrirModal = () => {
    fondo.hidden = false;
  };
  const cerrarModal = () => {
    fondo.hidden = true;
  };

  abrir.addEventListener("click", abrirModal);
  cerrar.addEventListener("click", cerrarModal);

  fondo.addEventListener("click", (event) => {
    // Solo si el clic fue en el fondo mismo, no en algo de adentro que "subió".
    if (event.target === fondo) cerrarModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarModal();
  });
}
