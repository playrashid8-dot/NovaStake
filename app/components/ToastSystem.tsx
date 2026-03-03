"use client";

import { useState } from "react";

export default function ToastSystem() {
  const [message, setMessage] = useState("");

  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 bg-green-600 px-6 py-3 rounded-xl shadow-xl">
      {message}
    </div>
  );
}