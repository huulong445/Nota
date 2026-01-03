"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { useEffect, useRef, useState, useCallback } from "react";
import hljs from "highlight.js/lib/core";

// Import only popular languages to keep bundle size small
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import java from "highlight.js/lib/languages/java";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", c);
hljs.registerLanguage("java", java);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", html);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sql", sql);

// Language options for the dropdown
export const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "sql", label: "SQL" },
] as const;

// Custom Code Block spec
export const CodeBlock = createReactBlockSpec(
  {
    type: "codeBlock",
    propSchema: {
      language: {
        default: "plaintext",
      },
      code: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { block, editor } = props;
      const [code, setCode] = useState(block.props.code || "");
      const [language, setLanguage] = useState(
        block.props.language || "plaintext"
      );
      const [highlightedCode, setHighlightedCode] = useState("");
      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const preRef = useRef<HTMLPreElement>(null);
      const isEditable = editor.isEditable;

      // Highlight code whenever code or language changes
      useEffect(() => {
        if (code && language !== "plaintext") {
          try {
            const result = hljs.highlight(code, { language });
            setHighlightedCode(result.value);
          } catch {
            setHighlightedCode(escapeHtml(code));
          }
        } else {
          setHighlightedCode(escapeHtml(code));
        }
      }, [code, language]);

      // Sync scroll between textarea and pre
      const handleScroll = useCallback(() => {
        if (textareaRef.current && preRef.current) {
          preRef.current.scrollTop = textareaRef.current.scrollTop;
          preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
      }, []);

      const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newCode = e.target.value;
        setCode(newCode);
        editor.updateBlock(block, {
          props: { ...block.props, code: newCode },
        });
      };

      const handleLanguageChange = (
        e: React.ChangeEvent<HTMLSelectElement>
      ) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        editor.updateBlock(block, {
          props: { ...block.props, language: newLanguage },
        });
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newCode =
              code.substring(0, start) + "  " + code.substring(end);
            setCode(newCode);
            editor.updateBlock(block, {
              props: { ...block.props, code: newCode },
            });
            // Set cursor position after the tab
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + 2;
            }, 0);
          }
        }
      };

      return (
        <div className="code-block-wrapper my-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-[#1e1e1e] dark:bg-[#0d1117]">
          {/* Header with language selector */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] dark:bg-[#161b22] border-b border-gray-700">
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={!isEditable}
              className="text-xs bg-[#3c3c3c] dark:bg-[#21262d] text-gray-300 rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer disabled:cursor-default"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
              }}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-gray-700"
              title="Copy code"
            >
              Copy
            </button>
          </div>

          {/* Code editor area */}
          <div className="relative font-mono text-sm">
            {/* Highlighted code display (background) */}
            <pre
              ref={preRef}
              className="absolute inset-0 m-0 p-4 overflow-auto pointer-events-none whitespace-pre text-gray-300"
              aria-hidden="true"
            >
              <code
                className={`hljs language-${language}`}
                dangerouslySetInnerHTML={{
                  __html: highlightedCode || "&nbsp;",
                }}
              />
            </pre>

            {/* Textarea for editing (foreground, transparent) */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              disabled={!isEditable}
              placeholder={isEditable ? "Enter code here..." : ""}
              spellCheck={false}
              className="relative w-full min-h-[120px] p-4 bg-transparent text-transparent caret-white resize-y font-mono text-sm leading-relaxed outline-none disabled:cursor-default"
              style={{
                caretColor: "white",
              }}
            />
          </div>
        </div>
      );
    },
  }
);

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
