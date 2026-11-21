// El mapache dibujado en SVG: respira, parpadea y mueve la cola (CSS). La cara cambia según cómo
// está (feliz, normal, hambriento, triste, dormido) y lleva puesta su ropa (equipo: { parte: id }).
// Si tocas al mapache, salta (la página decide qué dice).
import { useState } from "react";
import estilos from "./Mapache.module.css";

const PELO = "#949494";
const PELO_CLARO = "#b8b8b8";
const OSCURO = "#2f2f2f";
const CARA = "#f3f3f3";

function Ojos({ estado }) {
  if (estado === "dormido")
    return (
      <g stroke={OSCURO} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M70 94 Q78 100 86 94" />
        <path d="M114 94 Q122 100 130 94" />
      </g>
    );
  const triste = estado === "triste" || estado === "hambriento";
  return (
    <g>
      <g className={estilos.parpadeo}>
        <circle cx="78" cy="93" r="11" fill="#fff" />
        <circle cx="122" cy="93" r="11" fill="#fff" />
        <circle cx={triste ? 77 : 79} cy={triste ? 96 : 94} r="6.5" fill="#1f1f1f" />
        <circle cx={triste ? 121 : 123} cy={triste ? 96 : 94} r="6.5" fill="#1f1f1f" />
        <circle cx={triste ? 79 : 81} cy={triste ? 93 : 91} r="2.2" fill="#fff" />
        <circle cx={triste ? 123 : 125} cy={triste ? 93 : 91} r="2.2" fill="#fff" />
      </g>
      {triste && (
        <g stroke={CARA} strokeWidth="3" strokeLinecap="round">
          <path d="M66 77 L86 82" />
          <path d="M134 77 L114 82" />
        </g>
      )}
    </g>
  );
}

function Boca({ estado }) {
  const trazo = { stroke: OSCURO, strokeWidth: 3, strokeLinecap: "round", fill: "none" };
  if (estado === "feliz")
    return (
      <g>
        <path d="M88 119 Q100 134 112 119 Z" fill="#404040" stroke={OSCURO} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M94 126 Q100 131 106 126" fill="#929292" />
      </g>
    );
  if (estado === "hambriento") return <ellipse cx="100" cy="124" rx="6" ry="7" fill="#404040" stroke={OSCURO} strokeWidth="2.5" />;
  if (estado === "triste") return <path d="M90 127 Q100 118 110 127" {...trazo} />;
  if (estado === "dormido") return <path d="M95 123 Q100 126 105 123" {...trazo} />;
  return <path d="M90 120 Q95 126 100 121 Q105 126 110 120" {...trazo} />;
}

