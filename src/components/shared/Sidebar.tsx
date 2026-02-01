"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  ShieldAlert, 
  LogOut, 
  User, 
  Settings,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

const MENU_ITEMS = [
  { name: "Intelligence", path: "/", icon: LayoutDashboard },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "Discussion", path: "/discussion", icon: MessageSquare },
  { name: "Storage", path: "/files", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  return (
    <aside className="hidden md:flex flex-col w-64 fixed h-screen border-r border-paper-border bg-paper/80 backdrop-blur-xl p-6 z-50">
      <Link href="/" className="mb-10 flex items-center gap-3 group cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
          <span className="font-bold text-white text-lg">S</span>
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight group-hover:text-accent transition-colors">SENTINEL</h1>
          <p className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">Dev Center</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                isActive
                  ? "bg-accent text-white shadow-glow font-semibold"
                  : "text-ink-soft hover:bg-paper-light hover:text-ink"
              )}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110", isActive && "text-white")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-paper-border">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-ink-muted hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        ) : (
          <Link
            href="/auth"
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-ink-muted hover:text-accent hover:bg-accent/5 rounded-xl transition-all duration-200 group"
          >
            <User size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
}