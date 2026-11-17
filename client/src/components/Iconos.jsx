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
  <svg {...base}>
    <path d="M3 11l9-7 9 7" />
    <path d="M5 10v10h14V10" />
  </svg>
);
export const IconoAprender = () => (
  <svg {...base}>
    <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" />
    <path d="M4 21V5" />
  </svg>
);
export const IconoPracticar = () => (
  <svg {...base}>
    <path d="M8 8l-4 4 4 4" />
    <path d="M16 8l4 4-4 4" />
    <path d="M13.5 5l-3 14" />
  </svg>
);
export const IconoEntrevistas = () => (
  <svg {...base}>
    <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
  </svg>
);
export const IconoIngles = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 010 18" />
    <path d="M12 3a14 14 0 000 18" />
  </svg>
);
export const IconoTrabajo = () => (
  <svg {...base}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
    <path d="M3 13h18" />
  </svg>
);
export const IconoProgreso = () => (
  <svg {...base}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </svg>
);
export const IconoLuna = () => (
  <svg {...base}>
    <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />
  </svg>
);
export const IconoSol = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const IconoVSCode = () => (
  <svg {...base}>
    <path d="M17 3l4 2v14l-4 2-10-9z" />
    <path d="M7 12l-4 3V9z" />
  </svg>
);
export const IconoAjustes = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
  </svg>
);
export const IconoFuego = () => (
  <svg {...base}>
    <path d="M12 22c4 0 7-2.7 7-6.8 0-3.6-2.4-6-4.3-8.2-.6 2-1.6 3.2-2.9 3.7.2-3.1-1-5.8-3.8-8.7-.3 3.7-5 6.4-5 11.6C3 18.6 7 22 12 22z" />
  </svg>
);
export const IconoReferencia = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
export const IconoApagar = () => (
  <svg {...base}>
    <path d="M12 3v9" />
    <path d="M6.3 6.3a8 8 0 1011.4 0" />
  </svg>
);
export const IconoFlechaIzq = () => (
  <svg {...base}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
export const IconoMas = () => (
  <svg {...base}>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);
export const IconoChuleta = () => (
  <svg {...base}>
    <path d="M7 3h10a2 2 0 012 2v16l-7-4-7 4V5a2 2 0 012-2z" />
  </svg>
);
export const IconoDescargar = () => (
  <svg {...base}>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);
export const IconoGlosario = () => (
  <svg {...base}>
    <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 01-3-3z" />
    <path d="M8 13l2.5-6 2.5 6" />
    <path d="M9 11h3" />
  </svg>
);
export const IconoRevision = () => (
  <svg {...base}>
    <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h5" />
    <path d="M8 8h6" />
    <path d="M8 12h3" />
    <circle cx="16.5" cy="15.5" r="3" />
    <path d="M21 20l-2.4-2.4" />
  </svg>
);
export const IconoGit = () => (
  <svg {...base}>
    <circle cx="6" cy="5" r="2" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="9" r="2" />
    <path d="M6 7v10" />
    <path d="M18 11c0 4-6 3-12 6" />
  </svg>
);
export const IconoEnfoque = () => (
  <svg {...base}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2" />
    <path d="M9 2h6" />
  </svg>
);
export const IconoInsignias = () => (
  <svg {...base}>
    <circle cx="12" cy="9" r="6" />
    <path d="M8.5 13.9L7 22l5-3 5 3-1.5-8.1" />
  </svg>
);
export const IconoDiario = () => (
  <svg {...base}>
    <path d="M5 3h11a2 2 0 012 2v16H7a2 2 0 01-2-2z" />
    <path d="M9 8h5" />
    <path d="M9 12h5" />
    <path d="M20 7l1 1-5 5h-1v-1z" />
  </svg>
);
export const IconoLecciones = () => (
  <svg {...base}>
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
    <path d="M8 18h5a3 3 0 000-6h-2a3 3 0 010-6h5" />
  </svg>
);
export const IconoChevron = () => (
  <svg {...base} width={14} height={14}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

// --- Íconos de acciones y estados (mismo trazo que los de la barra). Aceptan props: tamano, className, style ---
const svg = ({ tamano = 18, ...resto } = {}) => ({ ...base, width: tamano, height: tamano, ...resto });

export const IconoAudio = (p) => (
  <svg {...svg(p)}>
    <path d="M11 5L6 9H3v6h3l5 4z" />
    <path d="M15.5 8.5a5 5 0 010 7" />
    <path d="M18.5 5.5a9 9 0 010 13" />
  </svg>
);
export const IconoMicrofono = (p) => (
  <svg {...svg(p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0014 0" />
    <path d="M12 18v3" />
  </svg>
);
export const IconoRegalo = (p) => (
  <svg {...svg(p)}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M5 12v9h14v-9" />
    <path d="M12 8v13" />
    <path d="M12 8c-1.5-3-5-4-5-1.5S10 8 12 8zM12 8c1.5-3 5-4 5-1.5S14 8 12 8z" />
  </svg>
);
/** Estrella: vacía, o llena con `llena`. */
export const IconoEstrella = ({ llena = false, ...p } = {}) => (
  <svg {...svg(p)} fill={llena ? "currentColor" : "none"}>
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </svg>
);
export const IconoRayo = (p) => (
  <svg {...svg(p)}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </svg>
);
export const IconoAudifonos = (p) => (
  <svg {...svg(p)}>
    <path d="M4 15v-3a8 8 0 0116 0v3" />
    <rect x="3" y="14" width="4" height="7" rx="1.5" />
    <rect x="17" y="14" width="4" height="7" rx="1.5" />
  </svg>
);
export const IconoLibro = (p) => (
  <svg {...svg(p)}>
    <path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z" />
    <path d="M12 6v14" />
  </svg>
);
export const IconoReloj = (p) => (
  <svg {...svg(p)}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2" />
    <path d="M9 2h6" />
  </svg>
);
export const IconoMezclar = (p) => (
  <svg {...svg(p)}>
    <path d="M16 3h5v5" />
    <path d="M4 20L21 3" />
    <path d="M21 16v5h-5" />
    <path d="M15 15l6 6" />
    <path d="M4 4l5 5" />
  </svg>
);
export const IconoOido = (p) => (
  <svg {...svg(p)}>
    <path d="M6 9a6 6 0 1112 0c0 3-2 4-3.5 5.5S13 18 13 19a3 3 0 01-6 0" />
    <path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-1.5 2-1.5 3.5" />
  </svg>
);
export const IconoRepetir = (p) => (
  <svg {...svg(p)}>
    <path d="M3 12a9 9 0 0115.5-6.2L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 01-15.5 6.2L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
export const IconoCandado = (p) => (
  <svg {...svg(p)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);
export const IconoAlerta = (p) => (
  <svg {...svg(p)}>
    <path d="M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);
export const IconoCorazon = ({ lleno = true, ...p } = {}) => (
  <svg {...svg(p)} fill={lleno ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
  </svg>
);
export const IconoLlamita = (p) => (
  <svg {...svg(p)} fill="currentColor" stroke="none">
    <path d="M12 22c4 0 7-2.7 7-6.8 0-3.6-2.4-6-4.3-8.2-.6 2-1.6 3.2-2.9 3.7.2-3.1-1-5.8-3.8-8.7-.3 3.7-5 6.4-5 11.6C3 18.6 7 22 12 22z" />
  </svg>
);
export const IconoPlay = (p) => (
  <svg {...svg(p)}>
    <path d="M7 4.5v15l12-7.5z" />
  </svg>
);
export const IconoTrofeo = (p) => (
  <svg {...svg(p)}>
    <path d="M8 4h8v5a4 4 0 01-8 0z" />
    <path d="M16 6h3a3 3 0 01-3 4M8 6H5a3 3 0 003 4" />
    <path d="M12 13v4M8 21h8M9 17h6" />
  </svg>
);
export const IconoChispa = (p) => (
  <svg {...svg(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </svg>
);
export const IconoFlechaDer = (p) => (
  <svg {...svg(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
