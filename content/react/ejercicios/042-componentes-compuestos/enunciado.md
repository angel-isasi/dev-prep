Crea un grupo de opciones con el patrón de **componentes compuestos** (*compound components*): un componente padre `Opciones` y sus piezas `Opciones.Item`, que se comunican por **contexto** sin que tengas que pasar props a cada item. Quien lo usa decide el orden y el contenido de cada opción, como con `<select>` y `<option>`.

Exporta:

- `Opciones({ valor, onCambio, children })`: el grupo (controlado por su padre).
- `Opciones.Item({ valor, children })`: una opción del grupo, como propiedad de `Opciones`.
- `Masa()`: un ejemplo de uso para elegir la masa de la pizza.

## Reglas

- `Opciones` pinta un `<div role="radiogroup">` con sus `children`, y comparte `valor` y `onCambio` por contexto.
- `Opciones.Item` pinta un `<button role="radio">` con su `children` y:
  - `aria-checked="true"` si su `valor` es el seleccionado del grupo; si no, `"false"`.
  - Al hacer clic, llama a `onCambio` del grupo con **su** `valor`.
- Si se usa un `Opciones.Item` **fuera** de un `Opciones`, debe lanzar un error con un mensaje que diga **"dentro de <Opciones>"**.
- `Masa` guarda la masa elegida (empieza en `"delgada"`) y muestra dos items: **"Delgada"** (`valor="delgada"`) y **"Gruesa"** (`valor="gruesa"`).

## Ejemplo

```jsx
function Masa() {
  const [masa, setMasa] = useState("delgada");
  return (
    <Opciones valor={masa} onCambio={setMasa}>
      <Opciones.Item valor="delgada">Delgada</Opciones.Item>
      <Opciones.Item valor="gruesa">Gruesa</Opciones.Item>
    </Opciones>
  );
}
```

| Acción | Delgada `aria-checked` | Gruesa `aria-checked` |
|---|---|---|
| (inicio) | `true` | `false` |
| Clic en "Gruesa" | `false` | `true` |

## Por qué importa

Es el patrón detrás de muchas librerías de componentes (Radix, Headless UI, Reach): `<Tabs>`, `<Tabs.List>`, `<Tabs.Panel>`. Mostrar que conoces patrones de diseño de componentes, más allá de "props y estado", te diferencia en una entrevista.
