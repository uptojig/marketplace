import * as React from "react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    
    // Headings
    h1: ({ children }: any) => (
      <h1 className="text-2xl sm:text-3xl font-extrabold text-mp-forest tracking-tight pb-3 mb-6 border-b border-mp-border mt-2 font-display">
        {children}
      </h1>
    ),
    
    h2: ({ children }: any) => {
      // Robustly extract string content from children
      const getRawText = (node: any): string => {
        if (!node) return "";
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(getRawText).join("");
        if (node.props && node.props.children) return getRawText(node.props.children);
        return "";
      };
      
      const text = getRawText(children);
      // Check if it's a step: e.g., "ขั้นที่ 1 — ค้นหาสินค้า" or "ขั้นตอนที่ 2..."
      const stepMatch = text.match(/^(ขั้นที่|ขั้นตอนที่|ขั้น)\s*(\d+)\s*[\-—–]\s*(.*)$/i);
      if (stepMatch) {
        const stepNum = stepMatch[2];
        const stepTitle = stepMatch[3];
        return (
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-mp-forest mt-8 mb-4 font-display">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mp-coral text-white text-xs sm:text-sm font-bold shadow-sm font-sans">
              {stepNum}
            </span>
            <span>{stepTitle}</span>
          </h2>
        );
      }
      return (
        <h2 className="text-lg sm:text-xl font-bold text-mp-forest border-l-4 border-mp-coral pl-3.5 mt-8 mb-4 font-display">
          {children}
        </h2>
      );
    },
    
    h3: ({ children }: any) => (
      <h3 className="text-base sm:text-lg font-bold text-mp-forest mt-6 mb-3 font-display">
        {children}
      </h3>
    ),
    
    h4: ({ children }: any) => (
      <h4 className="text-sm sm:text-base font-bold text-mp-forest mt-4 mb-2 font-display">
        {children}
      </h4>
    ),

    // Paragraph
    p: ({ children }: any) => {
      const getRawText = (node: any): string => {
        if (!node) return "";
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(getRawText).join("");
        if (node.props && node.props.children) return getRawText(node.props.children);
        return "";
      };
      
      const text = getRawText(children);
      if (text.startsWith("ปรับปรุงล่าสุด:")) {
        return (
          <p className="text-xs text-mp-ink-muted/80 bg-mp-cream-alt px-3 py-1.5 rounded-full inline-block mb-6 font-medium border border-mp-border/40">
            {children}
          </p>
        );
      }
      return (
        <p className="text-sm sm:text-base leading-relaxed text-mp-ink/90 mb-4 font-sans">
          {children}
        </p>
      );
    },

    // Lists
    ul: ({ children }: any) => {
      return (
        <ul className="list-none space-y-2.5 mb-6 pl-1">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                type: "unordered",
              });
            }
            return child;
          })}
        </ul>
      );
    },
    
    ol: ({ children }: any) => {
      let index = 0;
      return (
        <ol className="list-none space-y-2.5 mb-6 pl-1">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              index++;
              return React.cloneElement(child as React.ReactElement<any>, {
                type: "ordered",
                index: index,
              });
            }
            return child;
          })}
        </ol>
      );
    },
    
    li: ({ children, type, index }: { children?: React.ReactNode; type?: "ordered" | "unordered"; index?: number }) => {
      if (type === "ordered") {
        return (
          <li className="flex items-start gap-3 text-sm sm:text-base text-mp-ink/90 leading-relaxed my-1 font-sans">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mp-forest/10 text-mp-forest text-xs font-bold mt-0.5 font-sans">
              {index}
            </span>
            <span className="flex-1">{children}</span>
          </li>
        );
      }
      return (
        <li className="flex items-start gap-3 text-sm sm:text-base text-mp-ink/90 leading-relaxed my-1 font-sans">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mp-coral" />
          <span className="flex-1">{children}</span>
        </li>
      );
    },

    // Blockquote
    blockquote: ({ children }: any) => {
      const getRawText = (node: any): string => {
        if (!node) return "";
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(getRawText).join("");
        if (node.props && node.props.children) return getRawText(node.props.children);
        return "";
      };
      
      const text = getRawText(children);
      const isWarning = text.includes("หมายเหตุ") || text.includes("คำเตือน") || text.includes("สำคัญ");
      
      if (isWarning) {
        return (
          <div className="my-6 rounded-xl border border-mp-warning/20 bg-mp-warning/5 p-4 flex gap-3 text-sm sm:text-base text-mp-ink/90 leading-relaxed shadow-sm font-sans">
            <span className="text-lg mt-0.5 select-none">⚠️</span>
            <div className="flex-1 [&&>p]:mb-0 font-medium">{children}</div>
          </div>
        );
      }
      return (
        <div className="my-6 rounded-xl border border-mp-forest/20 bg-mp-forest/5 p-4 flex gap-3 text-sm sm:text-base text-mp-ink/90 leading-relaxed shadow-sm font-sans">
          <span className="text-lg mt-0.5 select-none">💡</span>
          <div className="flex-1 [&&>p]:mb-0">{children}</div>
        </div>
      );
    },

    // Links
    a: ({ href, children }: any) => (
      <Link
        href={href || "#"}
        className="font-semibold text-mp-coral hover:text-mp-coral-dark hover:underline transition-colors duration-150 inline-flex items-center gap-0.5"
      >
        {children}
      </Link>
    ),

    // Strong / Bold
    strong: ({ children }: any) => (
      <strong className="font-bold text-mp-forest">
        {children}
      </strong>
    ),

    // Code
    code: ({ children }: any) => (
      <code className="px-1.5 py-0.5 rounded bg-mp-cream-alt border border-mp-border text-mp-forest text-xs sm:text-sm font-mono font-medium">
        {children}
      </code>
    ),

    pre: ({ children }: any) => (
      <pre className="my-6 overflow-x-auto rounded-xl border border-mp-border bg-mp-cream-alt p-4 font-mono text-sm leading-relaxed text-mp-forest shadow-inner">
        {children}
      </pre>
    ),

    // Tables
    table: ({ children }: any) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-mp-border bg-mp-surface shadow-sm">
        <table className="w-full text-left border-collapse text-sm sm:text-base">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-mp-cream-alt text-mp-forest font-bold border-b border-mp-border">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-mp-border/50">
        {children}
      </tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-mp-cream/30 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-3 font-semibold text-mp-forest">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 text-mp-ink/80 leading-relaxed">
        {children}
      </td>
    ),

    // HR
    hr: () => (
      <hr className="my-8 border-t border-mp-border/60" />
    ),

    // Accordions / Details
    details: ({ children, ...props }: any) => (
      <details
        {...props}
        className="group my-4 rounded-xl border border-mp-border bg-mp-surface p-4 transition-all duration-300 open:bg-white open:shadow-sm"
      >
        {children}
      </details>
    ),
    summary: ({ children, ...props }: any) => (
      <summary
        {...props}
        className="flex cursor-pointer list-none items-center justify-between font-bold text-mp-forest hover:text-mp-coral focus:outline-none transition-colors [&::-webkit-details-marker]:hidden"
      >
        <span className="font-display pr-4">{children}</span>
        <span className="shrink-0 transition-transform duration-200 group-open:rotate-180 text-mp-ink-muted">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
    ),
  };
}
