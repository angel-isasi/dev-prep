## El problema

QA reporta un error raro en el panel de administración: "Abro y cierro el modal de **Confirmar** varias veces. Después, apretar **Escape** en cualquier parte de la página dispara 'cerrar' **varias veces** seguidas, aunque el modal ya no esté. A veces cierra otros paneles que no tienen nada que ver".

El compañero que lo hizo responde: "Raro, el `useEffect` tiene su `return` de limpieza".

## Qué debe hacer

`Modal` recibe `titulo`, `onCerrar` y `children`.

- Mientras está en pantalla, la tecla **Escape** llama a `onCerrar` **una vez**. Las demás teclas no hacen nada.
- El botón **Cerrar** también llama a `onCerrar`.
- Cuando el modal se desmonta, Escape ya no llama a nada.
- Si el padre le pasa un `onCerrar` nuevo, Escape llama solo al nuevo.

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
