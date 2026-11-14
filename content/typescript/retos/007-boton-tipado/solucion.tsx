import type { ReactNode } from "react";

// Unión de literales: solo estos tres textos son válidos.
export type Variante = "primario" | "secundario" | "peligro";

export type BotonProps = {
  variante?: Variante;
  children: ReactNode; // texto, otro elemento, varios elementos...
  onClick?: () => void;
  deshabilitado?: boolean;
};

// Desestructuramos con valores por defecto: dentro de la función,
// `variante` ya es Variante (no Variante | undefined).
export function Boton({ variante = "primario", children, onClick, deshabilitado = false }: BotonProps) {
  return (
    <button type="button" className={`boton boton--${variante}`} onClick={onClick} disabled={deshabilitado}>
      {children}
    </button>
  );
}
