"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Protect the route: Ensure user is authenticated before showing content
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      // No session found? Boot them back to the login page immediately
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
      {/* 🟢 TOP NAVIGATION BAR */}
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

      {/* 🟢 MAIN GRID CONTAINER */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDE PANELS FOR METRICS / CONTROLS */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">System Status</h3>
            <div className="space-y-2 text-xs">
              <p className="flex justify-between"><span className="text-zinc-500">Core Engine:</span> <span className="text-green-400 font-mono">ONLINE</span></p>
              <p className="flex justify-between"><span className="text-zinc-500">Render Driver:</span> <span className="text-yellow-500 font-mono">AWAITING CANVAS</span></p>
              <p className="flex justify-between"><span className="text-zinc-500">DB Pipeline:</span> <span className="text-green-400 font-mono">CONNECTED</span></p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">3D Scene Settings</h3>
            <p className="text-xs text-zinc-500 mb-4">Controls will activate once the Three.js runtime mounts inside the viewport grid.</p>
            <button disabled className="w-full py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-500 cursor-not-allowed">
              Initialize Environment
            </button>
          </div>
        </section>

        {/* 🚀 CENTRAL VIEWPORT: WHERE YOUR 3D WORLD WILL LIVE */}
        <section className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xl min-h-[500px]">
          <div className="bg-zinc-950/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono">viewport_canvas_01.gl</span>
            <span className="text-zinc-600">WebGL2</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-center pattern-grid">
            <div className="p-4 rounded-full bg-red-950/30 border border-red-900/40 text-red-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1V9a1 1 0 112 0v1a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-200">Ready for 3D Application Content</h2>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Your secure user session is verified. This central dark viewport container is styled and dimensioned to handle your upcoming React Three Fiber Canvas setup.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}