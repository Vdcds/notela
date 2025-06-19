"use client";
import React, { useState, useEffect, useCallback } from "react";

interface DatabaseStatus {
  database: string;
  orm: string;
  status: string;
  stats?: {
    notes: number;
    tasks: {
      total: number;
      completed: number;
      pending: number;
    };
    tags: number;
  };
  error?: string;
}

const Homepage = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Initialize time on client side only
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch database status
  useEffect(() => {
    const fetchDbStatus = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        setDbStatus(data);
      } catch (error) {
        console.error("Failed to fetch database status:", error);
        setDbStatus({
          database: "SQLite",
          orm: "Prisma",
          status: "error",
          error: "Connection failed",
        });
      }
    };

    fetchDbStatus();
    const interval = setInterval(fetchDbStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const navigateTo = (path: string): void => {
    window.location.href = path;
  };

  const handleKeyPress = useCallback((e: { key: string }) => {
    if (e.key === "1") navigateTo("/newnote");
    if (e.key === "2") navigateTo("/shitlist");
    if (e.key === "3") navigateTo("/vault");
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
  return (
    <div className="h-screen bg-black text-green-400 font-mono flex flex-col justify-center items-center w-full ">
      {" "}
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-4xl font-bold mb-4 text-cyan-400">
          ╔═══════════════╗
        </div>
        <div className="text-4xl font-bold mb-2 text-cyan-400">║ NOTELA ║</div>
        <div className="text-4xl font-bold mb-4 text-cyan-400">
          ╚═══════════════╝
        </div>
        <div className="text-sm text-gray-500 mt-4">
          {currentTime ? formatTime(currentTime) : "--:--"}
        </div>

        {/* Database Status */}
        <div className="mt-6 text-xs">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus?.status === "connected"
                  ? "bg-green-400 animate-pulse"
                  : "bg-red-400"
              }`}
            ></span>
            <span>
              {dbStatus?.database || "SQLite"} + {dbStatus?.orm || "Prisma"}
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-cyan-400">
              {dbStatus?.stats?.notes || 0} notes
            </span>
            <span className="text-pink-400">
              {dbStatus?.stats?.tasks?.pending || 0} tasks
            </span>
          </div>
        </div>
      </div>
      {/* Menu */}
      <div className="space-y-4 text-center">
        <div
          className="cursor-pointer hover:bg-gray-900 p-4 rounded transition-colors"
          onClick={() => navigateTo("/newnote")}
        >
          <span className="text-purple-400">[1]</span> NEW NOTE
        </div>

        <div
          className="cursor-pointer hover:bg-gray-900 p-4 rounded transition-colors"
          onClick={() => navigateTo("/shitlist")}
        >
          <span className="text-pink-400">[2]</span> TASKS
        </div>

        <div
          className="cursor-pointer hover:bg-gray-900 p-4 rounded transition-colors"
          onClick={() => navigateTo("/vault")}
        >
          <span className="text-cyan-400">[3]</span> VAULT
        </div>
      </div>
      {/* Command prompt */}
      <div className="mt-12 text-sm">
        <span className="text-green-400">user@notela:~$ </span>
        <span className="bg-green-400 text-black px-1">█</span>
      </div>
    </div>
  );
};

export default Homepage;
