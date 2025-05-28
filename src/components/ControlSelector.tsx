"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  OrbitControls, 
  TrackballControls, 
  FirstPersonControls, 
  FlyControls, 
  MapControls, 
  DragControls,
  TransformControls,
  ArcballControls,
  Html
} from '@react-three/drei';
import { MOUSE } from 'three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type ControlType = 
  | 'orbit' 
  | 'trackball' 
  | 'firstPerson' 
  | 'fly' 
  | 'map' 
  | 'drag'
  | 'pointerLock'
  | 'transform'
  | 'arcball'
  | 'dragFPS';

interface ControlSelectorProps {
  type: ControlType;
  onChange: (type: ControlType) => void;
}

export function ControlSelector({ type, onChange }: ControlSelectorProps) {
  return (
    <div className="fixed top-4 right-4 z-20 bg-white/80 dark:bg-black/80 p-2 rounded-lg shadow-lg">
      <select 
        value={type}
        onChange={(e) => onChange(e.target.value as ControlType)}
        className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-black dark:text-white"
      >
        <option value="orbit" className="bg-white dark:bg-black text-black dark:text-white">Orbit Controls</option>
        <option value="trackball" className="bg-white dark:bg-black text-black dark:text-white">Trackball Controls</option>
        <option value="firstPerson" className="bg-white dark:bg-black text-black dark:text-white">First Person Controls</option>
        <option value="fly" className="bg-white dark:bg-black text-black dark:text-white">Fly Controls</option>
        <option value="map" className="bg-white dark:bg-black text-black dark:text-white">Map Controls</option>
        <option value="drag" className="bg-white dark:bg-black text-black dark:text-white">Drag Controls</option>
        <option value="pointerLock" className="bg-white dark:bg-black text-black dark:text-white">Pointer Lock Controls</option>
        <option value="transform" className="bg-white dark:bg-black text-black dark:text-white">Transform Controls</option>
        <option value="arcball" className="bg-white dark:bg-black text-black dark:text-white">Arcball Controls</option>
        <option value="dragFPS" className="bg-white dark:bg-black text-black dark:text-white">Drag FPS Controls</option>
      </select>
    </div>
  );
}



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

