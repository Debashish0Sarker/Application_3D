"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SceneSettings from './SceneSettings'; 
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

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

  const spawnObject = (shapeType) => {
    const newObj = {
      id: Math.random().toString(),
      category: 'object',
      type: shapeType,
      position: [(Math.random() - 0.5) * 4, 0.5, (Math.random() - 0.5) * 4], 
      scale: 1,
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
        <section className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xl min-h-[550px]">
          <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-red-400">
              {currentProfile ? `profile_${currentProfile.toLowerCase().replace(/\s+/g, '_')}.gl` : 'viewport_canvas_01.gl'}
            </span>
            <span className="text-zinc-500">THREE.JS RUNTIME RUNNING</span>
          </div>
          
          <div className="flex-1 relative w-full h-full bg-zinc-950">
            <Canvas camera={{ position: [0, 5, 8] }} shadows>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
              
              {/* 🛠️ FIXED CONDITIONAL RENDERING LOOP FOR MESHES VS LIGHTING ELEMENTS */}
              {sceneItems.map((item) => {
                if (item.category === 'object') {
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
                      {item.type === 'cube' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
                      {item.type === 'circle' && <circleGeometry args={[0.8, 32]} />}
                      {item.type === 'triangle' && <coneGeometry args={[0.8, 1.4, 3]} />}
                      <meshStandardMaterial color={item.selected ? '#ef4444' : item.color} roughness={0.4} />
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