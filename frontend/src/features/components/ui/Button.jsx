// components/ui/Button.jsx
import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "rounded-md font-medium focus:outline-none transition-colors";

  const variantClasses = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    secondary:
      "bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    ghost:
      "text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
