import { useState } from "react";

const TOTAL_PASOS = 3;

export function Wizard({ onFinalizar }) {
  const [paso, setPaso] = useState(0);
  // Los datos de TODOS los pasos viven aquí, no dentro de cada paso.
  const [datos, setDatos] = useState({ nombre: "", escuela: "" });

  function cambiar(campo, valor) {
    setDatos((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  const esUltimo = paso === TOTAL_PASOS - 1;

  function avanzar() {
    if (esUltimo) onFinalizar(datos);
    else setPaso((p) => p + 1);
  }

  return (
    <div>
      <p>
        Paso {paso + 1} de {TOTAL_PASOS}
      </p>

      {paso === 0 && (
        <label>
          Nombre
          <input value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
        </label>
      )}

      {paso === 1 && (
        <label>
          Escuela
          <input value={datos.escuela} onChange={(e) => cambiar("escuela", e.target.value)} />
        </label>
      )}

      {paso === 2 && (
        <p>
          Confirma: {datos.nombre}, {datos.escuela}
        </p>
      )}

      {paso > 0 && (
        <button type="button" onClick={() => setPaso((p) => p - 1)}>
          Atrás
        </button>
      )}
      <button type="button" onClick={avanzar}>
        {esUltimo ? "Enviar" : "Siguiente"}
      </button>
    </div>
  );
}
