"use client";

import React, { useState, useEffect } from 'react';
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
        className="bg-transparent border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
      >
        <option value="orbit">Orbit Controls</option>
        <option value="trackball">Trackball Controls</option>
        <option value="firstPerson">First Person Controls</option>
        <option value="fly">Fly Controls</option>
        <option value="map">Map Controls</option>
        <option value="drag">Drag Controls</option>
        <option value="pointerLock">Pointer Lock Controls</option>
        <option value="transform">Transform Controls</option>
        <option value="arcball">Arcball Controls</option>
        <option value="dragFPS">Drag FPS Controls</option>
      </select>
    </div>
  );
}

export function CameraControls({ type }: { type: ControlType }) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTransformControls, setShowTransformControls] = useState(false);
  const { camera } = useThree();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click only
        setIsDragging(true);
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Rotate camera based on mouse movement
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x -= e.movementY * 0.002;
        
        // Clamp vertical rotation to prevent flipping
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
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
  }, [isDragging, camera]);

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
          <mesh position={[0, 0, -5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
          <Html center>
            <div className="text-white pointer-events-none">
              {isDragging ? 'Dragging - Looking Around' : 'Click and Drag to Look Around'}
            </div>
          </Html>
        </>
      );
    default:
      return null;
  }
} 