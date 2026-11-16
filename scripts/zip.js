// Escribe un .zip con archivos en memoria (sin dependencias): lo usa scripts/aws-sync.js para subir la Lambda.
// Formato ZIP mínimo: compresión deflate, sin carpetas ni cifrado.
import { crc32, deflateRawSync } from "node:zlib";

/**
 * @param {{ nombre: string, contenido: Buffer|string }[]} archivos
 * @returns {Buffer}
 */
export function crearZip(archivos) {
  const locales = [];
  const centrales = [];
  let desplazamiento = 0;
  for (const { nombre, contenido } of archivos) {
    const datos = Buffer.from(contenido);
    const comprimido = deflateRawSync(datos);
    const nombreBuf = Buffer.from(nombre, "utf8");
    const crc = crc32(datos);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // firma
    local.writeUInt16LE(20, 4); // versión necesaria
    local.writeUInt16LE(0x0800, 6); // nombres en UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt32LE(0, 10); // hora y fecha (no importan)
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comprimido.length, 18);
    local.writeUInt32LE(datos.length, 22);
    local.writeUInt16LE(nombreBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locales.push(local, nombreBuf, comprimido);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x031e, 4); // hecho en Unix (permisos en los atributos externos)
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(0, 12);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comprimido.length, 20);
    central.writeUInt32LE(datos.length, 24);
    central.writeUInt16LE(nombreBuf.length, 28);
    central.writeUInt32LE(0, 30); // extra y comentario
    central.writeUInt32LE(0, 34); // disco y atributos internos
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38); // archivo normal, -rw-r--r--
    central.writeUInt32LE(desplazamiento, 42);
    centrales.push(central, nombreBuf);

    desplazamiento += local.length + nombreBuf.length + comprimido.length;
  }
  const directorio = Buffer.concat(centrales);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(archivos.length, 8);
  fin.writeUInt16LE(archivos.length, 10);
  fin.writeUInt32LE(directorio.length, 12);
  fin.writeUInt32LE(desplazamiento, 16);
  return Buffer.concat([...locales, directorio, fin]);
}
