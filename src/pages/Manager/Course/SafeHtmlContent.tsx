import { useEffect, useRef } from "react";

const SafeHtmlContent = ({ html }: { html: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !html) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument!;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.7;
              color: #1f2937;
              padding: 2rem;
              margin: 0;
              background: transparent;
            }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            pre, code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 6px; }
            pre { padding: 1rem; overflow-x: auto; }
            table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
            th, td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
            th { background: #f9fafb; }
            h1, h2, h3, h4 { color: #111827; margin-top: 2rem; margin-bottom: 1rem; }
            a { color: #3b82f6; text-decoration: underline; }
            blockquote {
              border-left: 4px solid #3b82f6;
              padding-left: 1rem;
              margin: 1.5rem 0;
              color: #4b5563;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full rounded-none"
      style={{ height: "100%", minHeight: "600px" }}
      sandbox="allow-same-origin"
      title="Lesson Content"
      loading="lazy"
    />
  );
};

export default SafeHtmlContent;
