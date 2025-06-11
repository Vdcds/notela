"use client";
import React, { useState, useEffect, useCallback } from "react";

const Homepage = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [sessionId] = useState(() => Math.floor(Math.random() * 1000));
  const [motivation] = useState(() => {
    const motivations = [
      "You got this, champion! 💪",
      "Time to be productive... maybe 🤔",
      "Let's pretend we're organized today 📝",
      "Your procrastination ends here! (probably) 🎯",
      "Welcome back, note-taking ninja! 🥷",
      "Ready to conquer the world? Or at least your to-do list? 🌍",
      "Another day, another note to forget about 😅",
      "Diidii se Sikh le Kuch professional Procastinator ",
    ];
    return motivations[Math.floor(Math.random() * motivations.length)];
  });

  const welcomeText =
    "╔═══════════════════════════════════════════════════════════════╗\n║                          NOTELA v1.0.0                        ║\n║         'I Swear I'll Be Organized This Time' Terminal        ║\n╚═══════════════════════════════════════════════════════════════╝\n\n> Initializing digital vault system...\n> Loading markdown parser... ✅\n> Starting vim-style navigation... ✅\n> Activating Catppuccin theme... ✅\n> Loading coffee.exe... ☕\n> Initializing procrastination_blocker.dll... (failed)\n> Starting productivity_optimizer.exe... (also failed)\n> Falling back to basic note-taking... ✅\n\n╭─ System Status ─╮\n│ Caffeinated ✓   │\n│ Terminal Ready  │\n│ Vault Secured   │\n╰─────────────────╯\n\nAvailable Operations:\n  [1] newnote  → Craft markdown masterpieces\n  [2] shitlist → Professional chaos management\n  [3] vault    → Browse your encrypted wisdom archive\n\nPress 1, 2, or 3 to begin your journey into organized productivity.\nPress ESC to surrender to the void of YouTube rabbit holes.";

  // Initialize time on client side only
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  interface NavigationFunction {
    (path: string): void;
  }

  const navigateTo: NavigationFunction = (path: string): void => {
    window.location.href = path;
  };

  const handleKeyPress = useCallback((e: { key: string }) => {
    if (e.key === "1") {
      navigateTo("/newnote");
    } else if (e.key === "2") {
      navigateTo("/shitlist");
    } else if (e.key === "3") {
      navigateTo("/vault");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div
      className="h-screen w-screen bg-gray-900 text-purple-300 font-mono overflow-hidden fixed inset-0"
      tabIndex={0}
    >
      <div className="relative z-10 h-full flex flex-col">
        {/* Terminal Header */}
        <div className="bg-gray-900 flex-1 flex flex-col">
          {/* Title Bar */}
          <div className="p-4 flex justify-between items-center bg-gray-800">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-center text-lg font-bold text-cyan-400">
              NOTELA TERMINAL - chaos@localhost
            </div>
            <div className="text-sm text-gray-400">
              {currentTime
                ? `${formatDate(currentTime)} ${formatTime(currentTime)}`
                : "Loading time..."}
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-8 flex-1 flex flex-col justify-center">
            {/* ASCII Art Header */}
            <pre className="text-cyan-400 mb-8 text-lg leading-tight text-center">
              {`
███╗   ██╗ ██████╗ ████████╗███████╗██╗      █████╗
████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██║     ██╔══██╗
██╔██╗ ██║██║   ██║   ██║   █████╗  ██║     ███████║
██║╚██╗██║██║   ██║   ██║   ██╔══╝  ██║     ██╔══██║
██║ ╚████║╚██████╔╝   ██║   ███████╗███████╗██║  ██║
╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝
`}
            </pre>

            {/* Motivation */}
            <div className="text-center mb-6">
              <span className="text-pink-400 text-lg font-bold">
                ✨ {motivation} ✨
              </span>
            </div>

            {/* Terminal Output */}
            <div className="mb-12 text-center">
              <div className="whitespace-pre-wrap text-green-300 leading-relaxed">
                {welcomeText}
              </div>
            </div>

            {/* Command Options */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-purple-600/30 hover:border-purple-400/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-purple-400 text-xl font-bold">
                    [1] NOTES 📝
                  </span>
                  <span className="text-gray-400 text-sm">vim-style chaos</span>
                </div>
                <div className="text-sm text-gray-300 mb-4">
                  Enter the markdown dimension where your thoughts become...
                  slightly less scattered
                </div>
                <button
                  onClick={() => navigateTo("/newnote")}
                  className="bg-purple-600 text-white px-6 py-3 hover:bg-purple-500 text-sm font-mono rounded shadow-lg hover:shadow-purple-500/25"
                >
                  {">"} ./newnote --mode=procrastination
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-pink-600/30 hover:border-pink-400/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-pink-400 text-xl font-bold">
                    [2] TASKS 💩
                  </span>
                  <span className="text-gray-400 text-sm">shitlist v2.0</span>
                </div>
                <div className="text-sm text-gray-300 mb-4">
                  Manage the beautiful disaster that is your life, one task at a
                  time
                </div>
                <button
                  onClick={() => navigateTo("/shitlist")}
                  className="bg-pink-600 text-white px-6 py-3 hover:bg-pink-500 text-sm font-mono rounded shadow-lg hover:shadow-pink-500/25"
                >
                  {">"} ./shitlist --priority=panic
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-cyan-600/30 hover:border-cyan-400/50 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-cyan-400 text-xl font-bold">
                    [3] VAULT 📚
                  </span>
                  <span className="text-gray-400 text-sm">
                    digital archives
                  </span>
                </div>
                <div className="text-sm text-gray-300 mb-4">
                  Browse your collected digital wisdom (or random thoughts you
                  forgot about)
                </div>
                <button
                  onClick={() => navigateTo("/vault")}
                  className="bg-cyan-600 text-white px-6 py-3 hover:bg-cyan-500 text-sm font-mono rounded shadow-lg hover:shadow-cyan-500/25"
                >
                  {">"} ./vault --explore
                </button>
              </div>
            </div>

            {/* Command Prompt */}
            <div className="mt-12 text-center">
              <span className="text-cyan-300 text-lg">
                vdcds@chaosbox:~/life${" "}
              </span>
              <span className="bg-cyan-400 text-gray-900 px-1">█</span>
            </div>
          </div>

          {/* Status Bar */}
          <div className="p-4 text-xs bg-gray-800 flex justify-between border-t border-gray-700">
            <div className="text-green-400">
              STATUS: Barely Functioning | COFFEE: ☕☕☕ | SANITY: 12%
            </div>
            <div className="text-yellow-400">
              SESSION: {sessionId}min | MOOD: Chaotic Good
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-gray-500 text-sm bg-gray-900">
          <p className="text-purple-400">
            NOTELA v1.0.0 - &quot;Your Digital Brain (But Cooler)&quot; 🧠
          </p>
          <p className="mt-1">
            Press 1 for Digital Therapy | Press 2 for Organized Chaos | Press 3
            for Memory Lane | Ctrl+C to Rage Quit
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
