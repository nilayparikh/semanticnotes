import { useMemo } from "react";

interface MarkdownPreviewProps {
  content: string;
}

interface ParsedBlock {
  type: "h1" | "h2" | "h3" | "p" | "li" | "td" | "code-block";
  content: string;
  language?: string;
}

function parseInline(
  text: string,
): { text: string; inlineCode: boolean; bold: boolean; italic: boolean }[] {
  // First, handle inline code (backticks)
  // Then handle bold (**text**) and italic (*text*)
  const segments: {
    text: string;
    inlineCode: boolean;
    bold: boolean;
    italic: boolean;
  }[] = [];

  // Split by backticks first to preserve inline code
  const codeRegex = /`([^`]+)`|(\*\*[^*]+\*\*)|(\*[^*]+\*)|([^`*\n]+)/g;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match[1] !== undefined) {
      // Inline code
      segments.push({
        text: match[1],
        inlineCode: true,
        bold: false,
        italic: false,
      });
    } else if (match[2] !== undefined) {
      // Bold
      segments.push({
        text: match[2].slice(2, -2),
        inlineCode: false,
        bold: true,
        italic: false,
      });
    } else if (match[3] !== undefined) {
      // Italic
      segments.push({
        text: match[3].slice(1, -1),
        inlineCode: false,
        bold: false,
        italic: true,
      });
    } else if (match[4] !== undefined) {
      // Plain text
      segments.push({
        text: match[4],
        inlineCode: false,
        bold: false,
        italic: false,
      });
    }
  }

  return segments;
}

function renderInline(
  segments: {
    text: string;
    inlineCode: boolean;
    bold: boolean;
    italic: boolean;
  }[],
): JSX.Element[] {
  const elements: JSX.Element[] = [];
  let index = 0;
  for (const segment of segments) {
    if (segment.inlineCode) {
      elements.push(
        <code
          key={index++}
          className="px-1 py-0.5 bg-surface-container-high rounded text-sm font-jetbrains text-on-surface"
        >
          {segment.text}
        </code>,
      );
    } else {
      let content = <span key={index++}>{segment.text}</span>;
      if (segment.bold) {
        content = <strong key={index++}>{content}</strong>;
      }
      if (segment.italic) {
        content = <em key={index++}>{content}</em>;
      }
      elements.push(content);
    }
  }
  return elements;
}

function parseMarkdown(content: string): ParsedBlock[] {
  const lines = content.split("\n");
  const blocks: ParsedBlock[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let codeLanguage = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Handle code blocks (```)
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // Close code block
        blocks.push({
          type: "code-block",
          content: codeContent,
          language: codeLanguage,
        });
        inCodeBlock = false;
        codeContent = "";
        codeLanguage = "";
      } else {
        // Open code block
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim();
        continue;
      }
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? "\n" : "") + trimmed;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", content: trimmed.slice(2) });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", content: trimmed.slice(3) });
    } else if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", content: trimmed.slice(4) });
    } else if (trimmed.startsWith("- ")) {
      blocks.push({ type: "li", content: trimmed.slice(2) });
    } else if (trimmed.startsWith("|")) {
      const cells = trimmed.split("|").filter((c) => c.trim());
      for (const cell of cells) {
        blocks.push({ type: "td", content: cell.trim() });
      }
    } else if (trimmed.length > 0) {
      blocks.push({ type: "p", content: trimmed });
    }
  }

  return blocks;
}

// Group consecutive list items into a single <ul>
function groupBlocks(
  blocks: ParsedBlock[],
): (ParsedBlock | { type: "ul"; items: ParsedBlock[] })[] {
  const grouped: (ParsedBlock | { type: "ul"; items: ParsedBlock[] })[] = [];
  const currentList: ParsedBlock[] = [];

  for (const block of blocks) {
    if (block.type === "li") {
      currentList.push(block);
    } else {
      if (currentList.length > 0) {
        grouped.push({ type: "ul", items: currentList });
        currentList.length = 0;
      }
      grouped.push(block);
    }
  }
  if (currentList.length > 0) {
    grouped.push({ type: "ul", items: currentList });
  }

  return grouped;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  const grouped = useMemo(() => groupBlocks(blocks), [blocks]);

  const elements: JSX.Element[] = [];
  let index = 0;

  for (const block of grouped) {
    if (block.type === "ul") {
      const listItems = block.items.map((item, i) => {
        const segments = parseInline(item.content);
        return <li key={i}>{renderInline(segments)}</li>;
      });
      elements.push(
        <ul
          key={index++}
          className="list-disc list-inside space-y-1 my-2 text-on-surface-variant"
        >
          {listItems}
        </ul>,
      );
      continue;
    }

    // Handle code blocks
    if (block.type === "code-block") {
      elements.push(
        <pre
          key={index++}
          className="my-3 p-3 bg-surface-container-high rounded-md border border-white/5 overflow-x-auto"
        >
          <code className="font-jetbrains text-sm text-primary-container whitespace-pre-wrap">
            {block.content}
          </code>
        </pre>,
      );
      continue;
    }

    const segments = parseInline(block.content);

    switch (block.type) {
      case "h1":
        elements.push(
          <h1
            key={index++}
            className="text-3xl font-bold mt-6 mb-2 border-b text-on-surface"
          >
            {renderInline(segments)}
          </h1>,
        );
        break;
      case "h2":
        elements.push(
          <h2
            key={index++}
            className="text-2xl font-semibold mt-5 mb-2 text-on-surface"
          >
            {renderInline(segments)}
          </h2>,
        );
        break;
      case "h3":
        elements.push(
          <h3
            key={index++}
            className="text-xl font-medium mt-4 mb-1 text-on-surface"
          >
            {renderInline(segments)}
          </h3>,
        );
        break;
      case "p":
        elements.push(
          <p
            key={index++}
            className="my-2 leading-relaxed text-on-surface-variant"
          >
            {renderInline(segments)}
          </p>,
        );
        break;
      case "td":
        elements.push(
          <span
            key={index++}
            className="px-2 py-1 border border-surface-container-high rounded"
          >
            {renderInline(segments)}
          </span>,
        );
        break;
    }
  }

  return <article className="prose max-w-none">{elements}</article>;
}
