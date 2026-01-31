"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Lock, Terminal, FileText, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MENU_ITEMS = [
  { name: "Dev Home", path: "/", icon: LayoutDashboard },
  { name: "Auth Console", path: "/auth", icon: Lock },
  { name: "API Console", path: "/api-console", icon: Terminal },
  { name: "Report Predict", path: "/reports", icon: BarChart3 },
  { name: "File Console", path: "/files", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 fixed h-screen border-r border-line/60 bg-paper/80 backdrop-blur-sm p-6 z-50">
      <div className="mb-10">
        <h1 className="font-serif text-2xl font-bold text-ink">SENTINEL</h1>
        <p className="text-xs text-ink-muted">Dev Environment</p>
      </div>

      <nav className="flex-1 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white shadow-card text-accent font-semibold"
                  : "text-ink-soft hover:bg-white/50"
              }`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {isAuthenticated && (
        <div className="pt-6 border-t border-line">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-ink-soft hover:text-red-500 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
