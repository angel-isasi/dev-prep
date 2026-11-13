Escribe dos funciones de formato para una tienda peruana, usando la API `Intl` que trae JavaScript:

- `soles(monto)`: recibe un número y devuelve el texto en soles, con el formato de Perú: símbolo `S/`, comas para los miles, punto decimal y siempre 2 decimales.
- `fechaLarga(iso)`: recibe una fecha en texto ISO (como `"2026-11-17T12:00:00-05:00"`) y devuelve la fecha larga en español: `"17 de noviembre de 2026"`, **según la hora de Lima**.

## Reglas

- Usa el locale (idioma y país) `"es-PE"` en las dos.
- `soles` usa la moneda `"PEN"` y muestra siempre 2 decimales, aunque el número sea entero.
- `fechaLarga` debe usar la zona horaria `"America/Lima"`, sin importar en qué zona esté la computadora. Una fecha que en Londres ya es el 18, en Lima todavía puede ser el 17.
- El formato de la fecha es: día sin cero adelante, mes con su nombre completo en minúsculas y año con 4 cifras.
- No armes los textos a mano: usa `Intl.NumberFormat` e `Intl.DateTimeFormat`.

## Ejemplos

```js
soles(1234.5);       // "S/ 1,234.50"
soles(5);            // "S/ 5.00"
soles(1000000);      // "S/ 1,000,000.00"

fechaLarga("2026-11-17T12:00:00-05:00");   // "17 de noviembre de 2026"
fechaLarga("2026-11-18T03:00:00Z");        // "17 de noviembre de 2026" (en Lima son las 10 p. m. del 17)
fechaLarga("2027-03-01T12:00:00-05:00");   // "1 de marzo de 2027"
```

El espacio entre `S/` y el número puede ser un espacio "duro" (no separable), que se ve igual que uno normal.

## Por qué importa

Mostrar precios y fechas es parte de casi cualquier pantalla. Armarlos a mano con `toFixed` y arreglos de nombres de meses es frágil y no respeta las reglas de cada país. `Intl` lo resuelve en una línea. Y el detalle de la zona horaria es un error real muy común: una fecha que se muestra un día antes o después según dónde esté el servidor o el usuario.
