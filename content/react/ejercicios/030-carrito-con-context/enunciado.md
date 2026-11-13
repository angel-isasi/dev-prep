Comparte un carrito de compras entre componentes que **no son padre e hijo directos**, usando **Context** en lugar de pasar props por cada nivel.

Exporta tres componentes:

- `CarritoProvider({ children })`: guarda el carrito (una lista de nombres de pizzas) y lo comparte con todo lo que tenga adentro.
- `Encabezado()`: muestra cuántos items hay.
- `BotonPizza({ nombre })`: un botón que agrega esa pizza al carrito.

## Reglas

- `Encabezado` pinta un `<p>` con el texto **"Carrito: N"**, donde N es la cantidad de items (al inicio **"Carrito: 0"**).
- `BotonPizza` pinta un `<button>` con el texto **"Pedir "** + nombre, por ejemplo **"Pedir Hawaiana"**. Al hacer clic agrega ese nombre al carrito.
- `Encabezado` y `BotonPizza` **no reciben el carrito por props**: lo leen del contexto. Deben funcionar aunque estén anidados a cualquier profundidad dentro del provider.
- Cada `CarritoProvider` tiene **su propio** carrito: dos providers no se mezclan.

## Ejemplo

```jsx
<CarritoProvider>
  <Encabezado />
  <main>
    <section>
      <BotonPizza nombre="Hawaiana" />
      <BotonPizza nombre="Americana" />
    </section>
  </main>
</CarritoProvider>
```

| Acción | Se ve en el encabezado |
|---|---|
| (inicio) | Carrito: 0 |
| Clic en "Pedir Hawaiana" | Carrito: 1 |
| Clic en "Pedir Americana" | Carrito: 2 |
| Clic en "Pedir Hawaiana" otra vez | Carrito: 3 |

## Por qué importa

El **prop drilling** (pasar una prop por cinco componentes que no la usan solo para que llegue al sexto) es un problema que todo entrevistador conoce. Context es la solución integrada de React, y saber cuándo usarlo (y cuándo no) es pregunta casi segura.
