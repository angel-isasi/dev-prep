// node scripts/generar-icono.js
// Dibuja el ícono de dev-prep (cuadrado redondeado con "</>") y lo guarda como
// client/public/dev-prep.ico, para el acceso directo de Windows. Sin librerías.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const T = 256; // tamaño en píxeles
const SUB = 3; // submuestreo para bordes suaves

// Distancia de un punto a un segmento
function distSegmento(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// "</>" en coordenadas de 0 a 1
const TRAZOS = [
  [0.37, 0.33, 0.22, 0.5],
  [0.22, 0.5, 0.37, 0.67],
  [0.63, 0.33, 0.78, 0.5],
  [0.78, 0.5, 0.63, 0.67],
  [0.56, 0.28, 0.44, 0.72],
];
const GROSOR = 0.045;
const RADIO = 0.22; // esquinas redondeadas

function dentroCuadrado(x, y) {
  const r = RADIO;
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  return Math.hypot(x - cx, y - cy) <= r && x >= 0 && x <= 1 && y >= 0 && y <= 1;
}

const pixeles = Buffer.alloc(T * T * 4);
for (let y = 0; y < T; y++) {
  for (let x = 0; x < T; x++) {
    let fondo = 0;
    let trazo = 0;
    for (let sy = 0; sy < SUB; sy++) {
      for (let sx = 0; sx < SUB; sx++) {
        const u = (x + (sx + 0.5) / SUB) / T;
        const v = (y + (sy + 0.5) / SUB) / T;
        if (!dentroCuadrado(u, v)) continue;
        fondo++;
        if (TRAZOS.some(([ax, ay, bx, by]) => distSegmento(u, v, ax, ay, bx, by) <= GROSOR)) trazo++;
      }
    }
    const total = SUB * SUB;
    const i = (y * T + x) * 4;
    // Degradado lavanda -> verde menta (los colores de la app)
    const k = (x + y) / (2 * T);
    const fr = 179 + (95 - 179) * k;
    const fg = 168 + (211 - 168) * k;
    const fb = 255 + (190 - 255) * k;
    const a = trazo / Math.max(fondo, 1);
    // El trazo es casi negro (#0b0a12) sobre el degradado
    pixeles[i] = Math.round(fr * (1 - a) + 11 * a);
    pixeles[i + 1] = Math.round(fg * (1 - a) + 10 * a);
    pixeles[i + 2] = Math.round(fb * (1 - a) + 18 * a);
    pixeles[i + 3] = Math.round((fondo / total) * 255);
  }
}

// PNG mínimo
const crcTabla = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = crcTabla[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
function bloque(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(T, 0);
ihdr.writeUInt32BE(T, 4);
ihdr[8] = 8; // bits por canal
ihdr[9] = 6; // RGBA
const filas = Buffer.alloc(T * (T * 4 + 1));
for (let y = 0; y < T; y++) pixeles.copy(filas, y * (T * 4 + 1) + 1, y * T * 4, (y + 1) * T * 4);
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  bloque("IHDR", ihdr),
  bloque("IDAT", deflateSync(filas)),
  bloque("IEND", Buffer.alloc(0)),
]);

// ICO con el PNG adentro (Windows Vista en adelante lo acepta)
const cabecera = Buffer.alloc(6 + 16);
cabecera.writeUInt16LE(0, 0);
cabecera.writeUInt16LE(1, 2); // tipo: ícono
cabecera.writeUInt16LE(1, 4); // una imagen
cabecera[6] = 0; // 0 = 256 px
cabecera[7] = 0;
cabecera.writeUInt16LE(1, 10); // planos
cabecera.writeUInt16LE(32, 12); // bits
cabecera.writeUInt32LE(png.length, 14);
cabecera.writeUInt32LE(22, 18); // posición de la imagen
writeFileSync("client/public/dev-prep.ico", Buffer.concat([cabecera, png]));
writeFileSync("client/public/dev-prep.png", png);
console.log("Ícono creado: client/public/dev-prep.ico");
