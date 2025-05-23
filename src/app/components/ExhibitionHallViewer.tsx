"use client"; 

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera, Lightformer, ContactShadows } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function ExhibitionHall({ showRoof }: { showRoof: boolean }) {
  const floorSize = 70; // 70 meters
  const wallHeight = 8; // Increased height for industrial look
  const windowHeight = 2;
  const windowWidth = 4;
  const windowSpacing = 10;
  const doorWidth = 3;
  const doorHeight = 4;
  
  // Materials
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: '#ffffff',
    side: THREE.DoubleSide,
    roughness: 0.9,
    metalness: 0,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.1,
    envMapIntensity: 0.5,
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: '#b0b0b0',
    metalness: 0.8,
    roughness: 0.2,
  });

  // Function to create a window
  const Window = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[windowWidth, windowHeight, 0.1]} />
        <meshStandardMaterial color="#e8f1ff" metalness={0.9} roughness={0.1} transparent opacity={0.3} />
      </mesh>
      {/* Window frame */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[windowWidth + 0.2, windowHeight + 0.2, 0.2]} />
        <primitive object={metalMaterial} />
      </mesh>
    </group>
  );

  // Function to create a door
  const Door = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
      <mesh position={[0, doorHeight/2, 0]}>
        <boxGeometry args={[doorWidth, doorHeight, 0.2]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      {/* Door frame */}
      <mesh position={[0, doorHeight/2, 0.1]}>
        <boxGeometry args={[doorWidth + 0.4, doorHeight + 0.2, 0.4]} />
        <primitive object={metalMaterial} />
      </mesh>
    </group>
  );

  const Roof = () => {
    if (!showRoof) return null;
    
    return (
      <group position={[0, wallHeight, 0]}>
        {/* Main roof structure */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[floorSize, floorSize]} />
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
        
        {/* Ceiling beams */}
        {Array.from({ length: Math.floor(floorSize/5) }).map((_, i) => (
          <mesh 
            key={`beam-${i}`} 
            position={[-floorSize/2 + i * 5 + 2.5, -0.4, 0]}
          >
            <boxGeometry args={[0.3, 0.8, floorSize]} />
            <primitive object={metalMaterial} />
          </mesh>
        ))}

        {/* Cross beams */}
        {Array.from({ length: Math.floor(floorSize/5) }).map((_, i) => (
          <mesh 
            key={`cross-beam-${i}`} 
            position={[0, -0.4, -floorSize/2 + i * 5 + 2.5]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.3, 0.8, floorSize]} />
            <primitive object={metalMaterial} />
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <primitive object={floorMaterial} />
      </mesh>

      {/* Grid */}
      <Grid
        args={[floorSize, floorSize]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9f9f9f"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />

      {/* Walls with windows */}
      {/* Back wall */}
      <mesh position={[0, wallHeight / 2, -floorSize / 2]}>
        <boxGeometry args={[floorSize, wallHeight, 0.2]} />
        <primitive object={wallMaterial} />
      </mesh>
      {/* Back wall windows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Window 
          key={`back-window-${i}`}
          position={[
            -floorSize/2 + windowSpacing + i * windowSpacing,
            wallHeight - windowHeight - 1,
            -floorSize/2 + 0.2
          ]}
        />
      ))}

      {/* Front wall */}
      <mesh position={[0, wallHeight / 2, floorSize / 2]}>
        <boxGeometry args={[floorSize, wallHeight, 0.2]} />
        <primitive object={wallMaterial} />
      </mesh>
      {/* Front windows and door */}
      <Door position={[floorSize/4, 0, floorSize/2 - 0.2]} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Window 
          key={`front-window-${i}`}
          position={[
            -floorSize/2 + windowSpacing + i * windowSpacing,
            wallHeight - windowHeight - 1,
            floorSize/2 - 0.2
          ]}
        />
      ))}

      {/* Left wall with windows */}
      <mesh position={[-floorSize / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, wallHeight, floorSize]} />
        <primitive object={wallMaterial} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <Window 
          key={`left-window-${i}`}
          position={[
            -floorSize/2 + 0.2,
            wallHeight - windowHeight - 1,
            -floorSize/2 + windowSpacing + i * windowSpacing
          ]}
          rotation={[0, Math.PI/2, Math.PI/2]}
        />
      ))}

      {/* Right wall with windows and door */}
      <mesh position={[floorSize / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, wallHeight, floorSize]} />
        <primitive object={wallMaterial} />
      </mesh>
      <Door 
        position={[floorSize/2 - 0.2, 0, 0]} 
        rotation={[0, -Math.PI/2, 0]}
      />
      {Array.from({ length: 6 }).map((_, i) => (
        <Window 
          key={`right-window-${i}`}
          position={[
            floorSize/2 - 0.2,
            wallHeight - windowHeight - 1,
            -floorSize/2 + windowSpacing + i * windowSpacing
          ]}
          rotation={[0, -Math.PI/2, Math.PI/2]}
        />
      ))}

      {/* Roof with beams */}
      <Roof />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 10]} 
        intensity={0.5}
        castShadow
      />
      <directionalLight 
        position={[-10, 10, -10]} 
        intensity={0.2}
      />
      <directionalLight 
        position={[10, 10, -10]} 
        intensity={0.2}
      />
      
      {/* Ceiling lights */}
      {Array.from({ length: 5 }).map((_, i) => (
        Array.from({ length: 3 }).map((_, j) => (
          <pointLight
            key={`light-${i}-${j}`}
            position={[
              -floorSize/3 + i * (floorSize/3),
              wallHeight - 1,
              -floorSize/4 + j * (floorSize/2)
            ]}
            intensity={0.2}
            distance={20}
            decay={2}
          />
        ))
      ))}
    </>
  );
}

