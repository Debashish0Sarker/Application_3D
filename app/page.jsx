"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Switch endpoints dynamically based on the form state
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    // Conditionally bundle payload data
    const payload = isLogin 
      ? { username, password } 
      : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Something went wrong');
      }

      if (isLogin) {
        setMessage('Login successful! Loading 3D world...');
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to the dashboard path
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setMessage('Registration complete! Switching to Sign In...');
        setIsLogin(true);
        setPassword('');
        setEmail('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-white font-sans p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-zinc-800 p-8 shadow-xl border border-zinc-700">
        <h2 className="text-3xl font-bold text-center tracking-tight text-red-500">
          {isLogin ? 'Sign In to VR App' : 'Create an Account'}
        </h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-400">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-600 focus:outline-none focus:border-red-500 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* DYNAMIC EMAIL FIELD: Only shows up during Sign Up mode */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-600 focus:outline-none focus:border-red-500 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-400">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-600 focus:outline-none focus:border-red-500 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{error}</p>}
          {message && <p className="text-sm text-green-400 bg-green-900/20 p-2 rounded">{message}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 transition rounded-lg font-semibold text-white tracking-wide"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center text-zinc-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
            className="text-red-400 hover:underline focus:outline-none font-medium ml-1"
          >
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </p>
      </div>
    </div>
  );
}