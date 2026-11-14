import express from "express";

const ARTICULOS = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  titulo: `Artículo ${i + 1}`,
}));

const LIMITE_POR_DEFECTO = 10;
const LIMITE_MAXIMO = 50;

export function crearApp() {
  const app = express();

  app.get("/articulos", (req, res) => {
    // Si no vino el parámetro (o vino vacío), usamos el valor por defecto.
    const pagina = Number(req.query.page || 1);
    const limitePedido = Number(req.query.limit || LIMITE_POR_DEFECTO);

    // Number.isInteger descarta NaN ("abc") y decimales (2.5) de una vez.
    const esEnteroPositivo = (n) => Number.isInteger(n) && n >= 1;
    if (!esEnteroPositivo(pagina) || !esEnteroPositivo(limitePedido)) {
      return res.status(400).json({ error: "page y limit deben ser enteros positivos" });
    }

    const limite = Math.min(limitePedido, LIMITE_MAXIMO); // tope de 50
    const total = ARTICULOS.length;
    const paginas = Math.ceil(total / limite); // 23 / 10 = 2.3 -> 3 páginas

    // La página 1 empieza en 0, la 2 en `limite`, la 3 en `2 * limite`...
    const inicio = (pagina - 1) * limite;
    const datos = ARTICULOS.slice(inicio, inicio + limite); // fuera de rango -> []

    res.json({ datos, pagina, limite, total, paginas });
  });

  return app;
}
