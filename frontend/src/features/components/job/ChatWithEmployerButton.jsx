// components/job/ChatWithEmployerButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const ChatWithEmployerButton = ({ jobId, employerId, className = "" }) => {
  const navigate = useNavigate();
  console.log(employerId);
  const handleClick = () => {
    navigate(`/jobs/${jobId}/chat/${employerId}`);
  };

  return (
    <Button
      onClick={handleClick}
      variant="secondary"
      className={`flex items-center ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Chat with Employer
    </Button>
  );
};

export default ChatWithEmployerButton;
