Escribe dos funciones para transformar textos:

- `aCamel(texto)`: convierte a **camelCase**, el formato de los nombres de variables en JavaScript: todo junto, la primera palabra en minúsculas y las siguientes con su primera letra en mayúscula.
- `aSlug(texto)`: convierte a **slug**, el formato de las URLs: minúsculas, sin tildes, sin signos y con las palabras separadas por guiones.

## Reglas

**`aCamel`**

- Los separadores son guiones `-`, guiones bajos `_` y espacios. Uno o varios seguidos cuentan como un solo separador.
- Todo pasa a minúsculas, salvo la primera letra de cada palabra después de un separador.
- Si el texto termina en un separador, se descarta.

**`aSlug`**

- Las letras con tilde pierden la tilde y la `ñ` se vuelve `n`: `"Arqueología"` da `"arqueologia"`.
- Todo pasa a minúsculas.
- Cualquier grupo de caracteres que no sea letra (a-z) o número se reemplaza por **un solo** guion.
- No quedan guiones al inicio ni al final.

## Ejemplos

```js
aCamel("fecha_de_publicacion");    // "fechaDePublicacion"
aCamel("nombre-del-corto");        // "nombreDelCorto"
aCamel("Nombre Completo");         // "nombreCompleto"
aCamel("NOMBRE_COMPLETO");         // "nombreCompleto"

aSlug("¡Arqueología en Ica: Paracas y Nasca!");   // "arqueologia-en-ica-paracas-y-nasca"
aSlug("  Año Nuevo   2027 ");                     // "ano-nuevo-2027"
```

## Por qué importa

Convertir formatos es tarea diaria: la API te manda `fecha_de_publicacion` y en tu código usas `fechaDePublicacion`; el título de una noticia se vuelve la URL `/noticias/arqueologia-en-ica`. En entrevistas es la excusa perfecta para ver si sabes usar expresiones regulares y si piensas en tildes y caracteres raros, algo que en español pasa siempre.
