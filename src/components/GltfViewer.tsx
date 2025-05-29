"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, useGLTF, Html } from "@react-three/drei";
import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { ControlSelector, CameraControls, ControlType } from "./ControlSelector";
import { CameraPositionForm } from "./CameraPositionForm";
import * as THREE from 'three';
import { useFrame, useThree } from "@react-three/fiber";
import { Leva, monitor, useControls } from "leva";
import { Model as HallModel } from "../models/Hall";
import { Model as FoodModel } from "../models/Food";
import { Model as TechModel } from "../models/Tech";
import { Model as WoodModel } from "../models/Wood";

interface CameraPositionFormProps {
  onSubmit: (position: [number, number, number], label: string) => void;
  cameraPosition: THREE.Vector3;
  onGoTo: (position: [number, number, number]) => void;
}

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

// Individual model component
const SingleModel = ({ modelName, position = [0, 0, 0] }: { modelName: string, position?: [number, number, number] }) => {
  switch (modelName) {
    case 'hall':
      return <HallModel position={position} />;
    case 'food':
      return <FoodModel position={position} />;
    case 'tech':
      return <TechModel position={position} />;
    case 'wood':
      return <WoodModel position={position} />;
    default:
      return null;
  }
};

const Model = React.memo(({ curModel }: { curModel: string }) => {
  if (curModel === 'home') {
    return (
      <>
        <Suspense fallback={<LoadingPlaceholder position={[0, 0, 0]} />}>
          <SingleModel modelName="hall" position={[0, 0, 0]} />
        </Suspense>
        <Suspense fallback={<LoadingPlaceholder position={[-10, 0, 10]} />}>
          <SingleModel modelName="food" position={[-10, 0.1, 10]} />
        </Suspense>
        <Suspense fallback={<LoadingPlaceholder position={[10, 0, -10]} />}>
          <SingleModel modelName="tech" position={[10, 0.1, -10]} />
        </Suspense>
        <Suspense fallback={<LoadingPlaceholder position={[-10, 0, -10]} />}>
          <SingleModel modelName="wood" position={[-10, 0.1, -10]} />
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
  { position: [5, 3, 0], label: 'Right' },
  { position: [-5, 3, 0], label: 'Left' },
  { position: [0, 3, 5], label: 'Front' },
  { position: [0, 3, -5], label: 'Back' },
];

// Create text texture function (moved from ControlSelector)
function createTextTexture(text: string) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;

  canvas.width = 256;
  canvas.height = 64;
  
  // Set background
  context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set text
  context.font = '24px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Camera point component (moved from ControlSelector)
function CameraPoint({ position, label, onClick }: { position: [number, number, number], label: string, onClick: () => void }) {
  const texture = useMemo(() => createTextTexture(label), [label]);

  return (
    <group position={position}>
      {/* Main clickable sphere */}
      <mesh onClick={onClick}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      {/* Visual indicator showing exact camera position */}
      <mesh position={[0, 0, 0]} onClick={onClick}>
        <ringGeometry args={[0.3, 0.4, 16]} />
        <meshBasicMaterial color="yellow" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Label above */}
      {texture && (
        <mesh position={[0, 0.5, 0]}>
          <planeGeometry args={[1, 0.25]} />
          <meshBasicMaterial 
            map={texture} 
            transparent={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Camera manager component that runs inside Canvas
const CameraManager = ({ 
  onAddCameraPosition, 
  cameraPositions 
}: { 
  onAddCameraPosition: (position: [number, number, number], label: string) => void;
  cameraPositions: Array<{ position: [number, number, number], label: string }>;
}) => {
  const { camera } = useThree();

  useControls('Camera', {
    position: monitor(() => 
      `x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(2)}, z: ${camera.position.z.toFixed(2)}`
  ),
    rotation: monitor(() => 
      `x: ${camera.rotation.x.toFixed(2)}, y: ${camera.rotation.y.toFixed(2)}, z: ${camera.rotation.z.toFixed(2)}`
    ),
    quaternion: monitor(() => 
      `x: ${camera.quaternion.x.toFixed(2)}, y: ${camera.quaternion.y.toFixed(2)}, z: ${camera.quaternion.z.toFixed(2)}, w: ${camera.quaternion.w.toFixed(2)}`
    ),
  });

  // Store initial camera position and rotation
  const initialCameraState = useRef({
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion()
  });

  // Save initial camera state when component mounts
  useEffect(() => {
    initialCameraState.current = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone()
    };
  }, [camera]);

  // Move camera to a specific position
  const moveCamera = (position: [number, number, number]) => {
    console.log('moveCamera called with position:', position);
    
    // Create a new Vector3 for the target position
    const targetPosition = new THREE.Vector3(position[0], position[1], position[2]);
    
    // Set camera position
    camera.position.copy(targetPosition);
    
    // Set quaternion to look straight ahead (identity quaternion)
    camera.quaternion.set(0, 0, 0, 1);
    
    // Force camera update
    camera.updateMatrixWorld(true);
  };

  return (
    <>
      {/* Clickable camera points */}
      {cameraPositions.map((point, index) => (
        <CameraPoint
          key={`preset-${index}`}
          position={point.position as [number, number, number]}
          label={point.label}
          onClick={() => moveCamera(point.position as [number, number, number])}
        />
      ))}
    </>
  );
};

export default function GltfViewer() {
  const [controlType, setControlType] = useState<ControlType>('orbit');
  const [curModel, setCurModel] = useState<string>('home');
  const [cameraPositions, setCameraPositions] = useState<Array<{ position: [number, number, number], label: string }>>(DEFAULT_CAMERA_POSITIONS);
  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(20, 20, 20));

  const handleAddCameraPosition = (position: [number, number, number], label: string) => {
    setCameraPositions(prev => [...prev, { position, label }]);
  };

  const handleGoTo = (position: [number, number, number]) => {
    setCameraPosition(new THREE.Vector3(...position));
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
      <Canvas camera={{ position: [cameraPosition.x, cameraPosition.y, cameraPosition.z], fov: 50 }}>
        <CameraManager 
          onAddCameraPosition={handleAddCameraPosition}
          cameraPositions={cameraPositions}
        />
        <Suspense fallback={<LoadingPlaceholder />}>
          <Model curModel={curModel} />
        </Suspense>
        <CameraControls type={controlType} cameraPositions={cameraPositions} />
        <Environment files="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/hdris/noon-grass/noon_grass_1k.hdr" background />
      </Canvas>
      <CameraPositionForm 
        onSubmit={handleAddCameraPosition} 
        cameraPosition={cameraPosition}
        onGoTo={handleGoTo}
      />
      <Leva />
    </div>
  );
}