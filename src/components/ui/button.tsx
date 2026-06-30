import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-emerald-600 text-white hover:bg-emerald-700",
  secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
  ghost: "text-zinc-700 hover:bg-zinc-100",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
