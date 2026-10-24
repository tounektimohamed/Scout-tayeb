/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { ParentView } from './components/ParentView';
import { SectionLeaderView } from './components/SectionLeaderView';
import { TroopLeaderView } from './components/TroopLeaderView';
import { ShieldCheck, Compass, Loader2 } from 'lucide-react';

function ScoutAppShell() {
  const { user, profile, loading } = useAuth();
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-950 text-amber-400 flex items-center justify-center text-3xl font-black mb-4 shadow-xl border-2 border-amber-400 animate-bounce">
          ⚜️
        </div>
        <div className="flex items-center gap-2 text-emerald-950 font-black text-base">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
          <span>جاري فتح منظومة فوج الطيب المهيري بتطاوين...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render dedicated Login / Registration screen
  if (!user) {
    return <AuthScreen />;
  }

  // Role resolution
  const role = profile?.role || (user.email === 'codeopen540@gmail.com' ? 'troop_leader' : 'parent');

  return (
    <div className="min-h-screen bg-stone-100/70 text-gray-900 flex flex-col font-sans selection:bg-amber-200 selection:text-emerald-950">
      {/* Top Navbar with User Info & Sign Out */}
      <Navbar
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
        {isMobileFrame ? (
          /* Mobile Device Frame Mockup (Flutter/Android Phone view) */
          <div className="flex justify-center my-2">
            <div className="relative w-full max-w-[420px] bg-emerald-950 rounded-[44px] p-3 shadow-2xl border-4 border-emerald-900 ring-8 ring-black/10">
              {/* Notch */}
              <div className="h-5 flex items-center justify-center mb-1">
                <div className="w-20 h-3.5 bg-black rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-950 mr-2" />
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-1 text-[11px] text-white font-mono select-none">
                <span>09:41</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px]">4G</span>
                  <span className="text-[10px]">🔋 100%</span>
                </div>
              </div>

              {/* Mobile Viewport Screen */}
              <div className="bg-[#f8faf7] rounded-[32px] overflow-y-auto max-h-[750px] p-4 text-xs shadow-inner">
                {role === 'parent' && <ParentView />}
                {role === 'section_leader' && <SectionLeaderView />}
                {role === 'troop_leader' && <TroopLeaderView />}
              </div>

              {/* Home indicator bar */}
              <div className="h-4 flex items-center justify-center mt-1">
                <div className="w-32 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Full Screen Responsive Desktop View */
          <div className="w-full">
            {role === 'parent' && <ParentView />}
            {role === 'section_leader' && <SectionLeaderView />}
            {role === 'troop_leader' && <TroopLeaderView />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-emerald-950 text-white border-t border-emerald-900 py-6 px-4 text-center text-xs text-emerald-200 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">⚜️</span>
            <span className="font-bold text-white">فوج الطيب المهيري بتطاوين - الكشافة التونسية</span>
          </div>

          <div className="flex items-center gap-4 text-emerald-300">
            <span>شعارنا: كن مستعداً</span>
            <span>•</span>
            <span>جهة تطاوين</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScoutAppShell />
    </AuthProvider>
  );
}
