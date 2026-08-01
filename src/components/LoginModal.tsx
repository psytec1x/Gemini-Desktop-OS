import React, { useState } from 'react';
import { Lock, User, ShieldCheck, LogIn, LogOut, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: { username: string; uid: string } | null;
  onClose: () => void;
  onLoginSuccess: (username: string, uid: string) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLoginSuccess,
  onLogout,
}) => {
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('1982');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    if (trimmedUser === 'admin' && trimmedPass === '1982') {
      setSuccessMsg('Erfolgreich als admin angemeldet!');
      setTimeout(() => {
        onLoginSuccess('admin', 'user_admin_1982');
        onClose();
      }, 600);
    } else {
      setErrorMsg('Ungültiger Anmeldename oder Passwort! (Standard: admin / 1982)');
    }
  };

  const handleQuickAdminLogin = () => {
    setUsernameInput('admin');
    setPasswordInput('1982');
    setSuccessMsg('Erfolgreich als admin angemeldet!');
    setTimeout(() => {
      onLoginSuccess('admin', 'user_admin_1982');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/90 border-b border-slate-700/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Gemini Desktop Benutzer-Anmeldung</h3>
              <p className="text-[11px] text-slate-400">Firebase Synchronisation & Admin Profil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {currentUser ? (
            /* Logged in View */
            <div className="space-y-4 text-center py-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg ring-4 ring-emerald-500/20">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-base">
                  <CheckCircle className="w-4 h-4" />
                  <span>Angemeldet als {currentUser.username}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Benutzer-ID: <code className="text-blue-300 font-mono">{currentUser.uid}</code>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Alle Fenstergrößen, Widgets & Schnellstart-Favoriten werden in Firebase gespeichert.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Abmelden</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  Weiterarbeiten
                </button>
              </div>
            </div>
          ) : (
            /* Login Form View */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-start gap-2.5 text-xs text-blue-200">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Admin Zugangsdaten:</strong><br />
                  Anmeldename: <code className="bg-blue-900/60 px-1 py-0.5 rounded text-white font-mono">admin</code> |
                  Passwort: <code className="bg-blue-900/60 px-1 py-0.5 rounded text-white font-mono">1982</code>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-center gap-2 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Anmeldename</span>
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Passwort</span>
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="1982"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Anmelden</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all"
                  title="Mit 1-Klick als admin einloggen"
                >
                  ⚡ Admin 1-Klick
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
