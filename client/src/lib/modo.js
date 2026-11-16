// ¿Estamos en la versión celular? Es una constante de compilación (vite build --mode movil):
// en cada build, Vite elimina la rama que no corresponde.
export const ES_MOVIL = import.meta.env.MODE === "movil";
