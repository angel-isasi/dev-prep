## Idea clave

Las dos son una **cadena de reemplazos** con expresiones regulares. En camelCase, cada "grupo de separadores + letra" se cambia por esa letra en mayúscula. En el slug, primero **separas las tildes de las letras** con `normalize("NFD")` y las borras; después todo lo que no sea letra o número se vuelve un guion.

## Paso a paso

**`aCamel`**

1. Pasa todo a minúsculas.
2. `replace(/[-_\s]+(.)?/g, fn)`: busca uno o más separadores (`[-_\s]+`) seguidos opcionalmente (`?`) de un carácter que se captura (`(.)`).
3. Por cada coincidencia, `fn` recibe la coincidencia completa (que ignoras con `_`) y la letra capturada: devuelve la letra en mayúscula, o `""` si no había letra (separador al final).

**`aSlug`**

1. `normalize("NFD")`: descompone cada letra con tilde en dos caracteres, la letra base y la marca de la tilde. La `ñ` se vuelve `n` + `~`.
2. `replace(/[̀-ͯ]/g, "")`: ese rango de Unicode contiene las marcas sueltas (tildes, diéresis, la virgulilla de la ñ). Las borras.
3. `toLowerCase()`.
4. `replace(/[^a-z0-9]+/g, "-")`: `[^...]` significa "cualquier carácter que **no** esté en la lista"; con `+` agarra grupos enteros y los reemplaza por un solo guion.
5. `replace(/^-+|-+$/g, "")`: borra los guiones del inicio (`^-+`) o (`|`) del final (`-+$`).

```js
export function aCamel(texto) {
  return texto.toLowerCase().replace(/[-_\s]+(.)?/g, (_, letra) => (letra ? letra.toUpperCase() : ""));
}

export function aSlug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

## Por qué funciona

`aCamel("fecha_de_publicacion")`: la expresión encuentra `"_d"` (captura `d`) y `"_p"` (captura `p`), y los cambia por `"D"` y `"P"`: `"fechaDePublicacion"`.

`aSlug("¡Arqueología en Ica: Paracas y Nasca!")`:

| Paso | Texto |
|---|---|
| original | `¡Arqueología en Ica: Paracas y Nasca!` |
| `normalize` + borrar tildes | `¡Arqueologia en Ica: Paracas y Nasca!` |
| `toLowerCase` | `¡arqueologia en ica: paracas y nasca!` |
| `[^a-z0-9]+` → `-` | `-arqueologia-en-ica-paracas-y-nasca-` (el `": "` es un solo grupo, un solo guion) |
| quitar extremos | `arqueologia-en-ica-paracas-y-nasca` |

Sin el paso de `normalize`, la `í` no está en `a-z` y se convertiría en guion: `arqueolog-a`.

## Errores comunes

- **Olvidar el `+` en `[-_\s]+`.** Con dos separadores seguidos, el primero "captura" al segundo como si fuera la letra: `"fecha__de"` daría `"fecha_de"`. Lo reconoces porque falla el test de separadores repetidos.
- **Olvidar la `g` en la expresión.** Solo se reemplaza la primera coincidencia: `"fechaDe_publicacion"`.
- **No pasar a minúsculas antes.** `"NOMBRE_COMPLETO"` daría `"NOMBRECOMPLETO"`.
- **En el slug, reemplazar las tildes una por una (`replace("á", "a")`...).** Es fácil olvidar alguna (la `ü`, la `ñ`, las mayúsculas). `normalize` las cubre todas.
- **No quitar los guiones de los extremos.** `"¿Qué es JS?"` daría `"-que-es-js-"`.
- **Usar `[^a-z0-9]` sin `+`.** Cada espacio o signo se vuelve un guion distinto: `"  Año Nuevo   2027 "` daría `"ano-nuevo---2027"`.

## Otra forma de resolverlo

`aCamel` partiendo en palabras, sin `replace` con función:

```js
export function aCamel(texto) {
  return texto
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((palabra, i) => (i === 0 ? palabra : palabra[0].toUpperCase() + palabra.slice(1)))
    .join("");
}
```

Partes por los separadores, quitas los vacíos, dejas la primera palabra igual y a las demás les pones la primera letra en mayúscula. Es más largo pero cada paso se entiende solo, y además maneja bien un separador al **inicio** (`"_hola"` da `"hola"`; la versión con `replace` daría `"Hola"`). Conviene si no te sientes cómodo con las funciones de reemplazo.

## Cómo explicarlo en la entrevista

> "Para camelCase paso todo a minúsculas y busco con una expresión regular un grupo de separadores seguido de una letra; con una función de reemplazo pongo esa letra en mayúscula y los separadores desaparecen. Para el slug primero normalizo con NFD, que separa las tildes de las letras, y borro las tildes; luego paso a minúsculas, reemplazo cada grupo de caracteres que no sean letras o números por un guion y quito los guiones de los extremos. Es lo que se usa para generar URLs de noticias. Las dos son O(n)."

## Conceptos

- **camelCase, snake_case, kebab-case**: `fechaDeHoy`, `fecha_de_hoy`, `fecha-de-hoy`.
- **Slug**: versión de un texto apta para URL.
- **`replace` con función**: la función recibe la coincidencia y lo capturado, y devuelve el reemplazo.
- **Clases de caracteres**: `[abc]` cualquiera de esos; `[^abc]` cualquiera menos esos; `\s` espacio.
- **Cuantificadores `+` y `?`**: "uno o más" y "cero o uno".
- **Anclas `^` y `$`**: inicio y final del texto.
- **`normalize("NFD")`**: separa cada letra de sus marcas (tildes) para poder borrarlas.
