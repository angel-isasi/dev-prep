Crea el componente `Precio`, que recibe un número en la prop `monto` y lo muestra como **soles peruanos**: con el símbolo `S/`, separador de miles y siempre 2 decimales.

## Reglas

- Devuelve un `<span>` con el monto formateado.
- Usa **`Intl.NumberFormat`** con el idioma `"es-PE"`, estilo `"currency"` y moneda `"PEN"`. Es la herramienta que trae JavaScript para formatear dinero según el país; no armes el formato a mano.
- Crea el formateador **fuera** del componente, una sola vez.

## Ejemplo

```jsx
<Precio monto={1234.5} />
```

| Prop `monto` | Se ve |
|---|---|
| `1234.5` | S/ 1,234.50 |
| `28` | S/ 28.00 |
| `1000000` | S/ 1,000,000.00 |
| `0` | S/ 0.00 |

## Por qué importa

Mostrar dinero bien formateado aparece en cualquier tienda o panel. Saber que existe `Intl.NumberFormat` (en lugar de concatenar textos y comas a mano) y por qué conviene crear el formateador fuera del componente muestra criterio.
