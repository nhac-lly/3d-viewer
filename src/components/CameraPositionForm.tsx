import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

interface CameraPositionFormProps {
  onSubmit: (position: [number, number, number], label: string) => void;
  cameraPosition: THREE.Vector3;
  onGoTo: (position: [number, number, number]) => void;
}

export function CameraPositionForm({ onSubmit, cameraPosition, onGoTo }: CameraPositionFormProps) {
  const [x, setX] = useState('0');
  const [y, setY] = useState('0');
  const [z, setZ] = useState('0');
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit([parseFloat(x), parseFloat(y), parseFloat(z)], label || 'Custom');
  };

  const handleGoTo = () => {
    onGoTo([parseFloat(x), parseFloat(y), parseFloat(z)]);
  };

  const handleUseCurrent = () => {
    const currentX = cameraPosition.x.toFixed(2);
    const currentY = cameraPosition.y.toFixed(2);
    const currentZ = cameraPosition.z.toFixed(2);
    setX(currentX);
    setY(currentY);
    setZ(currentZ);
    onSubmit([parseFloat(currentX), parseFloat(currentY), parseFloat(currentZ)], label || 'Current');
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-4 right-4 bg-white/80 dark:bg-black/80 p-4 rounded-lg shadow-lg w-64">
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">X:</label>
          <input
            type="number"
            value={x}
            onChange={(e) => setX(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Y:</label>
          <input
            type="number"
            value={y}
            onChange={(e) => setY(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Z:</label>
          <input
            type="number"
            value={z}
            onChange={(e) => setZ(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Label:</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Custom"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add Position
          </button>
          <button
            type="button"
            onClick={handleGoTo}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Go To
          </button>
        </div>
        <button
          type="button"
          onClick={handleUseCurrent}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Use Current Position
        </button>
      </div>
    </form>
  );
} 