"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, FileText, Archive } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { id: "home", icon: Home, label: "127.0.0.1", href: "/" },
    { id: "new", icon: PlusCircle, label: "New", href: "/newnote" },
    { id: "writings", icon: FileText, label: "ShitList", href: "/shitlist" },
    { id: "vault", icon: Archive, label: "Vault", href: "/vault" },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-lg border border-gray-800 rounded-2xl px-4 py-3 shadow-2xl z-50">
      <div className="flex items-center space-x-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 ease-out group
                ${
                  isActive
                    ? "bg-white/10 text-white scale-105"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <IconComponent
                size={20}
                className={`transition-all duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              />
              <span
                className={`
                text-xs mt-1 font-medium transition-all duration-300
                ${
                  isActive
                    ? "opacity-100"
                    : "opacity-70 group-hover:opacity-100"
                }
              `}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
