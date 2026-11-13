Escribe la función `presentar(nombre, edad, ciudad)` que devuelva una frase de presentación armada con esos tres datos.

El formato exacto es:

```
Me llamo <nombre>, tengo <edad> años y vivo en <ciudad>.
```

## Reglas

- El nombre y la ciudad pueden venir con espacios de sobra a los costados: quítalos.
- La edad llega como número y aparece tal cual en el texto.
- Respeta el formato al pie de la letra: comas, espacios y el punto final.

## Ejemplos

```js
presentar("Ana", 20, "Lima");          // "Me llamo Ana, tengo 20 años y vivo en Lima."
presentar("  Luis ", 19, " Arequipa "); // "Me llamo Luis, tengo 19 años y vivo en Arequipa."
```

## Por qué importa

Armar textos con datos es lo que más haces en frontend: mensajes, etiquetas, URLs, clases de CSS. Los **template literals** (comillas invertidas con `${}`) son la forma moderna de hacerlo, y en una entrevista se nota si todavía concatenas con `+`.
