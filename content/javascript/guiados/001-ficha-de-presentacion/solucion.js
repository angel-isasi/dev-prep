export function presentar(nombre, edad, ciudad) {
  const nombreLimpio = nombre.trim();
  const ciudadLimpia = ciudad.trim();

  return `Me llamo ${nombreLimpio}, tengo ${edad} años y vivo en ${ciudadLimpia}.`;
}
