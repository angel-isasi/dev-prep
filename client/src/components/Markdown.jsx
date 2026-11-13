import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import estilos from "./Markdown.module.css";

/** Muestra texto Markdown (enunciados, explicaciones) con tablas y código resaltado. */
export function Markdown({ children }) {
  return (
    <div className={estilos.markdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
