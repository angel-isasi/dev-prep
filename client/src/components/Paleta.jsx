import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { api } from "../lib/api.js";
import { ES_MOVIL } from "../lib/modo.js";
import { SECCIONES } from "../lib/navegacion.js";
import { alAbrirPaleta, armarIndice, buscar } from "../lib/paleta.js";
import { alternarTema } from "../hooks/useTema.js";
import { IconoReferencia } from "./Iconos.jsx";
import estilos from "./Paleta.module.css";

/** Atajos que no son páginas del menú. Lo marcado con `web` solo existe en la versión publicada. */
const ACCIONES = [
  { titulo: "Empezar una lección", detalle: "Unas 8 preguntas de tu unidad", a: "/leccion", claves: "estudiar seguir continuar", web: true },
  { titulo: "Lección rápida", detalle: "5 preguntas", a: "/leccion?modo=rapida", claves: "corta poco tiempo", web: true },
  { titulo: "Repasar mis errores", detalle: "Lo que fallaste la última vez", a: "/leccion?modo=errores", claves: "corregir fallos", web: true },
  { titulo: "Inglés rápido", detalle: "5 ejercicios de inglés", a: "/leccion?ambito=ingles&modo=rapida", claves: "english", web: true },
  { titulo: "Modo enfoque", detalle: "25 minutos de una sola cosa", a: "/enfoque", claves: "pomodoro concentrarme temporizador", web: true },
  { titulo: "Simulacro de entrevista", detalle: "Entrevistas", a: "/entrevistas?pestana=simular", claves: "practicar entrevista etapas" },
  { titulo: "Mi pitch y mis historias STAR", detalle: "Entrevistas", a: "/entrevistas?pestana=estudiar&ver=pitch", claves: "presentacion hablame de ti" },
  { titulo: "Ajustes", detalle: "Meta diaria, fecha meta, respaldo", a: "/ajustes", claves: "configuracion nombre objetivo" },
  { titulo: "Cambiar entre modo claro y oscuro", detalle: "Acción", accion: "tema", claves: "tema dark light" },
].filter((x) => ES_MOVIL || !x.web);

async function cargarIndice() {
  const vacio = () => [];
  const [temas, ejercicios, referencia, glosario, preguntas] = await Promise.all([
    api.temas().catch(vacio),
    api.ejercicios().catch(vacio),
    api.referencia().then((r) => r.entradas ?? [], vacio),
    Promise.resolve(api.glosario?.() ?? []).then((categorias) => categorias.flatMap((c) => c.terminos), vacio),
    api.tarjetas({}).catch(vacio),
  ]);
  return armarIndice({ secciones: SECCIONES, acciones: ACCIONES, temas, ejercicios, referencia, glosario, preguntas });
}

/**
 * Buscador global: Ctrl+K (o el botón Buscar) abre una caja que encuentra temas, ejercicios,
 * referencia, glosario, preguntas de entrevista y acciones. Flechas para moverse, Enter para ir.
 * Se monta una sola vez en el armazón de la app.
 */
export function Paleta() {
  const [abierta, setAbierta] = useState(false);
  const [texto, setTexto] = useState("");
  const [indice, setIndice] = useState(null);
  const [elegido, setElegido] = useState(0);
  const lista = useRef(null);
  const navigate = useNavigate();

  useEffect(() => alAbrirPaleta(() => setAbierta(true)), []);
  useEffect(() => {
    const alTeclear = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierta((v) => !v);
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  // El índice se arma la primera vez que se abre (los datos ya suelen estar en caché)
  useEffect(() => {
    if (abierta && !indice) cargarIndice().then(setIndice);
    if (abierta) {
      setTexto("");
      setElegido(0);
    }
  }, [abierta, indice]);

  const grupos = useMemo(() => (indice ? buscar(indice, texto) : []), [indice, texto]);
  const planos = useMemo(() => grupos.flatMap((g) => g.entradas), [grupos]);

  function ir(entrada) {
    if (!entrada) return;
    setAbierta(false);
    if (entrada.accion === "tema") alternarTema();
    else navigate(entrada.a);
  }

  function alTeclearCaja(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const paso = e.key === "ArrowDown" ? 1 : -1;
      const nuevo = planos.length ? (elegido + paso + planos.length) % planos.length : 0;
      setElegido(nuevo);
      lista.current?.querySelector(`[data-n="${nuevo}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      ir(planos[elegido]);
    }
  }

  let n = -1;
  return (
    <Dialog.Root open={abierta} onOpenChange={setAbierta}>
      <Dialog.Portal>
        <Dialog.Overlay className={estilos.fondo} />
        <Dialog.Content className={estilos.caja} aria-describedby={undefined} onKeyDown={alTeclearCaja}>
          <Dialog.Title className={estilos.oculto}>Buscar en dev-prep</Dialog.Title>
          <div className={estilos.campo}>
            <IconoReferencia />
            <input
              value={texto}
              onChange={(e) => (setTexto(e.target.value), setElegido(0))}
              placeholder="Busca un tema, ejercicio, término o pregunta..."
              aria-label="Buscar"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd>Esc</kbd>
          </div>

          <div className={estilos.resultados} ref={lista} role="listbox" aria-label="Resultados">
            {!indice && <p className={estilos.vacio}>Cargando...</p>}
            {indice && !planos.length && <p className={estilos.vacio}>Nada con "{texto}". Prueba con otra palabra.</p>}
            {grupos.map((g) => (
              <div key={g.grupo} className={estilos.grupo}>
                <p className={estilos.nombreGrupo}>{g.grupo}</p>
                {g.entradas.map((entrada) => {
                  n++;
                  const numero = n;
                  return (
                    <button
                      key={`${entrada.grupo}-${entrada.a ?? entrada.accion}-${entrada.titulo}`}
                      type="button"
                      role="option"
                      aria-selected={numero === elegido}
                      data-n={numero}
                      className={estilos.entrada}
                      onMouseMove={() => numero !== elegido && setElegido(numero)}
                      onClick={() => ir(entrada)}
                    >
                      <strong>{entrada.titulo}</strong>
                      {entrada.detalle && <span>{entrada.detalle}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <p className={estilos.ayuda}>
            <kbd>↑</kbd>
            <kbd>↓</kbd> moverte <kbd>Enter</kbd> abrir <kbd>Ctrl K</kbd> abrir o cerrar
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
