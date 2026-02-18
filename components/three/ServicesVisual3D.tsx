"use client";

import { useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function ServicesVisual3D() {
  const t = useTranslations("visuals");
  const summary = t.raw("servicesSummary") as { title: string; tag: string }[];

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.4, 6], fov: 45 }}
      className="absolute inset-0 h-full w-full pointer-events-none"
      gl={{ alpha: true }}
    >
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#0ea5a4" />
      <directionalLight position={[3, 4, 4]} intensity={1} color="#0ea5a4" />
      <directionalLight position={[-3, -3, -4]} intensity={0.35} color="#38bdf8" />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#0ea5a4" emissive="#0ea5a4" emissiveIntensity={0.6} />
      </mesh>
      <ServiceStack items={summary} />
    </Canvas>
  );
}

function ServiceStack({ items }: { items: { title: string; tag: string }[] }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.08;
    }
  });

  const cardMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b162b",
        roughness: 0.35,
        metalness: 0.35,
        transparent: true,
        opacity: 0.95,
        emissive: new THREE.Color("#0ea5a4").multiplyScalar(0.25),
      }),
    [],
  );

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {items.map((item, idx) => {
        const y = (items.length / 2 - idx) * 0.9;
        return (
          <Float key={item.title} speed={0.8} rotationIntensity={0.2} floatIntensity={0.25}>
            <RoundedBox args={[2.8, 0.7, 0.2]} radius={0.2} position={[0, y, 0]}>
              <meshStandardMaterial {...cardMaterial} />
              <Html
                center
                style={{
                  pointerEvents: "none",
                  color: "#e2e8f0",
                  textAlign: "center",
                  fontSize: "12px",
                  lineHeight: "16px",
                }}
              >
                <div className="font-semibold text-slate-100">{item.title}</div>
                <div className="text-[11px] text-slate-300">{item.tag}</div>
              </Html>
            </RoundedBox>
          </Float>
        );
      })}
    </group>
  );
}
