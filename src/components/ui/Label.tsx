import React from "react";

export default function Label({
  className = "",
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={"mb-2 block text-sm font-medium text-gray-700 " + className}
    />
  );
}
