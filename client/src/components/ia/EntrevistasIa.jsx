// Entrevistas > Con IA: defiende tu proyecto, negociación de sueldo, preguntas para el entrevistador y el
// examen mensual de preparación (una entrevista completa al mes, comparada con la del mes anterior).
import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { correrJs } from "../../lib/correr-js.js";
import { CajaIa, CodigoIa, ListaIa, Veredicto, estilosIa as base } from "./CajaIa.jsx";
import { ChatIa } from "./ChatIa.jsx";
import { useIa } from "./useIa.js";
import estilos from "./Ia.module.css";

/** Resumen de dev-prep para que la IA te entreviste sobre él (puedes cambiarlo o pegar otro README). */
const DEV_PREP = `dev-prep: app de práctica para entrevistas de frontend junior que hice para mí. React + Vite en el cliente, un servidor Node con Express en la laptop que lee los ejercicios del disco, abre VS Code y corre los tests con Vitest en modo watch (los resultados llegan en vivo a la app). Funciona sin internet. También es una PWA publicada en Vercel que funciona en el celular, con el progreso guardado en localStorage y sincronizado entre dispositivos con una Lambda de AWS (DynamoDB). Tiene repaso espaciado (cajas y FSRS para tarjetas), racha, meta diaria con deuda, lecciones tipo Duolingo, inglés con voz (Web Speech API) y evaluación con IA mediante una función de Vercel que guarda la API key en el servidor (el navegador nunca la ve). Tests con Vitest (más de 500). TypeScript en partes nuevas.`;

export function EntrevistasIa() {
  return (
    <div className={estilos.rejilla}>
      <ExamenMensual />
      <DefiendeProyecto />
      <Negociacion />
      <PreguntasEntrevistador />
    </div>
  );
}

export function DefiendeProyecto() {
  const [proyecto, setProyecto] = useState(() => localStorage.getItem("devprep.defensaProyecto") ?? DEV_PREP);
  const [empezado, setEmpezado] = useState(false);
  return (
    <CajaIa titulo="Defiende tu proyecto" detalle="Te entrevista sobre tu proyecto para ver si lo entiendes de verdad: decisiones, bugs, qué harías distinto.">
      {(olvidar) =>
        !empezado ? (
          <>
            <textarea
              className={base.texto}
              rows={5}
              value={proyecto}
              onChange={(e) => {
                setProyecto(e.target.value);
                localStorage.setItem("devprep.defensaProyecto", e.target.value);
              }}
              aria-label="Descripción del proyecto"
            />
            <small className={base.suave}>Viene con dev-prep. Puedes pegar el README de otro proyecto.</small>
            <div className={base.fila}>
              <button type="button" className="boton boton-primario" disabled={proyecto.trim().length < 30} onClick={() => setEmpezado(true)}>
                Empezar la entrevista
              </button>
            </div>
          </>
        ) : (
          <ChatIa tareaTurno="defensa" tareaCierre="defensa-cierre" datos={{ proyecto }} textoEmpezar="Primera pregunta" alOlvidarClave={olvidar} />
        )
      }
    </CajaIa>
  );
}

const ESCENARIOS = {
  practicas: "Prácticas preprofesionales de frontend en una empresa de software en Lima, presencial o híbrido. Rango interno de la empresa: 1300 a 1800 soles al mes.",
  junior: "Primer trabajo como desarrollador frontend junior (React) en una empresa de software en Lima, híbrido. Rango interno: 2800 a 3800 soles al mes.",
  remoto: "Puesto junior frontend remoto para una empresa de Estados Unidos que contrata en Latinoamérica como contratista. Rango interno: 1200 a 1800 dólares al mes.",
};

export function Negociacion() {
  const [escenario, setEscenario] = useState("junior");
  const [clave, setClave] = useState(0);
  return (
    <CajaIa titulo="Negocia tu sueldo" detalle="Ya pasaste las entrevistas y te llama la reclutadora. Practica dar tu cifra con argumentos sin aceptar lo primero.">
      {(olvidar) => (
        <>
          <div className={estilos.chips}>
            {[
              ["practicas", "Prácticas"],
              ["junior", "Junior en Lima"],
              ["remoto", "Remoto en dólares"],
            ].map(([id, nombre]) => (
              <button key={id} type="button" className={estilos.chip} data-activo={escenario === id} onClick={() => (setEscenario(id), setClave((c) => c + 1))}>
                {nombre}
              </button>
            ))}
          </div>
          <ChatIa key={clave} tareaTurno="negociacion" tareaCierre="negociacion-cierre" datos={{ escenario: ESCENARIOS[escenario] }} textoEmpezar="Contestar la llamada" nombreOtro="Reclutadora" alOlvidarClave={olvidar} />
        </>
      )}
    </CajaIa>
  );
}