/** Ropa: cada prenda en su parte del cuerpo. */
function Ropa({ equipo = {} }) {
  const p = (parte) => equipo[parte];
  return (
    <>
      {p("espalda") === "mochila" && (
        <g>
          <path d="M70 146 Q74 170 68 196" fill="none" stroke="#474747" strokeWidth="5" strokeLinecap="round" />
          <path d="M130 146 Q126 170 132 196" fill="none" stroke="#474747" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {p("cuello") === "bufanda" && (
        <g>
          <path d="M60 140 Q100 158 140 140 L142 152 Q100 170 58 152 Z" fill="#4d4d4d" />
          <path d="M118 150 L128 186 L114 186 L108 154 Z" fill="#3d3d3d" />
          <path d="M66 144 L70 154 M80 149 L83 159 M96 152 L97 162 M112 151 L111 161 M128 146 L126 156" stroke="#b7b7b7" strokeWidth="2" />
        </g>
      )}
      {p("cuello") === "corbatin" && (
        <g>
          <path d="M100 146 L82 136 L82 156 Z" fill="#555555" />
          <path d="M100 146 L118 136 L118 156 Z" fill="#555555" />
          <circle cx="100" cy="146" r="5" fill="#383838" />
        </g>
      )}
      {p("cuello") === "corbata" && (
        <g>
          <path d="M94 142 L106 142 L103 150 L97 150 Z" fill="#3a3a3a" />
          <path d="M97 150 L103 150 L110 182 L100 192 L90 182 Z" fill="#606060" />
          <path d="M93 166 L107 160 M92 176 L108 170" stroke="#bebebe" strokeWidth="2" />
        </g>
      )}
      {p("ojos") === "lentes" && (
        <g fill="none" stroke="#282828" strokeWidth="3">
          <circle cx="78" cy="93" r="15" />
          <circle cx="122" cy="93" r="15" />
          <path d="M93 92 Q100 87 107 92" />
          <path d="M63 90 L50 86 M137 90 L150 86" />
        </g>
      )}
      {p("ojos") === "lentesSol" && (
        <g>
          <path d="M60 84 L96 84 L92 104 Q78 110 64 104 Z" fill="#181818" />
          <path d="M104 84 L140 84 L136 104 Q122 110 108 104 Z" fill="#181818" />
          <path d="M96 87 L104 87" stroke="#181818" strokeWidth="4" />
          <path d="M68 89 L78 89" stroke="#727272" strokeWidth="3" strokeLinecap="round" />
          <path d="M112 89 L122 89" stroke="#727272" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {p("orejas") === "audifonos" && (
        <g>
          <path d="M44 84 Q44 30 100 30 Q156 30 156 84" fill="none" stroke="#181818" strokeWidth="7" />
          <rect x="34" y="78" width="18" height="30" rx="8" fill="#686868" />
          <rect x="148" y="78" width="18" height="30" rx="8" fill="#686868" />
        </g>
      )}
      {p("cabeza") === "gorra" && (
        <g>
          <path d="M58 58 Q100 18 142 58 Z" fill="#606060" />
          <path d="M98 52 Q140 44 168 58 Q140 62 100 60 Z" fill="#4e4e4e" />
          <circle cx="100" cy="36" r="4" fill="#414141" />
        </g>
      )}
      {p("cabeza") === "sombrero" && (
        <g>
          <ellipse cx="100" cy="52" rx="58" ry="10" fill="#414141" />
          <path d="M70 52 L74 18 Q100 10 126 18 L130 52 Z" fill="#4e4e4e" />
          <rect x="72" y="40" width="56" height="7" fill="#c1c1c1" />
        </g>
      )}
      {p("cabeza") === "birrete" && (
        <g>
          <path d="M100 18 L152 36 L100 54 L48 36 Z" fill="#181818" />
          <path d="M76 44 L76 58 Q100 66 124 58 L124 44" fill="#282828" />
          <path d="M150 37 L150 62" stroke="#c1c1c1" strokeWidth="3" />
          <circle cx="150" cy="64" r="4" fill="#c1c1c1" />
        </g>
      )}
    </>
  );
}

/**
 * @param {{ estado?: string, equipo?: Record<string, string|null>, tamano?: number, alTocar?: () => void, quieto?: boolean }} props
 */
export function Mapache({ estado = "normal", equipo, tamano = 180, alTocar, quieto = false }) {
  const [salto, setSalto] = useState(0);
  const tocar = () => {
    setSalto((s) => s + 1);
    alTocar?.();
  };
  // Quieto es solo un dibujo (por ejemplo, dentro de un enlace): sin botón ni animaciones
  const Envoltura = quieto ? "span" : "button";
  return (
    <Envoltura
      {...(quieto ? { role: "img", "aria-label": "Tu mapache" } : { type: "button", onClick: tocar, "aria-label": "Tu mapache: tócalo" })}
      className={estilos.mapache}
      data-estado={estado}
      data-quieto={quieto}
      style={{ width: tamano, height: tamano * 1.1 }}
    >
      <svg key={salto} viewBox="0 0 200 220" className={salto ? estilos.salta : undefined} aria-hidden>
        <ellipse cx="100" cy="212" rx="56" ry="7" fill="#000" opacity="0.25" />
        {/* Cola anillada, detrás del cuerpo */}
        <g className={estilos.cola}>
          <path d="M138 186 Q186 176 182 126" fill="none" stroke={PELO} strokeWidth="24" strokeLinecap="round" />
          <path d="M138 186 Q186 176 182 126" fill="none" stroke={OSCURO} strokeWidth="24" strokeLinecap="butt" strokeDasharray="9 11" />
          <circle cx="182" cy="124" r="11.5" fill={OSCURO} />
        </g>
        <g className={estilos.cuerpo}>
          {equipo?.espalda === "mochila" && <rect x="44" y="136" width="112" height="66" rx="18" fill="#595959" />}
          {/* Cuerpo, panza y patas */}
          <ellipse cx="100" cy="170" rx="50" ry="42" fill={PELO} />
          <ellipse cx="100" cy="178" rx="31" ry="28" fill={PELO_CLARO} />
          <ellipse cx="74" cy="206" rx="14" ry="8" fill={OSCURO} />
          <ellipse cx="126" cy="206" rx="14" ry="8" fill={OSCURO} />
          <ellipse cx="62" cy="168" rx="9" ry="16" fill={PELO} transform="rotate(18 62 168)" />
          <ellipse cx="138" cy="168" rx="9" ry="16" fill={PELO} transform="rotate(-18 138 168)" />
          <ellipse cx="66" cy="182" rx="7" ry="6" fill={OSCURO} />
          <ellipse cx="134" cy="182" rx="7" ry="6" fill={OSCURO} />
          {/* Orejas */}
          <path d="M50 66 Q46 26 80 40 Z" fill={PELO} />
          <path d="M150 66 Q154 26 120 40 Z" fill={PELO} />
          <path d="M56 58 Q55 36 74 44 Z" fill={OSCURO} />
          <path d="M144 58 Q145 36 126 44 Z" fill={OSCURO} />
          {/* Cabeza */}
          <ellipse cx="100" cy="94" rx="62" ry="52" fill={PELO} />
          <path d="M100 44 Q92 62 96 78 L104 78 Q108 62 100 44 Z" fill={OSCURO} opacity="0.55" />
          <ellipse cx="100" cy="112" rx="44" ry="30" fill={CARA} />
          <path d="M44 96 Q46 74 70 78 Q90 82 100 90 Q110 82 130 78 Q154 74 156 96 Q150 116 126 110 Q110 106 100 100 Q90 106 74 110 Q50 116 44 96 Z" fill={OSCURO} />
          <path d="M60 66 Q78 58 90 70" fill="none" stroke={CARA} strokeWidth="5" strokeLinecap="round" />
          <path d="M140 66 Q122 58 110 70" fill="none" stroke={CARA} strokeWidth="5" strokeLinecap="round" />
          <Ojos estado={estado} />
          {estado === "feliz" && (
            <g fill="#939393" opacity="0.45">
              <circle cx="66" cy="118" r="7" />
              <circle cx="134" cy="118" r="7" />
            </g>
          )}
          <ellipse cx="100" cy="111" rx="8" ry="5.5" fill="#1f1f1f" />
          <ellipse cx="97" cy="109" rx="2.5" ry="1.5" fill="#fff" opacity="0.6" />
          <Boca estado={estado} />
          <Ropa equipo={equipo} />
        </g>
        {estado === "dormido" && (
          <g className={estilos.zzz} fill="#bdbdbd" fontFamily="var(--fuente-titulos)" fontWeight="800">
            <text x="150" y="44" fontSize="18">z</text>
            <text x="164" y="28" fontSize="24">Z</text>
          </g>
        )}
        {estado === "hambriento" && (
          <g className={estilos.gota}>
            <path d="M112 128 Q115 136 112 140 Q109 136 112 128 Z" fill="#bebebe" />
          </g>
        )}
      </svg>
    </Envoltura>
  );
}

/** Lo que queda cuando se escapa: una caja vacía con una nota. */
export function CajaVacia({ tamano = 180 }) {
  return (
    <svg viewBox="0 0 200 220" style={{ width: tamano, height: tamano * 1.1 }} aria-label="Se escapó: dejó una nota">
      <ellipse cx="100" cy="206" rx="70" ry="8" fill="#000" opacity="0.25" />
      <path d="M38 120 L162 120 L156 200 L44 200 Z" fill="#828282" />
      <path d="M38 120 L20 100 L136 100 L162 120 Z" fill="#9d9d9d" />
      <path d="M162 120 L180 98 L136 100 Z" fill="#6b6b6b" />
      <rect x="70" y="138" width="60" height="44" rx="3" fill="#f2f2f2" transform="rotate(-6 100 160)" />
      <path d="M78 150 L120 146 M79 160 L118 156 M80 170 L106 168" stroke="#4e4e4e" strokeWidth="2.5" strokeLinecap="round" />
      <g fill="#949494">
        <ellipse cx="60" cy="214" rx="6" ry="3" />
        <ellipse cx="44" cy="216" rx="6" ry="3" />
        <ellipse cx="26" cy="212" rx="6" ry="3" />
      </g>
    </svg>
  );
}
