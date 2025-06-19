"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

const NewNote = () => {
  const [content, setContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);

  // Focus on mount and keep focused
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Sync scroll between all layers
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current && lineNumberRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;

      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
      lineNumberRef.current.scrollTop = scrollTop;
    }
  };

  // Handle content changes
  const handleContentChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setContent(e.target.value);
    setIsModified(true);
    setSaveStatus("idle");
  };
  // Handle paste events to auto-convert image URLs
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const imageUrlRegex =
      /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;

    if (imageUrlRegex.test(pastedText.trim())) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = content;

      const urlParts = pastedText.split("/");
      const filename = urlParts[urlParts.length - 1].split("?")[0];
      const altText = filename.split(".")[0];
      const markdownImage = `![${altText}](${pastedText.trim()})`;

      const newContent =
        currentContent.substring(0, start) +
        markdownImage +
        currentContent.substring(end);

      setContent(newContent);
      setIsModified(true);
      setSaveStatus("idle");

      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd =
            start + markdownImage.length;
          textarea.focus();
        }
      }, 0);
    }
  };

  // Auto-focus when clicking anywhere
  const handleContainerClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Save as .md file (Ctrl+Shift+S)
  const saveAsMarkdownFile = useCallback(() => {
    if (!content.trim()) return;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const firstLine = content.split("\n")[0];
    const title =
      firstLine.replace(/^#+\s*/, "").trim() ||
      `note-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`;
    const sanitizedTitle = title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    link.download = `${sanitizedTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsModified(false);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [content]);

  // Save via API (Ctrl+S)
  const saveToAPI = useCallback(async () => {
    if (!content.trim()) return;

    setSaveStatus("saving");
    try {
      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsModified(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [content]);
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        saveAsMarkdownFile();
      } else if (e.ctrlKey && e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        saveToAPI();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [saveAsMarkdownFile, saveToAPI]);

  const highlightMarkdown = (text: string) => {
    if (!text) return "";

    const lines = text.split("\n");
    const processedLines = lines.map((line: string) => {
      let processedLine = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Headers with retro glow
      if (/^#{1}\s/.test(line)) {
        processedLine = `<span class="text-cyan-300 font-bold text-3xl leading-relaxed tracking-wide drop-shadow-lg">${processedLine}</span>`;
      } else if (/^#{2}\s/.test(line)) {
        processedLine = `<span class="text-purple-300 font-bold text-2xl leading-relaxed tracking-wide drop-shadow-lg">${processedLine}</span>`;
      } else if (/^#{3}\s/.test(line)) {
        processedLine = `<span class="text-pink-300 font-bold text-xl leading-relaxed">${processedLine}</span>`;
      } else if (/^#{4}\s/.test(line)) {
        processedLine = `<span class="text-yellow-300 font-semibold text-lg leading-relaxed">${processedLine}</span>`;
      } else if (/^#{5}\s/.test(line)) {
        processedLine = `<span class="text-green-300 font-medium text-base leading-relaxed">${processedLine}</span>`;
      } else if (/^#{6}\s/.test(line)) {
        processedLine = `<span class="text-blue-300 font-normal text-base leading-relaxed">${processedLine}</span>`;
      }
      // Horizontal Rules with neon effect
      else if (/^[\s]*[-*_]{3,}[\s]*$/.test(line)) {
        processedLine = `<div class="flex items-center justify-center py-6">
          <div class="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50 animate-pulse"></div>
        </div>`;
      }
      // Blockquotes
      else if (/^>\s/.test(line)) {
        processedLine = `<span class="text-orange-300 italic font-medium border-l-4 border-orange-400/50 pl-4 bg-orange-950/10">${processedLine}</span>`;
      }
      // Lists
      else if (/^[\s]*[-*+]\s/.test(line)) {
        processedLine = `<span class="text-emerald-300 font-medium">${processedLine}</span>`;
      } else if (/^[\s]*\d+\.\s/.test(line)) {
        processedLine = `<span class="text-amber-300 font-medium">${processedLine}</span>`;
      } else if (/^[\s]*[-*+]\s\[[ x]\]\s/.test(line)) {
        processedLine = `<span class="text-teal-300 font-medium">${processedLine}</span>`;
      } else {
        processedLine = processedLine
          // Images with retro styling
          .replace(
            /(!\[([^\]]*)\]\(([^)]+)\))/g,
            (match: string, altText: string, imageUrl: string) => {
              return `<div class="text-cyan-300 font-semibold bg-gray-900/50 p-4 rounded-lg border border-cyan-400/30 my-4 block backdrop-blur-sm">
                <div class="text-cyan-200 text-sm mb-3 flex items-center gap-3">
                  <span class="text-xl">📸</span>
                  <span>IMAGE:</span>
                  <span class="text-cyan-300 font-mono text-sm bg-gray-800 px-2 py-1 rounded">${
                    altText || "Image"
                  }</span>
                </div>
                <img src="${imageUrl}" alt="${
                altText || "Image"
              }" class="max-w-full h-auto rounded border border-cyan-400/30 mb-3 shadow-lg" style="max-height: 400px; display: block;" />
                <div class="text-cyan-300/70 text-xs font-mono mt-3 bg-gray-800/50 p-2 rounded">${match}</div>
              </div>`;
            }
          )
          // Code blocks
          .replace(
            /(```[\w]*)/g,
            '<span class="text-green-300 bg-gray-800 px-2 py-1 rounded font-mono border border-green-400/30">$1</span>'
          )
          // Inline code
          .replace(
            /(`[^`\n]+`)/g,
            '<span class="text-lime-300 bg-gray-800 px-2 py-1 rounded-md font-mono border border-lime-400/30">$1</span>'
          )
          // Bold text
          .replace(
            /(\*\*([^*\n]+)\*\*)/g,
            '<span class="text-white font-bold">$1</span>'
          )
          .replace(
            /(\_\_([^_\n]+)\_\_)/g,
            '<span class="text-white font-bold">$1</span>'
          )
          // Italic text
          .replace(
            /(\*([^*\n]+)\*)/g,
            '<span class="text-gray-300 italic font-medium">$1</span>'
          )
          .replace(
            /(\_([^_\n]+)\_)/g,
            '<span class="text-gray-300 italic font-medium">$1</span>'
          )
          // Strikethrough
          .replace(
            /(~~([^~\n]+)~~)/g,
            '<span class="text-gray-500 line-through">$1</span>'
          )
          // Links
          .replace(
            /(\[([^\]]+)\]\(([^)]+)\))/g,
            '<a href="$3" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300 cursor-pointer transition-colors duration-200 font-medium">$1</a>'
          )
          // URLs
          .replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300 cursor-pointer transition-colors duration-200 font-medium">$1</a>'
          )
          // Mentions
          .replace(
            /(@[\w]+)/g,
            '<span class="text-pink-400 font-semibold bg-pink-950/20 px-2 py-0.5 rounded">$1</span>'
          )
          // Hashtags
          .replace(
            /(#[\w]+)/g,
            '<span class="text-purple-400 font-semibold bg-purple-950/20 px-2 py-0.5 rounded">$1</span>'
          );
      }

      return processedLine;
    });

    return processedLines.join("\n");
  };

  // Generate line numbers
  const generateLineNumbers = () => {
    const lines = content.split("\n");
    const totalLines = lines.length;
    const maxDigits = String(totalLines).length;

    return lines.map((_, index) => {
      const lineNum = index + 1;
      const paddedNum = String(lineNum).padStart(maxDigits, " ");

      return (
        <div
          key={index}
          className="text-gray-500 text-sm font-mono pr-3 select-none flex items-center justify-end hover:text-cyan-400 transition-colors duration-200 h-7"
          style={{ minWidth: `${maxDigits * 0.6 + 1.5}rem` }}
        >
          <span className="font-medium">{paddedNum}</span>
        </div>
      );
    });
  };

  // Status indicator
  const StatusIndicator = () => {
    const getStatusColor = () => {
      switch (saveStatus) {
        case "saving":
          return "text-yellow-400";
        case "saved":
          return "text-green-400";
        case "error":
          return "text-red-400";
        default:
          return isModified ? "text-orange-400" : "text-gray-400";
      }
    };

    const getStatusText = () => {
      switch (saveStatus) {
        case "saving":
          return "SAVING";
        case "saved":
          return "SAVED";
        case "error":
          return "ERROR";
        default:
          return isModified ? "UNSAVED" : "READY";
      }
    };

    const getStatusIcon = () => {
      switch (saveStatus) {
        case "saving":
          return "⟳";
        case "saved":
          return "✓";
        case "error":
          return "✗";
        default:
          return isModified ? "●" : "○";
      }
    };

    return (
      <div className="fixed top-4 right-4 flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700 font-mono text-sm z-50">
        <span
          className={`${
            saveStatus === "saving" ? "animate-spin" : ""
          } ${getStatusColor()}`}
        >
          {getStatusIcon()}
        </span>
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
    );
  };

  // Help overlay
  const TerminalHelp = () => (
    <div
      className={`fixed top-4 left-4 bg-black/90 backdrop-blur-md border border-gray-700 rounded-lg p-6 font-mono text-sm z-50 max-w-md transition-all duration-500 ${
        content.trim()
          ? "opacity-0 pointer-events-none transform -translate-y-4"
          : "opacity-100 transform translate-y-0"
      }`}
    >
      <div className="space-y-4">
        <div className="border-b border-gray-700 pb-3">
          <div className="text-cyan-400 font-bold text-lg flex items-center gap-2">
            <span>⚡</span>
            <span>NOTELA</span>
          </div>
          <div className="text-gray-400 text-xs mt-1">
            Retro Modern Note Editor
          </div>
        </div>

        <div>
          <div className="text-purple-400 font-bold mb-2 text-sm">
            KEYBINDINGS:
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="text-green-400 bg-gray-800 px-2 py-1 rounded text-xs">
                Ctrl+S
              </kbd>
              <span className="text-gray-300">save to vault</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="text-blue-400 bg-gray-800 px-2 py-1 rounded text-xs">
                Ctrl+⇧+S
              </kbd>
              <span className="text-gray-300">export .md file</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-pink-400 font-bold mb-2 text-sm">SYNTAX:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <code className="text-cyan-400"># ##</code>{" "}
              <span className="text-gray-400">headers</span>
            </div>
            <div>
              <code className="text-white font-bold">**bold**</code>{" "}
              <span className="text-gray-400">bold</span>
            </div>
            <div>
              <code className="text-gray-300 italic">*italic*</code>{" "}
              <span className="text-gray-400">italic</span>
            </div>
            <div>
              <code className="text-lime-400">`code`</code>{" "}
              <span className="text-gray-400">code</span>
            </div>
            <div>
              <code className="text-blue-400 underline">[link]</code>{" "}
              <span className="text-gray-400">link</span>
            </div>
            <div>
              <code className="text-emerald-400">- item</code>{" "}
              <span className="text-gray-400">list</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <StatusIndicator />
      <TerminalHelp />

      <div
        className="fixed inset-0 bg-gray-900 text-gray-100 font-mono cursor-text overflow-hidden"
        onClick={handleContainerClick}
        style={{
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
        }}
      >
        <div className="relative w-full h-full flex">
          {/* Line Numbers */}
          <div className="border-r border-gray-700 bg-black/30 backdrop-blur-sm flex-shrink-0 overflow-hidden">
            <div
              ref={lineNumberRef}
              className="overflow-y-auto p-2"
              style={{
                height: "100vh",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="flex flex-col pt-4">{generateLineNumbers()}</div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative">
            <div className="relative w-full h-full">
              {/* Syntax Highlighted Background */}
              <div
                ref={highlightRef}
                className="absolute inset-0 p-6 whitespace-pre font-mono text-base leading-7 overflow-auto"
                dangerouslySetInnerHTML={{
                  __html: highlightMarkdown(content),
                }}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  pointerEvents: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "A" || target.tagName === "IMG") {
                    e.stopPropagation();
                    return;
                  }
                  e.preventDefault();
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
              />
              {/* Invisible Textarea */}{" "}
              <textarea
                ref={textareaRef}
                placeholder="Start typing your markdown..."
                value={content}
                onChange={handleContentChange}
                onScroll={handleScroll}
                onPaste={handlePaste}
                className="absolute inset-0 w-full h-full bg-transparent text-transparent border-none outline-none resize-none font-mono text-base leading-7 p-6 placeholder:text-gray-600"
                spellCheck={false}
                style={{
                  caretColor: "transparent",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              />{" "}
              {/* Custom Cursor - Hidden */}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-gray-700 px-6 py-2 font-mono text-xs z-40">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 flex items-center gap-4">
              <span className="text-cyan-400 font-bold">~/notela</span>
              <span>{content.split("\n").length} lines</span>
              <span>{content.length} chars</span>
              {content.split(/\s+/).filter((word) => word.length > 0).length >
                0 && (
                <span>
                  {
                    content.split(/\s+/).filter((word) => word.length > 0)
                      .length
                  }{" "}
                  words
                </span>
              )}
            </div>
            <div className="text-gray-500 font-bold tracking-wider">NOTELA</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewNote;
