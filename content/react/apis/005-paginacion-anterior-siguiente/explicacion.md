## Idea clave

La paginación del lado del servidor tiene dos fuentes de datos: la página que el usuario **pide** (estado local que cambian los botones) y la página que el servidor **entregó** (`pagina` y `totalPaginas` en la respuesta). El efecto depende de la primera; todo lo que se pinta (el texto "Página X de Y" y si un botón se puede usar) sale de la segunda. Y mientras una página viaja, los botones se bloquean.

## Paso a paso

1. **Estado de lo pedido, como objeto.** `const [pedido, setPedido] = useState({ pagina: 1 })`. ¿Por qué un objeto y no un número? Si el cambio a la página 2 falla y el usuario vuelve a hacer clic en Siguiente, pides otra vez el 2. Con un número, `setPagina(2)` cuando ya vale 2 no cambia nada y el efecto no corre: el botón queda muerto. Un objeto nuevo siempre es distinto para React (compara por referencia), así que cada clic es una petición nueva.
2. **Estado de lo recibido.** `respuesta` (el cuerpo completo), `cargando` y `error`, por separado: así puedes estar "cargando la página 3" y seguir mostrando la página 2.
3. **Efecto con `[pedido]`.** Cada clic pide `?pagina=${pedido.pagina}&limite=10`. La bandera `ignorar` protege contra respuestas que lleguen fuera de orden.
4. **No borres la respuesta anterior** al empezar a cargar. La lista no "salta" a vacío y vuelve; solo aparece un "Cargando página..." pequeño.
5. **Render por partes.** Si todavía no hay `respuesta`: cargando o error de la primera carga. Si `total` es 0: "No hay productos". Si no, lista y navegación.
6. **`disabled` calculado.** `cargando || respuesta.pagina <= 1` para Anterior, `cargando || respuesta.pagina >= respuesta.totalPaginas` para Siguiente.
7. **Los botones parten de la respuesta.** `setPedido({ pagina: respuesta.pagina + 1 })`: si el servidor corrigió la página (pediste la 99 y te dio la 4), sigues desde la real.

```jsx
const esPrimera = respuesta.pagina <= 1;
const esUltima = respuesta.pagina >= respuesta.totalPaginas;

<button onClick={() => setPedido({ pagina: respuesta.pagina - 1 })} disabled={cargando || esPrimera}>Anterior</button>
<span>Página {respuesta.pagina} de {respuesta.totalPaginas}</span>
<button onClick={() => setPedido({ pagina: respuesta.pagina + 1 })} disabled={cargando || esUltima}>Siguiente</button>
```

## Por qué funciona

Con 40 productos y `limite=10`:

| Momento | `pedido.pagina` | `respuesta.pagina` | `cargando` | Anterior | Siguiente |
|---|---|---|---|---|---|
| monta | 1 | (nada) | `true` | | |
| llega la 1 | 1 | 1 | `false` | deshabilitado | activo |
| clic Siguiente | 2 | 1 | `true` | deshabilitado | deshabilitado |
| llega la 2 | 2 | 2 | `false` | activo | activo |
| ... llega la 4 | 4 | 4 | `false` | activo | deshabilitado |

Y si el cambio a la página 2 falla, `respuesta` sigue siendo la página 1 (la lista no desaparece), se muestra la alerta y Siguiente vuelve a crear `{ pagina: 2 }`: un objeto nuevo, así que el efecto corre otra vez.

Deshabilitar durante la carga no es solo estética: si el usuario pudiera hacer clic dos veces rápido, el segundo clic calcularía `respuesta.pagina + 1` con la respuesta vieja y pediría otra vez la misma página. Bloquear mientras carga elimina ese caso de raíz.

## Errores comunes

- **Guardar la página pedida como número y reintentar el mismo número.** Después de un error, `setPagina(2)` cuando ya vale 2 no dispara nada: el botón parece roto. Un objeto nuevo (o un contador de intentos aparte) lo resuelve.
- **Usar la página pedida para el texto y los `disabled`.** Si el servidor corrige la página (la 99 no existe), tu pantalla dice "Página 99 de 4" y Siguiente sigue activo.
- **Calcular `totalPaginas` en el cliente con `datos.length`.** Con `datos` solo tienes la página actual; el total viene en la respuesta.
- **No deshabilitar durante la carga.** Clics rápidos lanzan varias peticiones y pueden llegar desordenadas.
- **Vaciar la lista en cada cambio de página.** La pantalla parpadea y el scroll salta arriba.
- **Olvidar el caso de una sola página o de cero resultados**: botones activos que piden páginas que no existen.
- **Armar la URL a mano con valores del usuario** sin codificar (si luego agregas `q`): usa `URLSearchParams`.

## Otra forma de resolverlo

Guardar la página en la URL del navegador (`?pagina=2`), para que el usuario pueda recargar o compartir el enlace y caer en la misma página. Con React Router:

```jsx
const [params, setParams] = useSearchParams();
const pagina = Number(params.get("pagina")) || 1;

// El efecto depende de `pagina`, que ahora sale de la URL.
<button onClick={() => setParams({ pagina: String(respuesta.pagina + 1) })}>Siguiente</button>
```

Y para armar la petición sin errores de codificación:

```js
const query = new URLSearchParams({ pagina: String(pagina), limite: "10" });
fetch(`/api/practica/productos?${query}`);
```

**¿Cuándo conviene?** En cualquier listado real: el estado en la URL sobrevive a recargas y al botón Atrás. Otra variante es el **scroll infinito** ("Cargar más"), donde concatenas `datos` en vez de reemplazarlos; es mejor para feeds, peor para tablas donde el usuario quiere ir a la página 7.

## Cómo explicarlo en la entrevista

> "La paginación es del lado del servidor: guardo en el estado la página que el usuario pide, como objeto para que reintentar la misma página también dispare el efecto, y ese efecto hace el `fetch` con `pagina` y `limite`. Para mostrar 'Página X de Y' y habilitar los botones uso lo que devuelve el servidor, porque es la fuente de verdad: si pido una página que no existe, me corrige. Mientras carga deshabilito los dos botones para evitar peticiones duplicadas, y dejo la lista anterior a la vista para que no parpadee. En un proyecto real pondría la página en la URL para que se pueda compartir."

## Conceptos

- **Paginación del lado del servidor**: `?pagina=` y `?limite=`, respuesta con `totalPaginas` y `total`.
- **Estado pedido vs. estado recibido**: el efecto usa uno, el render el otro.
- **Comparación por referencia**: un objeto nuevo siempre cuenta como cambio en las dependencias.
- **Atributo `disabled`** calculado a partir del estado.
- **Bloquear acciones durante la carga** para evitar peticiones duplicadas.
- **Mantener los datos anteriores** mientras llegan los nuevos (evita parpadeos).
- **`URLSearchParams`**: armar query strings sin errores.
- **Paginación en la URL** (`useSearchParams`) y **scroll infinito** como alternativas.
