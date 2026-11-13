import { createContext, useCallback, useContext, useMemo, useState } from "react";

// El valor por defecto (null) es el que recibe quien lea el contexto sin Provider.
const TemaContext = createContext(null);

export function TemaProvider({ children }) {
  const [tema, setTema] = useState("claro");

  const alternar = useCallback(() => {
    setTema((actual) => (actual === "claro" ? "oscuro" : "claro"));
  }, []);

  // Mismo objeto mientras el tema no cambie: los consumidores no se re-renderizan de más.
  const valor = useMemo(() => ({ tema, alternar }), [tema, alternar]);

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error("useTema debe usarse dentro de TemaProvider");
  }
  return contexto;
}

export function BotonTema() {
  const { tema, alternar } = useTema();
  return <button onClick={alternar}>Tema: {tema}</button>;
}

export function Tarjeta() {
  const { tema } = useTema();
  return (
    <div data-testid="tarjeta" className={tema === "oscuro" ? "bg-navy" : "bg-white"}>
      Hola
    </div>
  );
}
