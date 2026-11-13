Esta vez **no programas un componente: escribes su prueba**. Te damos el componente `Boletin` (un formulario para suscribirse con el correo) y tú completas la función `probarBoletin(Boletin)` con una prueba que verifique que:

1. Si el correo es inválido (no tiene `@`), **muestra el error** y **no envía**.
2. Si el correo es válido, **envía** el correo a `onSuscribir` y **ya no muestra** el error.

```jsx
// El componente que vas a probar (no lo modificas).
function Boletin({ onSuscribir }) {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  function enviar(e) {
    e.preventDefault();
    if (!correo.includes("@")) return setError("Ingresa un correo válido");
    setError("");
    onSuscribir(correo);
  }
  return (
    <form onSubmit={enviar}>
      <label>Correo <input value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button>Suscribirme</button>
    </form>
  );
}
```

## Reglas

- Exporta `async function probarBoletin(Boletin)`. Recibe el componente como parámetro: **renderiza ese**, no uno tuyo.
- Dentro usa `render`, `screen`, `userEvent`, `vi.fn()` y `expect`. Si el componente se porta mal, algún `expect` debe fallar (un `expect` que falla **lanza un error**).
- Pasa a `Boletin` una función espía en la prop `onSuscribir` para saber si se llamó y con qué.
- Busca los elementos como los ve el usuario: el campo por su etiqueta **"Correo"**, el botón por su rol y nombre **"Suscribirme"**, el error por su rol **`alert`** con el texto **"Ingresa un correo válido"**.
- La app corre tu prueba **5 veces**: contra el `Boletin` correcto (no debe fallar) y contra 4 versiones con errores escondidos (debe fallar en cada una).

## Ejemplo

| Tu prueba hace | Lo que debe comprobar |
|---|---|
| Escribe `angel` y pulsa "Suscribirme" | Aparece el alert "Ingresa un correo válido" y `onSuscribir` **no** se llamó |
| Completa `@unica.edu.pe` y pulsa otra vez | `onSuscribir` se llamó con `"angel@unica.edu.pe"` y el alert desapareció |

| Versión del Boletin | Tu prueba debe... |
|---|---|
| Correcta | pasar |
| No muestra el mensaje de error | fallar |
| Envía aunque el correo sea inválido | fallar |
| No envía un correo válido | fallar |
| Deja el error visible después de corregir | fallar |

## Por qué importa

En muchas entrevistas y en casi todo trabajo real te piden **escribir pruebas**, no solo código. Aquí practicas lo esencial de Testing Library: probar lo que ve y hace el usuario (etiquetas, roles, clics), no los detalles internos. Y aprendes la pregunta clave: "¿mi prueba fallaría si el código estuviera mal?".
