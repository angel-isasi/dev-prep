Crea un modal que se dibuje **fuera** del contenedor de la página usando un **portal** (`createPortal`), aunque en el código de React siga siendo hijo de la página.

Exporta dos componentes:

- `Modal({ children, onCerrar })`: la ventana del modal.
- `Pagina()`: una página con un botón que abre el modal.

## Reglas

- `Modal`:
  - Se dibuja con `createPortal(..., document.body)`: su `<div>` queda como **hijo directo de `<body>`**.
  - Ese `<div>` tiene `role="dialog"` y `aria-modal="true"`.
  - Adentro muestra `children` y un botón **"Cerrar"** que llama a `onCerrar`.
- `Pagina`:
  - Su contenedor es un `<div id="pagina">`.
  - Tiene un botón **"Ver pedido"** que abre el modal.
  - El modal muestra el texto **"Tu pedido"** y, al cerrarlo, desaparece del documento.
  - Al inicio el modal **no existe** en el DOM.

## Ejemplo

```jsx
<Pagina />
```

El HTML queda así cuando el modal está abierto:

```html
<body>
  <div>                                   <!-- donde se montó la app -->
    <div id="pagina"><button>Ver pedido</button></div>
  </div>
  <div role="dialog" aria-modal="true">   <!-- el portal: fuera de #pagina -->
    <p>Tu pedido</p><button>Cerrar</button>
  </div>
</body>
```

| Acción | Se ve |
|---|---|
| (inicio) | botón "Ver pedido", sin diálogo |
| Clic en "Ver pedido" | diálogo con "Tu pedido" y "Cerrar", colgado de `<body>` |
| Clic en "Cerrar" | el diálogo desaparece |

## Por qué importa

Un modal dibujado dentro de un contenedor con `overflow: hidden` o `z-index` bajo queda **cortado o tapado**. Los portales resuelven eso y son pregunta típica de nivel intermedio: "¿qué es un portal y para qué sirve?".
