"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import React, { Suspense } from "react";

function Model() {
  const gltf = useGLTF("/Qualcomm_Model_v1_fix02.gltf");
  return <primitive object={gltf.scene} />;
}

export default function GltfViewer() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [20, 20, 20], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
} 