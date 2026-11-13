## Idea clave

Parte el texto con `split` usando una expresión regular **con un grupo de captura** `( )`: así el resultado incluye las coincidencias. Luego recorres los pedazos y envuelves en `<mark>` los que coinciden. Antes de armar la regex, **escapas** lo que escribió el usuario.

## Paso a paso

1. **Caso vacío.** Si `busqueda.trim()` es `""`, devuelve el texto tal cual. Sin esto, una regex vacía partiría el texto letra por letra.
2. **Escapa la búsqueda.** `replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` busca cualquier carácter especial y le antepone una barra invertida. `$&` significa "lo que coincidió". Así `"("` se vuelve `"\("`, que en una regex significa "un paréntesis literal".
3. **Arma la regex** con `` new RegExp(`(${escapado})`, "gi") ``: `g` para todas las coincidencias, `i` para ignorar mayúsculas, y los paréntesis para que `split` las conserve.
4. **Parte el texto** con `texto.split(patron)`.
5. **Recorre los pedazos**: si un pedazo en minúsculas es igual a la búsqueda en minúsculas, va en `<mark>`; si no, se devuelve como texto suelto. React acepta mezclar textos y elementos dentro de un arreglo.

```jsx
function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function Resaltar({ texto, busqueda }) {
  if (!busqueda.trim()) return <>{texto}</>;

  const patron = new RegExp(`(${escaparRegex(busqueda)})`, "gi");
  const partes = texto.split(patron);
  const buscado = busqueda.toLowerCase();

  return (
    <>
      {partes.map((parte, indice) =>
        parte.toLowerCase() === buscado ? <mark key={indice}>{parte}</mark> : parte
      )}
    </>
  );
}
```

## Por qué funciona

`split` **con** y **sin** grupo de captura, con el texto `"Pizza Margarita"`:

| Llamada | Resultado |
|---|---|
| `split(/mar/gi)` | `["Pizza ", "garita"]` (la coincidencia se pierde) |
| `split(/(mar)/gi)` | `["Pizza ", "Mar", "garita"]` (la coincidencia se conserva) |

Con el segundo resultado, el `map` hace:

| `parte` | `parte.toLowerCase() === "mar"` | Se pinta |
|---|---|---|
| `"Pizza "` | no | `Pizza ` |
| `"Mar"` | **sí** | `<mark>Mar</mark>` |
| `"garita"` | no | `garita` |

Se pinta `"Mar"` con mayúscula porque usas el pedazo **original**; solo comparas en minúsculas.

Con `busqueda = "("` sin escapar, `new RegExp("(()", "gi")` lanza `SyntaxError: Unterminated group`. Escapado, el patrón es `/(\()/gi`: un grupo que contiene un paréntesis literal. Con `"."` pasa algo más sutil: sin escapar no hay error, pero `.` significa "cualquier carácter" y se resaltaría **todo**.

Con `"Pizza"` y `"z"`: `split(/(z)/gi)` da `["Pi", "z", "", "z", "a"]`. El string vacío entre las dos `z` no coincide y no pinta nada visible.

## Errores comunes

- **Olvidar escapar.** La app lanza un error con `(`, `[` o `*`, o resalta cosas raras con `.`. Lo reconoces porque los tests de caracteres especiales fallan con `SyntaxError`.
- **`split` sin paréntesis en la regex.** Pierdes las coincidencias: el texto se ve "comido".
- **Envolver en `<mark>` la búsqueda en vez del pedazo.** Pintarías `"mar"` en minúsculas aunque el texto diga `"Mar"`.
- **Olvidar la bandera `g`** (con `replace` en vez de `split`): solo resaltarías la primera coincidencia.
- **Usar `dangerouslySetInnerHTML`** con `texto.replace(..., "<mark>$1</mark>")`. Funciona, pero si el texto trae HTML del usuario abres la puerta a ataques XSS. Con JSX, React escapa todo solo.

## Otra forma de resolverlo

Sin regex, con `indexOf` en un bucle:

```jsx
export function Resaltar({ texto, busqueda }) {
  if (!busqueda.trim()) return <>{texto}</>;
  const partes = [];
  const textoMin = texto.toLowerCase();
  const buscado = busqueda.toLowerCase();
  let desde = 0;
  let pos = textoMin.indexOf(buscado);
  while (pos !== -1) {
    partes.push(texto.slice(desde, pos));
    partes.push(<mark key={pos}>{texto.slice(pos, pos + buscado.length)}</mark>);
    desde = pos + buscado.length;
    pos = textoMin.indexOf(buscado, desde);
  }
  partes.push(texto.slice(desde));
  return <>{partes}</>;
}
```

**¿Cuándo conviene?** Cuando no quieres lidiar con escapar regex: `indexOf` busca texto literal siempre. Es más largo, pero no tiene sorpresas. La versión con `split` es más corta y es la que se espera ver si dominas regex.

## Cómo explicarlo en la entrevista

> "Parto el texto con `split` y una regex que tiene un grupo de captura, porque así el arreglo resultante conserva las coincidencias. Luego hago `map` y envuelvo en `<mark>` los pedazos que, en minúsculas, son iguales a la búsqueda; uso el pedazo original para respetar las mayúsculas. Lo importante es que escapo la búsqueda antes de armar la regex: lo escribe el usuario, y un paréntesis o un punto rompería el patrón. Tampoco uso `innerHTML`, así React escapa el contenido y evito XSS."

## Conceptos

- **`split` con grupo de captura**: los paréntesis hacen que las coincidencias queden en el resultado.
- **Banderas `g` e `i`**: todas las coincidencias y sin distinguir mayúsculas.
- **Escapar regex**: anteponer `\` a los caracteres especiales para buscarlos literalmente.
- **`$&` en `replace`**: representa el texto que coincidió.
- **Arreglos mixtos en JSX**: React pinta textos y elementos juntos.
- **`<mark>`**: etiqueta semántica para texto resaltado.
- **XSS**: inyección de código; JSX lo evita escapando el contenido.
