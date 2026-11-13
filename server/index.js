// Punto de entrada: npm start
import { config } from "./config.js";
import { crearIndice } from "./contenido.js";
import { crearApp } from "./app.js";

const indice = await crearIndice(config.contenidoDir);
for (const error of indice.errores) console.warn(`[contenido] ${error}`);

const app = crearApp({ indice, clienteDir: config.clienteDir });

app.listen(config.puerto, config.host, () => {
  console.log(`dev-prep listo en http://localhost:${config.puerto} (${indice.ejercicios.length} ejercicios)`);
});
