"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Decal, Float, Html, Line, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useTranslations } from "next-intl";

export function TechCore3D() {
  const t = useTranslations("visuals");
  const panels = t.raw("techCorePanels") as string[];

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      className="absolute inset-0 h-full w-full pointer-events-none"
      gl={{ alpha: true }}
    >
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#0ea5a4" />
      <directionalLight position={[4, 6, 6]} intensity={1} color="#0ea5a4" />
      <directionalLight position={[-4, -3, -6]} intensity={0.4} color="#38bdf8" />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#0ea5a4" emissive="#0ea5a4" emissiveIntensity={0.6} />
      </mesh>
      <TechCoreSphere />
      <PanelRing labels={panels} />
    </Canvas>
  );
}

function TechCoreSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const logo = useTexture("/logo.png");

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.2;
      sphereRef.current.position.y = Math.sin(t * 0.6) * 0.1;
    }
  });

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0ea5a4",
        roughness: 0.35,
        metalness: 0.2,
        emissive: new THREE.Color("#0ea5a4").multiplyScalar(0.25),
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );

  return (
    <Float speed={1} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial {...mat} />
        {logo && (
          <Decal
            position={[0, 0, 1.6]}
            scale={[1.4, 1.4, 1.4]}
            map={logo}
            flatShading
            transparent
          />
        )}
      </mesh>
    </Float>
  );
}

function PanelRing({ labels }: { labels: string[] }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {labels.map((label, idx) => {
        const angle = (idx / labels.length) * Math.PI * 2;
        const radius = 3.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = idx % 2 === 0 ? 0.7 : -0.4;

        return (
          <Float key={label} speed={1} rotationIntensity={0.25} floatIntensity={0.25}>
            <RoundedBox
              args={[1.8, 0.8, 0.18]}
              position={[x, y, z]}
              radius={0.18}
              smoothness={6}
            >
              <meshStandardMaterial
                color="#0b162b"
                roughness={0.4}
                metalness={0.4}
                emissive={new THREE.Color("#0ea5a4").multiplyScalar(0.35)}
                opacity={0.95}
                transparent
              />
              <Html center style={{ pointerEvents: "none", color: "#e2e8f0", fontSize: "12px" }}>
                {label}
              </Html>
            </RoundedBox>
            <Line
              points={[
                new THREE.Vector3(x, y, z),
                new THREE.Vector3(0, 0, 0),
              ]}
              color="#38bdf8"
              lineWidth={1}
              transparent
              opacity={0.5}
            />
          </Float>
        );
      })}
    </group>
  );
}
