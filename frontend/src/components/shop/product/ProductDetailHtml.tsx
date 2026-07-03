"use client";

type ProductDetailHtmlProps = {
  html: string;
  className?: string;
};

export function ProductDetailHtml({ html, className }: ProductDetailHtmlProps) {
  if (!html.trim()) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
