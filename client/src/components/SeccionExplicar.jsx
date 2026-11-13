import { useState } from "react";
import { Markdown } from "./Markdown.jsx";
import estilos from "./Secciones.module.css";

/**
 * "Explícalo con tus palabras": escribes cómo lo explicarías en una entrevista
 * y luego lo comparas con la explicación modelo.
 * @param {{ resuelto: boolean, textoGuardado: string, modelo: string|null, alGuardar: (texto: string) => Promise<void> }} props
 */
export function SeccionExplicar({ resuelto, textoGuardado, modelo, alGuardar }) {
  const [texto, setTexto] = useState(textoGuardado);
  const [estado, setEstado] = useState("listo"); // listo | guardando | guardado

  if (!resuelto) {
    return (
      <div className={estilos.seccion}>
        <div className={estilos.bloqueada}>
          <p>Resuelve el ejercicio primero. Después aquí escribirás cómo lo explicarías en una entrevista.</p>
        </div>
      </div>
    );
  }

  async function guardar(evento) {
    evento.preventDefault();
    setEstado("guardando");
    await alGuardar(texto.trim());
    setEstado("guardado");
  }

  const yaEscribio = textoGuardado.trim().length > 0;

  return (
    <div className={estilos.seccion}>
      <p className={estilos.intro}>
        Imagina que el entrevistador te dice "cuéntame cómo lo resolviste". Escríbelo como lo dirías en voz alta: la
        idea, los pasos y por qué funciona. Explicarlo es lo que de verdad te evalúan.
      </p>
      <form onSubmit={guardar} className={estilos.seccion} style={{ paddingTop: 0 }}>
        <textarea
          className={estilos.texto}
          aria-label="Tu explicación"
          placeholder="Primero... luego... funciona porque..."
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setEstado("listo");
          }}
        />
        <div className={estilos.fila}>
          <button
            type="submit"
            className="boton boton-primario"
            disabled={!texto.trim() || estado === "guardando"}
          >
            {yaEscribio ? "Guardar cambios" : "Guardar y comparar"}
          </button>
          {estado === "guardado" && <span className={estilos.guardado}>Guardado</span>}
        </div>
      </form>

      {yaEscribio && modelo && (
        <div className={`${estilos.tarjeta} ${estilos.modelo}`}>
          <span className={estilos.etiqueta}>Cómo lo explicaría un candidato fuerte</span>
          <Markdown>{modelo}</Markdown>
          <p className={estilos.intro}>
            Compara: ¿mencionaste la idea clave? ¿Dijiste por qué funciona y cuánto cuesta? ¿Qué te faltó?
          </p>
        </div>
      )}
    </div>
  );
}
