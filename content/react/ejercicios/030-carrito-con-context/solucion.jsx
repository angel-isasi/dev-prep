import { createContext, useContext, useState } from "react";

// 1. El "canal" por donde viaja el carrito.
const CarritoContext = createContext(null);

// 2. El provider guarda el estado y lo pone en el canal.
export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const agregar = (nombre) => setItems((anteriores) => [...anteriores, nombre]);

  return (
    <CarritoContext.Provider value={{ items, agregar }}>
      {children}
    </CarritoContext.Provider>
  );
}

// 3. Cualquier descendiente lee el canal con useContext.
export function Encabezado() {
  const { items } = useContext(CarritoContext);
  return <p>Carrito: {items.length}</p>;
}

export function BotonPizza({ nombre }) {
  const { agregar } = useContext(CarritoContext);
  return <button onClick={() => agregar(nombre)}>Pedir {nombre}</button>;
}
