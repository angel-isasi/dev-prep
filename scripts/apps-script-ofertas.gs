// dev-prep: entrega a la app las alertas de empleo de tu etiqueta "Ofertas de trabajo" de Gmail.
// Se pega en script.google.com (en tu cuenta), se implementa como aplicación web ("Ejecutar como: yo",
// "Acceso: cualquier usuario") y la app lo llama con la clave. Solo lee: no borra ni envía nada.
// La clave NO va aquí (este archivo está en un repositorio público): va en Configuración del proyecto →
// Propiedades del script → CLAVE.
const ETIQUETA = 'ofertas-de-trabajo';
const DIAS = 14;

function doGet(e) {
  const clave = PropertiesService.getScriptProperties().getProperty('CLAVE');
  if (!clave || !e || e.parameter.clave !== clave) return salida({ error: 'clave' });
  const desde = Date.now() - DIAS * 24 * 60 * 60 * 1000;
  const correos = [];
  GmailApp.search('label:' + ETIQUETA + ' newer_than:' + DIAS + 'd', 0, 150).forEach(function (hilo) {
    hilo.getMessages().forEach(function (m) {
      if (m.getDate().getTime() < desde) return;
      const de = m.getFrom();
      const correo = { de: de, fecha: m.getDate().toISOString() };
      // Glassdoor manda las tarjetas solo en HTML; LinkedIn y Get on Board, bien en texto plano
      if (/glassdoor\.com/i.test(de)) correo.html = m.getBody().slice(0, 200000);
      else correo.texto = m.getPlainBody().slice(0, 80000);
      correos.push(correo);
    });
  });
  return salida({ correos: correos });
}

function salida(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos)).setMimeType(ContentService.MimeType.JSON);
}
