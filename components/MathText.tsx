
import React, { useEffect, useRef, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MathTextProps {
  content: string;
  className?: string;
}

const MathText: React.FC<MathTextProps> = React.memo(({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(containerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
      });
    }
  }, [content]);

  const sanitizedHtml = useMemo(() => {
    const html = marked.parse(content) as string;
    return DOMPurify.sanitize(html);
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className={`prose-custom ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
});

export default MathText;
