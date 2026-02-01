import React from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover shadow-glow border border-transparent",
    secondary: "bg-paper-light text-ink hover:bg-paper-border border border-paper-border",
    outline: "bg-transparent border border-paper-border text-ink-soft hover:text-ink hover:border-ink-muted",
    ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-paper-light",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button
      className={cn(
        "rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}