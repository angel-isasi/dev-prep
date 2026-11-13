export function capitalizar(frase) {
  return frase
    .split(" ")
    .map((palabra) => {
      // Entre dos espacios seguidos queda una "palabra" vacía: se deja tal cual.
      if (palabra === "") return palabra;
      return palabra[0].toUpperCase() + palabra.slice(1).toLowerCase();
    })
    .join(" ");
}
