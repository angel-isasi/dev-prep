Haz que un componente pesado (un mapa de locales) **no se descargue al abrir la página**, sino solo cuando el usuario lo pide. Mientras llega, muestra un mensaje de carga. Para eso usa `lazy` y `Suspense`.

Exporta dos cosas:

- `Mapa`: el componente del mapa, **creado con `lazy`**. En `inicio.jsx` ya tienes `MapaDeLocales` y la función `descargarMapa()`, que simula la descarga de un archivo aparte (espera 200 ms y entrega `{ default: MapaDeLocales }`).
- `Locales()`: la sección que usa el mapa.

## Reglas

- `Mapa = lazy(descargarMapa)`, creado **fuera** de cualquier componente.
- `Locales` muestra un botón **"Ver mapa"**.
- Al inicio **no** se muestra ni el mapa ni el mensaje de carga (el mapa ni siquiera se empieza a descargar).
- Al pulsar "Ver mapa":
  - Mientras se descarga: **"Cargando mapa…"** (con el carácter de puntos suspensivos `…`), usando `<Suspense fallback={...}>`.
  - Cuando llega: **"Mapa de locales"**, y el mensaje de carga desaparece.
- Una vez descargado, si se vuelve a mostrar, aparece al instante (React ya lo tiene guardado).

## Ejemplo

```jsx
<Locales />
```

| Momento | Se ve |
|---|---|
| (inicio) | botón "Ver mapa" |
| Clic en "Ver mapa" | botón + "Cargando mapa…" |
| 200 ms después | botón + "Mapa de locales" |

## Por qué importa

En una app grande, mandar todo el código en un solo archivo hace que la primera carga sea lenta. **Dividir el código** (*code splitting*) y cargar partes bajo demanda es una de las optimizaciones más pedidas, y `lazy` + `Suspense` es la forma integrada de React.
