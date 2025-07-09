// components/ui/Avatar.jsx
import React from "react";

const Avatar = ({ src, alt, size = "md", online = false }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}
      >
        {src ? (
          <img
            src={src}
            alt={alt || "User avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-lg">
            {alt ? alt.charAt(0).toUpperCase() : "U"}
          </div>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
      )}
    </div>
  );
};

export default Avatar;
