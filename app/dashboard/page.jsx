"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
// 1. Import our fresh 3D tools
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

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
  const [sceneItems, setSceneItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  // Handler to add new shapes (Cube, Circle, Triangle)
  const spawnObject = (shapeType) => {
    const newObj = {
      id: Math.random().toString(),
      category: 'object',
      type: shapeType,
      position: [(Math.random() - 0.5) * 4, 0.5, (Math.random() - 0.5) * 4], // Random landing spot 
      scale: 1,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Gives every spawned item a random unique color
      animate: false, // Default animation state is off
      selected: false
    };
    setSceneItems((prev) => [...prev, newObj]);
  };

  const spawnLight = (lightType) => {
    const newLight = {
      id: Math.random().toString(),
      category: 'light',
      type: lightType,
      position: [(Math.random() - 0.5) * 4, 3, (Math.random() - 0.5) * 4], // Spawn lights slightly higher in the air
      intensity: lightType === 'ambient' ? 0.5 : 1.5,
      selected: false
    };
    setSceneItems((prev) => [...prev, newLight]);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  useEffect(() => {
    // 1. Authenticate and verify user login session
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
    } else {
      setUser(JSON.parse(storedUser));
      setLoading(false); // Tells React it's safe to hide the loading screen
    }

    // 2. Intercept and block default browser right-click context menus
    const disableContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', disableContextMenu);
    
    // Cleanup listeners when leaving the page
    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
    };
  }, [router]);

  const handleItemSelect = (item) => {
    // 1. Loop through all items, set the clicked item's selected flag to true, others to false
    setSceneItems(prev => prev.map(i => ({ ...i, selected: i.id === item.id })));
    // 2. Save it to our active reference state
    setActiveItem(item);
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
        
        {/* --- REPLACE YOUR ORIGINAL LEFT SIDEBAR SECTION WITH THIS --- */}
        <section className="lg:col-span-1 space-y-4">
          
          {/* Object Spawning Panel */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Add Objects</h3>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => spawnObject('cube')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Cube</button>
              <button onClick={() => spawnObject('circle')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Circle</button>
              <button onClick={() => spawnObject('triangle')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Triangle</button>
            </div>
          </div>

          {/* Light Spawning Panel */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Add Lights</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => spawnLight('ambient')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Ambient</button>
              <button onClick={() => spawnLight('directional')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Directional</button>
            </div>
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
            <Canvas camera={{ position: [0, 5, 8] }} shadows>
              {/* 1. Subtle global light so things aren't completely black in the shadows */}
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <directionalLight 
                position={[5, 8, 5]} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize={[1024, 1024]} 
              />
              
              {/* --- UPDATE THE CANVAS LOOP TO LOOK LIKE THIS --- */}
            {sceneItems.map((item) => {
              if (item.category === 'object') {
                return (
                  <mesh 
                    key={item.id} 
                    position={item.position}
                    // This triggers whenever a user mouse-clicks this specific shape
                    onPointerDown={(e) => {
                      // nativeEvent.button === 0 is Left-Click, 2 is Right-Click
                      if (e.nativeEvent.button === 2 || e.nativeEvent.button === 0) {
                        e.stopPropagation(); // Stops the click from bleeding through to other objects underneath
                        handleItemSelect(item);
                      }
                    }}
                  >
                    {item.type === 'cube' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
                    {item.type === 'circle' && <circleGeometry args={[0.8, 32]} />}
                    {item.type === 'triangle' && <coneGeometry args={[0.8, 1.4, 3]} />}
                    
                    {/* Visual feedback: if selected, make the material have a subtle glow border or brighter look */}
                    <meshStandardMaterial 
                      color={item.selected ? '#ef4444' : item.color} 
                      roughness={0.4} 
                    />
                  </mesh>
                );
              } else {
                return (
                  <mesh 
                    key={item.id} 
                    position={item.position}
                    onPointerDown={(e) => {
                      if (e.nativeEvent.button === 2 || e.nativeEvent.button === 0) {
                        e.stopPropagation();
                        handleItemSelect(item);
                      }
                    }}
                  >
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial 
                      color={item.selected ? "#ef4444" : (item.type === 'ambient' ? "#fef08a" : "#fb923c")} 
                      wireframe 
                    />
                    
                    {item.type === 'ambient' && <ambientLight intensity={item.intensity} />}
                    {item.type === 'directional' && <directionalLight intensity={item.intensity} castShadow />}
                  </mesh>
                );
              }
            })}

              <Grid
                position={[0, -0.01, 0]}
                args={[10.5, 10.5]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#3f3f46"
                sectionSize={2.5}
                sectionThickness={1}
                sectionColor="#71717a"
                fadeDistance={20}
              />
            
              <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>
        </section>

      </main>
    </div>
  );
}