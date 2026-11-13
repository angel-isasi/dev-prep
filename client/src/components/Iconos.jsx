// Íconos SVG simples (sin librerías, funcionan offline). Heredan el color del texto.
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const IconoInicio = () => (
  <svg {...base}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
);
export const IconoAprender = () => (
  <svg {...base}><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" /><path d="M4 21V5" /></svg>
);
export const IconoPracticar = () => (
  <svg {...base}><path d="M8 8l-4 4 4 4" /><path d="M16 8l4 4-4 4" /><path d="M13.5 5l-3 14" /></svg>
);
export const IconoEntrevistas = () => (
  <svg {...base}><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>
);
export const IconoProgreso = () => (
  <svg {...base}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></svg>
);
export const IconoLuna = () => (
  <svg {...base}><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" /></svg>
);
export const IconoSol = () => (
  <svg {...base}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const IconoVSCode = () => (
  <svg {...base}><path d="M17 3l4 2v14l-4 2-10-9z" /><path d="M7 12l-4 3V9z" /></svg>
);
export const IconoFlechaIzq = () => (
  <svg {...base}><path d="M15 6l-6 6 6 6" /></svg>
);
