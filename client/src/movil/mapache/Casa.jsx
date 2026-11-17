// La casa del mapache: el fondo cambia con tu nivel (caja, rincón, cuarto, cuarto con ventana,
// departamento, departamento con vista) y aparecen los muebles que ganaste o compraste.
// Tocar un mueble dice su nombre en inglés (si hay voz) y lo muestra con su traducción.
import { useState } from "react";
import { hablar, hayVoz } from "../../lib/voz.js";
import { CajaVacia, Mapache } from "./Mapache.jsx";
import estilos from "./Casa.module.css";

const MADERA = "#6b4a2f";
const MADERA_CLARA = "#8a6240";

/** Cada mueble: su dibujo, ya en su lugar de la escena (viewBox 640 x 300). */
const DIBUJOS = {
  cama: (
    <g>
      <rect x="22" y="206" width="118" height="40" rx="6" fill="#4c5a7a" />
      <rect x="22" y="196" width="34" height="18" rx="6" fill="#e5e7eb" />
      <rect x="18" y="176" width="10" height="76" rx="3" fill={MADERA} />
      <rect x="22" y="242" width="118" height="10" rx="3" fill={MADERA} />
    </g>
  ),
  cuadro: (
    <g>
      <rect x="44" y="52" width="70" height="50" rx="3" fill={MADERA_CLARA} />
      <rect x="50" y="58" width="58" height="38" fill="#7dd3fc" />
      <path d="M50 96 L70 74 L84 88 L94 78 L108 96 Z" fill="#16a34a" />
      <circle cx="96" cy="66" r="5" fill="#fde047" />
    </g>
  ),
  estante: (
    <g>
      <rect x="140" y="70" width="74" height="8" rx="2" fill={MADERA} />
      <rect x="140" y="116" width="74" height="8" rx="2" fill={MADERA} />
      <rect x="146" y="88" width="9" height="28" fill="#ef4444" />
      <rect x="157" y="84" width="9" height="32" fill="#3b82f6" />
      <rect x="168" y="90" width="9" height="26" fill="#f59e0b" />
      <rect x="179" y="86" width="8" height="30" fill="#10b981" transform="rotate(12 183 101)" />
    </g>
  ),
  planta: (
    <g>
      <path d="M176 222 L208 222 L203 252 L181 252 Z" fill="#c2410c" />
      <path d="M192 222 Q172 196 180 178 Q192 196 192 222 Z" fill="#16a34a" />
      <path d="M192 222 Q212 190 206 172 Q194 196 192 222 Z" fill="#22c55e" />
      <path d="M192 222 Q190 192 196 168 Q200 196 192 222 Z" fill="#15803d" />
    </g>
  ),
  cojin: <ellipse cx="226" cy="252" rx="26" ry="12" fill="#a855f7" />,
  alfombra: <ellipse cx="320" cy="272" rx="150" ry="16" fill="#7c3aed" opacity="0.35" />,
  libro: (
    <g>
      <rect x="400" y="252" width="34" height="9" rx="2" fill="#2563eb" />
      <rect x="403" y="244" width="30" height="8" rx="2" fill="#f59e0b" />
    </g>
  ),
  guitarra: (
    <g transform="rotate(-14 420 220)">
      <rect x="416" y="132" width="7" height="70" fill={MADERA} />
      <ellipse cx="420" cy="214" rx="20" ry="24" fill="#d97706" />
      <ellipse cx="420" cy="232" rx="23" ry="20" fill="#d97706" />
      <circle cx="420" cy="216" r="6" fill="#3f2a18" />
    </g>
  ),
  mesa: (
    <g>
      <rect x="470" y="186" width="140" height="10" rx="3" fill={MADERA_CLARA} />
      <rect x="478" y="196" width="8" height="58" fill={MADERA} />
      <rect x="594" y="196" width="8" height="58" fill={MADERA} />
    </g>
  ),
  laptop: (
    <g>
      <path d="M516 150 L566 150 L566 182 L516 182 Z" fill="#1f2937" />
      <rect x="520" y="154" width="42" height="24" fill="#60a5fa" />
      <path d="M508 182 L574 182 L580 188 L502 188 Z" fill="#9ca3af" />
    </g>
  ),
  taza: (
    <g>
      <rect x="584" y="168" width="16" height="18" rx="3" fill="#f8fafc" />
      <path d="M600 172 Q608 176 600 182" fill="none" stroke="#f8fafc" strokeWidth="3" />
    </g>
  ),
  silla: (
    <g>
      <rect x="452" y="214" width="40" height="8" rx="3" fill="#475569" />
      <rect x="486" y="170" width="8" height="52" rx="3" fill="#475569" />
      <rect x="456" y="222" width="6" height="32" fill="#334155" />
      <rect x="482" y="222" width="6" height="32" fill="#334155" />
    </g>
  ),
  reloj: (
    <g>
      <circle cx="560" cy="62" r="20" fill="#f8fafc" stroke={MADERA} strokeWidth="4" />
      <path d="M560 62 L560 50 M560 62 L569 66" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  afiche: (
    <g>
      <rect x="452" y="40" width="54" height="70" rx="3" fill="#fde68a" />
      <text x="479" y="70" textAnchor="middle" fontSize="13" fontWeight="800" fill="#7c2d12">
        HELLO
      </text>
      <text x="479" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7c2d12">
        WORLD
      </text>
    </g>
  ),
  lampara: (
    <g>
      <rect x="621" y="120" width="4" height="132" fill="#4b5563" />
      <path d="M606 120 L640 120 L632 96 L614 96 Z" fill="#fbbf24" />
      <ellipse cx="623" cy="252" rx="12" ry="4" fill="#4b5563" />
    </g>
  ),
  radio: (
    <g>
      <rect x="190" y="98" width="22" height="18" rx="3" fill="#b91c1c" />
      <circle cx="197" cy="107" r="4" fill="#1f2937" />
      <path d="M208 98 L214 84" stroke="#9ca3af" strokeWidth="2" />
    </g>
  ),
  cactus: (
    <g>
      <rect x="150" y="54" width="14" height="16" rx="2" fill="#c2410c" />
      <rect x="153" y="34" width="8" height="22" rx="4" fill="#16a34a" />
      <rect x="146" y="40" width="6" height="10" rx="3" fill="#16a34a" />
    </g>
  ),
  pecera: (
    <g>
      <rect x="18" y="142" width="64" height="34" rx="5" fill="#38bdf8" opacity="0.55" stroke="#e0f2fe" strokeWidth="2" />
      <path d="M40 160 Q48 152 56 160 Q48 168 40 160 Z M56 160 L62 154 L62 166 Z" fill="#f97316" />
    </g>
  ),
  trofeo: (
    <g>
      <path d="M172 50 L196 50 L192 64 Q184 70 176 64 Z" fill="#fbbf24" />
      <rect x="181" y="64" width="6" height="6" fill="#f59e0b" />
      <rect x="176" y="70" width="16" height="4" fill="#b45309" />
    </g>
  ),
};

function Fondo({ casa }) {
  if (casa === "caja")
    return (
      <g>
        <rect width="640" height="300" fill="#16181d" />
        <rect y="240" width="640" height="60" fill="#22252c" />
        <path d="M228 150 L412 150 L404 262 L236 262 Z" fill="#b7793f" />
        <path d="M228 150 L204 124 L380 124 L412 150 Z" fill="#d4945a" />
      </g>
    );
  const pared = { rincon: "#252a35", cuarto: "#2a3142", ventana: "#2d3548", depa: "#323a4f", vista: "#2b3346" }[casa] ?? "#2a3142";
  return (
    <g>
      <rect width="640" height="300" fill={pared} />
      <rect y="236" width="640" height="64" fill="#3b2c22" />
      <path d="M0 236 L640 236" stroke="#5b4535" strokeWidth="4" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${i * 90 + 30} 240 L${i * 90 + 10} 300`} stroke="#33261d" strokeWidth="2" />
      ))}
      {(casa === "ventana" || casa === "depa") && (
        <g>
          <rect x="262" y="34" width="116" height="92" rx="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="5" />
          <path d="M320 34 L320 126 M262 80 L378 80" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="352" cy="58" r="10" fill="#fde68a" opacity="0.9" />
          <circle cx="290" cy="52" r="1.5" fill="#fff" />
          <circle cx="300" cy="104" r="1.5" fill="#fff" />
        </g>
      )}
      {casa === "vista" && (
        <g>
          <rect x="232" y="26" width="176" height="110" rx="4" fill="#1e1b4b" stroke="#cbd5e1" strokeWidth="5" />
          <circle cx="380" cy="52" r="12" fill="#fde68a" />
          <g fill="#312e81">
            <rect x="240" y="80" width="20" height="54" />
            <rect x="262" y="64" width="24" height="70" />
            <rect x="290" y="90" width="18" height="44" />
            <rect x="312" y="56" width="22" height="78" />
            <rect x="338" y="84" width="26" height="50" />
            <rect x="368" y="72" width="20" height="62" />
          </g>
          <g fill="#fde68a" opacity="0.8">
            <rect x="268" y="72" width="4" height="4" />
            <rect x="276" y="86" width="4" height="4" />
            <rect x="318" y="64" width="4" height="4" />
            <rect x="324" y="80" width="4" height="4" />
            <rect x="344" y="94" width="4" height="4" />
            <rect x="374" y="82" width="4" height="4" />
          </g>
          <path d="M320 26 L320 136" stroke="#cbd5e1" strokeWidth="4" />
        </g>
      )}
      {casa === "rincon" && <ellipse cx="320" cy="272" rx="160" ry="18" fill="#be185d" opacity="0.3" />}
    </g>
  );
}

/**
 * @param {{ datos: object, alTocarMapache?: () => void }} props
 */
export function Casa({ datos, alTocarMapache }) {
  const [elegido, setElegido] = useState(null);
  const voz = hayVoz();
  const tocar = (m) => {
    setElegido(m);
    if (voz) hablar(m.en);
  };
  return (
    <div className={estilos.casa}>
      <svg viewBox="0 0 640 300" className={estilos.escena} role="img" aria-label={`La casa de ${datos.nombre}: ${datos.casa.texto}`}>
        <Fondo casa={datos.casa.id} />
        {datos.muebles
          .filter((m) => DIBUJOS[m.id])
          .map((m) => (
            <g key={m.id} className={estilos.mueble} onClick={() => tocar(m)} role="button" aria-label={`${m.en}: ${m.es}`}>
              {DIBUJOS[m.id]}
            </g>
          ))}
      </svg>
      <div className={estilos.personaje}>
        {datos.estado === "escapado" ? <CajaVacia tamano={170} /> : <Mapache estado={datos.estado === "nuevo" ? "normal" : datos.estado} equipo={datos.equipo} tamano={170} alTocar={alTocarMapache} />}
      </div>
      {elegido && (
        <button type="button" className={estilos.etiqueta} onClick={() => setElegido(null)}>
          <strong lang="en">{elegido.en}</strong> {elegido.es}
        </button>
      )}
    </div>
  );
}
