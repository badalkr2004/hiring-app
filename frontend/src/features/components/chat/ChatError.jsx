// src/components/chat/ChatError.jsx
import React from "react";

const ChatError = ({ error, onRetry, onBack }) => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 bg-red-50 border border-red-100 rounded-lg max-w-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-red-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">Chat Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex justify-center space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Retry
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatError;
