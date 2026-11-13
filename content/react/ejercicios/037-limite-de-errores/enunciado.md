Crea un **límite de errores** (*error boundary*): un componente que atrapa los errores que lanzan sus hijos al renderizar y, en lugar de dejar la pantalla en blanco, muestra un mensaje.

```jsx
<LimiteDeError>
  <Carta />   {/* si Carta lanza un error, se ve el mensaje en su lugar */}
</LimiteDeError>
```

## Reglas

- Exporta la clase `LimiteDeError`, que extiende `Component` de React. (Es el único caso en que todavía necesitas un componente de clase: no existe un hook para esto.)
- Si sus hijos se renderizan bien, muestra los hijos **tal cual**.
- Si algún hijo lanza un error al renderizar, en vez de los hijos muestra un `<p role="alert">` con el texto **"Algo salió mal. Recarga la página."**.
- Solo reemplaza **su propia zona**: lo que esté fuera del límite sigue visible.

## Ejemplo

```jsx
function Rota() {
  throw new Error("boom");
}

<div>
  <h1>Pizzería</h1>
  <LimiteDeError>
    <Rota />
  </LimiteDeError>
</div>
```

| Hijos del límite | Se ve |
|---|---|
| `<p>Carta del día</p>` | Carta del día |
| `<Rota />` | Pizzería, y debajo: Algo salió mal. Recarga la página. |

Sin el límite, el error de `Rota` desmontaría **toda** la aplicación y el usuario vería una página en blanco.

## Por qué importa

En producción, un solo componente con un bug (un dato `null` inesperado, por ejemplo) puede tumbar toda la app. Los error boundaries son la forma de React de **aislar fallos**, y son pregunta frecuente justamente porque obligan a recordar los componentes de clase.
