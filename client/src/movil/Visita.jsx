// Lo que ve quien entra en modo visita (?visita=1): una barra que avisa que los datos son de
// ejemplo y una presentación corta del proyecto con atajos a las pantallas que vale la pena mirar.
// La lógica (datos en memoria, sin sincronizar) está en lib/visita.js.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { api } from "../lib/api.js";
import { salirDeVisita } from "../lib/visita.js";
import estilos from "./Visita.module.css";

const REPOSITORIO = "https://github.com/angel-isasi/dev-prep";
const CLAVE_VISTA = "devprep-visita-presentada";

const QUE_MIRAR = [
  { a: "/", titulo: "Hoy", texto: "La sesión del día: qué repasar primero y qué sigue" },
  { a: "/aprender/closures-y-scope", titulo: "Un tema completo", texto: "Teoría, lecciones, ejercicios, quiz y entrevista en una página" },
  { a: "/practicar/js-ej-001", titulo: "Un ejercicio", texto: "Enunciado, pistas progresivas y solución explicada" },
  { a: "/progreso", titulo: "Progreso", texto: "Mapa de dominio y la ruta semana a semana" },
];

const HECHA_CON = [
  "React 19 con Vite y React Router",
  "Node y Express: un motor local que abre VS Code y corre los tests al guardar",
  "Vitest: las pruebas de la app y los tests de cada ejercicio",
  "PWA con service worker: funciona sin internet",
  "AWS Lambda y DynamoDB para unir el progreso de laptop y celular",
  "CSS propio con tokens de diseño, tema claro y oscuro",
];

/** Envuelve la app en modo visita: la barra arriba y el contenido debajo. */
export function MarcoVisita({ children }) {
  const [abierta, setAbierta] = useState(() => sessionStorage.getItem(CLAVE_VISTA) !== "1");
  const [numeros, setNumeros] = useState(null);
  const navegar = useNavigate();

  useEffect(() => {
    api.version?.().then(setNumeros, () => {});
  }, []);

  const cerrar = () => {
    sessionStorage.setItem(CLAVE_VISTA, "1");
    setAbierta(false);
  };
  const ir = (a) => {
    cerrar();
    navegar(a);
  };

  return (
    <div className={estilos.marco}>
      <div className={estilos.barra} role="status">
        <span className={estilos.aviso}>
          <strong>Modo visita.</strong> Estás viendo dev-prep con datos de ejemplo: nada se guarda.
        </span>
        <span className={estilos.acciones}>
          <button type="button" onClick={() => setAbierta(true)}>
            Qué es esto
          </button>
          <a href={REPOSITORIO} target="_blank" rel="noreferrer">
            Código en GitHub ↗
          </a>
          <button type="button" onClick={salirDeVisita}>
            Salir
          </button>
        </span>
      </div>
      <div className={estilos.contenido}>{children}</div>

      <Dialog.Root open={abierta} onOpenChange={(v) => (v ? setAbierta(true) : cerrar())}>
        <Dialog.Portal>
          <Dialog.Overlay className={estilos.fondo} />
          <Dialog.Content className={estilos.caja}>
            <span className="etiqueta">Proyecto de Angel Isasi</span>
            <Dialog.Title className={estilos.titulo}>dev-prep</Dialog.Title>
            <Dialog.Description className={estilos.descripcion}>
              La app que construí para prepararme como desarrollador frontend junior, y que uso todos los días. Lo que vas a ver tiene un progreso de ejemplo.
            </Dialog.Description>

            {numeros && (
              <dl className={estilos.numeros}>
                <div>
                  <dt>{numeros.ejercicios}</dt>
                  <dd>ejercicios con tests</dd>
                </div>
                <div>
                  <dt>{numeros.temas}</dt>
                  <dd>temas con teoría y quiz</dd>
                </div>
                <div>
                  <dt>{numeros.preguntas}</dt>
                  <dd>preguntas de entrevista</dd>
                </div>
                <div>
                  <dt>A1 a C2</dt>
                  <dd>inglés por niveles</dd>
                </div>
              </dl>
            )}

            <div className={estilos.columnas}>
              <section>
                <h3>Qué mirar</h3>
                <ul className={estilos.atajos}>
                  {QUE_MIRAR.map((x) => (
                    <li key={x.a}>
                      <button type="button" onClick={() => ir(x.a)}>
                        <strong>{x.titulo} →</strong>
                        <span>{x.texto}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3>Con qué está hecha</h3>
                <ul className={estilos.lista}>
                  {HECHA_CON.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className={estilos.pie}>
              <a href={REPOSITORIO} target="_blank" rel="noreferrer" className="boton">
                Ver el código en GitHub ↗
              </a>
              <button type="button" className="boton boton-primario" onClick={cerrar}>
                Empezar a mirar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
