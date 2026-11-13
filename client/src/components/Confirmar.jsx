import * as Dialog from "@radix-ui/react-dialog";
import estilos from "./Confirmar.module.css";

/**
 * Diálogo de confirmación accesible: atrapa el foco, se cierra con Escape
 * y al hacer clic afuera, y devuelve el foco al botón que lo abrió.
 * `disparador` es el botón que lo abre.
 */
export function Confirmar({ disparador, titulo, descripcion, textoConfirmar, textoCancelar = "Cancelar", peligro, alConfirmar }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{disparador}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={estilos.fondo} />
        <Dialog.Content className={estilos.caja}>
          <Dialog.Title className={estilos.titulo}>{titulo}</Dialog.Title>
          <Dialog.Description className={estilos.descripcion}>{descripcion}</Dialog.Description>
          <div className={estilos.acciones}>
            <Dialog.Close asChild>
              <button type="button" className="boton">
                {textoCancelar}
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                type="button"
                className={`boton ${peligro ? "boton-peligro-lleno" : "boton-primario"}`}
                onClick={alConfirmar}
              >
                {textoConfirmar}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
