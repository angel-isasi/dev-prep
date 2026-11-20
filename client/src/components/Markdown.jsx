import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import estilos from "./Markdown.module.css";

/** Muestra texto Markdown (enunciados, explicaciones) con tablas y código resaltado. */
export function Markdown({ children }) {
  return (
    // data-sin-inmersion: es contenido de estudio, el modo inmersión (lib/inmersion.js) no lo traduce
    <div className={estilos.markdown} data-sin-inmersion>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
