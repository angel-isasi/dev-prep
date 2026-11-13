import * as Select from "@radix-ui/react-select";
import estilos from "./Selector.module.css";

// Radix no permite "" como valor de una opción: usamos esta marca para "todos".
const TODOS = "__todos";

/**
 * Select accesible (teclado, lector de pantalla) con el diseño de la app.
 * @param {{ valor: string, alCambiar: (v: string) => void, opciones: { valor: string, texto: string }[], textoTodos: string, etiqueta: string }} props
 */
export function Selector({ valor, alCambiar, opciones, textoTodos, etiqueta }) {
  return (
    <Select.Root value={valor || TODOS} onValueChange={(v) => alCambiar(v === TODOS ? "" : v)}>
      <Select.Trigger className={estilos.disparador} aria-label={etiqueta} data-activo={!!valor}>
        <Select.Value />
        <Select.Icon className={estilos.icono}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={estilos.menu} position="popper" sideOffset={6}>
          <Select.Viewport className={estilos.lista}>
            {[{ valor: TODOS, texto: textoTodos }, ...opciones].map((o) => (
              <Select.Item key={o.valor} value={o.valor} className={estilos.opcion}>
                <Select.ItemText>{o.texto}</Select.ItemText>
                <Select.ItemIndicator className={estilos.check}>✓</Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
