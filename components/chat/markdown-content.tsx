"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-sm max-w-none break-words prose-headings:text-text prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1.5 prose-p:leading-relaxed prose-a:text-primary prose-a:underline prose-a:underline-offset-2 prose-strong:text-text prose-strong:font-semibold prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-code:text-[13px] prose-code:bg-[rgba(24,23,23,0.06)] prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[rgba(24,23,23,0.04)] prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-fg prose-hr:border-border">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
