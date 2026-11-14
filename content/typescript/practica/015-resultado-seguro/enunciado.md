Muchas operaciones pueden fallar: leer un JSON guardado en `localStorage`, dividir con un divisor que escribió el usuario. En vez de lanzar errores que alguien olvida atrapar, puedes **devolver** el éxito o el error en un solo tipo:

```ts
type Resultado<T> =
  | { ok: true; valor: T }
  | { ok: false; error: string };
```

Es una **unión discriminada**: la propiedad `ok` dice en cuál de los dos casos estás, y TypeScript solo te deja leer `valor` cuando comprobaste que `ok` es `true`.

Escribe:

1. El tipo genérico `Resultado<T>` (exactamente como arriba).
2. `dividir(a, b)`: devuelve `Resultado<number>`. Si `b` es `0`, el error es `"No se puede dividir entre cero"`.
3. `parsearJSON(texto)`: devuelve `Resultado<unknown>`. Si `JSON.parse` lanza un error, devuelve `{ ok: false, error: "JSON inválido" }`.
4. `valorO(resultado, porDefecto)`: genérica. Devuelve el `valor` si el resultado salió bien, o `porDefecto` si falló. Su tipo de retorno es `T`.

## Reglas

- `dividir` y `parsearJSON` **nunca** lanzan errores: siempre devuelven un `Resultado`.
- En `valorO`, `porDefecto` debe ser del mismo tipo que el valor: `valorO(dividir(1, 2), "cero")` es un error de tipos.

## Ejemplos

```ts
dividir(10, 2);               // { ok: true, valor: 5 }
dividir(1, 0);                // { ok: false, error: "No se puede dividir entre cero" }
parsearJSON('{"tema":"oscuro"}'); // { ok: true, valor: { tema: "oscuro" } }
parsearJSON("{malo");         // { ok: false, error: "JSON inválido" }

valorO(dividir(10, 2), 0);    // 5
valorO(dividir(1, 0), 0);     // 0

const r = dividir(6, 3);
r.valor;                      // error de tipos: primero comprueba r.ok
if (r.ok) r.valor;            // number
```