export default function ExhibitionHallViewer() {
  const [showRoof, setShowRoof] = useState(false);

  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowRoof(prev => !prev)}
          className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-md shadow-lg hover:bg-white/90 transition-colors"
        >
          {showRoof ? 'Hide Roof' : 'Show Roof'}
        </button>
      </div>
      <Canvas
        shadows
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#15151a']} />
        <hemisphereLight intensity={0.5} />
        <ContactShadows resolution={1024} frames={1} position={[0, -1.16, 0]} scale={15} blur={0.5} opacity={1} far={20} />
        <mesh scale={4} position={[3, -1.161, -1.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}>
          <ringGeometry args={[0.9, 1, 4, 1]} />
          <meshStandardMaterial color="white" roughness={0.75} />
        </mesh>
        <mesh scale={4} position={[-3, -1.161, -1]} rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}>
          <ringGeometry args={[0.9, 1, 3, 1]} />
          <meshStandardMaterial color="white" roughness={0.75} />
        </mesh>
        <PerspectiveCamera makeDefault position={[35, 15, 35]} fov={50} />
        <ExhibitionHall showRoof={showRoof} />
        <OrbitControls 
          target={[0, 5, 0]}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={100}
        />
        <Environment resolution={512}>
          {/* Ceiling */}
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -9]} scale={[10, 1, 1]} />
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -6]} scale={[10, 1, 1]} />
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, -3]} scale={[10, 1, 1]} />
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 0]} scale={[10, 1, 1]} />
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 3]} scale={[10, 1, 1]} />
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 6]} scale={[10, 1, 1]} />
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 4, 9]} scale={[10, 1, 1]} />
          {/* Sides */}
          <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-50, 2, 0]} scale={[100, 2, 1]} />
          <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[50, 2, 0]} scale={[100, 2, 1]} />
          {/* Key */}
          <Lightformer form="ring" color="red" intensity={10} scale={2} position={[10, 5, 10]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
        </Environment>
      </Canvas>
    </>
  );
}