"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, FileText, Archive, Terminal } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    { id: "new", icon: PlusCircle, label: "NewNote", href: "/newnote" },
    { id: "writings", icon: FileText, label: "ShitList", href: "/shitlist" },
    { id: "vault", icon: Archive, label: "Vault", href: "/vault" },
  ];

  return (
    <>
      {/* Top Brand Bar - Hidden on /newnote route */}
      {pathname !== "/newnote" && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#1e1e2e] via-[#181825] to-[#1e1e2e] border-b border-[#313244] px-6 py-3 z-50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center gap-2">
                <Terminal className="w-6 h-6 text-[#89b4fa] group-hover:text-[#74c7ec] transition-colors" />
                <div className="flex flex-col">
                  <span className="text-[#cdd6f4] font-black text-xl tracking-wider">
                    NOTELA
                  </span>
                  <span className="text-[#6c7086] text-xs font-mono -mt-1">
                    digital.vault
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-[#6c7086] text-sm font-mono">v1.0.0</div>
              <div className="text-[#89b4fa] text-sm font-mono">~/notela</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1e1e2e]/90 backdrop-blur-lg border border-[#313244] rounded-2xl px-4 py-3 shadow-2xl z-50">
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
                ? "bg-[#89b4fa]/20 text-[#89b4fa] scale-105 border border-[#89b4fa]/30"
                : "text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]/50"
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
            text-xs mt-1 font-medium transition-all duration-300 font-mono
            ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}
          `}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#89b4fa] rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
