"use client";

import { Canvas } from "@react-three/fiber";
import { useEnvironment, useGLTF, Select, Text, Environment } from "@react-three/drei";
import React, { Suspense, useState } from "react";
import { Mesh } from "three";
import { ControlSelector, CameraControls, ControlType } from "./ControlSelector";

const DEFAULT_CAMERA_POSITIONS: Array<{ position: [number, number, number], label: string }> = [
    { position: [0, 3, 0], label: 'Start' },
    { position: [5, 3, 0], label: 'Right' },
    { position: [-5, 3, 0], label: 'Left' },
    { position: [0, 3, 5], label: 'Front' },
    { position: [0, 3, -5], label: 'Back' },
  ];

function Model() {
  const gltf = useGLTF("/Qualcomm_Model_v1_fix02.gltf");
  const env = useEnvironment({ preset: "city" })
  const [selected, setSelected] = useState<string | null>(null);

  return <group position={[0, 0, 0]}>
    {selected && <Text position={[0, 5, 0]} fontSize={2} color="black">{selected}</Text>}
    {Object.entries(gltf.nodes).map(([key, node]) => {
        const newNode = node as Mesh;
        return (
            <Select key={key} onPointerOver={() =>{
              console.log([key, node]);
              setSelected(key)}} onPointerOut={() => setSelected(null)}>
            <mesh geometry={newNode.geometry} material={newNode.material} position={newNode.position} material-envMap={env}>
              {/* <boxGeometry /> */}
              {/* <meshStandardMaterial color="red" /> */}
            </mesh> 
            </Select>
          )
    })}
  </group>;
}

export default function MeshViewer() {
  const [controlType, setControlType] = useState<ControlType>('orbit');
  const [cameraPositions, setCameraPositions] = useState<Array<{ position: [number, number, number], label: string }>>(DEFAULT_CAMERA_POSITIONS);

  const handleAddCameraPosition = (position: [number, number, number], label: string) => {
    setCameraPositions(prev => [...prev, { position, label }]);
  };

  return (
    <div className="w-full h-full">
      <ControlSelector type={controlType} onChange={setControlType} />
      <Canvas camera={{ position: [5, 5, 5], fov: 90 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <CameraControls type={controlType} cameraPositions={cameraPositions} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}