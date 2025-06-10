"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

const NewNote = () => {
  const [content, setContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
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
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsModified(true);
    setSaveStatus("idle");
  };

  // Handle paste events to auto-convert image URLs
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");

    // Check if pasted text is an image URL
    const imageUrlRegex =
      /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
    // Check if pasted text is a regular URL
    const urlRegex = /^https?:\/\/[^\s]+$/i;

    if (imageUrlRegex.test(pastedText.trim())) {
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = content;

      // Extract filename for alt text
      const urlParts = pastedText.split("/");
      const filename = urlParts[urlParts.length - 1].split("?")[0];
      const altText = filename.split(".")[0];

      // Create markdown image syntax
      const markdownImage = `![${altText}](${pastedText.trim()})`;

      // Insert the markdown image at cursor position
      const newContent =
        currentContent.substring(0, start) +
        markdownImage +
        currentContent.substring(end);

      setContent(newContent);
      setIsModified(true);
      setSaveStatus("idle");

      // Set cursor position after the inserted text
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd =
            start + markdownImage.length;
          textarea.focus();
        }
      }, 0);
    } else if (urlRegex.test(pastedText.trim())) {
      // For regular URLs, just paste them as-is (they'll be auto-linked)
      // Let the default paste behavior handle this
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

    // Generate filename from first line or use timestamp
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
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsModified(false);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        throw new Error("Failed to save");
      }
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

    // Process text line by line to maintain exact spacing and line breaks
    const lines = text.split("\n");
    const processedLines = lines.map((line) => {
      let processedLine = line
        // Escape HTML entities first
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Headers (H1-H6) - Subtle size and color variations
      if (/^#{1}\s/.test(line)) {
        processedLine = `<span class="text-orange-200 font-extrabold text-lg leading-6">${processedLine}</span>`;
      } else if (/^#{2}\s/.test(line)) {
        processedLine = `<span class="text-orange-300 font-bold text-base leading-6">${processedLine}</span>`;
      } else if (/^#{3}\s/.test(line)) {
        processedLine = `<span class="text-orange-400 font-semibold text-base leading-6">${processedLine}</span>`;
      } else if (/^#{4}\s/.test(line)) {
        processedLine = `<span class="text-orange-400 font-medium text-base leading-6">${processedLine}</span>`;
      } else if (/^#{5}\s/.test(line)) {
        processedLine = `<span class="text-orange-500 font-medium text-sm leading-6">${processedLine}</span>`;
      } else if (/^#{6}\s/.test(line)) {
        processedLine = `<span class="text-orange-600 font-normal text-sm leading-6">${processedLine}</span>`;
      }
      // Horizontal Rules - Enhanced with visual line
      else if (/^[\s]*[-*_]{3,}[\s]*$/.test(line)) {
        processedLine = `<span class="text-orange-600/40 relative block text-center leading-6"><span class="absolute inset-0 flex items-center"><span class="w-full border-t border-orange-600/60"></span></span><span class="relative bg-black px-2 text-xs">${processedLine}</span></span>`;
      }
      // Blockquotes
      else if (/^>\s/.test(line)) {
        processedLine = `<span class="text-gray-400 italic">${processedLine}</span>`;
      }
      // Unordered lists
      else if (/^[\s]*[-*+]\s/.test(line)) {
        processedLine = `<span class="text-orange-200">${processedLine}</span>`;
      }
      // Ordered lists
      else if (/^[\s]*\d+\.\s/.test(line)) {
        processedLine = `<span class="text-orange-200">${processedLine}</span>`;
      }
      // Task lists
      else if (/^[\s]*[-*+]\s\[[ x]\]\s/.test(line)) {
        processedLine = `<span class="text-orange-300">${processedLine}</span>`;
      } else {
        // Apply inline formatting only to non-header lines
        processedLine = processedLine
          // Images - Enhanced with actual image preview
          .replace(
            /(!\[([^\]]*)\]\(([^)]+)\))/g,
            (match, fullMatch, altText, imageUrl) => {
              return `<div class="text-indigo-300 font-medium bg-indigo-900/20 p-3 rounded border-l-4 border-indigo-400 my-2 block">
                <div class="text-indigo-200 text-xs mb-2 flex items-center gap-2">
                  <span>🖼️ IMAGE:</span>
                  <span class="text-indigo-300 font-mono text-xs">${
                    altText || "Image"
                  }</span>
                </div>
                <img src="${imageUrl}" alt="${
                altText || "Image"
              }" class="max-w-full h-auto rounded border border-indigo-400/30 mb-2 shadow-lg" style="max-height: 300px; display: block;" onload="this.style.opacity='1'" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />
                <div class="text-red-400 text-xs hidden bg-red-900/20 p-2 rounded">❌ Failed to load: ${imageUrl}</div>
                <div class="text-indigo-300 text-xs font-mono mt-2 opacity-70">${fullMatch}</div>
              </div>`;
            }
          )
          // Code blocks (preserve exactly)
          .replace(
            /(```[\w]*)/g,
            '<span class="text-orange-200 bg-gray-900">$1</span>'
          )
          // Inline code
          .replace(
            /(`[^`\n]+`)/g,
            '<span class="text-orange-200 bg-gray-800 px-1 rounded font-mono">$1</span>'
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
            '<span class="text-orange-200 italic">$1</span>'
          )
          .replace(
            /(\_([^_\n]+)\_)/g,
            '<span class="text-orange-200 italic">$1</span>'
          )
          // Strikethrough
          .replace(
            /(~~([^~\n]+)~~)/g,
            '<span class="text-gray-500 line-through">$1</span>'
          )
          // Links - Make them clickable
          .replace(
            /(\[([^\]]+)\]\(([^)]+)\))/g,
            '<a href="$3" target="_blank" rel="noopener noreferrer" class="text-orange-300 underline hover:text-orange-200 cursor-pointer transition-colors">$1</a>'
          )
          // URLs - Make them clickable
          .replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-orange-300 underline hover:text-orange-200 cursor-pointer transition-colors">$1</a>'
          )
          // Mentions and hashtags
          .replace(
            /(@[\w]+)/g,
            '<span class="text-orange-300 font-medium">$1</span>'
          )
          .replace(
            /(#[\w]+)/g,
            '<span class="text-orange-400 font-medium">$1</span>'
          );
      }

      return processedLine;
    });

    return processedLines.join("\n");
  };

  // Generate vim-style line numbers
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
          className="text-yellow-400 text-sm font-mono pr-2 select-none flex items-center justify-end hover:text-orange-500/90 transition-colors h-6"
          style={{ minWidth: `${maxDigits * 0.6 + 2}rem` }}
        >
          <span className="text-pink-300 mr-1">│|</span>
          {paddedNum}
        </div>
      );
    });
  };

  // Status indicator component
  const StatusIndicator = () => {
    const getStatusColor = () => {
      switch (saveStatus) {
        case "saving":
          return "text-orange-300";
        case "saved":
          return "text-orange-200";
        case "error":
          return "text-red-400";
        default:
          return isModified ? "text-orange-200" : "text-gray-500";
      }
    };

    const getStatusText = () => {
      switch (saveStatus) {
        case "saving":
          return "SAVING...";
        case "saved":
          return "SAVED";
        case "error":
          return "ERROR";
        default:
          return isModified ? "MODIFIED" : "JOT DOWN SENSIE";
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
      <div className="fixed top-0 right-0 px-6 py-4 bg-black border-l-2 border-b-3 shadow-amber-100  border-orange-600/50 font-mono text-sm z-40 backdrop-blur-2xl rounded-bl-lg">
        <div className="flex items-center gap-2">
          <span
            className={`${
              saveStatus === "saving" ? "animate-pulse" : ""
            } ${getStatusColor()}`}
          >
            {getStatusIcon()}
          </span>
          <span className={getStatusColor()}>{getStatusText()}</span>
        </div>
      </div>
    );
  };

  // Terminal-style help overlay
  const TerminalHelp = () => (
    <div
      className={`fixed top-0 left-0 px-6 py-4 bg-black border-r-2 border-b-2 border-orange-600/50 font-mono text-sm z-40 transition-all duration-500 max-w-lg backdrop-blur-sm ${
        content.trim()
          ? "opacity-0 pointer-events-none transform -translate-x-4"
          : "opacity-100 transform translate-x-0"
      }`}
    >
      <div className="space-y-4">
        {/* Terminal Header */}
        <div className="border-b border-orange-600/30 pb-2">
          <div className="text-orange-300 font-bold flex items-center gap-2">
            <span>NOTELA</span>
            <span className="text-orange-600/60 text-xs">v1.0</span>
          </div>
          <div className="text-orange-600/70 text-xs">
            ~Just in Case if y'all got Dimensia.~
          </div>
        </div>

        {/* Keybindings */}
        <div>
          <div className="font-semibold mb-2 text-orange-200">KEYBINDINGS:</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="text-orange-400 font-mono bg-orange-900/20 px-1.5 py-0.5 rounded border border-orange-600/30">
                Ctrl+S
              </kbd>
              <span className="text-gray-300">save to server</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="text-orange-400 font-mono bg-orange-900/20 px-1.5 py-0.5 rounded border border-orange-600/30">
                Ctrl+⇧+S
              </kbd>
              <span className="text-gray-300">export .md file</span>
            </div>
          </div>
        </div>

        {/* Syntax Guide */}
        <div>
          <div className="text-orange-200 font-semibold mb-2">
            SYNTAX GUIDE:
          </div>
          <div className="grid grid-cols-1 gap-y-1 text-xs">
            <div className="flex items-center">
              <code className="text-orange-300 font-mono w-16 bg-gray-900/30 px-1 rounded">
                # ##
              </code>
              <span className="text-gray-300 ml-2">headers</span>
            </div>
            <div className="flex items-center">
              <code className="text-white font-mono w-16 bg-gray-900/30 px-1 rounded">
                **text**
              </code>
              <span className="text-gray-300 ml-2">bold</span>
            </div>
            <div className="flex items-center">
              <code className="text-orange-200 font-mono w-16 bg-gray-900/30 px-1 rounded">
                *text*
              </code>
              <span className="text-gray-300 ml-2">italic</span>
            </div>
            <div className="flex items-center">
              <code className="text-orange-200 font-mono w-16 bg-gray-900/30 px-1 rounded">
                `code`
              </code>
              <span className="text-gray-300 ml-2">inline code</span>
            </div>
            <div className="flex items-center">
              <code className="text-orange-300 font-mono w-16 bg-gray-900/30 px-1 rounded">
                [link]
              </code>
              <span className="text-gray-300 ml-2">hyperlink</span>
            </div>
            <div className="flex items-center">
              <code className="text-orange-200 font-mono w-16 bg-gray-900/30 px-1 rounded">
                - item
              </code>
              <span className="text-gray-300 ml-2">bullet list</span>
            </div>
            <div className="flex items-center">
              <code className="text-gray-400 font-mono w-16 bg-gray-900/30 px-1 rounded">
                &gt; text
              </code>
              <span className="text-gray-300 ml-2">blockquote</span>
            </div>
            <div className="flex items-center">
              <code className="text-gray-500 font-mono w-16 bg-gray-900/30 px-1 rounded">
                ---
              </code>
              <span className="text-gray-300 ml-2">separator</span>
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
        className="fixed inset-0 bg-black text-orange-100 font-mono cursor-text overflow-hidden z-0"
        onClick={handleContainerClick}
      >
        <div className="relative w-full h-full flex border-t-2 border-orange-600/50 pb-24">
          {/* Vim-style Line Numbers */}
          <div className="bg-black border-r-2 border-orange-600/50 px-3 py-4 flex-shrink-0 overflow-hidden">
            <div
              ref={lineNumberRef}
              className="overflow-y-auto scrollbar-hide"
              style={{ height: "calc(100vh - 7rem)" }}
            >
              <div className="flex flex-col">{generateLineNumbers()}</div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative">
            <div className="relative w-full h-full">
              {/* Syntax Highlighted Background */}
              <div
                ref={highlightRef}
                className="markdown-editor absolute inset-0 p-6 pb-24 whitespace-pre font-mono text-base leading-6 overflow-auto scrollbar-hide"
                dangerouslySetInnerHTML={{
                  __html: highlightMarkdown(content),
                }}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  pointerEvents: "auto",
                }}
                onClick={(e) => {
                  // Only allow clicks on links and images, block everything else
                  const target = e.target as HTMLElement;
                  if (target.tagName === "A" || target.tagName === "IMG") {
                    e.stopPropagation();
                    return;
                  }
                  // For any other element, focus the textarea
                  e.preventDefault();
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
              />

              {/* Actual Textarea with Custom Caret */}
              <textarea
                ref={textareaRef}
                placeholder="Start typing your markdown story..."
                value={content}
                onChange={handleContentChange}
                onScroll={handleScroll}
                onPaste={handlePaste}
                className="absolute inset-0 w-full h-full bg-transparent text-transparent border-none outline-none resize-none font-mono text-base leading-6 p-6 pb-24 placeholder:text-orange-600/40 scrollbar-hide"
                spellCheck={false}
                style={{
                  caretColor: "#fb923c",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              />
            </div>
          </div>
        </div>

        {/* Terminal Footer with Notela Branding */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-orange-600/50 px-4 py-2 font-mono text-xs z-40">
          <div className="flex justify-between items-center">
            <div className="text-orange-600/70 flex items-center gap-4">
              <span className="text-orange-400">~/notela</span>
              <div className="flex items-center gap-2">
                <span className="text-orange-600/50">│</span>
                <span>{content.split("\n").length} lines</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600/50">│</span>
                <span>{content.length} chars</span>
              </div>
              {content.split(/\s+/).filter((word) => word.length > 0).length >
                0 && (
                <div className="flex items-center gap-2">
                  <span className="text-orange-600/50">│</span>
                  <span>
                    {
                      content.split(/\s+/).filter((word) => word.length > 0)
                        .length
                    }{" "}
                    words
                  </span>
                </div>
              )}
            </div>
            <div className="text-orange-300 font-semibold tracking-wider">
              NOTELA
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewNote;
