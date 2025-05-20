"use client";

import { useState, useEffect } from "react";

export const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("openai_api_key", apiKey.trim());
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("openai_api_key");
    setApiKey("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-4 border border-gray-100">
        <div className="text-sm text-gray-500 font-medium mb-1">
          OpenAI API Key
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {apiKey ? "••••••••" + apiKey.slice(-4) : "Not set"}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-4 border border-gray-100">
      <div className="text-sm text-gray-500 font-medium mb-2">
        OpenAI API Key
      </div>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter your OpenAI API key"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Everything is saved locally in your browser
      </div>
    </div>
  );
};
