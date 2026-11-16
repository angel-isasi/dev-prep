import { AuroraText } from "./ui/aurora-text.jsx";
import { TextEffect } from "./ui/text-effect.jsx";
import estilos from "./CabeceraPagina.module.css";

/**
 * Cabecera común de las pantallas (mismo estilo que Inicio): etiqueta pequeña arriba,
 * título grande en Bricolage, subtítulo y, a la derecha, acciones (buscador, botones).
 * `resaltado` es una palabra opcional que va después del título con el degradado de aurora.
 */
export function CabeceraPagina({ etiqueta, titulo, resaltado, children, acciones }) {
  return (
    <header className={estilos.cabecera}>
      <div className={estilos.texto}>
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
        </h1>
        {children && <p className={estilos.subtitulo}>{children}</p>}
      </div>
      {acciones && <div className={estilos.acciones}>{acciones}</div>}
    </header>
  );
}
