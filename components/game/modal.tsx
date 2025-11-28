/**
 * Modal Component
 *
 * This component handles the display of the interactive popup window when a user enters a zone.
 * It takes an `activeZone` prop to determine which content to show (from data.tsx) and includes
 * animations for opening/closing.
 */

import React from "react";
import { X } from "lucide-react";
import { InteractionType } from "./types";
import { ZONE_CONTENT } from "./data";

interface ModalProps {
  activeZone: InteractionType;
  onClose: () => void;
}

export const Modal = ({ activeZone, onClose }: ModalProps) => {
  if (!activeZone) return null;

  const currentZoneData = ZONE_CONTENT[activeZone as keyof typeof ZONE_CONTENT];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white text-black w-full h-full md:w-full ${
          activeZone === "ABOUT" ? "md:max-w-4xl" : "md:max-w-3xl"
        } md:h-auto md:max-h-[80vh] flex flex-col md:pixel-border shadow-2xl animate-in zoom-in-95 duration-200`}
      >
        {/* Modal Header */}
        <div
          className={`${currentZoneData.color} p-4 flex justify-between items-center border-b-4 border-black shrink-0`}
        >
          <h2 className="text-white text-pixel-xl md:text-pixel-2xl flex items-center gap-3">
            <span className="text-pixel-2xl">{currentZoneData.icon}</span>
            {currentZoneData.content.title}
          </h2>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white p-2 pixel-border-sm transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 overflow-y-auto bg-[#f0f0f0] flex-1">
          {currentZoneData.content.body}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-200 p-4 border-t-4 border-black text-right text-mono-xs text-gray-500 hidden md:block shrink-0">
          PRESS ESC TO CLOSE
        </div>
      </div>
    </div>
  );
};
