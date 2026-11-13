## En una frase

Las **props** son los datos que un componente padre le pasa a su hijo, como los argumentos de una función: el hijo las lee, pero **no las cambia**.

## Lo esencial

### Pasar y leer props

```jsx
function Pizza(props) {
  return <h2>{props.nombre}: S/ {props.precio}</h2>;
}

function Menu() {
  return (
    <>
      <Pizza nombre="Margarita" precio={28} />
      <Pizza nombre="Pepperoni" precio={32} />
    </>
  );
}
// Se ve:
// Margarita: S/ 28
// Pepperoni: S/ 32
```

- React junta todos los atributos en **un objeto** (`props`) y se lo pasa a tu función.
- Textos con comillas: `nombre="Margarita"`. Cualquier otra cosa con llaves: `precio={28}`, `activo={true}`, `items={[1, 2]}`, `onClick={fn}`.
- Una prop sin valor vale `true`: `<Boton deshabilitado />` es lo mismo que `deshabilitado={true}`.

### Desestructurar (lo que verás en todo código real)

```jsx
function Pizza({ nombre, precio }) {
  return <h2>{nombre}: S/ {precio}</h2>;
}
```

Es lo mismo que antes, pero sacas las props directo en los parámetros. Ves de un vistazo qué recibe el componente.

### Valores por defecto

```jsx
function Saludo({ nombre = "invitado" }) {
  return <p>Hola, {nombre}</p>;
}

<Saludo />              // Hola, invitado
<Saludo nombre="Ana" /> // Hola, Ana
```

El valor por defecto se usa solo si la prop llega como `undefined` (no la pasaron). Si llega `null` o `""`, **no** se aplica. En React 19 ya no existe `Componente.defaultProps` para componentes de función: se usa esto.

### children: lo que va entre las etiquetas

```jsx
function Tarjeta({ titulo, children }) {
  return (
    <section className="tarjeta">
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

<Tarjeta titulo="Promo">
  <p>2x1 los martes</p>
  <p>Solo en local</p>
</Tarjeta>
// Se ve: Promo / 2x1 los martes / Solo en local  (todo dentro del <section>)
```

`children` es una prop especial: React pone ahí todo lo que escribes entre `<Tarjeta>` y `</Tarjeta>`. Así creas "marcos" reutilizables (tarjetas, modales, layouts) sin saber de antemano qué llevarán adentro. Si el componente no pinta `{children}`, ese contenido simplemente no aparece.

### Pasar funciones: el hijo le avisa al padre

Los datos **bajan** del padre al hijo. Para que el hijo diga "me hicieron clic", el padre le pasa una **función** y el hijo la llama.

```jsx
function BotonAgregar({ pizza, onAgregar }) {
  return <button onClick={() => onAgregar(pizza)}>Agregar {pizza}</button>;
}

function Tienda() {
  function agregar(pizza) {
    alert(`Agregaste ${pizza}`);
  }
  return <BotonAgregar pizza="Hawaiana" onAgregar={agregar} />;
}
// Clic en "Agregar Hawaiana" → alerta "Agregaste Hawaiana"
```

Convención: las props que son funciones de evento empiezan con `on` (`onAgregar`, `onCerrar`) y la función del padre suele llamarse `handle...` o con un verbo (`agregar`).

### Las props son de solo lectura

```jsx
function Precio(props) {
  props.monto = props.monto * 1.18; // ¡No! TypeError en desarrollo
  return <p>{props.monto}</p>;
}
```

El hijo nunca modifica sus props. Si necesitas un valor calculado, crea una variable nueva: `const conIgv = monto * 1.18;`. Si algo debe cambiar con el tiempo, eso es **estado** (siguiente tema), y vive en quien lo controla.

### Flujo de datos en una sola dirección

```
App  (tiene los datos)
 ├─ props ──▶ Lista
 │              └─ props ──▶ Item
 └─ props ──▶ Resumen
```

Los datos van de arriba hacia abajo. Los avisos van de abajo hacia arriba **llamando funciones** que llegaron por props. Así siempre sabes de dónde viene cada dato.

### Pasar el resto con `...rest`

