Crea el componente `CargarMas` que muestra una lista que se va llenando por páginas. Recibe en la prop `obtenerPagina` una función **asíncrona**: `obtenerPagina(numero)` devuelve una promesa con `{ datos, siguiente }`, donde `datos` es un arreglo de textos y `siguiente` es `true` si hay otra página después.

## Reglas

- Al montarse, pide la **página 1** y muestra sus datos en una `<ul>`, un `<li>` por texto.
- Un botón **"Cargar más"** pide la página siguiente (2, 3...) y **agrega** sus datos al final de la lista, sin borrar los anteriores.
- Mientras una página se está cargando, el botón dice **"Cargando…"** (con el carácter `…`) y está **deshabilitado**, para evitar pedir la misma página dos veces.
- Cuando una página responde con `siguiente: false`, el botón **desaparece**.

## Ejemplo

```jsx
const paginas = {
  1: { datos: ["n1", "n2"], siguiente: true },
  2: { datos: ["n3"], siguiente: false },
};

<CargarMas obtenerPagina={async (numero) => paginas[numero]} />
```

| Momento | Lista | Botón |
|---|---|---|
| recién montado (pidiendo la 1) | (vacía) | Cargando… (deshabilitado) |
| llegó la página 1 | n1, n2 | Cargar más |
| clic, pidiendo la 2 | n1, n2 | Cargando… (deshabilitado) |
| llegó la página 2 (`siguiente: false`) | n1, n2, n3 | (no hay botón) |

## Por qué importa

"Cargar más" (o el scroll infinito) aparece en casi todos los feeds. Evalúa trabajar con datos **asíncronos**, acumular resultados sin mutar el estado y manejar el estado de carga para no duplicar peticiones.
