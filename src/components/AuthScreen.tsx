import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { signInWithGoogle, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || 'فشل تسجيل الدخول عبر Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-950/10">
        {/* Scouting Header */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 text-white p-8 text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center font-black text-4xl mx-auto mb-4 shadow-lg border-2 border-amber-300">
            ⚜️
          </div>
          <h1 className="text-2xl font-black tracking-wide">فوج الطيب المهيري بتطاوين</h1>
          <p className="text-sm text-amber-300 font-bold mt-1">الكشافة التونسية - جهة تطاوين</p>
          <div className="mt-4 inline-block bg-white/10 px-4 py-1.5 rounded-full text-xs text-emerald-200">
            بوابة الدخول الموحدة (قائد الفوج • قادة الفرق • الأولياء)
          </div>
        </div>

        {/* Single Action: Google Sign-In */}
        <div className="p-8 space-y-6">
          {(localError || error) && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <div>
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-4 px-6 rounded-2xl border-2 border-emerald-800/20 hover:border-emerald-700 bg-white hover:bg-emerald-50/60 text-emerald-950 font-black text-base shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>تسجيل الدخول بحساب Google</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
          فوج الطيب المهيري - تطاوين | شريعة الكشاف: الصدق، النخوة والواجب
        </div>
      </div>
    </div>
  );
};
