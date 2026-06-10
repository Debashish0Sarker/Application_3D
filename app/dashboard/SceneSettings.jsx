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
  setSceneItems, // Passed down to allow clearing canvas workspace arrays
  isSaving 
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
    setSceneItems([]); // Clear out current canvas elements for a clean slate
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

        {/* Dropdown to switch profiles */}
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

        {/* Save layout setup form */}
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

        {/* Action Button Controls */}
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
    </section>
  );
}