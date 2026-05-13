// Required by @next/mdx for the App Router — Next.js looks for this
// file at the project root and uses it to resolve the MDXComponents
// registry for every .mdx page. Without it, MDX pages crash on data
// collection with "s.createContext is not a function".
//
// Default: pass components through. Customize per-element here (e.g.
// styled <a>, <code>, etc.) if the help/legal content ever needs more
// than the prose styling in components/content/content-layout.tsx.

import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components;
}