```jsx
function Boton({ variante = "primario", children, ...rest }) {
  return <button className={`boton boton-${variante}`} {...rest}>{children}</button>;
}

<Boton type="submit" disabled>Enviar</Boton>
// <button class="boton boton-primario" type="submit" disabled>Enviar</button>
```

Te quedas con las props que manejas tú y el resto (`onClick`, `disabled`, `aria-label`...) se las pasas tal cual al elemento real.

## Errores típicos

**1. Olvidar desestructurar**

```jsx
function Saludo(nombre) {
  return <p>Hola, {nombre}</p>;
}
<Saludo nombre="Ana" /> // Error: Objects are not valid as a React child
```
El componente recibe **un objeto** `{ nombre: "Ana" }`, no el texto. Escribe `function Saludo({ nombre })`.

**2. Llamar la función en vez de pasarla**

```jsx
<Boton onClick={avisar()} />
```
Con `()` ejecutas `avisar` **durante el render** y pasas lo que devuelve (normalmente `undefined`). Al hacer clic no pasa nada. Pasa la función: `onClick={avisar}`, o si necesitas argumentos, `onClick={() => avisar("Ana")}`.

**3. Modificar una prop**

```jsx
function Item({ cantidad }) {
  cantidad = cantidad + 1;       // reasignar la variable local: no rompe, pero confunde
}
function Item2(props) {
  props.cantidad++;              // TypeError: React congela las props en desarrollo
}
```
Calcula en una variable nueva. Si debe cambiar, que el padre la cambie y la vuelva a pasar.

**4. Esperar que el valor por defecto cubra `null`**

```jsx
function Precio({ monto = 0 }) { return <p>S/ {monto}</p>; }
<Precio monto={null} /> // Se ve "S/ " (sin número): null no activa el valor por defecto
```
El valor por defecto solo cubre `undefined`. Para `null` usa `monto ?? 0`.

**5. Olvidar pintar `{children}`**

```jsx
function Caja({ titulo }) { return <h2>{titulo}</h2>; }
<Caja titulo="Promo"><p>2x1</p></Caja> // Solo se ve "Promo"
```
Si el componente no pone `{children}` en su JSX, lo que escribiste adentro se pierde sin error.

**6. Pasar un número como texto**

```jsx
<Pizza precio="28" />  // precio es el texto "28"
precio + 2             // "282", no 30
```
Con comillas siempre es texto. Para números, booleanos, arreglos u objetos usa llaves: `precio={28}`.

## Chuleta

- `<Hijo dato="texto" numero={5} activo onCambio={fn} />` → `function Hijo({ dato, numero, activo, onCambio })`.
- Valor por defecto: `{ nombre = "invitado" }` (solo cubre `undefined`).
- `children` = lo que va entre `<Hijo>` y `</Hijo>`. Píntalo con `{children}`.
- Funciones como props: `onAlgo={fn}` (sin `()`). Con argumentos: `onClick={() => fn(x)}`.
- Props = solo lectura. Para algo que cambia, estado en el padre.
- Datos bajan por props, avisos suben llamando funciones.
- `...rest` para reenviar las props que no manejas: `<button {...rest}>`.

## En la entrevista

**¿Qué son las props?**
Son los datos que un componente padre le pasa a un hijo, como los argumentos de una función. Llegan en un objeto, el hijo las usa para pintarse y no las puede modificar.

**¿Cuál es la diferencia entre props y estado?**
Las props vienen de afuera (del padre) y son de solo lectura para el componente. El estado es interno: el propio componente lo crea con `useState` y lo cambia, y cada cambio provoca un nuevo render.

**¿Qué es `children`?**
Es una prop especial que contiene lo que se escribe entre la etiqueta de apertura y la de cierre de un componente. Permite crear componentes contenedores reutilizables como tarjetas, modales o layouts: es la base de la composición en React.

**¿Cómo se comunica un hijo con su padre?**
El padre le pasa una función por props (por ejemplo `onAgregar`) y el hijo la llama cuando ocurre algo, pasándole los datos necesarios. El padre decide qué hacer, normalmente actualizar su estado.

**¿Qué significa que React tiene flujo de datos unidireccional?**
Que los datos solo bajan de padres a hijos por props. Un hijo no puede cambiar los datos del padre directamente; solo puede avisarle mediante funciones. Esto hace que el origen de cada dato sea fácil de rastrear.
