"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Card, CardHeader } from "./ui/card";
import { Button } from "./ui/button";

interface Task {
  id: number;
  text: string;
  priority: "low" | "medium" | "high";
}

const Shitlist = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addTask = () => {
    if (inputValue.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: inputValue.trim(),
        priority: selectedPriority,
      };
      setTasks([...tasks, newTask]);
      setInputValue("");
      setSelectedTaskIndex(-1);
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
    setSelectedTaskIndex(-1);
  };

  const deleteSelectedTask = () => {
    if (selectedTaskIndex >= 0 && tasks[selectedTaskIndex]) {
      deleteTask(tasks[selectedTaskIndex].id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Global keyboard shortcuts
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTask();
    } else if (e.key === "ArrowUp" && tasks.length > 0) {
      e.preventDefault();
      setSelectedTaskIndex((prev) => (prev <= 0 ? tasks.length - 1 : prev - 1));
    } else if (e.key === "ArrowDown" && tasks.length > 0) {
      e.preventDefault();
      setSelectedTaskIndex((prev) => (prev >= tasks.length - 1 ? 0 : prev + 1));
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (inputValue === "" && selectedTaskIndex >= 0) {
        e.preventDefault();
        deleteSelectedTask();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSelectedTaskIndex(-1);
      inputRef.current?.focus();
    } else if (e.key === "1" || e.key === "2" || e.key === "3") {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const priorities: ("low" | "medium" | "high")[] = [
          "low",
          "medium",
          "high",
        ];
        setSelectedPriority(priorities[parseInt(e.key) - 1]);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getPrioritySymbol = (priority: string) => {
    switch (priority) {
      case "high":
        return "●●●";
      case "medium":
        return "●●○";
      case "low":
        return "●○○";
      default:
        return "●○○";
    }
  };

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-gray-900 text-gray-100 p-6 font-mono"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-light mb-2 tracking-wide">Shitlist</h1>
          <p className="text-sm text-gray-400">Get this shit done asap</p>
        </div>

        {/* Task List */}
        <div className="space-y-2 mb-8">
          {tasks.map((task, index) => (
            <Card
              key={task.id}
              className={`
                ${getPriorityColor(task.priority)}
                ${
                  selectedTaskIndex === index
                    ? "ring-2 ring-blue-400 bg-blue-50"
                    : ""
                }
                border-l-4 transition-all duration-200 cursor-pointer hover:shadow-md
              `}
              onClick={() => setSelectedTaskIndex(index)}
            >
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold opacity-60">
                      {getPrioritySymbol(task.priority)}
                    </span>
                    <span className="text-gray-800 font-medium">
                      {task.text}
                    </span>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-600 hover:bg-red-100 p-1 h-6 w-6"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No tasks yet</p>
              <p className="text-sm mt-1">
                Start typing to add your first task
              </p>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="sticky bottom-0 bg-gray-900 pt-4 border-t border-gray-700 text-black">
          {/* Priority Selection */}
          <div className="flex gap-2 justify-center mb-4">
            {(["low", "medium", "high"] as const).map((priority, index) => (
              <Button
                key={priority}
                onClick={() => setSelectedPriority(priority)}
                variant={selectedPriority === priority ? "default" : "outline"}
                size="sm"
                className="font-mono text-xs px-3 py-1"
              >
                {priority} {getPrioritySymbol(priority)}
                <span className="ml-1 text-xs opacity-60 bg-orange-300">
                  ctrl+{index + 1}
                </span>
              </Button>
            ))}
          </div>

          {/* Input Field */}
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add task... (Enter to save, ↑↓ to navigate, Del to remove)"
            className="w-full h-12 bg-gray-800 text-gray-100 border-gray-600 focus:border-blue-400 font-mono placeholder:text-gray-500"
          />

          {/* Keyboard Shortcuts Help */}
          <div className="mt-3 text-xs text-gray-500 text-center space-x-4">
            <span>Enter: Add</span>
            <span>↑↓: Navigate</span>
            <span>Del: Remove</span>
            <span>Esc: Clear selection</span>
            <span>⌘1-3: Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shitlist;
