"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SceneSettings from './SceneSettings'; 
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls } from '@react-three/drei';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Profile system states
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  
  const [sceneItems, setSceneItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [transformMode, setTransformMode] = useState('translate');
  const orbitRef = useRef(null);

  const spawnObject = (shapeType) => {
    const newObj = {
      id: Math.random().toString(),
      category: 'object',
      type: shapeType,
      position: [(Math.random() - 0.5) * 4, 0.5, (Math.random() - 0.5) * 4], 
      scale: [1, 1, 1],
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), 
      selected: false
    };
    setSceneItems((prev) => [...prev, newObj]);
  };

  const spawnLight = (lightType) => {
    const newLight = {
      id: Math.random().toString(),
      category: 'light',
      type: lightType,
      position: [(Math.random() - 0.5) * 4, 3, (Math.random() - 0.5) * 4], 
      intensity: lightType === 'ambient' ? 0.5 : 1.5,
      color: '#ffffff',
      selected: false
    };
    setSceneItems((prev) => [...prev, newLight]);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  // Fetch index listing of user profiles
  const refreshProfilesList = async (userEmail) => {
    try {
      const res = await fetch(`/api/scene?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      }
    } catch (err) {
      console.error("Error updating configuration indices:", err);
    }
  };

  // Load objects for a specific chosen profile configuration name
  const loadNamedProfile = async (profileName) => {
    if (!user?.email || !profileName) return;
    try {
      const response = await fetch(`/api/scene?email=${encodeURIComponent(user.email)}&profileName=${encodeURIComponent(profileName)}`);
      if (response.ok) {
        const data = await response.json();
        setSceneItems(data.sceneItems || []);
        setCurrentProfile(profileName);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save/Update layout handler
  const saveSceneToDatabase = async (profileName) => {
    if (!user?.email || !profileName) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          profileName: profileName,
          sceneItems: sceneItems 
        }),
      });

      if (response.ok) {
        setCurrentProfile(profileName);
        await refreshProfilesList(user.email);
        alert(`✨ Layout successfully synced to profile "${profileName}"!`);
      } else {
        const data = await response.json();
        alert(`Failed to save layout parameters: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete profile layout sequence configuration
  const deleteProfileFromDatabase = async (profileName) => {
    if (!user?.email || !profileName) return;
    if (!confirm(`Are you sure you want to delete profile "${profileName}"?`)) return;

    try {
      const response = await fetch(`/api/scene?email=${encodeURIComponent(user.email)}&profileName=${encodeURIComponent(profileName)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Profile wiped successfully.');
        if (currentProfile === profileName) {
          setCurrentProfile(null);
          setSceneItems([]); // Clear current canvas space
        }
        await refreshProfilesList(user.email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    } 
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Bootstrap user canvas layouts panel registries index map
    const bootstrapLayouts = async () => {
      try {
        const res = await fetch(`/api/scene?email=${encodeURIComponent(parsedUser.email)}`);
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
          
          // Auto-load the newest modified setup layout profile on start if it exists
          if (data.profiles && data.profiles.length > 0) {
            const initialProfile = data.profiles[0].profileName;
            const itemResponse = await fetch(`/api/scene?email=${encodeURIComponent(parsedUser.email)}&profileName=${encodeURIComponent(initialProfile)}`);
            if (itemResponse.ok) {
              const itemData = await itemResponse.json();
              setSceneItems(itemData.sceneItems || []);
              setCurrentProfile(initialProfile);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); 
      }
    };

    bootstrapLayouts();

    const disableContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', disableContextMenu);
    return () => document.removeEventListener('contextmenu', disableContextMenu);
  }, [router]);

  const handleItemSelect = (item) => {
    setSceneItems(prev => prev.map(i => ({ ...i, selected: i.id === item.id })));
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
            {currentProfile && <span className="text-zinc-600 ml-2">({currentProfile})</span>}
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
        
        {/* COMPONENT INTEGRATION PORT WITH COMPREHENSIVE CONTROL SYSTEM HOOKS */}
        <div className="lg:col-span-1">
          <SceneSettings 
            spawnObject={spawnObject}
            spawnLight={spawnLight}
            profiles={profiles}
            currentProfile={currentProfile}
            setCurrentProfile={setCurrentProfile}
            saveSceneToDatabase={saveSceneToDatabase}
            loadNamedProfile={loadNamedProfile}
            deleteProfileFromDatabase={deleteProfileFromDatabase}
            setSceneItems={setSceneItems} // ➕ Passed down to enable workspace resetting functionality
            isSaving={isSaving}
          />
        </div>

        {/* CENTRAL VIEWPORT CONTAINER */}
        {/* CENTRAL VIEWPORT CONTAINER */}
        <section className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xl min-h-[550px] relative">
          
          {/* HEADER OPTIONS BAR */}
          <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 z-10">
            <div className="flex items-center space-x-4">
              <span className="font-mono text-red-400">
                {currentProfile ? `profile_${currentProfile.toLowerCase().replace(/\s+/g, '_')}.gl` : 'viewport_canvas_01.gl'}
              </span>
              
              {/* 🛠️ GIZMO INTERACTION MODE SELECTOR */}
              <div className="flex bg-zinc-950 rounded-md p-0.5 border border-zinc-800 ml-4">
                <button
                  onClick={() => setTransformMode('translate')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${transformMode === 'translate' ? 'bg-red-500 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Move Mode
                </button>
                <button
                  onClick={() => setTransformMode('scale')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${transformMode === 'scale' ? 'bg-red-500 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Resize Mode
                </button>
              </div>
            </div>
            <span className="text-zinc-500">THREE.JS RUNTIME RUNNING</span>
          </div>
          
          {/* VIEWPORT CONTENT HOUSING */}
          <div className="flex-1 relative w-full h-full bg-zinc-950">
            
            {/* FLOATING INSPECTOR PANEL */}
            {activeItem && (
              <div className="absolute top-4 right-4 z-20 w-60 bg-zinc-900/95 border border-zinc-800 shadow-2xl rounded-lg overflow-hidden backdrop-blur font-mono text-[11px]">
                <div className="bg-zinc-800 px-3 py-1.5 border-b border-zinc-700 font-semibold text-zinc-300 flex justify-between items-center">
                  <span>{activeItem.category === 'object' ? 'OBJECT INSPECTOR' : 'LIGHT INSPECTOR'}</span>
                  <span className="text-[9px] bg-zinc-900 text-red-400 px-1.5 py-0.5 rounded capitalize">{activeItem.type}</span>
                </div>
                
                <div className="p-3 space-y-3">
                  
                  {/* 📦 GEOMETRIC SHAPE CONTROLS */}
                  {activeItem.category === 'object' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">objectColor</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-zinc-500 font-bold uppercase">{activeItem.color}</span>
                          <div className="w-3 h-3 rounded-sm border border-zinc-700" style={{ backgroundColor: activeItem.color }} />
                        </div>
                      </div>

                      <hr className="border-zinc-800" />

                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-400">
                          <span>scaleX</span>
                          <span className="text-red-400">{(activeItem.scale?.[0] ?? 1).toFixed(2)}</span>
                        </div>
                        <input 
                          type="range" min="0.2" max="4" step="0.05"
                          value={activeItem.scale?.[0] ?? 1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setSceneItems(prev => prev.map(i => i.id === activeItem.id ? { ...i, scale: [val, i.scale?.[1] ?? 1, i.scale?.[2] ?? 1] } : i));
                            setActiveItem(prev => prev ? { ...prev, scale: [val, prev.scale?.[1] ?? 1, prev.scale?.[2] ?? 1] } : null);
                          }}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-400">
                          <span>scaleY</span>
                          <span className="text-red-400">{(activeItem.scale?.[1] ?? 1).toFixed(2)}</span>
                        </div>
                        <input 
                          type="range" min="0.2" max="4" step="0.05"
                          value={activeItem.scale?.[1] ?? 1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setSceneItems(prev => prev.map(i => i.id === activeItem.id ? { ...i, scale: [i.scale?.[0] ?? 1, val, i.scale?.[2] ?? 1] } : i));
                            setActiveItem(prev => prev ? { ...prev, scale: [prev.scale?.[0] ?? 1, val, prev.scale?.[2] ?? 1] } : null);
                          }}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-400">
                          <span>scaleZ</span>
                          <span className="text-red-400">{(activeItem.scale?.[2] ?? 1).toFixed(2)}</span>
                        </div>
                        <input 
                          type="range" min="0.2" max="4" step="0.05"
                          value={activeItem.scale?.[2] ?? 1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setSceneItems(prev => prev.map(i => i.id === activeItem.id ? { ...i, scale: [i.scale?.[0] ?? 1, i.scale?.[1] ?? 1, val] } : i));
                            setActiveItem(prev => prev ? { ...prev, scale: [prev.scale?.[0] ?? 1, prev.scale?.[1] ?? 1, val] } : null);
                          }}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>
                    </>
                  )}

                  {/* 💡 AMBIENT/DIRECTIONAL LIGHT SOURCE CONTROLS */}
                  {activeItem.category === 'light' && (
                    <>
                      {/* CHROMATIC EMISSION FIELD */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-400">
                          <span>lightColor</span>
                          <span className="text-orange-400 uppercase">{activeItem.color || '#ffffff'}</span>
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <input 
                            type="color" 
                            value={activeItem.color || '#ffffff'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSceneItems(prev => prev.map(i => i.id === activeItem.id ? { ...i, color: val } : i));
                              setActiveItem(prev => prev ? { ...prev, color: val } : null);
                            }}
                            className="w-8 h-6 bg-transparent border border-zinc-700 cursor-pointer rounded bg-zinc-950 p-0.5"
                          />
                          <span className="text-[10px] text-zinc-500">Modify emission wavelength hue</span>
                        </div>
                      </div>

                      <hr className="border-zinc-800" />

                      {/* INTENSITY POWER CONTROLLER */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-400">
                          <span>intensity (Power)</span>
                          <span className="text-orange-400">{(activeItem.intensity ?? 1).toFixed(2)} lm</span>
                        </div>
                        <input 
                          type="range" min="0" max="6" step="0.1"
                          value={activeItem.intensity ?? 1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setSceneItems(prev => prev.map(i => i.id === activeItem.id ? { ...i, intensity: val } : i));
                            setActiveItem(prev => prev ? { ...prev, intensity: val } : null);
                          }}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setSceneItems(prev => prev.map(i => ({ ...i, selected: false })));
                    setActiveItem(null);
                  }}
                  className="w-full py-1 bg-zinc-800 border-t border-zinc-700 text-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750 transition-colors"
                >
                  Close Controls
                </button>
              </div>
            )}

            <Canvas camera={{ position: [0, 5, 8] }} shadows>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
            
              {/* RENDER LOOP FOR OBJECTS AND LIGHTS WITH ADVANCED TRANSFORM CAPABILITIES */}
              {sceneItems.map((item) => {
                const isSelected = activeItem?.id === item.id;

                if (item.category === 'object') {
                  const meshContent = (
                    <>
                      {item.type === 'cube' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
                      {item.type === 'circle' && <circleGeometry args={[0.8, 32]} />}
                      {item.type === 'triangle' && <coneGeometry args={[0.8, 1.4, 3]} />}
                      <meshStandardMaterial color={item.selected ? '#ef4444' : item.color} roughness={0.4} />
                    </>
                  );

                  if (isSelected) {
                    return (
                      <TransformControls
                        key={`transform-${item.id}`}
                        position={item.position}
                        mode={transformMode} // 👈 DYNAMICALLY SWITCHES BETWEEN 'translate' AND 'scale'
                        onDraggingChanged={(e) => {
                          if (orbitRef.current) orbitRef.current.enabled = !e.value;
                        }}
                        onMouseUp={(e) => {
                          // Captures both position vectors and size metrics when you let go of the mouse
                          const { x, y, z } = e.target.object.position;
                          const s = e.target.object.scale;
                          const newPos = [x, y, z];
                          const newScale = [s.x, s.y, s.z];

                          setSceneItems(prev => prev.map(i => i.id === item.id ? { ...i, position: newPos, scale: newScale } : i));
                          setActiveItem(prev => prev && prev.id === item.id ? { ...prev, position: newPos, scale: newScale } : prev);
                        }}
                      >
                        <mesh 
                          scale={item.scale || [1, 1, 1]} // 👈 TELLS THREEJS TO RESIZE THE OBJECT
                          castShadow 
                          receiveShadow 
                          onPointerDown={(e) => { e.stopPropagation(); handleItemSelect(item); }}
                        >
                          {meshContent}
                        </mesh>
                      </TransformControls>
                    );
                  }

                  return (
                    <mesh 
                      key={item.id} 
                      position={item.position}
                      scale={item.scale || [1, 1, 1]} // 👈 TELLS THREEJS TO RENDER SAVED SIZES
                      castShadow 
                      receiveShadow
                      onPointerDown={(e) => {
                        if (e.nativeEvent.button === 2 || e.nativeEvent.button === 0) {
                          e.stopPropagation(); 
                          handleItemSelect(item);
                        }
                      }}
                    >
                      {meshContent}
                    </mesh>
                  );
                  
                } else {
                  // Environmental Lights Rendering Loop
                  const isSelected = activeItem?.id === item.id;
                  
                  // Centralizing the light configuration template
                  const lightContent = (
                    <>
                      <sphereGeometry args={[0.2, 16, 16]} />
                      <meshBasicMaterial 
                        color={item.selected ? "#ef4444" : (item.color || "#ffffff")} 
                        wireframe 
                      />
                      {item.type === 'ambient' && (
                        <ambientLight intensity={item.intensity} color={item.color || "#ffffff"} />
                      )}
                      {item.type === 'directional' && (
                        <directionalLight 
                          intensity={item.intensity} 
                          color={item.color || "#ffffff"} 
                          castShadow 
                          position={[0, 0, 0]} // Position stays relative to its interactive mesh parent wrapper
                        />
                      )}
                    </>
                  );

                  if (isSelected) {
                    return (
                      <TransformControls
                        key={`transform-${item.id}`}
                        position={item.position}
                        mode="translate" // Lights are transformed through spatial movement handles
                        onDraggingChanged={(e) => {
                          if (orbitRef.current) orbitRef.current.enabled = !e.value;
                        }}
                        onMouseUp={(e) => {
                          const { x, y, z } = e.target.object.position;
                          const newPos = [x, y, z];
                          setSceneItems(prev => prev.map(i => i.id === item.id ? { ...i, position: newPos } : i));
                          setActiveItem(prev => prev && prev.id === item.id ? { ...prev, position: newPos } : prev);
                        }}
                      >
                        <mesh onPointerDown={(e) => { e.stopPropagation(); handleItemSelect(item); }}>
                          {lightContent}
                        </mesh>
                      </TransformControls>
                    );
                  }

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
                      {lightContent}
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
              
              <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.05} />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <shadowMaterial opacity={0.4} />
              </mesh>
            </Canvas>
          </div>
        </section>
      </main>
    </div>
  );
}