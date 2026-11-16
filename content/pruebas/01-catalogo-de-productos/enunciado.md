# Catálogo de productos con búsqueda y filtros

## Contexto

**Qhatu** es una startup de Lima que lleva el inventario de las bodegas del barrio a una tienda en línea: el vecino entra, busca lo que necesita y la bodega más cercana se lo envía. El equipo de frontend está armando la nueva versión del catálogo y necesita un desarrollador junior que pueda tomar pantallas como esta de punta a punta.

Esta prueba es una versión reducida de una tarea real del equipo. El backend todavía no está listo, así que tienes una **API falsa** en `src/api.js`: `fetchProducts()` devuelve una promesa que tarda medio segundo y **falla a propósito una de cada cinco veces**, igual que una red móvil de verdad.

Tiempo estimado: **3 horas**. No hace falta que se vea como un producto terminado: preferimos algo simple, correcto y bien explicado.

## Requisitos

- [ ] Al abrir la página se piden los productos con `fetchProducts()` **una sola vez**.
- [ ] Mientras llegan, se ve el texto `Cargando productos...`.
- [ ] Si la petición falla, se ve un mensaje con `role="alert"` que dice `No pudimos cargar los productos.` y un botón **Reintentar** que vuelve a pedirlos (y muestra otra vez el estado de carga).
- [ ] Los productos se muestran en una lista con nombre accesible `Productos` (`<ul aria-label="Productos">`). Cada producto es un `<li>` con su nombre en un título `<h3>`, su categoría y su precio con el formato `S/ 24.90`.
- [ ] Un campo de búsqueda (`type="search"`) con la etiqueta **Buscar productos** filtra por nombre mientras escribes, **sin importar mayúsculas ni tildes** (`cafe` encuentra `Café tostado 250 g`).
- [ ] Un `<select>` con la etiqueta **Categoría** tiene la opción `Todas` y luego las categorías que existen en los datos, en orden alfabético y sin repetir. No las escribas a mano: salen de los productos.
- [ ] Un `<select>` con la etiqueta **Ordenar por** tiene las opciones `Relevancia` (el orden en que llegan de la API), `Precio: menor a mayor` y `Precio: mayor a menor`.
- [ ] Búsqueda, categoría y orden **se combinan**.
- [ ] Se ve cuántos productos hay en pantalla: `Mostrando 2 de 6 productos`.
- [ ] Si ningún producto coincide, no se muestra la lista sino el texto `No encontramos productos que coincidan con tu búsqueda.` y un botón **Limpiar filtros** que deja todo como al inicio.

## Lo que se valora

- Que los tests de `tests/` pasen y que la app funcione de verdad en el navegador.
- Manejo correcto de los tres estados de una petición: cargando, error y éxito.
- **Estado derivado**: la lista filtrada y ordenada se calcula a partir de los productos y los filtros; no se guarda una copia en otro `useState`.
- No mutar los datos (cuidado: `sort()` modifica el arreglo original).
- Componentes con una sola responsabilidad y lógica pura separada de la interfaz, fácil de probar.
- Accesibilidad: cada control con su etiqueta, mensajes de error anunciados.
- Un README que explique cómo correrlo y qué decisiones tomaste.

## Entrega

1. Completa los archivos con `// TODO` de `src/` (puedes crear más archivos si los necesitas).
2. Verifica que pasan todos los tests de `tests/catalogo.test.jsx`.
3. Actualiza el `README.md` con: cómo correr el proyecto, decisiones que tomaste y qué mejorarías con más tiempo.
4. En una entrevista real lo subirías a un repositorio público de GitHub y enviarías el enlace. Prepárate para explicar tu código en 5 minutos.
