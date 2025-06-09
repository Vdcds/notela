"use client";
import React, { useState, useRef, useEffect } from "react";

const NewNote = () => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount and keep focused
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-focus when clicking anywhere
  const handleContainerClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const highlightMarkdown = (text: String) => {
    return (
      text
        // Headers
        .replace(
          /(^#{1,6}\s.*$)/gm,
          '<span class="text-blue-400 font-semibold">$1</span>'
        )
        // Bold
        .replace(
          /(\*\*.*?\*\*)/g,
          '<span class="text-yellow-300 font-bold">$1</span>'
        )
        // Italic
        .replace(
          /(\*(?!\*).*?\*)/g,
          '<span class="text-green-300 italic">$1</span>'
        )
        // Inline code
        .replace(
          /(`[^`]*`)/g,
          '<span class="text-pink-300 bg-gray-800 px-1 rounded font-mono">$1</span>'
        )
        // Code blocks
        .replace(
          /(```[\s\S]*?```)/g,
          '<span class="text-purple-300 bg-gray-900 block p-2 rounded my-2 font-mono">$1</span>'
        )
        // Lists
        .replace(
          /(^[\s]*[-*+]\s.*$)/gm,
          '<span class="text-rose-300">$1</span>'
        )
        // Links
        .replace(
          /(\[.*?\]\(.*?\))/g,
          '<span class="text-cyan-300 underline">$1</span>'
        )
        // Blockquotes
        .replace(
          /(^>\s.*$)/gm,
          '<span class="text-gray-400 italic border-l-2 border-gray-600 pl-2 block">$1</span>'
        )
    );
  };

  return (
    <div
      className="w-screen h-screen bg-black  text-gray-300 font-mono text-xl leading-relaxed cursor-text overflow-hidden"
      onClick={handleContainerClick}
    >
      <div className="relative w-full h-full p-6">
        {/* Syntax Highlighted Background */}
        <div
          className="absolute inset-6 pointer-events-none whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-hidden"
          dangerouslySetInnerHTML={{
            __html: highlightMarkdown(content),
          }}
        />

        {/* Actual Textarea */}
        <textarea
          ref={textareaRef}
          placeholder=""
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full max-h-screen bg-transparent text-transparent caret-green-400 border-none outline-none resize-none font-mono text-sm leading-relaxed relative z-10 p-0"
          spellCheck={false}
          style={{
            caretColor: "#4ade80",
          }}
        />
      </div>
    </div>
  );
};

export default NewNote;
