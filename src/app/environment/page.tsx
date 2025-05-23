"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';

const PRESETS = [
  'sunset',
  'dawn',
  'night',
  'warehouse',
  'forest',
  'apartment',
  'studio',
  'city',
  'park',
  'lobby',
] as const;

function EnvironmentScene({ preset }: { preset: typeof PRESETS[number] }) {
  // Sample objects to show material interactions
  const SampleObjects = () => (
    <>
      {/* Reflective sphere */}
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} envMapIntensity={1} />
      </mesh>

      {/* Matte box */}
      <mesh position={[-2.5, 1, 0]} castShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="white" metalness={0} roughness={0.9} envMapIntensity={0.5} />
      </mesh>

      {/* Semi-reflective cylinder */}
      <mesh position={[2.5, 1, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 2, 32]} />
        <meshStandardMaterial color="white" metalness={0.5} roughness={0.5} envMapIntensity={0.7} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="white" roughness={0.2} metalness={0.1} envMapIntensity={0.8} />
      </mesh>
    </>
  );

  return (
    <>
      <SampleObjects />
      
      {/* Basic lighting */}
      <ambientLight intensity={0.2} />
      <ContactShadows 
        resolution={2048} 
        frames={1} 
        position={[0, -0.49, 0]} 
        scale={15} 
        blur={0.5} 
        opacity={0.8} 
        far={20} 
      />

      {/* Environment map */}
      <Environment
        preset={preset}
        background
        blur={0}
        resolution={2048}
        ground={{
          height: 15,
          radius: 40,
          scale: 20
        }}
      />
    </>
  );
}

export default function EnvironmentPage() {
  const [currentPreset, setCurrentPreset] = useState<typeof PRESETS[number]>('sunset');

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 flex-wrap justify-center max-w-2xl p-4">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setCurrentPreset(preset)}
            className={`px-4 py-2 rounded-md shadow-lg transition-colors ${
              currentPreset === preset
                ? 'bg-white text-black'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}
      </div>
      <Canvas
        shadows
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8
        }}
      >
        <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={50} />
        <EnvironmentScene preset={currentPreset} />
        <OrbitControls 
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
} 