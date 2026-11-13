import { useEffect, useRef } from "react";

export function usePrevio(valor) {
  // La ref guarda un valor entre renders sin provocar renders nuevos.
  const ref = useRef(undefined);

  // El efecto corre DESPUÉS del render: guarda el valor actual para el próximo.
  useEffect(() => {
    ref.current = valor;
  }, [valor]);

  // Durante el render, la ref todavía tiene el valor del render anterior.
  return ref.current;
}
