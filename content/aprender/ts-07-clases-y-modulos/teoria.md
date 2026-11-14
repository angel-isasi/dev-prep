## En una frase

TypeScript agrega a las clases de JavaScript **control de acceso** (`private`, `protected`, `readonly`) y **contratos** (`implements`), y en los módulos te deja exportar e importar tipos igual que funciones.

## Lo esencial

### Una clase tipada

```ts
class CuentaBancaria {
  titular: string;
  private saldo: number;          // solo se usa dentro de la clase

  constructor(titular: string, saldoInicial: number) {
    this.titular = titular;
    this.saldo = saldoInicial;
  }

  depositar(monto: number): void {
    if (monto <= 0) throw new Error("Monto inválido");
    this.saldo += monto;
  }

  verSaldo(): number {
    return this.saldo;
  }
}

const c = new CuentaBancaria("Ana", 100);
c.depositar(50);
c.verSaldo();    // 150
c.saldo = 99999; // error: La propiedad 'saldo' es privada y solo se puede acceder a ella en la clase 'CuentaBancaria'.
```

En TypeScript **las propiedades se declaran** arriba con su tipo (en JS puro basta con asignarlas en el constructor). Así el saldo solo cambia por `depositar`, que valida.

### Modificadores de acceso

| Modificador | ¿Desde dónde se usa? |
|---|---|
| `public` (por defecto) | Desde cualquier lugar |
| `private` | Solo dentro de la clase |
| `protected` | Dentro de la clase y de sus hijas (`extends`) |
| `readonly` | Se asigna en la declaración o el constructor, y no cambia más |

```ts
class Empleado {
  readonly id: number;
  protected sueldo: number;

  constructor(id: number, sueldo: number) {
    this.id = id;
    this.sueldo = sueldo;
  }
}

class Gerente extends Empleado {
  bono(): number {
    return this.sueldo * 0.1; // ok: protected se ve desde la hija
  }
}

const g = new Gerente(1, 5000);
g.id = 2;     // error: es de solo lectura
g.sueldo;     // error: protected, no se ve desde fuera
```

**Atajo:** poner el modificador en el parámetro del constructor declara y asigna en un paso.

```ts
class Producto {
  constructor(public nombre: string, private precio: number) {}
  // equivale a declarar nombre y precio, y hacer this.nombre = nombre; this.precio = precio;
}
```

`private` de TypeScript es solo una revisión de tsc. JavaScript tiene su propio privado real con `#`: `#saldo = 0;` (ese sí no se puede leer desde fuera ni en ejecución).

### implements: cumplir un contrato

Una `interface` puede describir lo que una clase **debe tener**:

```ts
interface Notificador {
  enviar(mensaje: string): boolean;
}

class NotificadorEmail implements Notificador {
  enviar(mensaje: string): boolean {
    console.log(`Email: ${mensaje}`);
    return true;
  }
}

class NotificadorSms implements Notificador {
  // error: La clase 'NotificadorSms' implementa la interfaz 'Notificador' de forma incorrecta.
}

function avisar(n: Notificador) { n.enviar("Tu pedido llegó"); } // acepta cualquiera de las dos
```

`implements` no agrega código: solo hace que tsc revise que la clase cumple la interfaz.

### Clases abstractas (en pocas líneas)

Una clase `abstract` es una plantilla: **no se puede instanciar** y puede dejar métodos sin implementar para que las hijas los completen.

```ts
abstract class Figura {
  abstract area(): number;                        // las hijas deben implementarlo
  describir(): string { return `Área: ${this.area().toFixed(2)}`; } // compartido
}

class Circulo extends Figura {
  constructor(private radio: number) { super(); }
  area(): number { return Math.PI * this.radio ** 2; }
}

new Figura();               // error: no se puede crear una instancia de una clase abstracta
new Circulo(1).describir(); // "Área: 3.14"
```

En el frontend de hoy (React con funciones) las clases se usan poco, pero aparecen en entrevistas y en código de servicios.

### Módulos: exportar e importar tipos

Cada archivo es un módulo. Los tipos se exportan igual que las funciones:

```ts
// tipos.ts
export interface Usuario { id: number; nombre: string }
export type Rol = "admin" | "lector";

// api.ts
import type { Usuario, Rol } from "./tipos";
import { formatearNombre } from "./utilidades";

export async function obtenerUsuario(id: number): Promise<Usuario> {
  const r = await fetch(`/api/usuarios/${id}`);
  return r.json();
}
```

`import type` deja claro que **solo importas tipos**: esa línea se borra completa al compilar, porque en JavaScript los tipos no existen. También puedes mezclar: `import { type Usuario, formatearNombre } from "./modulo";`.

Tip: es común tener un archivo `tipos.ts` con las interfaces compartidas del proyecto.

## Errores típicos

**1. No declarar las propiedades**

```ts
class Punto {
  constructor(x: number) {
    this.x = x; // error: La propiedad 'x' no existe en el tipo 'Punto'.
  }
}
```
Declara `x: number;` arriba o usa el atajo `constructor(public x: number) {}`.

**2. Propiedad sin inicializar**

```ts
class Carrito {
  items: string[]; // error en modo estricto: no tiene inicializador ni se asigna en el constructor
}
```
Dale valor: `items: string[] = [];`.

**3. Creer que `private` oculta en ejecución**

```ts
console.log(cuenta); // en la consola se ve saldo igual
```
`private` es solo de TypeScript. Para privacidad real usa `#saldo`.

**4. Olvidar `super()` en la clase hija**

```ts
class Circulo extends Figura {
  constructor(private radio: number) {} // error: el constructor debe llamar a super()
}
```
Si la hija tiene constructor, la primera instrucción debe ser `super(...)`.

**5. Importar un tipo como valor**

```ts
import type { Usuario } from "./tipos";
const u = new Usuario(); // error: "Usuario" solo es un tipo y no se puede usar como valor
```
Una `interface` no existe en ejecución: no puedes hacer `new` ni `instanceof` con ella.

## Chuleta

```ts
class A {
  publico = 1;
  private oculto = 2;
  protected paraHijas = 3;
  readonly fijo = 4;
  #privadoReal = 5;                     // privado de JavaScript
  constructor(public nombre: string) {} // declara y asigna
}
class B extends A { constructor() { super("b"); } }
class C implements MiInterface { ... }
abstract class D { abstract f(): void }
export interface X {}  /  import type { X } from "./x";
```

## En la entrevista

**¿Diferencia entre `private` y `protected`?**
`private` solo se puede usar dentro de la misma clase; `protected` también desde las clases que heredan de ella. Ninguno se puede usar desde fuera.

**¿Diferencia entre `private` de TypeScript y `#` de JavaScript?**
`private` es una regla del compilador y desaparece al compilar: en ejecución la propiedad sigue siendo accesible. `#campo` es privado de verdad en JavaScript, incluso en ejecución.

**¿Para qué sirve `implements`?**
Para que tsc compruebe que una clase cumple una interfaz (tiene todos sus métodos y propiedades con los tipos correctos). Permite programar contra la interfaz y cambiar la implementación sin tocar a quien la usa.

**¿Qué es una clase abstracta?**
Una clase que no se puede instanciar y sirve de base: define métodos comunes y declara métodos `abstract` que cada hija debe implementar.

**¿Para qué sirve `import type`?**
Para importar solo tipos. Deja claro que esa importación no existe en ejecución y el compilador la borra entera, lo que evita cargar módulos innecesarios.
