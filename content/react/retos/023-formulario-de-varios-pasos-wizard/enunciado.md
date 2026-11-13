Crea el componente `Wizard`, un formulario de **3 pasos** que pide el nombre, luego la escuela y al final muestra un resumen para confirmar. Recibe la prop `onFinalizar`, una función que se llama con los datos al enviar.

## Reglas

- Arriba se ve el texto **"Paso N de 3"** (por ejemplo, `Paso 1 de 3`).
- **Paso 1:** un input con la etiqueta **"Nombre"**.
- **Paso 2:** un input con la etiqueta **"Escuela"**.
- **Paso 3:** un párrafo con el texto exacto **"Confirma: nombre, escuela"** (por ejemplo, `Confirma: Angel, Sistemas`).
- Botón **"Siguiente"** en los pasos 1 y 2. En el paso 3 ese botón dice **"Enviar"** y llama a `onFinalizar({ nombre, escuela })`.
- Botón **"Atrás"** en los pasos 2 y 3 (en el paso 1 no aparece).
- Al volver atrás **no se pierde** lo que ya se escribió.

## Ejemplo

```jsx
<Wizard onFinalizar={(datos) => console.log(datos)} />
```

| Acción | Se ve |
|---|---|
| (inicio) | Paso 1 de 3, input Nombre, botón Siguiente |
| Escribe "Angel" y Siguiente | Paso 2 de 3, input Escuela, botones Atrás y Siguiente |
| Escribe "Sistemas" y Atrás | Paso 1 de 3, el input Nombre todavía dice "Angel" |
| Siguiente, Siguiente | Paso 3 de 3, "Confirma: Angel, Sistemas", botón Enviar |
| Enviar | se llama `onFinalizar({ nombre: "Angel", escuela: "Sistemas" })` |

## Por qué importa

Los registros, checkouts y encuestas suelen ir por pasos. La trampa clásica es guardar cada campo dentro de su paso: al cambiar de paso el input se desmonta y los datos se pierden. Evalúan si sabes **dónde** debe vivir el estado.
