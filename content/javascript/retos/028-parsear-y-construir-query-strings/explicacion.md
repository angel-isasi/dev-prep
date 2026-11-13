## Idea clave

No reinventes la rueda: `URLSearchParams` ya sabe leer y armar query strings, y se encarga de **codificar y decodificar** espacios y caracteres especiales. Tú solo conviertes entre objeto y pares con `Object.entries` y `Object.fromEntries`.

## Paso a paso

1. **`parsearQuery`**: quita el `?` inicial con `qs.replace(/^\?/, "")`. La expresión `^\?` significa "un signo `?` al inicio del texto" (la barra hace que `?` sea literal).
2. Crea `new URLSearchParams(...)` con ese texto: separa los pares y decodifica los valores.
3. Conviértelo en objeto con `Object.fromEntries(params)`, que acepta cualquier cosa que se pueda recorrer como pares.
4. **`crearQuery`**: saca los pares con `Object.entries(obj)`.
5. Filtra los que valen `undefined` o `""`. El `[, valor]` desestructura el par saltándose la clave.
6. Crea `new URLSearchParams(pares)` y conviértelo a texto con `toString()`, que codifica todo.

```js
export function parsearQuery(qs) {
  return Object.fromEntries(new URLSearchParams(qs.replace(/^\?/, "")));
}

export function crearQuery(obj) {
  const pares = Object.entries(obj).filter(([, valor]) => valor !== undefined && valor !== "");
  return new URLSearchParams(pares).toString();
}
```

## Por qué funciona

`parsearQuery("?q=cortos%20ica&pagina=2")`:

| Paso | Resultado |
|---|---|
| quitar el `?` | `"q=cortos%20ica&pagina=2"` |
| `new URLSearchParams(...)` | pares `["q", "cortos ica"]` y `["pagina", "2"]`, ya decodificados |
| `Object.fromEntries(...)` | `{ q: "cortos ica", pagina: "2" }` |

`crearQuery({ q: "cortos ica", pagina: 2, vacio: "" })`:

| Paso | Resultado |
|---|---|
| `Object.entries` | `[["q", "cortos ica"], ["pagina", 2], ["vacio", ""]]` |
| `filter` | `[["q", "cortos ica"], ["pagina", 2]]` |
| `new URLSearchParams(pares).toString()` | `"q=cortos+ica&pagina=2"` |

¿Por qué hay que codificar? Porque `&` y `=` tienen significado en la URL. Si mandas `q=cine & teatro` sin codificar, el `&` corta el valor y aparece un parámetro falso llamado `" teatro"`. Codificado queda `q=cine+%26+teatro` y vuelve intacto al parsearlo.

El número 2 sale como `"2"` al parsear: en la URL todo es texto. Si lo necesitas como número, lo conviertes con `Number(...)`.

## Errores comunes

- **Armar el texto a mano con `${clave}=${valor}`.** Los espacios, `&` o `ñ` rompen la URL. Lo reconoces porque el test de caracteres especiales recibe `q=a&b`.
- **Parsear con `split("=")` sin decodificar.** Recibes `"cortos%20ica"` en vez de `"cortos ica"`.
- **Usar `decodeURIComponent` pero no reemplazar `+`.** `decodeURIComponent("cortos+ica")` deja el `+`. Los formularios codifican los espacios como `+`. Lo reconoces porque el segundo test recibe `"cortos+ica"`.
- **Filtrar con `if (valor)` en `crearQuery`.** También descartas `0` y `false`, que son valores válidos (página 0, `activo=false`).
- **Dejar el `?` al parsear.** La primera clave queda como `"?q"`. Lo reconoces porque el objeto tiene la clave `"?q"` en vez de `q`.

## Otra forma de resolverlo

`parsearQuery` a mano, para entender qué hace `URLSearchParams` por dentro:

```js
export function parsearQuery(qs) {
  const resultado = {};
  const texto = qs.startsWith("?") ? qs.slice(1) : qs;
  if (texto === "") return resultado;

  for (const par of texto.split("&")) {
    const [clave, valor = ""] = par.split("=");
    const decodificar = (s) => decodeURIComponent(s.replace(/\+/g, " "));
    resultado[decodificar(clave)] = decodificar(valor);
  }
  return resultado;
}
```

Corta por `&`, luego por `=`, cambia los `+` por espacios y decodifica el resto con `decodeURIComponent`. Sirve para mostrar en la entrevista que entiendes el formato, pero en código real usa `URLSearchParams`: maneja casos que es fácil olvidar. En el navegador, `new URL(location.href).searchParams` te da los parámetros de la página actual directamente.

## Cómo explicarlo en la entrevista

> "No reinvento la rueda: `URLSearchParams` ya maneja la codificación de espacios y caracteres especiales. Para leer, quito el `?`, creo el `URLSearchParams` y lo convierto a objeto con `Object.fromEntries`. Para construir, saco los pares con `Object.entries`, filtro los valores vacíos y dejo que la API arme el texto. Ojo: los valores siempre llegan como string, así que si necesito números los convierto. Codificar es clave porque un `&` sin codificar parte el valor en dos."

## Conceptos

- **Query string**: la parte de la URL después del `?`, con pares `clave=valor` separados por `&`.
- **`URLSearchParams`**: objeto nativo para leer, modificar y armar query strings.
- **Codificación de URL**: los caracteres especiales se escriben como `%XX` (y el espacio como `+` o `%20`).
- **`Object.entries` / `Object.fromEntries`**: de objeto a pares y de pares a objeto.
- **Desestructuración con hueco**: `[, valor]` toma el segundo elemento e ignora el primero.
- **`decodeURIComponent`**: decodifica `%XX`, pero no convierte `+` en espacio.
