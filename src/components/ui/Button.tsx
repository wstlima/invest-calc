import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

function variantClass(v: Variant) {
  switch (v) {
    case "primary":
      return "bg-blue-600 text-white hover:bg-blue-700";
    case "secondary":
      return "bg-gray-100 text-gray-900 hover:bg-gray-200";
    case "danger":
      return "bg-red-600 text-white hover:bg-red-700";
    case "ghost":
      return "bg-transparent text-gray-700 hover:bg-gray-100";
  }
}

function sizeClass(s: Size) {
  switch (s) {
    case "sm":
      return "h-9 px-3 text-sm";
    case "md":
      return "h-10 px-4 text-sm";
    case "lg":
      return "h-11 px-5 text-base";
  }
}

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={
        "inline-flex items-center justify-center gap-2 rounded-xl border border-transparent font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 " +
        variantClass(variant) +
        " " +
        sizeClass(size) +
        " " +
        className
      }
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              opacity="0.25"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
          {props.children}
        </span>
      ) : (
        props.children
      )}
    </button>
  );
}
