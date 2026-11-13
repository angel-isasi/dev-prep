Crea el formulario para pedir una pizza por delivery. Exporta dos piezas:

- `validarPedido({ nombre, telefono })`: función **pura** que devuelve un objeto de errores. Si todo está bien, devuelve `{}`.
- `FormularioPedido()`: el componente con los campos, los mensajes de error y el resumen final.

## Reglas

**`validarPedido`**:

- Si el nombre, sin espacios a los lados, tiene menos de 3 letras: `errores.nombre = "Escribe tu nombre completo"`.
- Si el celular, quitando los espacios, no son 9 dígitos que empiezan con 9: `errores.telefono = "El celular debe tener 9 dígitos y empezar con 9"`. `"987 654 321"` es válido.
- Un campo sin error **no aparece** en el objeto.

**`FormularioPedido`**:

- Tres campos con su `<label>`: **"Nombre"** (input), **"Celular"** (input) y **"Tamaño"** (`<select>` con las opciones `M` "Mediana" y `L` "Familiar"; por defecto `M`).
- Un botón **"Hacer pedido"** que envía el formulario.
- Al enviar se valida **todo**. Cada error se muestra debajo de su campo en un elemento con `role="alert"`, y el input con error lleva `aria-invalid="true"`.
- Si no hay errores, el formulario se reemplaza por el resumen:
  **"Listo, {nombre}. Tu pizza {tamaño} está en camino y te llamaremos al {celular}."** (el nombre sin espacios a los lados).

## Ejemplo

| El usuario hace | Se ve |
|---|---|
| Clic en "Hacer pedido" con todo vacío | 2 mensajes de error |
| Escribe "Angel Isasi" y vuelve a enviar | Solo queda el error del celular |
| Celular `987654321`, Tamaño Familiar, envía | Listo, Angel Isasi. Tu pizza L está en camino y te llamaremos al 987654321. |

```js
validarPedido({ nombre: "Al", telefono: "123" });
// { nombre: "Escribe tu nombre completo", telefono: "El celular debe tener 9 dígitos y empezar con 9" }
```

## Por qué importa

Los formularios con validación son el pan de cada día en frontend. En la entrevista se fijan en tres cosas: que la validación esté **separada** del componente (para probarla y reutilizarla), que los errores sean **accesibles** (`role="alert"`, `aria-invalid`, labels) y que manejes bien el envío con `preventDefault`.
