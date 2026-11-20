import { useEffect, useState } from "react";
import { Markdown } from "./Markdown.jsx";
import { api } from "../lib/api.js";
import { useAhora } from "../hooks/useAhora.js";
import estilos from "./Secciones.module.css";
import { IconoReloj } from "./Iconos.jsx";
import { EvaluadorIa } from "./EvaluadorIa.jsx";

const SEGUNDOS = 60;
// Lo que la IA mira al evaluar cómo explicas tu solución
const CLAVES_EXPLICAR = [
  "La idea principal en una frase",
  "Los pasos en orden, sin leer el código línea por línea",
  "Por qué funciona",
  "La complejidad o un caso borde",
];

const NOTAS = [
  { valor: "no", texto: "Me trabé" },
  { valor: "dude", texto: "Más o menos" },
  { valor: "sabia", texto: "Lo expliqué bien" },
];

/**
 * "Explícalo con tus palabras": escribes cómo lo explicarías en una entrevista
 * y luego lo comparas con la explicación modelo.
 * Con IA: evalúa tu explicación (con tu código a la vista). La revisión de senior está en "Entrénalo".
 * @param {{ id: string, titulo?: string, enunciado?: string, resuelto: boolean, textoGuardado: string, modelo: string|null, alGuardar: (texto: string) => Promise<void> }} props
 */
export function SeccionExplicar({ id, titulo = "", enunciado = "", resuelto, textoGuardado, modelo, alGuardar }) {
  const [texto, setTexto] = useState(textoGuardado);
  const [estado, setEstado] = useState("listo"); // listo | guardando | guardado
  // "Explícalo en 60 segundos": como en la entrevista, con reloj. Al terminar te comparas con el modelo.
  const [reloj, setReloj] = useState(null); // { inicio } | { fin: segundos usados }
  const [nota, setNota] = useState(null);
  const ahora = useAhora(250);
  const restantes = reloj?.inicio ? Math.max(0, SEGUNDOS - Math.floor((ahora - reloj.inicio) / 1000)) : null;
  const corriendo = restantes !== null && !reloj?.fin;
  // Tu código de workspace/ (solo en la laptop): la IA lo ve al evaluar y lo revisa como un senior
  const [codigo, setCodigo] = useState(null);
  useEffect(() => {
    if (!resuelto) return;
    let vivo = true;
    api.miCodigo?.(id)
      .then((d) => vivo && setCodigo(d?.codigo ?? null))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [id, resuelto]);

  useEffect(() => {
    if (corriendo && restantes === 0) terminarReloj();
  }, [corriendo, restantes]);

  async function terminarReloj() {
    const usados = Math.min(SEGUNDOS, Math.round((Date.now() - reloj.inicio) / 1000));
    setReloj({ ...reloj, fin: usados });
    if (texto.trim()) {
      setEstado("guardando");
      await alGuardar(texto.trim());
      setEstado("guardado");
    }
  }

  async function calificar(valor) {
    setNota(valor);
    await api.calificarExplicacion?.(id, valor, reloj?.fin ?? null);
  }

  if (!resuelto) {
    return (
      <div className={estilos.seccion}>
        <div className={estilos.bloqueada}>
          <strong>Primero resuélvelo</strong>
          <p>Después lo explicas aquí, como en una entrevista.</p>
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
      <div className={estilos.explicar}>
        <form onSubmit={guardar} className={`${estilos.tarjeta} ${estilos.escribir}`}>
          <header>
            <span className={estilos.etiqueta}>"Cuéntame cómo lo resolviste"</span>
            {corriendo ? (
              <strong className={estilos.reloj} data-poco={restantes <= 10}>
                0:{String(restantes).padStart(2, "0")}
              </strong>
            ) : (
              !reloj && (
                <button
                  type="button"
                  className="boton"
                  title="Como en la entrevista: sin pensarlo demasiado"
                  onClick={() => {
                    setTexto("");
                    setNota(null);
                    setReloj({ inicio: Date.now() });
                  }}
                >
                  <IconoReloj tamano={16} /> En {SEGUNDOS} segundos
                </button>
              )
            )}
          </header>
          <textarea
            readOnly={!!reloj?.fin}
            autoFocus={corriendo}
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
            {corriendo ? (
              <button type="button" className="boton boton-primario" onClick={terminarReloj}>
                Terminé
              </button>
            ) : (
              <button type="submit" className="boton boton-primario" disabled={!texto.trim() || estado === "guardando"}>
                {yaEscribio ? "Guardar cambios" : "Guardar y comparar"}
              </button>
            )}
            {estado === "guardado" && <span className={estilos.guardado}>Guardado</span>}
            <span className={estilos.intro}>{texto.trim() ? texto.trim().split(/\s+/).length : 0} palabras</span>
          </div>
        </form>

        <aside className={`${estilos.tarjeta} ${estilos.guion}`}>
          <span className={estilos.etiqueta}>Qué decir, en orden</span>
          <ol>
            <li>
              <b>1</b>
              <span>
                <strong>La idea</strong>
                <small>En una frase, qué haces</small>
              </span>
            </li>
            <li>
              <b>2</b>
              <span>
                <strong>Los pasos</strong>
                <small>Primero, luego, al final</small>
              </span>
            </li>
            <li>
              <b>3</b>
              <span>
                <strong>Por qué funciona</strong>
                <small>Y un caso raro que cubres</small>
              </span>
            </li>
          </ol>
          <p className={estilos.intro}>Al guardar lo comparas con la respuesta de un candidato fuerte.</p>
        </aside>
      </div>

      {(yaEscribio || reloj?.fin) && modelo && !corriendo && (
        <div className={`${estilos.tarjeta} ${estilos.modelo}`}>
          <span className={estilos.etiqueta}>Cómo lo explicaría un candidato fuerte</span>
          <Markdown>{modelo}</Markdown>
          <p className={estilos.intro}>
            Compara: ¿mencionaste la idea clave? ¿Dijiste por qué funciona y cuánto cuesta? ¿Qué te faltó?
          </p>
          {reloj?.fin && (
            <div className={estilos.fila}>
              {NOTAS.map((n) => (
                <button key={n.valor} type="button" className={`boton ${nota === n.valor ? "boton-primario" : ""}`} onClick={() => calificar(n.valor)}>
                  {n.texto}
                </button>
              ))}
              {nota && (
                <button type="button" className="boton boton-fantasma" onClick={() => setReloj(null)}>
                  Otra vez
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {(yaEscribio || reloj?.fin) && !corriendo && texto.trim() && (
        <EvaluadorIa
          tarea="entrevista"
          respuestaFija={texto.trim()}
          textoBoton="Evaluar mi explicación"
          pedido={{
            pregunta: `Cuéntame cómo resolviste el ejercicio "${titulo}".`,
            categoria: "Explicar tu solución",
            claves: CLAVES_EXPLICAR,
            modelo: modelo ?? "",
            codigo: codigo ?? "",
          }}
        />
      )}

    </div>
  );
}
