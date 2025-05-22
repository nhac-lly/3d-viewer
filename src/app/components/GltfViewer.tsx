"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import React, { Suspense, useState } from "react";
import { ControlSelector, CameraControls, CameraPositionForm, ControlType } from "./ControlSelector";

function Model() {
  const gltf = useGLTF("/Qualcomm_Model_v1_fix02.gltf");
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
  const [cameraPositions, setCameraPositions] = useState<Array<{ position: [number, number, number], label: string }>>(DEFAULT_CAMERA_POSITIONS);

  const handleAddCameraPosition = (position: [number, number, number], label: string) => {
    setCameraPositions(prev => [...prev, { position, label }]);
  };

  return (
    <div className="w-full h-full">
      <ControlSelector type={controlType} onChange={setControlType} />
      <Canvas camera={{ position: [20, 20, 20], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <CameraControls type={controlType} cameraPositions={cameraPositions} />
      </Canvas>
      {controlType === 'dragFPS' && (
        <CameraPositionForm onSubmit={handleAddCameraPosition} />
      )}
    </div>
  );
} 