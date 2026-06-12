"use client";
import { useEffect, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useThree, useLoader } from '@react-three/fiber';

//  LOADING SKELETON FOR ASSETS WHILE DOWNLOADING
function ModelFallbackMesh() {
  return (
    <mesh>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#3f3f46" wireframe />
    </mesh>
  );
}

//REMOTE ASSET LOADER COMPONENTS
function RemoteModel({ url }) {
  const gltf = useLoader(GLTFLoader, url);
  
  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf]);

  return <primitive object={clonedScene} />;
}

//BACKGROUND TEXTURE MANAGER (Main Export)
export function SceneBackground({ url }) {
  const { scene } = useThree();

  useEffect(() => {
    if (!url) {
      scene.background = null;
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
      },
      undefined,
      (err) => console.error("Error loading environmental backdrop:", err)
    );
  }, [url, scene]);

  return null;
}

//CUSTOM MODEL ROUTER GATEWAY (Main Export)
export function CustomAssetLoader({ item }) {
  if (item.type !== 'custom' || !item.url) return null;

  return (
    <Suspense fallback={<ModelFallbackMesh />}>
      <RemoteModel url={item.url} />
    </Suspense>
  );
}