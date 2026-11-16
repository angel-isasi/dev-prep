# Qhatu: catálogo de productos

Prueba técnica para el puesto de **Desarrollador Frontend Junior**. Tiempo estimado: 3 horas.

Lee primero el enunciado completo (requisitos y lo que se valora). Este README es tu punto de partida: al terminar, reemplaza la sección "Mis decisiones" con lo tuyo.

## Cómo correrlo

El proyecto usa las dependencias de dev-prep (React 19, Vite, Vitest y Testing Library), así que no hace falta `npm install`.

Desde esta carpeta, en una terminal:

```bash
npx vitest        # corre los tests y los repite cada vez que guardas
npx vite          # levanta la app en http://localhost:5173
```

## Qué hay en la carpeta

```
src/
  api.js                  API falsa: fetchProducts() tarda 500 ms y falla 1 de cada 5 veces (no la modifiques)
  App.jsx                 pantalla principal (TODO)
  hooks/useProducts.js    petición y estados de carga y error (TODO)
  lib/catalog.js          funciones puras: formato, filtros y orden (TODO)
  components/Filters.jsx  búsqueda, categoría y orden (TODO)
  components/ProductList.jsx  lista de productos (TODO)
  main.jsx, styles.css    arranque y estilos base
tests/
  catalogo.test.jsx       tests de aceptación: tu entrega debe pasarlos todos
```

Puedes crear más archivos o cambiar la estructura si lo justificas. Lo único fijo es lo que piden los tests: los textos, las etiquetas y los roles.

## Sugerencia de orden

1. `lib/catalog.js`: son funciones puras, las más fáciles de razonar.
2. `hooks/useProducts.js` y los estados de carga y error en `App.jsx`.
3. `ProductList.jsx`.
4. `Filters.jsx` y la lista visible (estado derivado) en `App.jsx`.
5. Estilos y este README.

## Mis decisiones

- (Escribe aquí qué decidiste y por qué.)

## Qué mejoraría con más tiempo

- (Escribe aquí.)
