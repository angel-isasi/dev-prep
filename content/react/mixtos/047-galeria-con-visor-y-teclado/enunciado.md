Crea el componente `Galeria` que recibe en la prop `fotos` un arreglo de nombres de fotos (textos únicos) y permite verlas en un visor que se maneja con el teclado.

## Reglas

- Por cada foto, un botón con el texto **"Ver {foto}"**.
- Al hacer clic en uno se abre el visor: un elemento con `role="dialog"` y `aria-label="Foto {n} de {total}"` (n empieza en 1). Dentro se ve el nombre de la foto y un botón **"Cerrar"**.
- Con el visor abierto, el teclado funciona en **todo el documento** (escucha `keydown` en `document`):
  - **ArrowRight**: foto siguiente. Después de la última vuelve a la primera.
  - **ArrowLeft**: foto anterior. Antes de la primera va a la última.
  - **Escape**: cierra el visor.
- Con el visor cerrado, las teclas no hacen nada.
- Al cerrar el visor o desmontar el componente se quita el listener del teclado.

## Ejemplo

```jsx
<Galeria fotos={["horno", "masa", "local"]} />
```

| Acción | Visor |
|---|---|
| Clic en "Ver horno" | Foto 1 de 3: horno |
| ArrowLeft | Foto 3 de 3: local (dio la vuelta) |
| ArrowRight | Foto 1 de 3: horno |
| ArrowRight | Foto 2 de 3: masa |
| Escape | (cerrado) |

## Por qué importa

Modales, carruseles y visores con teclado aparecen mucho en entrevistas porque prueban si sabes **suscribirte a eventos globales** con `useEffect` y, sobre todo, **limpiarlos**. Un listener que no se quita es una fuga de memoria y un bug difícil de rastrear. El truco del módulo `%` para "dar la vuelta" también es un clásico.
