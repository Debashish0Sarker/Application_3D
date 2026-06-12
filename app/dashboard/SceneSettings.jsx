"use client";
import { useState } from 'react';

export default function SceneSettings({ 
  spawnObject, 
  spawnLight, 
  profiles,
  currentProfile,
  setCurrentProfile,
  saveSceneToDatabase,
  loadNamedProfile,
  deleteProfileFromDatabase,
  setSceneItems,
  isSaving,
  bgInputText,
  setBgInputText,
  backgroundImageUrl,
  setBackgroundImageUrl,
  customModelUrlInput,
  setCustomModelUrlInput
}) {
  const [newProfileName, setNewProfileName] = useState('');

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    saveSceneToDatabase(newProfileName.trim());
    setNewProfileName(''); 
  };

  const handleCreateNewWorkspace = () => {
    setCurrentProfile(null);
    setSceneItems([]);
    setNewProfileName('');
  };

  return (
    <section className="space-y-4">
      {/* 1. PROFILE CONTROL MANAGER */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Profile Management
          </h3>
          {currentProfile && (
            <button
              onClick={handleCreateNewWorkspace}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition-all"
            >
              ➕ New Scene
            </button>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Active Map Environment</label>
          <select
            value={currentProfile || ''}
            onChange={(e) => loadNamedProfile(e.target.value)}
            className="w-full bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 rounded-lg p-2 focus:outline-none focus:border-zinc-700"
          >
            <option value="" disabled>-- Select a Workspace Profile --</option>
            {profiles.map((p) => (
              <option key={p.profileName} value={p.profileName}>
                {p.profileName}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSaveSubmit} className="space-y-2">
          <label className="text-xs text-zinc-500 block">
            {currentProfile ? "Save a copy as fresh profile:" : "Save current layout as:"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter unique profile name..."
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="flex-1 bg-zinc-950 text-xs border border-zinc-800 rounded-lg p-2 focus:outline-none focus:border-zinc-700 text-zinc-200"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 rounded-lg text-xs font-semibold text-emerald-400 transition-all"
            >
              Save
            </button>
          </div>
        </form>

        {currentProfile && (
          <div className="pt-2 border-t border-zinc-800 flex justify-between gap-2">
            <button
              onClick={() => saveSceneToDatabase(currentProfile)}
              disabled={isSaving}
              className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-medium transition-all"
            >
              {isSaving ? 'Updating...' : `Update "${currentProfile}"`}
            </button>
            <button
              onClick={() => deleteProfileFromDatabase(currentProfile)}
              className="px-2.5 bg-zinc-900 hover:bg-red-950/50 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-900 rounded-lg text-xs transition-all"
              title="Delete Profile"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* 2. OBJECT SPAWNER */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Add Objects</h3>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => spawnObject('cube')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Cube</button>
          <button onClick={() => spawnObject('circle')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Circle</button>
          <button onClick={() => spawnObject('triangle')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Triangle</button>
        </div>
      </div>

      {/* 3. LIGHT SPAWNER */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Add Lights</h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => spawnLight('ambient')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Ambient</button>
          <button onClick={() => spawnLight('directional')} className="py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 active:scale-95 transition-all">Directional</button>
        </div>
      </div>

      {/* 🌆 4. ENVIRONMENT & CUSTOM ASSETS */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Environment Backdrop</h3>
          <div className="space-y-2">
            {/* ✅ FIXED: Converted from vulnerable text input to a native local file explorer selector */}
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Safely streams local desktop images directly inside browser storage memory space
                  const secureObjectUrl = URL.createObjectURL(file);
                  setBackgroundImageUrl(secureObjectUrl);
                }
              }}
              className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 file:cursor-pointer"
            />
            
            {/* ✅ FIXED: Removed duplicate 'Apply' layout styling and connected accurate resetting clear actions */}
            {backgroundImageUrl && (
              <button
                onClick={() => {
                  setBackgroundImageUrl('');
                  if (typeof setBgInputText === 'function') setBgInputText('');
                }}
                className="w-full py-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/40 rounded-lg text-xs border border-red-900/30 font-semibold tracking-wide transition-colors"
              >
                Clear Backdrop
              </button>
            )}
          </div>
        </div>

        <hr className="border-zinc-800" />

        <div>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Import 3D Asset</h3>
          <div className="space-y-2">
            <input 
              type="text"
              placeholder="Paste direct .gltf or .glb URL..."
              value={customModelUrlInput}
              onChange={(e) => setCustomModelUrlInput(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-700 font-mono"
            />
            <button
              onClick={() => {
                if (!customModelUrlInput.trim()) return;
                spawnObject('custom', customModelUrlInput.trim());
                setCustomModelUrlInput('');
              }}
              className="w-full py-2 text-center text-xs font-bold bg-red-500 hover:bg-red-600 rounded-lg text-white uppercase tracking-wider transition-all"
            >
              + Inject Custom Model
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}