// Abre VS Code con la carpeta workspace/ y salta al archivo del ejercicio.
// Una sola ventana para todos los ejercicios: si ya está abierta, la reutiliza.
import { spawn } from "node:child_process";

const comillas = (texto) => `"${texto}"`;

/**
 * En Windows `code` es un archivo code.cmd: sin `shell: true` Node no lo encuentra (ENOENT).
 * Las rutas salen de config + un id validado, nunca del navegador.
 * @returns {Promise<void>} se rechaza si el comando `code` no existe
 */
export function abrirEnVSCode(carpeta, archivo) {
  return new Promise((resolve, reject) => {
    // Con shell: true se pasa el comando completo como texto (Node desaconseja pasar
    // argumentos sueltos con shell). Las rutas van entre comillas por si tienen espacios.
    const comando = `code ${comillas(carpeta)} -g ${comillas(archivo)}`;
    const proceso = spawn(comando, {
      shell: true,
      windowsHide: true,
      stdio: "ignore",
    });
    // Si el comando termina rápido con error, `code` no está instalado o no está en el PATH.
    const espera = setTimeout(resolve, 4000);
    proceso.on("error", (error) => {
      clearTimeout(espera);
      reject(error);
    });
    proceso.on("exit", (codigo) => {
      clearTimeout(espera);
      if (codigo === 0) resolve();
      else reject(new Error("No se encontró el comando `code`. Reinstala VS Code marcando la opción \"Agregar a PATH\" y vuelve a abrir la app."));
    });
  });
}
