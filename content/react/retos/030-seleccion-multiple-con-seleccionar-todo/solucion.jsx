import { useEffect, useRef, useState } from "react";

export function SeleccionMultiple({ items }) {
  // Set con los ids elegidos: buscar con .has(id) es directo.
  const [elegidos, setElegidos] = useState(() => new Set());
  const refTodos = useRef(null);

  // Estado derivado.
  const todos = items.length > 0 && elegidos.size === items.length;
  const algunos = elegidos.size > 0 && !todos;

  // `indeterminate` no existe como atributo HTML: solo se puede poner desde JavaScript.
  useEffect(() => {
    if (refTodos.current) refTodos.current.indeterminate = algunos;
  }, [algunos]);

  function alternar(id) {
    setElegidos((anteriores) => {
      const nuevo = new Set(anteriores); // copia: nunca mutamos el Set del estado
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  function alternarTodos() {
    setElegidos(todos ? new Set() : new Set(items.map((item) => item.id)));
  }

  return (
    <div>
      <label>
        <input ref={refTodos} type="checkbox" checked={todos} onChange={alternarTodos} />
        Seleccionar todo
      </label>
      {items.map((item) => (
        <label key={item.id}>
          <input type="checkbox" checked={elegidos.has(item.id)} onChange={() => alternar(item.id)} />
          {item.nombre}
        </label>
      ))}
      <p>{elegidos.size} seleccionados</p>
    </div>
  );
}
