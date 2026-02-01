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
    <aside className="hidden md:flex flex-col w-64 fixed h-screen border-r border-line/60 bg-paper/80 backdrop-blur-md p-6 z-50">
      <div className="mb-10">
        <h1 className="font-serif text-2xl font-bold text-ink tracking-tight text-center">SENTINEL</h1>
        <div className="h-px bg-gradient-to-r from-transparent via-line to-transparent my-4" />
      </div>

      <nav className="flex-1 space-y-1.5">
        <p className="text-[10px] font-black text-ink-muted mb-2 px-4 uppercase tracking-widest">Main Menu</p>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive
                  ? "bg-white shadow-card text-accent font-bold"
                  : "text-ink-soft hover:bg-white/50 hover:translate-x-1"
              )}
            >
              <item.icon size={18} className={cn(isActive ? "text-accent" : "text-ink-muted group-hover:text-ink")} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-line/40">
            <p className="text-[10px] font-black text-ink-muted mb-2 px-4 uppercase tracking-widest">Administrator</p>
            <Link
              href="/api-console"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                pathname === "/api-console"
                  ? "bg-ink text-white shadow-lg"
                  : "text-ink-soft hover:bg-red-50 hover:text-red-600"
              )}
            >
              <ShieldAlert size={18} />
              <span>Admin Console</span>
            </Link>
          </div>
        )}
      </nav>

      {isAuthenticated ? (
        <div className="pt-6 border-t border-line">
          <div className="flex items-center gap-3 px-4 mb-6 p-3 bg-white/40 rounded-2xl border border-line/20">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent ring-2 ring-white">
                <User size={20} />
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-ink truncate">{user?.name}</p>
                <p className="text-[10px] text-ink-muted truncate font-mono uppercase">{user?.role.split('_')[1]}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link href="/auth" className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-ink-soft hover:text-accent transition-colors">
                <Settings size={14} /> Account Settings
            </Link>
            <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-bold text-ink-soft hover:text-red-500 transition-colors cursor-pointer"
            >
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-6 border-t border-line">
            <Link href="/auth">
                <Button className="w-full">Sign In</Button>
            </Link>
        </div>
      )}
    </aside>
  );
}