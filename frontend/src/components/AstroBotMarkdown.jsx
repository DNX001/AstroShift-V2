import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-4 text-lg font-bold text-cyan-200">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-base font-bold text-cyan-200">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-sm font-semibold text-cyan-100">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-2 break-words first:mt-0 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-outside list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-outside list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-cyan-300 underline decoration-cyan-300/40 underline-offset-2 hover:text-cyan-100"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-r-lg border-l-2 border-cyan-300/50 bg-cyan-300/[0.035] py-2 pl-3 pr-2 italic text-slate-300">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-3 max-w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-[#070e15] p-3 text-[11px] leading-5 text-cyan-100">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code className={className || "rounded bg-slate-950/80 px-1 py-0.5 text-[0.9em] text-cyan-100"}>
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="my-3 max-w-full overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full border-collapse text-left text-[11px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-white/[0.1] bg-[#0a1721] px-3 py-2 font-semibold text-cyan-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/[0.06] px-3 py-2 text-slate-300 last:border-b-0">
      {children}
    </td>
  ),
  hr: () => <hr className="my-4 border-white/[0.09]" />,
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
