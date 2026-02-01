import React from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-paper border border-paper-border rounded-3xl shadow-card backdrop-blur-sm",
        "hover:border-paper-light hover:shadow-soft transition-all duration-300",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pb-0 border-b border-paper-border mb-4", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}