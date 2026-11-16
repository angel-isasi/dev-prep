# Leer documentación

## En una frase

La documentación en inglés (React, MDN, npm) usa siempre las mismas secciones y el mismo tipo de frases. Si reconoces esas piezas, puedes leer docs sin traductor y encontrar rápido lo que necesitas.

## Cómo se forma

Las secciones que verás casi siempre:

| Sección | Qué encuentras |
|---|---|
| Overview / Getting started | Para qué sirve y cómo empezar |
| Installation / Prerequisites | Cómo instalarlo y qué necesitas antes |
| Usage / Examples | Cómo se usa, con código |
| API reference | Cada función: syntax, parameters, return value, exceptions |
| Caveats / Pitfalls / Troubleshooting | Detalles, errores comunes y cómo arreglarlos |

Cuatro tipos de frase que se repiten:
- **Presente sin sujeto**: "**Returns** a new array." "**Throws** a TypeError if..." (se sobreentiende "this function").
- **Imperativo**: "**Install** the package." "**Pass** a callback as the second argument."
- **Pasiva**: "The callback **is called** once for each element."
- **Modales**: "This API **may** change." "Each child **should** have a unique key."

Ejemplos:
- The second argument is optional. → El segundo argumento es opcional.
- If omitted, the default value is used. → Si se omite, se usa el valor por defecto.
- This method is deprecated. → Este método está obsoleto.

## Errores típicos

- **Deprecated** no es "despreciado" ni "roto": significa que **todavía funciona**, pero no debes usarlo porque lo van a eliminar.
- **Default** no es "defecto" (falla): es el **valor por defecto**. Una falla es un **bug** o un **defect**.
- **e.g.** ≠ **i.e.**: **e.g.** es "por ejemplo" y **i.e.** es "es decir". "Browsers, e.g. Chrome" ✓; "the first item, i.e. index 0" ✓.
- **Required** en docs no es "requerido" en sentido de buscado: es **obligatorio**.
- **Returns** describe lo que devuelve la función, no lo que recibe. Lo que recibe son los **parameters**.

## Pronunciación

- **deprecated** → déprekeirid, con fuerza al inicio. No digas "dipríkeited".
- **required** → rikuáierd y **optional** → ópshonal.
- **caveat** → kéviat, tres sílabas cortas (ké-vi-at), con fuerza en la primera.
- **e.g.** se lee í yí (o "for example") y **i.e.** se lee ái í (o "that is").
