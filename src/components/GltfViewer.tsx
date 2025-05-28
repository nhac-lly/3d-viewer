"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import React, { Suspense, useState } from "react";
import { ControlSelector, CameraControls, CameraPositionForm, ControlType } from "./ControlSelector";
import { useQueryState } from "nuqs";

function Model({ curModel }: { curModel: string }) {
  const gltf = useGLTF(`/${curModel}/${curModel}.gltf`);
  return <primitive object={gltf.scene} />;
}

// Define camera positions
const DEFAULT_CAMERA_POSITIONS: Array<{ position: [number, number, number], label: string }> = [
  { position: [0, 3, 0], label: 'Start' },
  { position: [5, 3, 0], label: 'Right' },
  { position: [-5, 3, 0], label: 'Left' },
  { position: [0, 3, 5], label: 'Front' },
  { position: [0, 3, -5], label: 'Back' },
];

export default function GltfViewer() {
  const [controlType, setControlType] = useState<ControlType>('orbit');
  const [curModel, setCurModel] = useQueryState<string>('curModel', { defaultValue: 'hall', parse: (value) => value || 'hall' });
  const [cameraPositions, setCameraPositions] = useState<Array<{ position: [number, number, number], label: string }>>(DEFAULT_CAMERA_POSITIONS);

  const handleAddCameraPosition = (position: [number, number, number], label: string) => {
    setCameraPositions(prev => [...prev, { position, label }]);
  };

  const SelectModel = ({ curModel, setCurModel }: { curModel: string, setCurModel: (model: string) => void }) => (
    <div className="fixed top-4 left-4 z-10 bg-white/80 dark:bg-black/80 p-2 rounded-lg shadow-lg">
      <select 
        value={curModel} 
        onChange={(e) => setCurModel(e.target.value)}
        className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-black dark:text-white"
      >
        <option value="hall" className="bg-white dark:bg-black text-black dark:text-white">Hall</option>
        <option value="food" className="bg-white dark:bg-black text-black dark:text-white">Food</option>
        <option value="tech" className="bg-white dark:bg-black text-black dark:text-white">Tech</option>
        <option value="wood" className="bg-white dark:bg-black text-black dark:text-white">Wood</option>
      </select>
    </div>
  );

  return (
    <Suspense fallback={null}>
      <div className="w-full h-full">
        <SelectModel curModel={curModel} setCurModel={setCurModel} />
        <ControlSelector type={controlType} onChange={setControlType} />
      <Canvas camera={{ position: [20, 20, 20], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model curModel={curModel} />
        </Suspense>
        <CameraControls type={controlType} cameraPositions={cameraPositions} />
        <Environment files="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/hdris/noon-grass/noon_grass_1k.hdr" background />
      </Canvas>
      {controlType === 'dragFPS' && (
          <CameraPositionForm onSubmit={handleAddCameraPosition} />
        )}
      </div>
    </Suspense>
  );
} 