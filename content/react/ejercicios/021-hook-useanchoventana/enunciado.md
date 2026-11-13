Crea el **hook propio** `useAnchoVentana()`, que devuelve el ancho actual de la ventana del navegador en píxeles (`window.innerWidth`) y **se actualiza solo** cuando el usuario cambia el tamaño de la ventana.

Un hook propio es una función cuyo nombre empieza con `use` y que usa otros hooks (`useState`, `useEffect`...) por dentro. No devuelve JSX: devuelve datos que un componente puede usar.

## Reglas

- Exporta la función `useAnchoVentana()`. No recibe parámetros.
- Devuelve un **número**: al inicio, el valor de `window.innerWidth`.
- Cada vez que la ventana dispara el evento `"resize"`, el hook devuelve el nuevo `window.innerWidth`.
- Cuando el componente que lo usa se desmonta, **quita el listener** de `"resize"` que agregó (el mismo, no otro).

## Ejemplo

```jsx
function Menu() {
  const ancho = useAnchoVentana();
  return ancho < 600 ? <MenuMovil /> : <MenuEscritorio />;
}
```

| Acción | `useAnchoVentana()` devuelve |
|---|---|
| Al montar con la ventana de 1024 px | `1024` |
| El usuario achica la ventana a 500 px | `500` |
| El componente se desmonta | (ya no escucha `"resize"`) |

## Por qué importa

Suscribirse a un evento del navegador y **limpiar al desmontar** es el patrón clásico de `useEffect`. Si no limpias, dejas listeners vivos que gastan memoria e intentan actualizar componentes que ya no existen. Y empaquetarlo en un hook propio muestra que sabes reutilizar lógica.
