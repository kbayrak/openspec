"use client";

import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "border border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900",
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
};

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={`${baseClasses} ${variants[variant]} ${className ?? ""}`} {...props} />;
}
