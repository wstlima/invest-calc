import React from "react";

type Tone = "gray" | "blue" | "green" | "orange" | "red";

function toneClass(t: Tone) {
  switch (t) {
    case "blue":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "green":
      return "bg-green-50 text-green-700 border-green-100";
    case "orange":
      return "bg-orange-50 text-orange-700 border-orange-100";
    case "red":
      return "bg-red-50 text-red-700 border-red-100";
    case "gray":
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function Badge({
  className = "",
  tone = "gray",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      {...props}
      className={
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold " +
        toneClass(tone) +
        " " +
        className
      }
    />
  );
}
