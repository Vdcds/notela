"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

const NewNote = () => {
  const [content, setContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null); // Load file content on mount if filename is provided via URL params
  useEffect(() => {
    const loadFromParams = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const filename = urlParams.get("file");

      if (filename) {
        // Check if trying to load from vault, require password
        const password = prompt("Enter vault password:");
        if (password !== "5204") {
          alert("Invalid password. Access denied.");
          window.location.href = "/";
          return;
        }

        try {
          const response = await fetch(`/api/vault/${filename}`);
          const data = await response.json();
          setContent(data.content || "");
          setCurrentFilename(filename);
          setIsModified(false);
          setSaveStatus("idle");
        } catch (error) {
          console.error("Error loading file:", error);
          setSaveStatus("error");
        }
      }
    };

    loadFromParams();
  }, []);

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

  // Save via API (Ctrl+S) - Now saves to vault
  const saveToAPI = useCallback(async () => {
    if (!content.trim()) return;

    setSaveStatus("saving");
    try {
      let filename;
      let method;
      let url;

      if (currentFilename) {
        // Editing existing file
        filename = currentFilename;
        method = "PUT";
        url = `/api/vault/${currentFilename}`;
      } else {
        // Creating new file
        const firstLine = content.split("\n")[0];
        const title =
          firstLine.replace(/^#+\s*/, "").trim() ||
          `note-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`;
        const sanitizedTitle = title
          .replace(/[^a-zA-Z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase();

        filename = `${sanitizedTitle}.md`;
        method = "POST";
        url = "/api/vault";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          ...(method === "POST" && { filename }),
        }),
      });

      if (response.ok) {
        // If it was a new file, set the current filename
        if (method === "POST" && filename) {
          setCurrentFilename(filename);
        }
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

      // Headers (H1-H6) - Catppuccin colors with bigger sizes
      if (/^#{1}\s/.test(line)) {
        processedLine = `<span class="text-pink-300 font-black text-3xl leading-10 tracking-wide">${processedLine}</span>`;
      } else if (/^#{2}\s/.test(line)) {
        processedLine = `<span class="text-mauve-300 font-extrabold text-2xl leading-9 tracking-wide">${processedLine}</span>`;
      } else if (/^#{3}\s/.test(line)) {
        processedLine = `<span class="text-blue-300 font-bold text-xl leading-8 tracking-normal">${processedLine}</span>`;
      } else if (/^#{4}\s/.test(line)) {
        processedLine = `<span class="text-sapphire-300 font-semibold text-lg leading-7">${processedLine}</span>`;
      } else if (/^#{5}\s/.test(line)) {
        processedLine = `<span class="text-sky-300 font-medium text-base leading-7">${processedLine}</span>`;
      } else if (/^#{6}\s/.test(line)) {
        processedLine = `<span class="text-teal-300 font-normal text-base leading-7">${processedLine}</span>`;
      }
      // Horizontal Rules - Enhanced with neon effect
      else if (/^[\s]*[-*_]{3,}[\s]*$/.test(line)) {
        processedLine = `<div class="relative block text-center leading-8 my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-lg shadow-pink-400/50"></div>
          </div>
          <span class="relative bg-gray-900 px-4 text-xs text-pink-400/70 font-mono">${processedLine}</span>
        </div>`;
      }
      // Blockquotes - Catppuccin lavender
      else if (/^>\s/.test(line)) {
        processedLine = `<span class="text-lavender-300 italic font-medium border-l-4 border-lavender-400/50 pl-4 bg-lavender-950/20">${processedLine}</span>`;
      }
      // Unordered lists - Catppuccin peach
      else if (/^[\s]*[-*+]\s/.test(line)) {
        processedLine = `<span class="text-peach-300 font-medium text-lg">${processedLine}</span>`;
      }
      // Ordered lists - Catppuccin yellow
      else if (/^[\s]*\d+\.\s/.test(line)) {
        processedLine = `<span class="text-yellow-300 font-medium text-lg">${processedLine}</span>`;
      }
      // Task lists - Catppuccin green
      else if (/^[\s]*[-*+]\s\[[ x]\]\s/.test(line)) {
        processedLine = `<span class="text-green-300 font-medium text-lg">${processedLine}</span>`;
      } else {
        // Apply inline formatting only to non-header lines
        processedLine = processedLine
          // Images - Enhanced with Catppuccin blue theme
          .replace(
            /(!\[([^\]]*)\]\(([^)]+)\))/g,
            (match, fullMatch, altText, imageUrl) => {
              return `<div class="text-blue-300 font-semibold bg-blue-950/30 p-4 rounded-xl border-l-4 border-blue-400 my-4 block shadow-lg">
                <div class="text-blue-200 text-sm mb-3 flex items-center gap-3">
                  <span class="text-xl">🖼️</span>
                  <span>IMAGE:</span>
                  <span class="text-blue-300 font-mono text-sm bg-blue-900/30 px-2 py-1 rounded">${
                    altText || "Image"
                  }</span>
                </div>
                <img src="${imageUrl}" alt="${
                altText || "Image"
              }" class="max-w-full h-auto rounded-lg border-2 border-blue-400/30 mb-3 shadow-xl" style="max-height: 400px; display: block;" onload="this.style.opacity='1'" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />
                <div class="text-red-400 text-sm hidden bg-red-950/30 p-3 rounded-lg">❌ Failed to load: ${imageUrl}</div>
                <div class="text-blue-300/70 text-xs font-mono mt-3 bg-blue-900/20 p-2 rounded">${fullMatch}</div>
              </div>`;
            }
          )
          // Code blocks - Catppuccin surface colors
          .replace(
            /(```[\w]*)/g,
            '<span class="text-mauve-200 bg-surface-800 px-2 py-1 rounded font-mono text-lg border border-mauve-600/30">$1</span>'
          )
          // Inline code - Enhanced
          .replace(
            /(`[^`\n]+`)/g,
            '<span class="text-green-300 bg-surface-800 px-2 py-1 rounded-md font-mono text-base border border-green-600/30 shadow-sm">$1</span>'
          )
          // Bold text - Catppuccin text
          .replace(
            /(\*\*([^*\n]+)\*\*)/g,
            '<span class="text-text-100 font-black text-lg">$1</span>'
          )
          .replace(
            /(\_\_([^_\n]+)\_\_)/g,
            '<span class="text-text-100 font-black text-lg">$1</span>'
          )
          // Italic text - Catppuccin subtext
          .replace(
            /(\*([^*\n]+)\*)/g,
            '<span class="text-subtext-300 italic font-medium text-lg">$1</span>'
          )
          .replace(
            /(\_([^_\n]+)\_)/g,
            '<span class="text-subtext-300 italic font-medium text-lg">$1</span>'
          )
          // Strikethrough - Catppuccin overlay
          .replace(
            /(~~([^~\n]+)~~)/g,
            '<span class="text-overlay-400 line-through font-medium">$1</span>'
          )
          // Links - Catppuccin sapphire with hover effects
          .replace(
            /(\[([^\]]+)\]\(([^)]+)\))/g,
            '<a href="$3" target="_blank" rel="noopener noreferrer" class="text-sapphire-300 underline hover:text-sapphire-200 cursor-pointer transition-all duration-200 hover:shadow-sm hover:shadow-sapphire-400/30 font-medium text-lg">$1</a>'
          )
          // URLs - Catppuccin blue with glow effect
          .replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-300 underline hover:text-blue-200 cursor-pointer transition-all duration-200 hover:shadow-sm hover:shadow-blue-400/30 font-medium text-lg">$1</a>'
          )
          // Mentions - Catppuccin pink
          .replace(
            /(@[\w]+)/g,
            '<span class="text-pink-300 font-semibold bg-pink-950/20 px-2 py-0.5 rounded text-lg">$1</span>'
          )
          // Hashtags - Catppuccin mauve
          .replace(
            /(#[\w]+)/g,
            '<span class="text-mauve-300 font-semibold bg-mauve-950/20 px-2 py-0.5 rounded text-lg">$1</span>'
          );
      }

      return processedLine;
    });

    return processedLines.join("\n");
  };

  // Generate vim-style line numbers with Catppuccin colors
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
          className="text-overlay-400 text-base font-mono pr-3 select-none flex items-center justify-end hover:text-pink-400 transition-colors duration-200 h-8"
          style={{ minWidth: `${maxDigits * 0.7 + 2}rem` }}
        >
          <span className="text-pink-400/60 mr-2 text-lg">│</span>
          <span className="font-medium">{paddedNum}</span>
        </div>
      );
    });
  };

  // Status indicator component with Catppuccin theme
  const StatusIndicator = () => {
    const getStatusColor = () => {
      switch (saveStatus) {
        case "saving":
          return "text-yellow-300";
        case "saved":
          return "text-green-300";
        case "error":
          return "text-red-300";
        default:
          return isModified ? "text-peach-300" : "text-overlay-400";
      }
    };

    const getStatusText = () => {
      switch (saveStatus) {
        case "saving":
          return "SAVING...";
        case "saved":
          return "SAVED ✨";
        case "error":
          return "ERROR ❌";
        default:
          return isModified ? "MODIFIED ●" : "READY TO JOT 🎵";
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

    const getStatusBg = () => {
      switch (saveStatus) {
        case "saving":
          return "bg-yellow-950/40 border-yellow-400/40";
        case "saved":
          return "bg-green-950/40 border-green-400/40";
        case "error":
          return "bg-red-950/40 border-red-400/40";
        default:
          return isModified
            ? "bg-peach-950/40 border-peach-400/40"
            : "bg-surface-700/60 border-overlay-400/30";
      }
    };

    return (
      <div
        className={`fixed top-0 right-0 px-6 py-4 ${getStatusBg()} border-l-2 border-b-2 font-mono text-base z-40 backdrop-blur-xl rounded-bl-2xl shadow-xl`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-xl ${
              saveStatus === "saving" ? "animate-spin" : ""
            } ${getStatusColor()}`}
          >
            {getStatusIcon()}
          </span>
          <span className={`${getStatusColor()} font-semibold text-lg`}>
            {getStatusText()}
          </span>
        </div>
      </div>
    );
  };

  // Terminal-style help overlay with Catppuccin theme
  const TerminalHelp = () => (
    <div
      className={`fixed top-0 left-0 px-8 py-6 bg-surface-800/95 border-r-2 border-b-2 border-pink-400/40 font-mono text-base z-40 transition-all duration-500 max-w-xl backdrop-blur-xl rounded-br-2xl shadow-2xl ${
        content.trim()
          ? "opacity-0 pointer-events-none transform -translate-x-8"
          : "opacity-100 transform translate-x-0"
      }`}
    >
      <div className="space-y-6">
        {/* Terminal Header */}
        <div className="border-b border-pink-400/30 pb-4">
          <div className="text-pink-300 font-black text-2xl flex items-center gap-3">
            <span className="text-3xl">🤔</span>
            <span>NOTELA</span>
            <span className="text-overlay-400 text-sm font-normal bg-surface-700 px-2 py-1 rounded">
              v1.0
            </span>
          </div>
          <div className="text-subtext-400 text-base mt-2 font-medium">
            ~ Just Because I won't pay for notion. ~
          </div>
        </div>

        {/* Keybindings */}
        <div>
          <div className="font-bold mb-4 text-mauve-300 text-lg flex items-center gap-2">
            <span>⌨️</span>
            <span>KEYBINDINGS:</span>
          </div>
          <div className="space-y-2 text-base">
            <div className="flex items-center gap-3">
              <kbd className="text-green-300 font-mono bg-green-950/30 px-3 py-2 rounded-lg border border-green-400/30 font-semibold">
                Ctrl+S
              </kbd>
              <span className="text-text-200 font-medium">save to vault</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="text-blue-300 font-mono bg-blue-950/30 px-3 py-2 rounded-lg border border-blue-400/30 font-semibold">
                Ctrl+⇧+S
              </kbd>
              <span className="text-text-200 font-medium">export .md file</span>
            </div>
          </div>
        </div>

        {/* Syntax Guide */}
        <div>
          <div className="text-sapphire-300 font-bold mb-4 text-lg flex items-center gap-2">
            <span>📝</span>
            <span>SYNTAX GUIDE:</span>
          </div>
          <div className="grid grid-cols-1 gap-y-3 text-base">
            <div className="flex items-center">
              <code className="text-pink-300 font-mono w-20 bg-surface-700/50 px-2 py-1 rounded-lg font-semibold">
                # ##
              </code>
              <span className="text-text-200 ml-3 font-medium">headers</span>
            </div>
            <div className="flex items-center">
              <code className="text-text-100 font-mono w-20 bg-surface-700/50 px-2 py-1 rounded-lg font-bold">
                **text**
              </code>
              <span className="text-text-200 ml-3 font-medium">bold</span>
            </div>
            <div className="flex items-center">
              <code className="text-subtext-300 font-mono w-20 bg-surface-700/50 px-2 py-1 rounded-lg italic">
                *text*
              </code>
              <span className="text-text-200 ml-3 font-medium">italic</span>
            </div>
            <div className="flex items-center">
              <code className="text-green-300 font-mono w-20 bg-surface-700/50 px-2 py-1 rounded-lg">
                `code`
              </code>
              <span className="text-text-200 ml-3 font-medium">
                inline code
              </span>
            </div>
            <div className="flex items-center">
              <code className="text-sapphire-300 font-mono w-20 bg-surface-700/50 px-2 py-1 rounded-lg underline">
                [link]
              </code>
              <span className="text-text-200 ml-3 font-medium">hyperlink</span>
            </div>
            <div className="flex items-center">
              <code className="text-peach-300 font-mono w-20 bg-surface-700/50 px-2 py-1 rounded-lg">
                - item
              </code>
              <span className="text-text-200 ml-3 font-medium">
                bullet list
              </span>
            </div>
            <div className="flex items-center">
              <code className="text-lavender-300 font-mono w-20 bg-surface-700/50 px-2 py-1 rounded-lg italic">
                &gt; text
              </code>
              <span className="text-text-200 ml-3 font-medium">blockquote</span>
            </div>
            <div className="flex items-center">
              <code className="text-pink-400 font-mono w-20 bg-surface-700/50 px-2 py-1 rounded-lg">
                ---
              </code>
              <span className="text-text-200 ml-3 font-medium">separator</span>
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
        className="fixed inset-0 bg-base text-text font-mono cursor-text overflow-hidden z-0"
        onClick={handleContainerClick}
        style={{
          background: "linear-gradient(135deg, #1e1e2e 0%, #181825 100%)",
        }}
      >
        <div className="relative w-full h-full flex border-t-2 border-pink-400/30 pb-28">
          {/* Vim-style Line Numbers */}
          <div
            className="border-r-2 border-pink-400/30 px-4 py-6 flex-shrink-0 overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(30, 30, 46, 0.8) 0%, rgba(24, 24, 37, 0.9) 100%)",
            }}
          >
            <div
              ref={lineNumberRef}
              className="overflow-y-auto scrollbar-hide"
              style={{ height: "calc(100vh - 10rem)" }}
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
                className="markdown-editor absolute inset-0 p-8 pb-28 whitespace-pre font-mono text-lg leading-8 overflow-auto scrollbar-hide"
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
                placeholder="Start crafting your markdown masterpiece... ✨"
                value={content}
                onChange={handleContentChange}
                onScroll={handleScroll}
                onPaste={handlePaste}
                className="absolute inset-0 w-full h-full bg-transparent text-transparent border-none outline-none resize-none font-mono text-lg leading-8 p-8 pb-28 placeholder:text-overlay-400/60 scrollbar-hide"
                spellCheck={false}
                style={{
                  caretColor: "#f5c2e7",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              />
            </div>
          </div>
        </div>

        {/* Terminal Footer with Catppuccin Branding */}
        <div
          className="fixed bottom-0 left-0 right-0 border-t-2 border-pink-400/30 px-6 py-4 font-mono text-base z-40 shadow-2xl"
          style={{
            background:
              "linear-gradient(90deg, rgba(30, 30, 46, 0.95) 0%, rgba(24, 24, 37, 0.95) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex justify-between items-center">
            <div className="text-subtext-400 flex items-center gap-6">
              <span className="text-pink-300 font-semibold text-lg flex items-center gap-2">
                <span>🌸</span>
                <span>~/notela</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-pink-400/60">│</span>
                <span className="font-medium">
                  {content.split("\n").length} lines
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-pink-400/60">│</span>
                <span className="font-medium">{content.length} chars</span>
              </div>
              {content.split(/\s+/).filter((word) => word.length > 0).length >
                0 && (
                <div className="flex items-center gap-2">
                  <span className="text-pink-400/60">│</span>
                  <span className="font-medium">
                    {
                      content.split(/\s+/).filter((word) => word.length > 0)
                        .length
                    }{" "}
                    words
                  </span>
                </div>
              )}
            </div>
            <div className="text-pink-300 font-black tracking-wider text-xl flex items-center gap-2">
              <span>NOTELA</span>
              <span className="text-mauve-400">⟡</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewNote;
