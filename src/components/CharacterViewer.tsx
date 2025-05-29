"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import React, { Suspense, useState } from "react";
import { ControlSelector, CameraControls, ControlType } from "./ControlSelector";
import Ecctrl from 'ecctrl';
import { KeyboardControls } from '@react-three/drei';

function Scene() {
  const gltf = useGLTF("/Qualcomm_Model_v1_fix02.gltf");
  return <primitive object={gltf.scene} />;
}

function Floor() {
  return (
    <RigidBody type="fixed" position={[0, 1, 0]}>
      <mesh receiveShadow rotation={[0, 0, 0]}>
        <boxGeometry args={[1000, 0.2, 1000]} />
        <meshStandardMaterial 
          color="#666666" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    </RigidBody>
  );
}

function Character() {
  return (
    <Ecctrl
      position={[0, 5, 0]}
      capsuleHalfHeight={0.35}
      capsuleRadius={0.3}
      turnSpeed={10}
      turnVelMultiplier={0.1}
      maxVelLimit={2}
      dragDampingC={0.2}
    >
      <mesh castShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Ecctrl>
  );
}

// Define camera positions
const DEFAULT_CAMERA_POSITIONS: Array<{ position: [number, number, number], label: string }> = [
  { position: [0, 3, 0], label: 'Start' },
  { position: [5, 3, 0], label: 'Right' },
  { position: [-5, 3, 0], label: 'Left' },
  { position: [0, 3, 5], label: 'Front' },
  { position: [0, 3, -5], label: 'Back' },
];

// Define keyboard controls
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["Shift"] },
];

export default function GltfViewer() {
  const [controlType, setControlType] = useState<ControlType>('orbit');
  const [cameraPositions, setCameraPositions] = useState<Array<{ position: [number, number, number], label: string }>>(DEFAULT_CAMERA_POSITIONS);

  const handleAddCameraPosition = (position: [number, number, number], label: string) => {
    setCameraPositions(prev => [...prev, { position, label }]);
  };

  return (
    <KeyboardControls map={keyboardMap}>
      <div className="w-full h-full">
        <ControlSelector type={controlType} onChange={setControlType} />
        <Canvas shadows camera={{ position: [20, 20, 20], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Suspense fallback={null}>
            <Physics>
              <Scene />
              <Floor />
              <Character />
            </Physics>
          </Suspense>
          <CameraControls type={controlType} cameraPositions={cameraPositions} />
        </Canvas>
      </div>
    </KeyboardControls>
  );
} 