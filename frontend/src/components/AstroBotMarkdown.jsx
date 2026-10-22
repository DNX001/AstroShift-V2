
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-4 text-lg font-bold text-cyan-300">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-base font-bold text-cyan-300">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-sm font-semibold text-cyan-200">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="my-2 first:mt-0 last:mb-0">
      {children}
    </p>
  ),

  strong: ({ children }) => (
    <strong className="font-bold text-white">
      {children}
    </strong>
  ),

  ul: ({ children }) => (
    <ul className="my-2 list-outside list-disc space-y-1 pl-5">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="my-2 list-outside list-decimal space-y-1 pl-5">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="pl-1">{children}</li>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
    >
      {children}
    </a>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-cyan-500 pl-3 italic text-slate-300">
      {children}
    </blockquote>
  ),

  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-cyan-100">
      {children}
    </pre>
  ),

  code: ({ children, className }) => (
    <code className={className || "rounded bg-slate-950 px-1 py-0.5 text-xs text-cyan-200"}>
      {children}
    </code>
  ),

  table: ({ children }) => (
    <table className="my-3 w-full border-collapse text-left text-xs">
      {children}
    </table>
  ),

  th: ({ children }) => (
    <th className="border border-slate-600 bg-slate-900 p-2 font-semibold text-cyan-300">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border border-slate-600 p-2">
      {children}
    </td>
  ),

  img: ({ alt }) => (
    <span className="text-xs italic text-slate-400">
      [External image: {alt || "image"}]
    </span>
  ),
};

export default function AstroBotMarkdown({ content }) {
  return (
    <div className="min-w-0 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
        skipHtml
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
