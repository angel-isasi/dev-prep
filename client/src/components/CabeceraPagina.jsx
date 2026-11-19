import { useId, useState } from "react";
import { AuroraText } from "./ui/aurora-text.jsx";
import { TextEffect } from "./ui/text-effect.jsx";
import { SubNav } from "./SubNav.jsx";
import estilos from "./CabeceraPagina.module.css";

/**
 * Cabecera común de las pantallas (mismo estilo que Inicio): etiqueta pequeña arriba,
 * título grande en Bricolage, subtítulo y, a la derecha, acciones (buscador, botones).
 * `resaltado` es una palabra opcional que va después del título con el degradado de aurora.
 *
 * El subtítulo (children) explica para qué sirve la pantalla: se lee una vez y después estorba.
 * Por eso no va siempre a la vista: vive detrás de un botón "?" junto al título.
 */
export function CabeceraPagina({ etiqueta, titulo, resaltado, children, acciones }) {
  const [ayuda, setAyuda] = useState(false);
  const idAyuda = useId();
  return (
    <header className={estilos.cabecera}>
      <div className={estilos.texto}>
        {/* En el celular: los otros destinos de esta sección */}
        <SubNav />
        {etiqueta && <p className={estilos.etiqueta}>{etiqueta}</p>}
        <h1 className={estilos.titulo}>
          {/* Motion Primitives: cada palabra sube y se aclara al entrar a la pantalla */}
          {typeof titulo === "string" ? (
            <TextEffect key={titulo} preset="slide" per="word" as="span">
              {titulo}
            </TextEffect>
          ) : (
            titulo
          )}
          {resaltado && (
            <>
              {" "}
              <AuroraText>{resaltado}</AuroraText>
            </>
          )}
          {children && (
            <button
              type="button"
              className={estilos.botonAyuda}
              aria-expanded={ayuda}
              aria-controls={idAyuda}
              aria-label="Para qué sirve esta pantalla"
              onClick={() => setAyuda((a) => !a)}
            >
              ?
            </button>
          )}
        </h1>
        {children && ayuda && (
          <p id={idAyuda} className={estilos.subtitulo}>
            {children}
          </p>
        )}
      </div>
      {acciones && <div className={estilos.acciones}>{acciones}</div>}
    </header>
  );
}
