# Formulario de registro con validación en vivo

## Contexto

**Wayra Pagos** es una billetera digital de Arequipa para pagar con QR en mercados y bodegas. El registro es la primera pantalla que ve un usuario nuevo y hoy la mitad abandona ahí: los errores aparecen todos juntos al final, no se entienden y los lectores de pantalla no los anuncian.

Te pedimos rehacer el formulario de registro. El backend ya existe; en esta prueba lo reemplaza una **API falsa** en `src/api.js`: `registerUser({ email, password })` tarda menos de un segundo y responde con un error si el correo es `usado@wayra.pe` (como si ya estuviera registrado).

Tiempo estimado: **2 horas**.

## Requisitos

- [ ] Campos con estas etiquetas: **Correo electrónico**, **Contraseña**, **Confirmar contraseña** y un checkbox **Acepto los términos y condiciones**.
- [ ] Debajo de la contraseña, siempre visible, la ayuda `Mínimo 8 caracteres, con al menos una mayúscula y un número.`
- [ ] **Validación en vivo**: el error de un campo aparece cuando sales de él por primera vez (blur) y, desde ese momento, se actualiza mientras escribes. Un campo que no has tocado no muestra errores.
- [ ] Mensajes de error (se muestra solo el primero que aplique):
  - Correo vacío: `Ingresa tu correo electrónico.`
  - Correo sin formato válido: `Ingresa un correo válido, por ejemplo nombre@dominio.com.`
  - Contraseña vacía: `Ingresa una contraseña.`
  - Menos de 8 caracteres: `La contraseña debe tener al menos 8 caracteres.`
  - Sin mayúscula: `La contraseña debe tener al menos una letra mayúscula.`
  - Sin número: `La contraseña debe tener al menos un número.`
  - Confirmación vacía: `Confirma tu contraseña.`
  - No coinciden: `Las contraseñas no coinciden.` (si cambias la contraseña después, la confirmación se vuelve a revisar).
- [ ] Accesibilidad: un campo con error tiene `aria-invalid="true"` y su `aria-describedby` apunta al mensaje de error (en la contraseña, también a la ayuda).
- [ ] El correo se valida y se envía **sin espacios al inicio ni al final**.
- [ ] El botón **Crear cuenta** está deshabilitado hasta que todos los campos sean válidos y los términos estén aceptados.
- [ ] Al enviar: el botón dice `Enviando...`, queda deshabilitado y no se puede enviar dos veces.
- [ ] Si todo sale bien, el formulario se reemplaza por el título `¡Cuenta creada!` y el texto `Te enviamos un correo de confirmación a <correo>.`
- [ ] Si el servidor responde con error, se muestra su mensaje con `role="alert"`, el formulario conserva lo escrito y se puede volver a enviar.

## Lo que se valora

- Que los tests de `tests/` pasen.
- Los errores son **estado derivado** de los valores: no se guardan en un `useState` aparte que haya que sincronizar.
- Validación en funciones puras, separadas del componente.
- Un componente de campo reutilizable que se encargue de la etiqueta, la ayuda, el error y los atributos `aria-*`.
- Buena experiencia: no regañar al usuario antes de tiempo, mensajes claros que dicen cómo corregir.
- Un README breve con tus decisiones.

## Entrega

1. Completa los archivos con `// TODO` de `src/`.
2. Verifica que pasan todos los tests de `tests/registro.test.jsx`.
3. Actualiza el `README.md` con tus decisiones y qué mejorarías.
4. Prepárate para responder en la entrevista: ¿por qué validar al salir del campo y no en cada tecla desde el inicio? ¿Basta con validar en el frontend?
