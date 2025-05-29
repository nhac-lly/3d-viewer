"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, useGLTF, Html } from "@react-three/drei";
import React, { Suspense, useState, useEffect, useRef } from "react";
import { ControlSelector, CameraControls, CameraPositionForm, ControlType } from "./ControlSelector";
import * as THREE from 'three';
import { useFrame } from "@react-three/fiber";

// Loading placeholder component
const LoadingPlaceholder = ({ position = [0, 0, 0] }: { position?: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotate the placeholder
    meshRef.current.rotation.y += 0.01;
    
    // Create a pulsing effect
    const time = state.clock.getElapsedTime();
    const scale = 1 + Math.sin(time * 2) * 0.1;
    meshRef.current.scale.set(scale, scale, scale);
    
    // Add a floating effect
    meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.2;
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color={hovered ? "#4a9eff" : "#cccccc"}
          metalness={0.5}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Add a subtle glow effect */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

// Loading indicator component
const LoadingIndicator = ({ progress }: { progress: number }) => (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 dark:bg-black/90 p-4 rounded-lg shadow-lg">
    <div className="text-black dark:text-white text-center mb-2">Loading Models...</div>
    <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
      <div 
        className="h-full bg-blue-500 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="text-black dark:text-white text-center mt-2">{Math.round(progress)}%</div>
  </div>
);

// Individual model component
const SingleModel = ({ modelName, position = [0, 0, 0], transformed = true }: { modelName: string, position?: [number, number, number], transformed?: boolean }) => {
   
  let gltf = null;
  if (transformed) {
    gltf = useGLTF(`/${modelName}/${modelName}-transformed.glb`);
  } else {
    gltf = useGLTF(`/${modelName}/${modelName}.gltf`);
  }

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gltf]);

  return <primitive object={gltf.scene} position={position} />;
};

const Model = React.memo(({ curModel }: { curModel: string }) => {
  if (curModel === 'home') {
    return (
      <>
        <Suspense fallback={<LoadingPlaceholder position={[0, 0, 0]} />}>
          <SingleModel modelName="hall" position={[0, 0, 0]} />
        </Suspense>
        <Suspense fallback={<LoadingPlaceholder position={[-10, 0, 10]} />}>
          <SingleModel modelName="food" position={[-10, 0, 10]} />
        </Suspense>
        <Suspense fallback={<LoadingPlaceholder position={[10, 0, -10]} />}>
          <SingleModel modelName="tech" position={[10, 0, -10]} />
        </Suspense>
        <Suspense fallback={<LoadingPlaceholder position={[-10, 0, -10]} />}>
          <SingleModel modelName="wood" position={[-10, 0, -10]} />
        </Suspense>
      </>
    );
  }

  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <SingleModel modelName={curModel} />
    </Suspense>
  );
});

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
  const [curModel, setCurModel] = useState<string>('home');
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
        <option value="home" className="bg-white dark:bg-black text-black dark:text-white">Home</option>
        <option value="hall" className="bg-white dark:bg-black text-black dark:text-white">Hall</option>
        <option value="food" className="bg-white dark:bg-black text-black dark:text-white">Food</option>
        <option value="tech" className="bg-white dark:bg-black text-black dark:text-white">Tech</option>
        <option value="wood" className="bg-white dark:bg-black text-black dark:text-white">Wood</option>
      </select>
    </div>
  );

  return (
    <div className="w-full h-full">
      <SelectModel curModel={curModel} setCurModel={setCurModel} />
      <ControlSelector type={controlType} onChange={setControlType} />
      <Canvas camera={{ position: [20, 20, 20], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={<LoadingPlaceholder />}>
          <Model curModel={curModel} />
        </Suspense>
        <CameraControls type={controlType} cameraPositions={cameraPositions} />
        <Environment files="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/hdris/noon-grass/noon_grass_1k.hdr" background />
      </Canvas>
      {controlType === 'dragFPS' && (
        <CameraPositionForm onSubmit={handleAddCameraPosition} />
      )}
    </div>
  );
}