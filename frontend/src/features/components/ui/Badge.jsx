// components/ui/Badge.jsx
import React from "react";

const Badge = ({ count, variant = "primary", size = "md" }) => {
  if (!count || count === 0) return null;

  const variantClasses = {
    primary: "bg-indigo-600 text-white",
    secondary: "bg-purple-600 text-white",
    red: "bg-red-500 text-white",
    gray: "bg-gray-500 text-white",
  };

  const sizeClasses = {
    sm: "h-4 min-w-4 text-xs",
    md: "h-5 min-w-5 text-xs",
    lg: "h-6 min-w-6 text-sm",
  };

  return (
    <div
      className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full flex items-center justify-center px-1.5`}
    >
      {count > 99 ? "99+" : count}
    </div>
  );
};

export default Badge;
