import React, { useState, useEffect } from 'react';
import {
  loadSettings,
  saveSettings,
  loadConversations,
  saveConversations,
  loadShortcuts,
  saveShortcuts,
} from './lib/storage';
import { AppSettings, Conversation, DesktopShortcut, WindowState } from './types';
import { DesktopIconsGrid } from './components/DesktopIconsGrid';
import { Taskbar } from './components/Taskbar';
import { DesktopWindow } from './components/DesktopWindow';
import { GeminiAppContent } from './components/GeminiAppContent';
import { ShortcutGeneratorModal } from './components/ShortcutGeneratorModal';
import { DesktopSettingsModal } from './components/DesktopSettingsModal';
import { DesktopSpotlight } from './components/DesktopSpotlight';
import { LoginModal } from './components/LoginModal';
import { Sparkles, Download, Image, Sliders } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [currentConvId, setCurrentConvId] = useState<string>(() => loadConversations()[0]?.id || 'conv-1');
  const [shortcuts, setShortcuts] = useState<DesktopShortcut[]>(loadShortcuts);

  // User & Login state (Default admin / 1982)
  const [currentUser, setCurrentUser] = useState<{ username: string; uid: string } | null>(() => {
    const saved = localStorage.getItem('gemini_pc_user');
    return saved ? JSON.parse(saved) : { username: 'admin', uid: 'user_admin_1982' };
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Spotlight Quick Search overlay
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Windows State Management
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    geminiApp: {
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      position: { x: 120, y: 32 },
      size: { width: 920, height: 640 },
      activeTab: 'chat',
    },
    shortcutCreator: {
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      position: { x: 200, y: 60 },
      size: { width: 720, height: 560 },
      activeTab: 'shortcuts',
    },
    imageStudio: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 240, y: 100 },
      size: { width: 800, height: 580 },
      activeTab: 'image-studio',
    },
    settings: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 280, y: 120 },
      size: { width: 680, height: 520 },
      activeTab: 'settings',
    },
  });

  const [zIndices, setZIndices] = useState<Record<string, number>>({
    geminiApp: 20,
    shortcutCreator: 25,
    imageStudio: 10,
    settings: 10,
  });

  const [focusedWindow, setFocusedWindow] = useState<string>('geminiApp');

  // Sync state to local storage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveShortcuts(shortcuts);
  }, [shortcuts]);

  // Global Keyboard Hotkey for Alt+Space Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Bring window to front
  const bringToFront = (winId: string) => {
    setFocusedWindow(winId);
    setZIndices((prev) => {
      const maxZ = Math.max(...(Object.values(prev) as number[]), 10);
      return { ...prev, [winId]: maxZ + 1 };
    });
  };

  const openWindow = (target: DesktopShortcut['targetWindow']) => {
    let winId = 'geminiApp';
    if (target === 'shortcut-creator') winId = 'shortcutCreator';
    if (target === 'image-studio') winId = 'imageStudio';
    if (target === 'settings') winId = 'settings';

    setWindows((prev) => ({
      ...prev,
      [winId]: {
        ...prev[winId],
        isOpen: true,
        isMinimized: false,
      },
    }));
    bringToFront(winId);
  };

  const toggleTaskbarWindow = (winId: string) => {
    setWindows((prev) => {
      const win = prev[winId];
      if (focusedWindow === winId && !win.isMinimized) {
        return {
          ...prev,
          [winId]: { ...win, isMinimized: true },
        };
      } else {
        bringToFront(winId);
        return {
          ...prev,
          [winId]: { ...win, isMinimized: false },
        };
      }
    });
  };

  const updateWindowPosition = (winId: string, pos: { x: number; y: number }) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: { ...prev[winId], position: pos },
    }));
  };

  const updateWindowSize = (winId: string, size: { width: number; height: number }) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: { ...prev[winId], size },
    }));
  };

  const toggleMaximize = (winId: string) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: { ...prev[winId], isMaximized: !prev[winId].isMaximized },
    }));
  };

  const minimizeWindow = (winId: string) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: { ...prev[winId], isMinimized: true },
    }));
  };

  const closeWindow = (winId: string) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: { ...prev[winId], isOpen: false },
    }));
  };

  // Conversation Management Handlers
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'Neue Unterhaltung',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: settings.defaultModel,
      messages: [
        {
          id: 'msg-' + Date.now(),
          role: 'model',
          content: 'Hallo! Wie kann ich dir in dieser neuen Unterhaltung helfen?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConvId(newConv.id);
  };

  const handleDeleteConversation = (id: string) => {
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (currentConvId === id && remaining.length > 0) {
      setCurrentConvId(remaining[0].id);
    }
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleAddVirtualShortcut = (newShortcut: DesktopShortcut) => {
    setShortcuts((prev) => [...prev, newShortcut]);
  };

  const handleSendSpotlightToChat = (prompt: string, answer: string) => {
    openWindow('gemini-app');
    const currentConv = conversations.find((c) => c.id === currentConvId) || conversations[0];
    const userMsg = {
      id: 'msg-' + Date.now(),
      role: 'user' as const,
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const botMsg = {
      id: 'msg-' + (Date.now() + 1),
      role: 'model' as const,
      content: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    handleUpdateConversation({
      ...currentConv,
      messages: [...currentConv.messages, userMsg, botMsg],
    });
  };

  // Dynamic Wallpaper Gradient mapping
  const getWallpaperGradient = (wallpaper: AppSettings['wallpaper']) => {
    switch (wallpaper) {
      case 'google-dark':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950';
      case 'dark-cyber':
        return 'bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950';
      case 'windows-eleven':
        return 'bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950';
      case 'sonoma-dusk':
        return 'bg-gradient-to-br from-amber-950 via-rose-950 to-indigo-950';
      case 'minimal-light':
        return 'bg-gradient-to-br from-slate-200 via-slate-100 to-blue-100';
      default:
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950';
    }
  };

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${getWallpaperGradient(settings.wallpaper)} font-sans select-none`}>
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Virtual Desktop Icons */}
      <DesktopIconsGrid
        shortcuts={shortcuts}
        onOpenWindow={openWindow}
      />

      {/* WINDOW 1: Google Gemini Desktop Main App */}
      <DesktopWindow
        title="Google Gemini Desktop"
        icon={<Sparkles className="w-4 h-4 text-blue-400" />}
        isOpen={windows.geminiApp.isOpen}
        isMinimized={windows.geminiApp.isMinimized}
        isMaximized={windows.geminiApp.isMaximized}
        position={windows.geminiApp.position}
        size={windows.geminiApp.size}
        windowStyle={settings.windowStyle}
        zIndex={zIndices.geminiApp}
        onClose={() => closeWindow('geminiApp')}
        onMinimize={() => minimizeWindow('geminiApp')}
        onMaximize={() => toggleMaximize('geminiApp')}
        onFocus={() => bringToFront('geminiApp')}
        onPositionChange={(pos) => updateWindowPosition('geminiApp', pos)}
        onSizeChange={(sz) => updateWindowSize('geminiApp', sz)}
      >
        <GeminiAppContent
          conversations={conversations}
          currentConvId={currentConvId}
          settings={settings}
          activeTab={windows.geminiApp.activeTab}
          onSelectConversation={setCurrentConvId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onUpdateConversation={handleUpdateConversation}
          onOpenShortcutModal={() => openWindow('shortcut-creator')}
        />
      </DesktopWindow>

      {/* WINDOW 2: Startverknüpfung Erstellen / Desktop Integration */}
      <DesktopWindow
        title="Startverknüpfung auf dem Desktop erstellen"
        icon={<Download className="w-4 h-4 text-emerald-400" />}
        isOpen={windows.shortcutCreator.isOpen}
        isMinimized={windows.shortcutCreator.isMinimized}
        isMaximized={windows.shortcutCreator.isMaximized}
        position={windows.shortcutCreator.position}
        size={windows.shortcutCreator.size}
        windowStyle={settings.windowStyle}
        zIndex={zIndices.shortcutCreator}
        onClose={() => closeWindow('shortcutCreator')}
        onMinimize={() => minimizeWindow('shortcutCreator')}
        onMaximize={() => toggleMaximize('shortcutCreator')}
        onFocus={() => bringToFront('shortcutCreator')}
        onPositionChange={(pos) => updateWindowPosition('shortcutCreator', pos)}
        onSizeChange={(sz) => updateWindowSize('shortcutCreator', sz)}
      >
        <ShortcutGeneratorModal onAddVirtualShortcut={handleAddVirtualShortcut} />
      </DesktopWindow>

      {/* WINDOW 3: Gemini Bild-Studio Standalone */}
      <DesktopWindow
        title="Gemini KI Bild-Studio"
        icon={<Image className="w-4 h-4 text-purple-400" />}
        isOpen={windows.imageStudio.isOpen}
        isMinimized={windows.imageStudio.isMinimized}
        isMaximized={windows.imageStudio.isMaximized}
        position={windows.imageStudio.position}
        size={windows.imageStudio.size}
        windowStyle={settings.windowStyle}
        zIndex={zIndices.imageStudio}
        onClose={() => closeWindow('imageStudio')}
        onMinimize={() => minimizeWindow('imageStudio')}
        onMaximize={() => toggleMaximize('imageStudio')}
        onFocus={() => bringToFront('imageStudio')}
        onPositionChange={(pos) => updateWindowPosition('imageStudio', pos)}
        onSizeChange={(sz) => updateWindowSize('imageStudio', sz)}
      >
        <GeminiAppContent
          conversations={conversations}
          currentConvId={currentConvId}
          settings={settings}
          activeTab="image-studio"
          onSelectConversation={setCurrentConvId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onUpdateConversation={handleUpdateConversation}
          onOpenShortcutModal={() => openWindow('shortcut-creator')}
        />
      </DesktopWindow>

      {/* WINDOW 4: Desktop Einstellungen */}
      <DesktopWindow
        title="Desktop & App Einstellungen"
        icon={<Sliders className="w-4 h-4 text-amber-400" />}
        isOpen={windows.settings.isOpen}
        isMinimized={windows.settings.isMinimized}
        isMaximized={windows.settings.isMaximized}
        position={windows.settings.position}
        size={windows.settings.size}
        windowStyle={settings.windowStyle}
        zIndex={zIndices.settings}
        onClose={() => closeWindow('settings')}
        onMinimize={() => minimizeWindow('settings')}
        onMaximize={() => toggleMaximize('settings')}
        onFocus={() => bringToFront('settings')}
        onPositionChange={(pos) => updateWindowPosition('settings', pos)}
        onSizeChange={(sz) => updateWindowSize('settings', sz)}
      >
        <DesktopSettingsModal
          settings={settings}
          onUpdateSettings={(newSt) => setSettings((prev) => ({ ...prev, ...newSt }))}
        />
      </DesktopWindow>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        currentUser={currentUser}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Spotlight Search Launcher Modal */}
      <DesktopSpotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSendToFullChat={handleSendSpotlightToChat}
      />

      {/* Desktop Taskbar Bottom */}
      <Taskbar
        currentUser={currentUser}
        activeWindows={{
          geminiApp: windows.geminiApp.isOpen,
          shortcutCreator: windows.shortcutCreator.isOpen,
          imageStudio: windows.imageStudio.isOpen,
          settings: windows.settings.isOpen,
        }}
        minimizedWindows={{
          geminiApp: windows.geminiApp.isMinimized,
          shortcutCreator: windows.shortcutCreator.isMinimized,
          imageStudio: windows.imageStudio.isMinimized,
          settings: windows.settings.isMinimized,
        }}
        focusedWindow={focusedWindow}
        onToggleWindow={toggleTaskbarWindow}
        onOpenWindow={openWindow}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}
