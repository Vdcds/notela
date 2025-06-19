"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FileText, Terminal } from "lucide-react";

interface VaultFile {
  filename: string;
  title: string;
  lastModified: string;
  size: number;
  preview: string;
}

const Vault = () => {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"normal" | "search" | "command">("normal");
  const [command, setCommand] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null); // Load files from vault
  const loadFiles = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await fetch("/api/vault", {
        headers: {
          "x-vault-password": "5204",
        },
      });

      if (!response.ok) {
        throw new Error(
          `API call failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Loaded files:", data.files); // Debug log
      setFiles(data.files || []);
      setStatusMessage(`Loaded ${data.files?.length || 0} files`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Error loading files:", error);
      setStatusMessage("Error loading files");
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load specific file content
  const loadFileContent = async (filename: string) => {
    try {
      const response = await fetch(`/api/vault/${filename}`, {
        headers: {
          "x-vault-password": "5204",
        },
      });
      const data = await response.json();
      setFileContent(data.content || "");
      setSelectedFile(filename);
      setStatusMessage(`Loaded ${filename}`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Error loading file content:", error);
      setStatusMessage("Error loading file");
    }
  };

  // Delete file
  const deleteFile = useCallback(
    async (filename: string) => {
      try {
        const response = await fetch(`/api/vault/${filename}`, {
          method: "DELETE",
          headers: {
            "x-vault-password": "5204",
          },
        });

        if (response.ok) {
          await loadFiles();
          if (selectedFile === filename) {
            setSelectedFile(null);
            setFileContent("");
          }
          setStatusMessage(`Deleted ${filename}`);
          setTimeout(() => setStatusMessage(""), 3000);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        setStatusMessage("Error deleting file");
      }
    },
    [loadFiles, selectedFile]
  );

  // Download file
  // Filter files based on search term
  const filteredFiles = files.filter(
    (file) =>
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "search") {
        if (e.key === "Escape") {
          setMode("normal");
          setSearchTerm("");
        }
        return;
      }

      // Command mode
      if (mode === "normal" && e.key === ":") {
        e.preventDefault();
        setMode("command");
        setCommand("");
        setTimeout(() => commandInputRef.current?.focus(), 0);
        return;
      }

      // Search mode
      if (mode === "normal" && e.key === "/") {
        e.preventDefault();
        setMode("search");
        setTimeout(() => searchInputRef.current?.focus(), 0);
        return;
      }

      if (mode === "normal") {
        switch (e.key) {
          case "j":
          case "ArrowDown":
            e.preventDefault();
            setSelectedIndex((prev) =>
              Math.min(prev + 1, filteredFiles.length - 1)
            );
            break;
          case "k":
          case "ArrowUp":
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
            break;
          case "Enter":
            e.preventDefault();
            if (filteredFiles[selectedIndex]) {
              loadFileContent(filteredFiles[selectedIndex].filename);
            }
            break;
          case "e":
            e.preventDefault();
            if (filteredFiles[selectedIndex]) {
              const filename = filteredFiles[selectedIndex].filename;
              window.location.href = `/newnote?file=${encodeURIComponent(
                filename
              )}`;
            }
            break;
          case "n":
            e.preventDefault();
            window.location.href = "/newnote";
            break;
          case "r":
            e.preventDefault();
            loadFiles();
            setStatusMessage("Refreshing files...");
            break;
          case "d":
            e.preventDefault();
            if (filteredFiles[selectedIndex]) {
              deleteFile(filteredFiles[selectedIndex].filename);
            }
            break;
          case "q":
            e.preventDefault();
            if (selectedFile) {
              setSelectedFile(null);
              setFileContent("");
              setStatusMessage("Back to file list");
              setTimeout(() => setStatusMessage(""), 2000);
            }
            break;
          case "Escape":
            setMode("normal");
            setCommand("");
            break;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mode, selectedIndex, filteredFiles, selectedFile, loadFiles, deleteFile]);

  // Handle command execution
  const executeCommand = (cmd: string) => {
    const parts = cmd.split(" ");
    const command = parts[0];

    switch (command) {
      case "q":
      case "quit":
        if (selectedFile) {
          setSelectedFile(null);
          setFileContent("");
        }
        break;
      case "help":
        setStatusMessage(
          "Commands: q(uit), help | Keys: j/k(nav), /(search), :(cmd), e(dit in NewNote), n(ew), r(efresh), d(el)"
        );
        setTimeout(() => setStatusMessage(""), 5000);
        break;
      default:
        setStatusMessage(`Unknown command: ${command}`);
        setTimeout(() => setStatusMessage(""), 3000);
    }
    setMode("normal");
    setCommand("");
  };

  useEffect(() => {
    // Only set loading to false initially, don't load files
    setLoading(false);
  }, []);

  // Update selected index when filtered files change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0b";
    const k = 1024;
    const sizes = ["b", "k", "m"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  // Password authentication
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "5204") {
      setIsAuthenticated(true);
      setPasswordError("");
      loadFiles(); // Load files after successful authentication
    } else {
      setPasswordError("Invalid password. Access denied.");
      setPassword("");
      setTimeout(() => setPasswordError(""), 3000);
    }
  };

  // Auto-focus password input on mount
  useEffect(() => {
    if (!isAuthenticated && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] font-mono flex items-center justify-center">
        <div className="text-lg">loading vault...</div>
      </div>
    );
  }

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] font-mono flex items-center justify-center">
        <div className="bg-[#313244] p-8 rounded-lg border border-[#89b4fa] shadow-2xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-[#89b4fa] mb-2">
              VAULT ACCESS
            </h2>
            <p className="text-[#6c7086] text-sm">
              Enter password to access the vault
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                ref={passwordInputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#6c7086] rounded-lg px-4 py-3 focus:outline-none focus:border-[#89b4fa] font-mono"
                autoFocus
              />
            </div>

            {passwordError && (
              <div className="text-[#f38ba8] text-sm text-center bg-[#1e1e2e] p-3 rounded-lg border border-[#f38ba8]/30">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#89b4fa] text-[#1e1e2e] py-3 rounded-lg font-bold hover:bg-[#74c7ec] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#89b4fa]/50"
            >
              UNLOCK VAULT
            </button>
          </form>

          <div className="text-center mt-6 text-[#6c7086] text-xs">
            <div className="flex items-center justify-center gap-2">
              <kbd className="px-2 py-1 bg-[#1e1e2e] rounded text-xs">
                Enter
              </kbd>
              <span>to submit</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] font-mono">
      {/* Header */}
      <div className="border-b border-[#313244] px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-[#89b4fa]" />
            <span className="text-[#89b4fa] font-bold">vault</span>
            <span className="text-[#6c7086] text-sm">({files.length})</span>
          </div>
          <div className="text-[#6c7086] text-sm">
            {mode === "normal" && "NORMAL"}
            {mode === "search" && "SEARCH"}
            {mode === "command" && "COMMAND"}
          </div>
        </div>
      </div>

      {/* Search Bar (when in search mode) */}
      {mode === "search" && (
        <div className="border-b border-[#313244] px-4 py-2 bg-[#181825]">
          <div className="flex items-center gap-2">
            <span className="text-[#f9e2af]">/</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[#cdd6f4] placeholder-[#6c7086]"
              placeholder="search files..."
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Command Bar (when in command mode) */}
      {mode === "command" && (
        <div className="border-b border-[#313244] px-4 py-2 bg-[#181825]">
          <div className="flex items-center gap-2">
            <span className="text-[#f9e2af]">:</span>
            <input
              ref={commandInputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  executeCommand(command);
                } else if (e.key === "Escape") {
                  setMode("normal");
                  setCommand("");
                }
              }}
              className="flex-1 bg-transparent outline-none text-[#cdd6f4] placeholder-[#6c7086]"
              placeholder="enter command..."
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Password Prompt (when not authenticated) */}
      {!isAuthenticated && (
        <div className="flex items-center justify-center h-[calc(100vh-60px)]">
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-[#181825] p-6 rounded-md shadow-md w-80"
          >
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#cdd6f4] mb-1"
              >
                Password
              </label>
              <Input
                ref={passwordInputRef}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1e1e2e] text-[#cdd6f4] placeholder-[#6c7086] focus:ring-2 focus:ring-[#89b4fa] focus:outline-none"
                placeholder="Enter your password"
                autoFocus
              />
              {passwordError && (
                <div className="text-red-500 text-xs mt-1">{passwordError}</div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#89b4fa] text-[#1e1e2e] hover:bg-[#6c83b2] transition-colors"
            >
              Unlock
            </Button>
          </form>
        </div>
      )}

      {isAuthenticated && (
        <div className="flex h-[calc(100vh-60px)]">
          {/* File List */}
          <div className="w-80 border-r border-[#313244] overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <div className="p-4 text-center text-[#6c7086]">
                <div className="text-4xl mb-2">∅</div>
                <div className="text-sm">
                  {searchTerm ? "no matches" : "no files"}
                </div>
              </div>
            ) : (
              <div>
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.filename}
                    className={`px-4 py-3 border-b border-[#313244] cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? "bg-[#313244] border-l-2 border-l-[#89b4fa]"
                        : "hover:bg-[#1e1e2e]"
                    } ${
                      selectedFile === file.filename
                        ? "bg-[#313244] text-[#89b4fa]"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedIndex(index);
                      loadFileContent(file.filename);
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium text-sm truncate pr-2">
                        {file.title}
                      </div>
                      <div className="text-xs text-[#6c7086] flex gap-2 shrink-0">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.lastModified)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-[#6c7086] line-clamp-2 leading-relaxed">
                      {file.preview}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Content */}
          <div className="flex-1 flex flex-col">
            {selectedFile ? (
              <>
                {/* File Header */}
                <div className="border-b border-[#313244] px-4 py-2 bg-[#181825]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#a6e3a1]" />
                      <span className="text-[#cdd6f4] font-medium">
                        {selectedFile}
                      </span>
                    </div>
                    <div className="text-xs text-[#6c7086]">
                      e to edit in NewNote, q to quit
                    </div>
                  </div>
                </div>

                {/* File Content */}
                <div className="flex-1 overflow-hidden">
                  <div className="w-full h-full overflow-auto p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#cdd6f4]">
                      {fileContent}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-[#6c7086]">
                <div>
                  <div className="text-6xl mb-4">📂</div>
                  <div className="text-lg mb-2">select a file</div>
                  <div className="text-sm space-y-1">
                    <div>
                      <kbd className="px-1 text-xs bg-[#313244] rounded">
                        j/k
                      </kbd>{" "}
                      navigate
                    </div>
                    <div>
                      <kbd className="px-1 text-xs bg-[#313244] rounded">
                        enter
                      </kbd>{" "}
                      open file
                    </div>
                    <div>
                      <kbd className="px-1 text-xs bg-[#313244] rounded">/</kbd>{" "}
                      search
                    </div>
                    <div>
                      <kbd className="px-1 text-xs bg-[#313244] rounded">:</kbd>{" "}
                      command
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="border-t border-[#313244] px-4 py-1 bg-[#181825] text-xs text-[#6c7086] flex justify-between">
        <div>{statusMessage || "ready"}</div>
        <div className="flex gap-4">
          <span>files: {filteredFiles.length}</span>
          {selectedFile && <span>selected: {selectedFile}</span>}
        </div>
      </div>
    </div>
  );
};

export default Vault;
