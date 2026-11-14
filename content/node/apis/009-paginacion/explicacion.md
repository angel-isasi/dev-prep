## Idea clave

Paginar es cortar la lista con `slice(inicio, inicio + limite)`, donde `inicio = (pagina - 1) * limite`. Además devuelves los **metadatos** (`total` y `paginas = Math.ceil(total / limite)`) para que el cliente sepa cuántas páginas existen. Validas los parámetros y pones un **tope** al límite para que nadie pida todo de golpe.

## Paso a paso

1. **Valores por defecto.** `req.query.page || 1`: si no vino (`undefined`) o vino vacío (`""`), usa 1. Después conviertes con `Number`.
2. **Validar.** `Number.isInteger(n) && n >= 1` rechaza todo lo malo de una vez: `NaN` (de `"abc"`), decimales (`2.5`), cero y negativos. Si `page` o `limit` falla, `400`.
3. **Tope.** `Math.min(limitePedido, 50)`. No es un error pedir 100: simplemente recibes 50. El `limite` que devuelves es el que **usaste**, para que el cliente sepa qué pasó.
4. **Metadatos.** `total` es el largo de la lista. `paginas` es `Math.ceil(total / limite)`: con 23 artículos y límite 10 hay 2 páginas llenas y una con 3, o sea 3.
5. **Cortar.** La página 1 empieza en la posición 0, la 2 en `limite`, la 3 en `2 * limite`: en general `(pagina - 1) * limite`. `slice(inicio, inicio + limite)` toma desde `inicio` hasta antes de `inicio + limite`.
6. **Responder.** `res.json({ datos, pagina, limite, total, paginas })`.

```js
const inicio = (pagina - 1) * limite;
const datos = ARTICULOS.slice(inicio, inicio + limite);
res.json({ datos, pagina, limite, total, paginas: Math.ceil(total / limite) });
```

## Por qué funciona

Con 23 artículos (posiciones 0 a 22, ids 1 a 23):

| Petición | `pagina` | `limite` | `inicio` | `slice(...)` | ids | `paginas` |
|---|---|---|---|---|---|---|
| (sin nada) | 1 | 10 | 0 | `slice(0, 10)` | 1 a 10 | 3 |
| `?page=3` | 3 | 10 | 20 | `slice(20, 30)` | 21, 22, 23 | 3 |
| `?page=2&limit=5` | 2 | 5 | 5 | `slice(5, 10)` | 6 a 10 | 5 |
| `?limit=100` | 1 | **50** | 0 | `slice(0, 50)` | los 23 | 1 |
| `?page=9` | 9 | 10 | 80 | `slice(80, 90)` | ninguno | 3 |

`slice` nunca falla por pasarse: `slice(20, 30)` en un arreglo de 23 da lo que haya (3 elementos), y `slice(80, 90)` da `[]`. Por eso la página fuera de rango sale sola, sin un `if`.

Con `?page=0`: `Number("0")` es 0, que no es `>= 1`, así que 400. Ojo: `"0" || 1` da `"0"` porque `"0"` es un texto no vacío (truthy), así que el 0 no se convierte en 1 por accidente.

## Errores comunes

- **Calcular `inicio = pagina * limite`**: la página 1 empieza en la 10 y te saltas los primeros. Lo ves en el primer test: recibes del 11 al 20.
- **`Math.floor` o `Math.round` en vez de `Math.ceil`**: con 23 / 10 daría 2 páginas y perderías los últimos 3 artículos.
- **`parseInt` en vez de `Number`**: `parseInt("2.5")` da 2 y `parseInt("3abc")` da 3; pasan la validación cuando deberían dar 400.
- **Usar `req.query.page ?? 1`**: `??` solo reemplaza `null` y `undefined`. Con `?page=` llegaría `""`, `Number("")` es 0 y responderías 400 sin motivo.
- **No poner tope al límite**: funciona en el ejercicio, pero en producción `limit=1000000` sobre una tabla grande tumba la base. El test de `limit=100` lo exige.
- **Responder 404 para una página fuera de rango**: los datos sí existen, solo que esa página está vacía; el cliente usa `paginas` para no pedirla.

## Otra forma de resolverlo

**Paginación por cursor** (la que usan feeds como Twitter o Instagram). En vez de `page`, el cliente manda "dame los 10 siguientes después del id 20":

```js
// GET /articulos?despuesDe=20&limit=10
const despuesDe = Number(req.query.despuesDe || 0);
const datos = ARTICULOS.filter((a) => a.id > despuesDe).slice(0, limite);
const siguiente = datos.length === limite ? datos.at(-1).id : null;
res.json({ datos, siguiente });
```

| | Offset (`page` + `limit`) | Cursor (`despuesDe`) |
|---|---|---|
| Saltar a la página 7 | sí | no, solo "siguiente" |
| Si insertan datos mientras navegas | se repiten o se saltan elementos | estable |
| Costo en una base grande | `OFFSET 10000` es lento | rápido con índice |

Offset es lo normal en tablas de administración con números de página; cursor en scroll infinito. En SQL, la versión offset es `LIMIT ? OFFSET ?` con los mismos números que calculaste aquí.

## Cómo explicarlo en la entrevista

> "Leo page y limit de la query con valores por defecto 1 y 10, los convierto y valido que sean enteros mayores o iguales a 1; si no, 400. Al límite le pongo un tope de 50 para proteger el servidor. Calculo el inicio como (page - 1) por limit y corto con slice, que devuelve vacío si me paso del final, así que una página fuera de rango responde 200 con datos vacíos. Además devuelvo total y paginas, con Math.ceil, para que el frontend pueda armar la navegación. Si la lista cambia mucho o es infinita, usaría paginación por cursor."

## Conceptos

- **Paginación offset**: `inicio = (pagina - 1) * limite`, `slice(inicio, inicio + limite)`.
- **Metadatos**: `total` y `paginas` con `Math.ceil`.
- **Valores por defecto con `||`** y por qué no `??` con textos vacíos.
- **Validación con `Number.isInteger`**: descarta NaN, decimales y negativos.
- **Tope con `Math.min`**: proteger el servidor de peticiones enormes.
- **`slice` fuera de rango**: devuelve `[]`, no falla.
- **Paginación por cursor**: la alternativa para listas que cambian o son infinitas.
