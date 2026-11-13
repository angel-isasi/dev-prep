Crea el componente `Estrellas` para calificar con estrellas. Recibe en la prop `total` cuántas estrellas mostrar (por defecto `5`) y en la prop opcional `onCambio` una función a la que avisas el valor elegido.

## Reglas

- Un contenedor con `role="radiogroup"` y `aria-label="Calificación"`.
- Un `<button>` por estrella, con `role="radio"`.
- Cada botón tiene `aria-label` **"1 estrella"**, **"2 estrellas"**, **"3 estrellas"**... (singular solo para 1).
- El texto de cada botón es **`★`** (llena) o **`☆`** (vacía). Al inicio todas están vacías.
- Al hacer **clic** en la estrella N: se llenan de la 1 a la N, esa estrella queda con `aria-checked="true"` y se llama a `onCambio(N)` (si existe).
- Al pasar el **mouse** por encima de la estrella N (`mouseenter`) se **previsualiza**: se llenan de la 1 a la N. Al sacar el mouse (`mouseleave`), se vuelve a ver el valor elegido.

## Ejemplo

```jsx
<Estrellas onCambio={(valor) => console.log(valor)} />
```

| Acción | Se ve | `onCambio` |
|---|---|---|
| (al inicio) | ☆☆☆☆☆ | |
| clic en "4 estrellas" | ★★★★☆ | `onCambio(4)` |
| mouse sobre "2 estrellas" | ★★☆☆☆ | |
| el mouse sale | ★★★★☆ | |

## Por qué importa

Es un componente pequeño pero completo: dos estados relacionados (el elegido y el que está bajo el mouse), **comunicar un valor al padre con un callback** y accesibilidad con roles. Aparece mucho en pruebas para casa.
