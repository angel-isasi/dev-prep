# Componentes de librerías de UI

Componentes copiados de librerías de UI y adaptados a dev-prep. Se copian en vez de instalarse
porque así funcionan offline y se pueden ajustar: es lo que recomiendan las propias librerías.

| Archivo | Librería | Original |
|---|---|---|
| `magic-card.jsx` | Magic UI | magicui.design/docs/components/magic-card |
| `border-beam.jsx` | Magic UI | magicui.design/docs/components/border-beam |
| `aurora-text.jsx` | Magic UI | magicui.design/docs/components/aurora-text |
| `particles.jsx` | Magic UI | magicui.design/docs/components/particles |
| `text-effect.jsx` | Motion Primitives | motion-primitives.com/docs/text-effect |
| `animated-group.jsx` | Motion Primitives | motion-primitives.com/docs/animated-group |
| `sliding-number.jsx` | Animate UI | animate-ui.com/docs/primitives/texts/sliding-number |
| `liquid-button.jsx` | RareUI | github.com/Codewithswappy/RareUI |
| `shine-border.jsx` | Magic UI | magicui.design/docs/components/shine-border |
| `animated-shiny-text.jsx` | Magic UI | magicui.design/docs/components/animated-shiny-text |
| `meteors.jsx` | Magic UI | magicui.design/docs/components/meteors |
| `card-3d.jsx` | Aceternity UI | ui.aceternity.com/components/3d-card-effect |

Cambios frente al original, en todos:
- De TypeScript a JavaScript (sin tipos), con comentarios en español.
- Colores por defecto tomados de `tokens.css` (lavanda, verde, ámbar) en lugar de los de la librería.
- Respetan "reducir movimiento" del sistema.
- La raíz lleva la clase `tw`, que activa el reinicio mínimo de Tailwind solo dentro del componente
  (ver `client/src/styles/tailwind.css`).
