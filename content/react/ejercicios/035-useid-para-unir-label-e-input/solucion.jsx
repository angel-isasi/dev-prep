import { useId } from "react";

// `...props` junta todas las props que no son `etiqueta`.
export function Campo({ etiqueta, ...props }) {
  const id = useId(); // único por cada Campo renderizado

  return (
    <div>
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} {...props} />
    </div>
  );
}