export function PreguntasEntrevistador() {
  return (
    <CajaIa titulo="¿Tienes preguntas para nosotros?" detalle="Así termina casi toda entrevista. Escribe las 2 o 3 preguntas que harías y te digo cómo suenan.">
      {(olvidar) => <PreguntasContenido olvidar={olvidar} />}
    </CajaIa>
  );
}

function PreguntasContenido({ olvidar }) {
  const { cargando, error, pedir } = useIa(olvidar);
  const [texto, setTexto] = useState("");
  const [r, setR] = useState(null);
  if (r) {
    return (
      <div className={base.resultado}>
        <Veredicto puntaje={r.puntaje} texto="Tus preguntas" />
        <ul>
          {r.comentarios.map((c, i) => (
            <li key={i}>
              <strong>{c.pregunta}</strong>: {c.comentario}
            </li>
          ))}
        </ul>
        <ListaIa titulo="Podrías preguntar" items={r.sugeridas} tipo="bien" />
        <button type="button" className={base.enlace} onClick={() => setR(null)}>
          Intentar otra vez
        </button>
      </div>
    );
  }
  return (
    <>
      <textarea className={base.texto} rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={"1. ...\n2. ...\n3. ..."} />
      <div className={base.fila}>
        <button type="button" className="boton boton-primario" disabled={cargando || texto.trim().length < 10} onClick={async () => setR(await pedir({ tarea: "preguntas-entrevistador", respuesta: texto }))}>
          {cargando ? "Revisando…" : "Revisar mis preguntas"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
const PREGUNTAS_INGLES = [
  "Tell me about yourself and why you want to work as a frontend developer.",
  "Describe a project you built. What was the hardest part?",
  "How do you usually learn a new technology?",
  "Tell me about a time you made a mistake in your code. What did you do?",
  "Why should we hire you as a junior developer?",
  "How do you organize your work when you have a deadline?",
];
const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const mesActual = () => new Date().toISOString().slice(0, 7);

/** Una entrevista corta y completa una vez al mes: concepto, código, inglés y comportamiento. */
export function ExamenMensual() {
  const [historial, setHistorial] = useState(null);
  useEffect(() => {
    api.examenesMes?.().then(setHistorial, () => setHistorial({}));
  }, []);
  if (!api.examenesMes || !historial) return null;
  const meses = Object.keys(historial).sort();
  const anterior = meses.filter((m) => m < mesActual()).pop();
  const este = historial[mesActual()];
  return (
    <CajaIa titulo="Examen mensual de preparación" detalle="Una entrevista completa al mes (concepto, código, inglés y comportamiento) para ver si de verdad avanzas.">
      {(olvidar) => <ExamenContenido olvidar={olvidar} este={este} anterior={anterior ? { mes: anterior, ...historial[anterior] } : null} alGuardar={(r) => setHistorial((h) => ({ ...h, [mesActual()]: r }))} />}
    </CajaIa>
  );
}

function ExamenContenido({ olvidar, este, anterior, alGuardar }) {
  const { cargando, error, pedir, setError } = useIa(olvidar);
  const [pasos, setPasos] = useState(null); // [{ etapa, pregunta, tarea, extra, respuesta, r }]
  const [indice, setIndice] = useState(0);
  const [texto, setTexto] = useState("");
  const [informe, setInforme] = useState(null);

  async function empezar() {
    setError(null);
    const datos = await fetch("/datos/entrevistas.json").then((r) => r.json()).catch(() => null);
    const preguntas = datos?.preguntas ?? [];
    const tecnicas = preguntas.filter((p) => /JavaScript|React|Web|CSS|HTML/.test(p.categoria));
    const personales = preguntas.filter((p) => /Sobre ti|Recursos humanos/.test(p.categoria));
    const tec = azar(tecnicas);
    const per = azar(personales);
    const codigo = await pedir({ tarea: "imprime-crear", tema: azar(["closures", "event loop y promesas", "this", "referencias de objetos"]), anteriores: [] });
    let salida = "";
    if (codigo) salida = await correrJs(codigo.codigo).catch(() => "");
    const lista = [
      tec && { etapa: "Concepto", pregunta: tec.pregunta, tarea: "entrevista", extra: { claves: tec.claves ?? tec.quiere ?? [], modelo: tec.respuesta ?? "", categoria: tec.categoria } },
      codigo && salida && { etapa: "Código", pregunta: "¿Qué imprime este código y por qué?", codigo: codigo.codigo, tarea: "imprime-evaluar", extra: { codigo: codigo.codigo, salida } },
      { etapa: "Inglés", pregunta: azar(PREGUNTAS_INGLES), tarea: "ingles", extra: { nivel: "B2" } },
      per && { etapa: "Comportamiento", pregunta: per.pregunta, tarea: "entrevista", extra: { claves: per.claves ?? per.quiere ?? [], modelo: per.respuesta ?? "", categoria: per.categoria } },
    ].filter(Boolean);
    setPasos(lista);
    setIndice(0);
    setInforme(null);
  }

  async function responder() {
    const p = pasos[indice];
    const r = await pedir({ tarea: p.tarea, pregunta: p.pregunta, ...p.extra, respuesta: texto });
    if (!r) return;
    const nuevos = pasos.map((x, i) => (i === indice ? { ...x, respuesta: texto, r } : x));
    setPasos(nuevos);
    setTexto("");
    if (indice + 1 < nuevos.length) return setIndice(indice + 1);
    // Último paso: el balance de toda la entrevista
    const items = nuevos.map((x) => ({
      etapa: x.etapa,
      pregunta: x.pregunta,
      puntaje: x.r.puntaje ?? (x.r.veredicto === "acerto" ? 9 : x.r.veredicto === "casi" ? 6 : 3),
      falta: x.r.falta ?? (x.r.correcciones ?? []).map((c) => `${c.original} → ${c.corregido}`),
      respuesta: x.respuesta,
    }));
    const inf = await pedir({ tarea: "informe", items });
    if (!inf) return;
    setInforme(inf);
    const guardado = { puntaje: inf.puntaje, nivel: inf.nivel, resumen: inf.resumen, fecha: new Date().toISOString().slice(0, 10) };
    await api.guardarExamenMes?.(mesActual(), guardado);
    alGuardar(guardado);
  }

  if (informe) {
    const diferencia = anterior ? informe.puntaje - anterior.puntaje : null;
    return (
      <div className={base.resultado}>
        <Veredicto puntaje={informe.puntaje} texto={{ listo: "Listo para una entrevista junior", casi: "Casi listo", falta: "Todavía te falta" }[informe.nivel]} />
        {diferencia !== null && (
          <p className={estilos.nota}>
            {diferencia > 0 ? `Subiste ${diferencia} puntos` : diferencia < 0 ? `Bajaste ${-diferencia} puntos` : "Igual"} respecto a {anterior.mes} ({anterior.puntaje}/10).
          </p>
        )}
        <p>{informe.resumen}</p>
        <div className={base.columnas}>
          <ListaIa titulo="Fortalezas" items={informe.fortalezas} tipo="bien" />
          <ListaIa titulo="Para mejorar" items={informe.mejoras} tipo="falta" />
        </div>
        <ListaIa titulo="Tu plan" items={informe.plan} />
      </div>
    );
  }

  if (!pasos) {
    return (
      <>
        {este && (
          <p className={estilos.nota}>
            Este mes ya lo diste: {este.puntaje}/10. {este.resumen} Puedes repetirlo, pero cuenta el último.
          </p>
        )}
        {!este && anterior && (
          <p className={base.suave}>
            El mes pasado ({anterior.mes}): {anterior.puntaje}/10.
          </p>
        )}
        <div className={base.fila}>
          <button type="button" className="boton boton-primario" disabled={cargando} onClick={empezar}>
            {cargando ? "Preparando…" : "Empezar (unos 15 min)"}
          </button>
        </div>
        {error && <p className={base.error}>{error}</p>}
      </>
    );
  }

  const p = pasos[indice];
  return (
    <>
      <span className={base.suave}>
        {indice + 1} de {pasos.length} · {p.etapa}
      </span>
      <strong lang={p.etapa === "Inglés" ? "en" : "es"}>{p.pregunta}</strong>
      {p.codigo && <CodigoIa codigo={p.codigo} />}
      <textarea className={base.texto} rows={5} lang={p.etapa === "Inglés" ? "en" : "es"} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={p.etapa === "Inglés" ? "Answer in English…" : "Tu respuesta, como la dirías en la entrevista…"} />
      <div className={base.fila}>
        <button type="button" className="boton boton-primario" disabled={cargando || texto.trim().split(/\s+/).length < 3} onClick={responder}>
          {cargando ? "Evaluando…" : indice + 1 < pasos.length ? "Siguiente" : "Terminar y ver el balance"}
        </button>
      </div>
      {error && <p className={base.error}>{error}</p>}
    </>
  );
}
