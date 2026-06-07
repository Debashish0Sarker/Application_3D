"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
// 1. Import our fresh 3D tools
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// 🟢 SUB-COMPONENT: A Spinning 3D Cube Mesh
function SpinningCube() {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // useFrame runs on every single animation frame loop (around 60-120fps)
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Defines shape dimensions: [width, height, depth] */}
      <boxGeometry args={[2, 2, 2]} />
      {/* Defines surface look: changes color to bright crimson when mouse hovers */}
      <meshStandardMaterial color={hovered ? '#ef4444' : '#b91c1c'} roughness={0.3} />
    </mesh>
  );
}

// 🟢 MAIN COMPONENT
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
    } else {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-lg animate-pulse">Authenticating workspace session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      {/* HEADERBAR */}
      <header className="w-full border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wider uppercase text-zinc-200">
            VR Control Center
          </h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <span className="text-sm text-zinc-400">
            Operator: <strong className="text-red-400 font-medium">@{user?.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-red-950 hover:text-red-400 border border-zinc-700 hover:border-red-900 rounded-lg transition-all"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* METRICS SIDEBAR & VIEWPORT GRID */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">System Status</h3>
            <div className="space-y-2 text-xs">
              <p className="flex justify-between"><span className="text-zinc-500">Core Engine:</span> <span className="text-green-400 font-mono">ONLINE</span></p>
              {/* Status turned to ACTIVE! */}
              <p className="flex justify-between"><span className="text-zinc-500">Render Driver:</span> <span className="text-green-400 font-mono font-bold animate-pulse">ACTIVE (WEBGL2)</span></p>
              <p className="flex justify-between"><span className="text-zinc-500">DB Pipeline:</span> <span className="text-green-400 font-mono">CONNECTED</span></p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">3D Scene Settings</h3>
            <p className="text-xs text-zinc-400 mb-2">💡 Interactive Hotkeys Connected:</p>
            <ul className="text-[11px] text-zinc-500 list-disc list-inside space-y-1">
              <li>Left-Click + Drag to Rotate Space</li>
              <li>Scroll Wheel to Zoom In/Out</li>
              <li>Click Object to Toggle Scale size</li>
            </ul>
          </div>
        </section>

        {/* 🚀 CENTRAL VIEWPORT CONTAINER */}
        <section className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xl min-h-[550px]">
          <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-red-400">viewport_canvas_01.gl</span>
            <span className="text-zinc-500">THREE.JS RUNTIME RUNNING</span>
          </div>
          
          {/* This relative div encapsulates our live WebGL context viewport */}
          <div className="flex-1 relative w-full h-full bg-zinc-950">
            <Canvas camera={{ position: [0, 0, 5.5] }}>
              {/* Studio lighting environment components */}
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <directionalLight position={[-5, 5, 5]} intensity={1} />
              
              {/* Renders our custom cube component */}
              <SpinningCube />
              
              {/* Enables mouse drag orbit controls context */}
              <OrbitControls enableZoom={true} maxDistance={10} minDistance={3} />
            </Canvas>
          </div>
        </section>

      </main>
    </div>
  );
}