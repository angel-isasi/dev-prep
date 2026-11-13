Completa el objeto `usuario` y la constante `saludoLigado` para practicar cómo se decide el valor de `this`.

- `usuario` tiene la propiedad `nombre: "Angel"` y dos métodos:
  - `saludar()`: devuelve `` `Hola, soy ${nombre}` `` leyendo el nombre con `this`.
  - `saludarLuego()`: devuelve una promesa que, **100 ms después** (con `setTimeout`), se cumple con el nombre leído con `this`.
- `saludoLigado`: una función **suelta** que, al llamarla así, `saludoLigado()`, devuelve `"Hola, soy Angel"`. Créala a partir de `usuario.saludar`.

## Reglas

- No escribas `"Angel"` dentro de los métodos: usa `this.nombre`. Los tests copian los métodos a otros objetos para comprobarlo.
- `saludar` y `saludarLuego` deben ser métodos normales, no funciones flecha.
- `saludoLigado` debe seguir saludando como Angel aunque la pongas dentro de otro objeto.

## Ejemplos

```js
usuario.saludar();               // "Hola, soy Angel"
await usuario.saludarLuego();    // "Angel" (después de 100 ms)

const rosa = { nombre: "Rosa", saludar: usuario.saludar };
rosa.saludar();                  // "Hola, soy Rosa": this es quien llama

const suelta = usuario.saludar;
suelta();                        // TypeError: this es undefined

saludoLigado();                  // "Hola, soy Angel"
```

## Por qué importa

`this` es una de las fuentes de errores más comunes en JavaScript: un método que funciona en un lado y "pierde" su objeto al pasarlo como callback a un evento o a un `setTimeout`. En entrevistas te preguntan cuánto vale `this` en cada caso y cuál es la diferencia entre una función normal y una flecha.
