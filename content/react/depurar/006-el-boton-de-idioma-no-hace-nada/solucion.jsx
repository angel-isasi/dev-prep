import { createContext, useContext, useState } from "react";

// Idioma de la app con Context
//
// IdiomaProvider guarda el idioma ("es" o "en") y lo comparte.
// BotonIdioma lo cambia; Bienvenida muestra el saludo en el idioma actual.

const IdiomaContext = createContext({ idioma: "es", cambiar: () => {} });

function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState("es");
  const cambiar = () => setIdioma((i) => (i === "es" ? "en" : "es"));
  return <IdiomaContext.Provider value={{ idioma, cambiar }}>{children}</IdiomaContext.Provider>;
}

function BotonIdioma() {
  const { idioma, cambiar } = useContext(IdiomaContext);
  return <button onClick={cambiar}>{idioma === "es" ? "English" : "Español"}</button>;
}

function Bienvenida() {
  const { idioma } = useContext(IdiomaContext);
  return <h1>{idioma === "es" ? "Bienvenido" : "Welcome"}</h1>;
}

export function App() {
  return (
    <>
      <IdiomaProvider>
        <BotonIdioma />
        <Bienvenida />
      </IdiomaProvider>
    </>
  );
}
