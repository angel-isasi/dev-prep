Crea el componente `Buscador`, un campo de búsqueda de pizzas que **recibe el foco automáticamente** cuando aparece en pantalla, para que el usuario pueda escribir sin hacer clic.

## Reglas

- Exporta la función `Buscador()`. No recibe props.
- Pinta un `<input>` con `aria-label="Buscar pizza"`.
- Apenas el componente se monta, el input queda enfocado (es el `document.activeElement`).
- Hazlo con **`useRef`** (para tener el elemento real del DOM) y **`useEffect`** (para enfocarlo después de pintar). No uses `document.querySelector`.
- Enfoca **solo al montar**: si después el usuario se va a otro elemento y el componente se vuelve a renderizar, no le robes el foco.

## Ejemplo

```jsx
<Buscador />
```

| Acción | Resultado |
|---|---|
| El componente aparece | el cursor ya está en "Buscar pizza" |
| El usuario enfoca otro botón y el componente se vuelve a renderizar | el foco se queda en el botón |

## Por qué importa

`useRef` es la puerta de React hacia el DOM real: enfocar un campo, medir un elemento, hacer scroll. Enfocar al montar es el ejemplo más clásico, y te obliga a entender **cuándo** existe el elemento (después del render) y para qué sirven las dependencias `[]`.
