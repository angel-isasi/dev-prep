## Idea clave

Una **interfaz** es un contrato ("tiene un canal y sabe enviar") y cada clase lo cumple a su manera con `implements`. El código que usa el contrato, como `notificarATodos`, trabaja con cualquier objeto que lo cumpla sin preguntar de qué clase es: eso es **polimorfismo**.

## Paso a paso

1. **Escribe el contrato.** La interfaz solo dice qué existe, no cómo funciona. Los métodos van con su firma, sin cuerpo:

   ```ts
   export interface Notificador {
     readonly canal: Canal;
     enviar(mensaje: string): string;
   }
   ```

2. **Implementa el contrato en cada clase.** `implements Notificador` le pide a TypeScript que compruebe que la clase cumple: si olvidas `enviar` o pones `canal = "paloma"`, el error aparece en la línea de la clase, no lejos en otro archivo.

3. **Cada clase guarda su destino y arma su texto.** El destino es un detalle interno, por eso es `private`:

   ```ts
   export class NotificadorEmail implements Notificador {
     readonly canal = "email";
     private email: string;

     constructor(email: string) {
       if (!email.includes("@")) throw new Error("Email inválido");
       this.email = email;
     }

     enviar(mensaje: string): string {
       return `Email a ${this.email}: ${mensaje}`;
     }
   }
   ```

   `readonly canal = "email"` hace que el tipo de `canal` sea el literal `"email"`, que encaja en `Canal`. El constructor valida antes de guardar: un `NotificadorEmail` con un email inválido nunca llega a existir.

4. **El SMS recorta.** `mensaje.slice(0, 160)` devuelve como mucho los primeros 160 caracteres; si el mensaje es más corto, lo devuelve completo. Fíjate que se recorta el **mensaje**, no el texto final con el prefijo.

5. **Usa solo el contrato.** `notificarATodos` recibe `Notificador[]`, así que solo puede usar `canal` y `enviar`. No necesita `if (n instanceof NotificadorEmail)`:

   ```ts
   return notificadores.map((notificador) => notificador.enviar(mensaje));
   ```

## Por qué funciona

Recorrido de `notificarATodos([email, sms, push], "Llegó")`:

| Elemento | Clase real | `enviar` que se ejecuta | Resultado |
|---|---|---|---|
| 1 | `NotificadorEmail` | el de Email | `"Email a ana@correo.com: Llegó"` |
| 2 | `NotificadorSMS` | el de SMS (recorta a 160) | `"SMS a 987654321: Llegó"` |
| 3 | `NotificadorPush` | el de Push | `"Push a celular-ana: Llegó"` |

La misma línea `notificador.enviar(mensaje)` ejecuta un código distinto según el objeto: cada objeto lleva su propio método. Si mañana agregas `NotificadorWhatsApp implements Notificador`, `notificarATodos` funciona sin tocar una línea.

Y como TypeScript compara por **forma** (tipado estructural), hasta un objeto literal `{ canal: "push", enviar: (m) => ... }` es un `Notificador`. Así se hacen dobles de prueba (mocks) sin crear clases.

## Errores comunes

- **Escribir `canal = "email"` en la clase sin `readonly`.** Sin `readonly`, la propiedad se infiere como `string`, que no encaja en `Canal`, y `implements` marca el error. Usa `readonly canal = "email"` o anota `canal: Canal = "email"`.
- **Poner cuerpo a los métodos en la interfaz.** Una interfaz no lleva código: `enviar(mensaje: string): string;` termina en punto y coma.
- **Recortar el texto completo en vez del mensaje.** `("SMS a ...: " + mensaje).slice(0, 160)` corta el mensaje antes de tiempo: el test de 200 caracteres lo detecta.
- **Preguntar por la clase en `notificarATodos`** con `instanceof` o con `canal`. Funciona hoy, pero cada canal nuevo obliga a tocar esa función: pierdes el beneficio de la interfaz.
- **Validar el email en `enviar` en vez del constructor.** El test espera que `new NotificadorEmail("ana-correo.com")` lance el error de inmediato.

## Otra forma de resolverlo

**Sin clases, con funciones que devuelven objetos** (factory functions):

```ts
export function crearNotificadorPush(dispositivo: string): Notificador {
  return {
    canal: "push",
    enviar: (mensaje) => `Push a ${dispositivo}: ${mensaje}`,
  };
}
```

El destino queda guardado en el closure (privado de verdad) y el tipo de retorno `Notificador` comprueba el contrato. En React y en mucho código frontend moderno se prefiere este estilo; las clases son comunes en Angular, NestJS y en librerías. Las dos formas cumplen la misma interfaz.

**Una clase abstracta** (`abstract class NotificadorBase`) cuando las clases comparten **código**, no solo la forma (por ejemplo, un `registrarEnvio()` común). Si solo comparten la forma, la interfaz es más simple.

## Cómo explicarlo en la entrevista

> "Definí una interfaz Notificador con el canal y el método enviar, que es el contrato. Cada clase la implementa con implements, así TypeScript me avisa si alguna no la cumple, y guarda su destino como propiedad privada; el de email valida en el constructor. notificarATodos recibe un arreglo de Notificador y solo llama a enviar: no sabe qué clase es cada uno, eso es polimorfismo. Para agregar un canal nuevo creo otra clase y no toco esa función. Y como TypeScript es estructural, en los tests puedo pasar un objeto literal que cumpla la interfaz."

## Conceptos

- **Interfaz**: contrato de forma (propiedades y firmas de métodos) sin implementación.
- **`implements`**: obliga a una clase a cumplir una interfaz; el error aparece en la clase.
- **Polimorfismo**: el mismo llamado (`enviar`) ejecuta código distinto según el objeto.
- **Tipado estructural**: en TypeScript, cualquier objeto con la forma correcta cumple el tipo, aunque no use `implements`.
- **`readonly` con literal**: `readonly canal = "email"` tiene tipo `"email"`, no `string`.
- **Template literals**: textos con `${...}` para insertar valores.
- **`slice(0, n)`**: los primeros `n` caracteres, sin fallar si el texto es más corto.
- **Abierto a extensión**: agregar un canal nuevo no cambia el código que ya funciona.
- Repasa el tema de Aprender "TS: clases y módulos" (y "TS: objetos e interfaces") y, en la Referencia, `slice` e `includes`.
