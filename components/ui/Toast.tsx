"use client";

import React from "react";

interface ToastProps {
  message: string;
  isOpen: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isOpen }) => {
  return (
    <div
      className={`toast ${isOpen ? "on" : ""}`}
      id="toast"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default Toast;