function CameraPoint({ position, label, onClick }: { position: [number, number, number], label: string, onClick: () => void }) {
  const texture = useMemo(() => createTextTexture(label), [label]);

  return (
    <group position={position}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
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

interface CameraPositionFormProps {
  onSubmit: (position: [number, number, number], label: string) => void;
}

export function CameraControls({ type, cameraPositions = [] }: { type: ControlType, cameraPositions?: Array<{ position: [number, number, number], label: string }> }) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTransformControls, setShowTransformControls] = useState(false);
  const [isEyeLevel, setIsEyeLevel] = useState(false);
  const { camera } = useThree();

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

  // Reset camera to initial position
  const resetCamera = () => {
    camera.position.copy(initialCameraState.current.position);
    camera.quaternion.copy(initialCameraState.current.quaternion);
  };

  // Move camera to a specific position
  const moveCamera = (position: [number, number, number]) => {
    camera.position.set(...position);
    // Reset rotation to look forward
    camera.quaternion.set(0, 0, 0, 1);
  };

  // Toggle eye level with 'E' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (type === 'dragFPS' && e.key.toLowerCase() === 'e') {
        setIsEyeLevel(prev => !prev);
        // Toggle eye level relative to current position
        camera.position.y = isEyeLevel ? camera.position.y - 1.7 : camera.position.y + 1.7;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [camera, type, isEyeLevel]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click only
        setIsDragging(true);
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && type === 'dragFPS') {
        // Create quaternions for pitch and yaw
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          e.movementY * 0.002
        );
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          e.movementX * 0.002
        );

        // Apply rotations in order: yaw first, then pitch
        camera.quaternion.multiply(yawQuat);
        camera.quaternion.multiply(pitchQuat);

        // Extract the current pitch
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);
        
        // Clamp pitch to prevent flipping
        if (euler.x > Math.PI / 2) {
          euler.x = Math.PI / 2;
        //   camera.quaternion.set(0,0,0,1)
        //   camera.quaternion.setFromEuler(euler);
        } else if (euler.x < -Math.PI / 2) {
          euler.x = -Math.PI / 2;
        //   camera.quaternion.set(0,0,0,1)
        //   camera.quaternion.setFromEuler(euler);
        }

        // Force the up vector to stay vertical
        camera.up.set(0, 3, 0);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, camera, type]);

  switch (type) {
    case 'orbit':
      return (
        <OrbitControls 
          mouseButtons={{ LEFT: MOUSE.LEFT }}
          rotateSpeed={1}
          enablePan={false}
          enableZoom={true}
        />
      );
    case 'trackball':
      return (
        <TrackballControls 
          mouseButtons={{ LEFT: MOUSE.LEFT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.RIGHT }}
          rotateSpeed={1}
          noPan={true}
          zoomSpeed={1}
        />
      );
    case 'firstPerson':
      return (
        <FirstPersonControls
          activeLook={isDragging}
          movementSpeed={1.0}
          lookSpeed={0.1}
          lookVertical={true}
          autoForward={false}
          heightCoef={1}
          constrainVertical={true}
          verticalMin={0}
          verticalMax={Math.PI}
        />
      );
    case 'fly':
      return (
        <FlyControls
          dragToLook={true}
          movementSpeed={1.0}
          rollSpeed={0.005}
        />
      );
    case 'map':
      return (
        <MapControls
          enableDamping={true}
          dampingFactor={0.05}
          screenSpacePanning={false}
          minDistance={1}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2}
        />
      );
    case 'drag':
      return (
        <>
          <OrbitControls 
            mouseButtons={{ LEFT: MOUSE.LEFT }}
            rotateSpeed={1}
            enablePan={false}
            enableZoom={true}
          />
          <DragControls>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          </DragControls>
        </>
      );
    case 'pointerLock':
      return (
        <>
          <mesh position={[0, 0, -5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </>
      );
    case 'transform':
      return (
        <>
          <OrbitControls 
            mouseButtons={{ LEFT: MOUSE.LEFT }}
            rotateSpeed={1}
            enablePan={false}
            enableZoom={true}
          />
          <mesh 
            position={[0, 0, 0]}
            onClick={() => setShowTransformControls(!showTransformControls)}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
          {showTransformControls && (
            <TransformControls>
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="hotpink" />
              </mesh>
            </TransformControls>
          )}
        </>
      );
    case 'arcball':
      return (
        <ArcballControls
          enablePan={false}
          enableZoom={true}
        />
      );
    case 'dragFPS':
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
          {/* Reset button */}
          <Html position={[0, 2, 0]} center>
            <button
              onClick={resetCamera}
              className="bg-white/80 dark:bg-black/80 text-black dark:text-white px-4 py-2 rounded-lg shadow-lg hover:bg-white dark:hover:bg-black transition-colors"
            >
              Reset Camera
            </button>
          </Html>

          {/* <Html center>
            <div className="text-white pointer-events-none">
              {isDragging ? 'Dragging - Looking Around' : 'Click and Drag to Look Around'}
              <br />
              Press &apos;E&apos; to toggle eye level
            </div>
          </Html> */}
        </>
      );
    default:
      return null;
  }
}

// Separate component for the camera position form
export function CameraPositionForm({ onSubmit }: CameraPositionFormProps) {
  const [x, setX] = useState('0');
  const [y, setY] = useState('3');
  const [z, setZ] = useState('0');
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit([parseFloat(x), parseFloat(y), parseFloat(z)], label || 'Custom');
    setLabel('');
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
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Camera Position
        </button>
      </div>
    </form>
  );
} 