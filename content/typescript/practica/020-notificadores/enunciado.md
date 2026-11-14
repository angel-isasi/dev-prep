Una app de pedidos avisa al cliente cuando su pedido sale: por email, por SMS o con una notificación push en el celular. Cada canal funciona distinto, pero el código que avisa no debería saber de esos detalles: solo necesita algo que **sepa enviar**.

Escribe:

1. La interfaz `Notificador` con:
   - `canal`: de solo lectura, de tipo `Canal` (ya está declarado: `"email" | "sms" | "push"`).
   - `enviar(mensaje: string): string`: envía y devuelve un texto que describe el envío.
2. Tres clases que **implementan** `Notificador` (`implements Notificador`). Cada una recibe su destino en el constructor:
   - `NotificadorEmail(email)`: canal `"email"`. Si el email no contiene `"@"`, el constructor lanza `Error("Email inválido")`. `enviar` devuelve `"Email a <email>: <mensaje>"`.
   - `NotificadorSMS(telefono)`: canal `"sms"`. Un SMS tiene máximo 160 caracteres: `enviar` devuelve `"SMS a <telefono>: <mensaje>"` con el **mensaje** recortado a sus primeros 160 caracteres.
   - `NotificadorPush(dispositivo)`: canal `"push"`. `enviar` devuelve `"Push a <dispositivo>: <mensaje>"`.
3. `notificarATodos(notificadores, mensaje)`: recibe un `Notificador[]` y devuelve un arreglo con el resultado de llamar `enviar` en cada uno, en orden.

## Reglas

- `notificarATodos` no pregunta de qué clase es cada notificador: solo llama a `enviar`.
- Un objeto al que le falte `enviar` no debe poder usarse como `Notificador` (error de tipos).

## Ejemplos

```ts
const email = new NotificadorEmail("ana@correo.com");
email.enviar("Tu pedido salió");     // "Email a ana@correo.com: Tu pedido salió"

const sms = new NotificadorSMS("987654321");
sms.enviar("Tu pedido salió");       // "SMS a 987654321: Tu pedido salió"

new NotificadorEmail("ana-correo");  // Error: Email inválido

notificarATodos([email, sms, new NotificadorPush("celular-ana")], "Llegó");
// [
//   "Email a ana@correo.com: Llegó",
//   "SMS a 987654321: Llegó",
//   "Push a celular-ana: Llegó",
// ]
```
