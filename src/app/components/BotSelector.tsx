"use client";

import { useState } from "react";

export type BotType = "marc" | "farza" | "sam";

interface BotSelectorProps {
  selectedBot: BotType;
  onBotChange: (bot: BotType) => void;
}

export const BotSelector = ({ selectedBot, onBotChange }: BotSelectorProps) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-xl p-4 border border-gray-100">
      <div className="flex gap-4">
        <button
          onClick={() => onBotChange("marc")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedBot === "marc"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Marc Andreessen
        </button>
        <button
          onClick={() => onBotChange("farza")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedBot === "farza"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Farza
        </button>
        <button
          onClick={() => onBotChange("sam")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedBot === "sam"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Sam Altman
        </button>
      </div>
    </div>
  );
};
