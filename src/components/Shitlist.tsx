"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const Shitlist = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("MEDIUM");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load tasks from database
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to load tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setStatusMessage("Failed to load tasks");
      setTimeout(() => setStatusMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new task
  const addTask = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.trim(),
          priority: selectedPriority,
        }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);
      setInput("");
      setSelectedIndex(-1);
      setStatusMessage("Task added");
      setTimeout(() => setStatusMessage(""), 2000);
    } catch (error) {
      console.error("Error creating task:", error);
      setStatusMessage("Failed to add task");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // Toggle task completion
  const toggleTask = async (task: Task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      console.error("Error updating task:", error);
      setStatusMessage("Failed to update task");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedIndex(-1);
      setStatusMessage("Task deleted");
      setTimeout(() => setStatusMessage(""), 2000);
    } catch (error) {
      console.error("Error deleting task:", error);
      setStatusMessage("Failed to delete task");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTask();
    } else if (e.key === "ArrowUp" && tasks.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? tasks.length - 1 : prev - 1));
    } else if (e.key === "ArrowDown" && tasks.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev >= tasks.length - 1 ? 0 : prev + 1));
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (input === "" && selectedIndex >= 0) {
        e.preventDefault();
        deleteTask(tasks[selectedIndex].id);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSelectedIndex(-1);
      inputRef.current?.focus();
    } else if (e.key === " " && selectedIndex >= 0 && input === "") {
      e.preventDefault();
      toggleTask(tasks[selectedIndex]);
    } else if (e.key >= "1" && e.key <= "4" && e.ctrlKey) {
      e.preventDefault();
      const priorities: ("LOW" | "MEDIUM" | "HIGH" | "URGENT")[] = [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
      ];
      setSelectedPriority(priorities[parseInt(e.key) - 1]);
    }
  };

  useEffect(() => {
    loadTasks();
    inputRef.current?.focus();
  }, [loadTasks]);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "border-red-400 bg-red-950/30 text-red-300";
      case "HIGH":
        return "border-orange-400 bg-orange-950/30 text-orange-300";
      case "MEDIUM":
        return "border-yellow-400 bg-yellow-950/30 text-yellow-300";
      case "LOW":
        return "border-green-400 bg-green-950/30 text-green-300";
      default:
        return "border-gray-400 bg-gray-950/30 text-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "⚡";
      case "HIGH":
        return "🔥";
      case "MEDIUM":
        return "⚪";
      case "LOW":
        return "❄️";
      default:
        return "⚪";
    }
  };

  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div
      className="fixed inset-0 bg-black text-gray-100 font-mono overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Status Message */}
      {statusMessage && (
        <div className="fixed top-4 right-4 bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 px-4 py-2 rounded-lg font-mono text-sm z-50 backdrop-blur-md">
          {statusMessage}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-700 bg-black/80 backdrop-blur-md p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-300 tracking-wider drop-shadow-lg">
              SHITLIST
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Get this shit done • {pendingTasks.length} pending •{" "}
              {completedTasks.length} done
            </p>
          </div>
          <div className="text-right text-xs text-gray-500 font-mono">
            <div>CTRL+1-4: Priority</div>
            <div>↑↓: Navigate • SPACE: Toggle • DEL: Remove</div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)] max-w-4xl mx-auto">
        {/* Main Tasks Panel */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-cyan-400 text-xl animate-pulse">
                Loading tasks...
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task, taskIndex) => (
                <div
                  key={task.id}
                  className={`
                    group border border-gray-700 rounded-lg p-4 transition-all duration-200 cursor-pointer
                    ${
                      selectedIndex === taskIndex
                        ? "ring-2 ring-cyan-400 bg-cyan-950/20 border-cyan-400"
                        : "hover:border-gray-600 hover:bg-gray-900/50"
                    }
                    ${getPriorityStyles(task.priority)}
                  `}
                  onClick={() => setSelectedIndex(taskIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 border-2 border-gray-500 rounded cursor-pointer hover:border-cyan-400 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task);
                        }}
                      />
                      <span className="text-lg">
                        {getPriorityIcon(task.priority)}
                      </span>
                      <div>
                        <div className="text-gray-100 font-medium">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-gray-400 text-sm mt-1">
                            {task.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {task.priority} •{" "}
                          {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="text-gray-500 hover:text-red-400 text-xl w-8 h-8 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {pendingTasks.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="text-gray-400 text-xl">All done!</div>
                  <div className="text-gray-500 text-sm mt-2">
                    Add a new task to get started
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Completed Tasks Sidebar */}
        {completedTasks.length > 0 && (
          <div className="w-80 border-l border-gray-700 bg-gray-950/50 p-6 overflow-y-auto">
            <h2 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="group border border-gray-800 rounded p-3 bg-gray-900/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 bg-green-400 rounded flex items-center justify-center cursor-pointer"
                        onClick={() => toggleTask(task)}
                      >
                        <span className="text-black text-xs">✓</span>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm line-through">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(task.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-600 hover:text-red-400 text-lg w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Panel */}
      <div className="border-t border-gray-700 bg-black/90 backdrop-blur-md p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            {" "}
            {/* Priority Selector */}
            <div className="flex gap-1">
              {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map(
                (priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority)}
                    className={`
                    px-3 py-2 rounded text-xs font-bold transition-all duration-200 border
                    ${
                      selectedPriority === priority
                        ? getPriorityStyles(priority) + " border-current"
                        : "border-gray-700 text-gray-500 hover:border-gray-600"
                    }
                  `}
                  >
                    {getPriorityIcon(priority)} {priority}
                  </button>
                )
              )}
            </div>
            {/* Input Field */}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add task... (Enter to save)"
              className="flex-1 bg-gray-900 border border-gray-700 text-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-gray-500 font-mono"
            />
            {/* Add Button */}
            <button
              onClick={addTask}
              disabled={!input.trim()}
              className="px-6 py-3 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              ADD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shitlist;
