import { createContext, useContext, useState } from "react";

// Canal privado entre Opciones y sus Item.
const GrupoContext = createContext(null);

export function Opciones({ valor, onCambio, children }) {
  return (
    <GrupoContext.Provider value={{ valor, onCambio }}>
      <div role="radiogroup">{children}</div>
    </GrupoContext.Provider>
  );
}

// Item cuelga de Opciones: se usa como <Opciones.Item>.
Opciones.Item = function Item({ valor, children }) {
  const grupo = useContext(GrupoContext);
  if (!grupo) throw new Error("Opciones.Item debe usarse dentro de <Opciones>");

  return (
    <button role="radio" aria-checked={grupo.valor === valor} onClick={() => grupo.onCambio(valor)}>
      {children}
    </button>
  );
};

export function Masa() {
  const [masa, setMasa] = useState("delgada");

  return (
    <Opciones valor={masa} onCambio={setMasa}>
      <Opciones.Item valor="delgada">Delgada</Opciones.Item>
      <Opciones.Item valor="gruesa">Gruesa</Opciones.Item>
    </Opciones>
  );
}
