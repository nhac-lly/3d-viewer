import React from 'react';

interface MovementInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MovementInstructions({ isOpen, onClose }: MovementInstructionsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Movement Controls</h2>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p><span className="font-bold">W/↑:</span> Move forward</p>
          <p><span className="font-bold">S/↓:</span> Move backward</p>
          <p><span className="font-bold">A/←:</span> Move left</p>
          <p><span className="font-bold">D/→:</span> Move right</p>
          <p><span className="font-bold">Space:</span> Jump</p>
          <p><span className="font-bold">Shift:</span> Sprint</p>
          <p><span className="font-bold">Mouse:</span> Look around</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
} 