"use client";

import { useState } from "react";
import { addString, getStrings } from "./actions";

type Entry = {
  id: number;
  content: string;
  username: string;
  created_at: string;
};

export default function Home() {
  const [strings, setStrings] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg(null);
    const res = await addString(formData);
    
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      // Reload on success
      await handleFetch();
    }
    setLoading(false);
  }

  async function handleFetch() {
    setFetching(true);
    setErrorMsg(null);
    const res = await getStrings();
    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.data) {
      setStrings(res.data);
    }
    setFetching(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gradient-to-br from-gray-900 via-indigo-950 to-slate-900 text-white font-sans">
      <div className="max-w-xl w-full bg-white/5 p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rotate-12 -z-10 blur-3xl pointer-events-none" />

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 tracking-tight">
          Global String Wall
        </h1>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-indigo-200 ml-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              className="w-full px-5 py-3.5 bg-black/40 border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent focus:outline-none transition-all placeholder-gray-500 text-gray-100 shadow-inner"
              placeholder="e.g. johndoe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-indigo-200 ml-1">
              Your String
            </label>
            <input
              type="text"
              name="content"
              id="content"
              required
              className="w-full px-5 py-3.5 bg-black/40 border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent focus:outline-none transition-all placeholder-gray-500 text-gray-100 shadow-inner"
              placeholder="Enter something memorable..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transform transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Post to Wall"
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-indigo-500/20">
          <button
            onClick={handleFetch}
            disabled={fetching}
            className="w-full py-3.5 px-6 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 font-semibold rounded-xl shadow-lg transition-all border border-indigo-500/30 hover:border-indigo-400/50 flex flex-col items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
          >
            <span className="flex items-center gap-2">
              {fetching ? "Loading..." : "Load the Wall"}
            </span>
          </button>

          {strings.length > 0 && (
            <div className="mt-8 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar fade-in">
              {strings.map((item) => (
                <div 
                  key={item.id} 
                  className="p-5 bg-gradient-to-r from-black/40 to-black/20 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-white/5 group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      @{item.username}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-200 text-lg leading-relaxed break-words">
                    "{item.content}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
