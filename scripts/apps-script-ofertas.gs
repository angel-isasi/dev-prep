// dev-prep: entrega a la app las alertas de empleo de tu etiqueta "Ofertas de trabajo" de Gmail.
// Se pega en script.google.com (en tu cuenta), se implementa como aplicación web ("Ejecutar como: yo",
// "Acceso: cualquier usuario") y la app lo llama con la clave. Solo lee: no borra ni envía nada.
// La clave NO va aquí (este archivo está en un repositorio público): va en Configuración del proyecto →
// Propiedades del script → CLAVE.
const ETIQUETA = 'ofertas-de-trabajo';
const DIAS = 14;
// Confirmaciones de postulación (Indeed, Bumeran, Computrabajo, LinkedIn, empresas): para marcar las ofertas a las que ya postulaste
const POSTULACIONES = 'newer_than:90d subject:("Indeed Application" OR "tu postulación" OR "tu postulacion" OR "tu solicitud se ha enviado" OR "thank you for applying" OR "thanks for applying" OR "your application" OR "gracias por postular")';

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
  const postulaciones = [];
  GmailApp.search(POSTULACIONES, 0, 100).forEach(function (hilo) {
    const m = hilo.getMessages()[0];
    postulaciones.push({ de: m.getFrom(), asunto: m.getSubject(), fecha: m.getDate().toISOString(), texto: m.getPlainBody().slice(0, 3000) });
  });
  return salida({ correos: correos, postulaciones: postulaciones });
}

function salida(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos)).setMimeType(ContentService.MimeType.JSON);
}
