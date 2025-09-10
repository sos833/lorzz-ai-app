import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-purple-500/10 border border-gray-200 dark:border-cyan-500/20">
        <div className="text-center">
          <h1 
            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
            style={{filter: `drop-shadow(0 0 15px var(--glow-cyan)) drop-shadow(0 0 40px var(--glow-purple))`}}
          >
            Lorzz
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">أطلق العنان لقوة الذكاء الخارق</p>
        </div>
        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <div className="relative">
             <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer relative block w-full px-4 py-3 text-lg text-gray-900 dark:text-white placeholder-transparent bg-gray-200/50 dark:bg-white/5 border-2 border-gray-300 dark:border-cyan-500/30 rounded-lg focus:outline-none focus:ring-0 focus:border-cyan-400 transition-colors"
                placeholder="ادخل اسمك هنا"
              />
               <label 
                htmlFor="name" 
                className="absolute right-4 -top-3.5 text-cyan-500 dark:text-cyan-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-cyan-500 dark:peer-focus:text-cyan-400 peer-focus:text-sm"
               >
                اسم المستخدم
              </label>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600/50 dark:hover:bg-cyan-500/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-black focus:ring-cyan-500 transition-all duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,246,255,0.5)] hover:shadow-[0_0_25px_rgba(0,246,255,0.8)]"
              disabled={!name.trim()}
            >
              دردش الآن
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
