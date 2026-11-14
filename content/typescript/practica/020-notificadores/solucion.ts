export type Canal = "email" | "sms" | "push";

// La interfaz es un contrato: todo Notificador tiene un canal y sabe enviar.
// No dice CÓMO se envía; eso lo decide cada clase.
export interface Notificador {
  readonly canal: Canal;
  enviar(mensaje: string): string;
}

const MAXIMO_SMS = 160;

// implements: TypeScript comprueba que la clase cumpla el contrato.
// Si te falta enviar o el canal no es un Canal válido, marca el error aquí.
export class NotificadorEmail implements Notificador {
  readonly canal = "email";
  private email: string;

  constructor(email: string) {
    if (!email.includes("@")) {
      throw new Error("Email inválido");
    }
    this.email = email;
  }

  enviar(mensaje: string): string {
    return `Email a ${this.email}: ${mensaje}`;
  }
}

export class NotificadorSMS implements Notificador {
  readonly canal = "sms";
  private telefono: string;

  constructor(telefono: string) {
    this.telefono = telefono;
  }

  enviar(mensaje: string): string {
    // slice no falla si el mensaje es más corto: devuelve el texto completo.
    return `SMS a ${this.telefono}: ${mensaje.slice(0, MAXIMO_SMS)}`;
  }
}

export class NotificadorPush implements Notificador {
  readonly canal = "push";
  private dispositivo: string;

  constructor(dispositivo: string) {
    this.dispositivo = dispositivo;
  }

  enviar(mensaje: string): string {
    return `Push a ${this.dispositivo}: ${mensaje}`;
  }
}

// Polimorfismo: esta función no sabe ni le importa qué clase es cada uno.
// Solo usa lo que promete la interfaz.
export function notificarATodos(notificadores: Notificador[], mensaje: string): string[] {
  return notificadores.map((notificador) => notificador.enviar(mensaje));
}
