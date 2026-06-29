import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const FarmTerrain = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshStandardMaterial 
        color="#1a2e1a" 
        wireframe={false}
        roughness={0.8}
      />
    </mesh>
  );
};

const CropRow = ({ position }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
    </Float>
  );
};

const FarmScene = () => {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[10, 10, 10]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 20, 10]} intensity={1.5} />
      
      <FarmTerrain />
      
      {/* Simulate some crop rows */}
      {Array.from({ length: 10 }).map((_, i) => (
        Array.from({ length: 10 }).map((_, j) => (
          <CropRow key={`${i}-${j}`} position={[i - 5, 0.25, j - 5]} />
        ))
      ))}
      
      <Environment preset="forest" />
    </Canvas>
  );
};

export default FarmScene;
