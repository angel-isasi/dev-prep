// TU PARTE (tarea 1): instrucciones en docs/tareas/01-insignia-y-filtro.md
// Los tests están en Insignia.test.jsx. Córrelos con: npm test
//
// Una etiqueta pequeña de color para el estado o el nivel de un ejercicio:
//   <Insignia estado="resuelto" />   ->  "Resuelto" en verde
//   <Insignia nivel={2} />           ->  "Intermedio" en amarillo
//
// Los colores ya están en Insignia.module.css: solo tienes que poner el
// atributo data-variante="exito" | "aviso" | "error" | "neutro" en el <span>.

import estilos from "./Insignia.module.css";

export function Insignia({ estado, nivel }) {
  // Por ahora muestra el valor tal cual. Reemplaza esto con tu código.
  return <span className={estilos.insignia}>{estado ?? nivel}</span>;
}
