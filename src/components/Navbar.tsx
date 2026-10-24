import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SCOUT_SECTIONS } from '../types/scout';
import {
  Smartphone,
  Monitor,
  LogOut,
  User,
  Shield,
  Users,
  Compass
} from 'lucide-react';

interface NavbarProps {
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMobileFrame,
  onToggleMobileFrame
}) => {
  const { user, profile, signOut } = useAuth();

  const roleLabel =
    profile?.role === 'troop_leader'
      ? 'قائد الفوج (المدير)'
      : profile?.role === 'section_leader'
      ? `قائد ${SCOUT_SECTIONS.find(s => s.id === profile.sectionId)?.name || 'الفرقة'}`
      : 'ولي أمر كشفي';

  return (
    <header className="no-print bg-emerald-950 text-white border-b-2 border-amber-500/80 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Troop Identity Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 flex items-center justify-center font-black text-2xl shadow-md border border-amber-300">
            ⚜️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-wide text-white">فوج الطيب المهيري</span>
              <span className="bg-amber-400/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                تطاوين 🇹🇳
              </span>
            </div>
            <p className="text-[11px] text-emerald-300 font-medium">
              المنظومة الإلكترونية لإدارة الفوج الكشفي
            </p>
          </div>
        </div>

        {/* User Account Info & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* User profile badge */}
          <div className="bg-emerald-900/90 px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-xs">
              {profile?.role === 'troop_leader' ? '⚜️' : profile?.role === 'section_leader' ? '🧭' : '👨‍👧'}
            </div>
            <div>
              <p className="font-black text-white leading-tight">{profile?.name || user?.displayName || 'مستخدم'}</p>
              <p className="text-[10px] text-amber-300 font-bold">{roleLabel}</p>
            </div>
          </div>

          {/* Mobile frame toggle */}
          <button
            onClick={onToggleMobileFrame}
            className={`p-2 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              isMobileFrame
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-emerald-900 text-emerald-200 border-emerald-800 hover:bg-emerald-800'
            }`}
            title={isMobileFrame ? 'تبديل إلى وضع الشاشة الكاملة' : 'تبديل إلى وضع شاشة الهاتف'}
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            <span className="hidden md:inline">{isMobileFrame ? 'شاشة كاملة' : 'وضع الهاتف'}</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => signOut()}
            className="p-2 bg-red-950/60 hover:bg-red-900 text-red-200 rounded-xl transition border border-red-800/80 flex items-center gap-1.5 text-xs font-bold"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
};
