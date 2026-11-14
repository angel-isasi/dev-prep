// Notificadores
//
// Interfaz Notificador: canal (solo lectura, tipo Canal) y enviar(mensaje): string.
// Tres clases que la implementan: NotificadorEmail, NotificadorSMS y NotificadorPush.
// notificarATodos(notificadores, mensaje): el resultado de enviar en cada uno.
//
//   new NotificadorEmail("ana@correo.com").enviar("Hola")  ->  "Email a ana@correo.com: Hola"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export type Canal = "email" | "sms" | "push";

export interface Notificador {
  // Completa: canal (solo lectura) y el método enviar.
}

// Agrega `implements Notificador` a cada clase y completa su contenido.
export class NotificadorEmail {
  constructor(email: string) {
    // Tu código aquí
  }
}

export class NotificadorSMS {
  constructor(telefono: string) {
    // Tu código aquí
  }
}

export class NotificadorPush {
  constructor(dispositivo: string) {
    // Tu código aquí
  }
}

export function notificarATodos(notificadores: Notificador[], mensaje: string): string[] {
  // Tu código aquí
  return [];
}
