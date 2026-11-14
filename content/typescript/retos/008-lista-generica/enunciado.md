Crea el componente **genérico** `Lista<T>`: una lista reutilizable que sirve para productos, usuarios, textos o lo que sea. El componente no sabe qué hay en cada elemento: quien lo usa le dice cómo pintarlo (`renderItem`) y cómo sacar su clave única (`obtenerClave`).

Lo importante es el tipo: `T` se **infiere** de `items`. Si le pasas `Producto[]`, dentro de `renderItem` el parámetro ya es un `Producto`, con autocompletado y sin anotarlo.

## Reglas

- Exporta `ListaProps<T>` y `Lista<T>`.
- Props:
  - `items: T[]`: los elementos.
  - `renderItem: (item: T, indice: number) => ReactNode`: qué pintar dentro de cada `<li>`.
  - `obtenerClave: (item: T) => string | number`: la `key` de cada `<li>`.
  - `vacio` (opcional, `ReactNode`): qué mostrar si no hay elementos. Por defecto `"No hay elementos"`.
- Con elementos: un `<ul>` con un `<li key={obtenerClave(item)}>` por elemento, y dentro lo que devuelva `renderItem(item, indice)`.
- Sin elementos: solo un `<p>` con `vacio` (sin `<ul>`).
- Sin `any`: TypeScript debe marcar error si en `renderItem` usas una propiedad que no existe, o si `obtenerClave` no devuelve `string` o `number`.

## Ejemplos

```tsx
type Producto = { id: number; nombre: string; precio: number };

<Lista
  items={productos}
  obtenerClave={(p) => p.id}
  renderItem={(p, i) => `${i + 1}. ${p.nombre}: S/ ${p.precio}`}
/>
// <ul>
//   <li>1. Teclado: S/ 120</li>
//   <li>2. Mouse: S/ 45</li>
// </ul>

<Lista items={["rojo", "verde"]} obtenerClave={(c) => c} renderItem={(c) => <strong>{c}</strong>} />

<Lista items={[]} obtenerClave={...} renderItem={...} vacio="Tu carrito está vacío" />
// <p>Tu carrito está vacío</p>

<Lista items={productos} obtenerClave={(p) => p.id} renderItem={(p) => p.titulo} />
// Error de TypeScript: Producto no tiene "titulo"
```

## Por qué importa

Tablas, selects, listas con buscador: casi todos los componentes de una librería de UI son genéricos. Saber escribir uno muestra que entiendes los genéricos de TypeScript dentro de React, que es justo lo que cuesta al principio. Además usa el patrón **render prop** (`renderItem`), que separa "cómo se recorre" de "cómo se ve cada elemento", y repasa por qué cada `<li>` necesita una `key` estable.
