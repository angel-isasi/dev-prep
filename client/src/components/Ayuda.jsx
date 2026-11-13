import * as Tooltip from "@radix-ui/react-tooltip";
import estilos from "./Ayuda.module.css";

/** Tooltip accesible: aparece al pasar el mouse o al enfocar con Tab. */
export function Ayuda({ texto, children, lado = "top" }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={estilos.globo} side={lado} sideOffset={6}>
          {texto}
          <Tooltip.Arrow className={estilos.flecha} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export const ProveedorAyuda = Tooltip.Provider;
