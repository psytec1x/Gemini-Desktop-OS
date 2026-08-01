import { Conversation, AppSettings, DesktopShortcut } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'gemini_desktop_conversations',
  CURRENT_CONV: 'gemini_desktop_current_conv_id',
  SETTINGS: 'gemini_desktop_settings',
  SHORTCUTS: 'gemini_desktop_shortcuts',
};

export const DEFAULT_SETTINGS: AppSettings = {
  wallpaper: 'google-dark',
  defaultModel: 'gemini-3.6-flash',
  enableSearchGrounding: true,
  systemPrompt: 'Du bist Google Gemini Desktop, eine hochentwickelte KI-Assistenz auf Deutsch. Antworte übersichtlich mit präziser Markdown-Formatierung.',
  windowStyle: 'windows',
  desktopIconsEnabled: true,
  soundEnabled: true,
  darkAppTheme: true,
};

export const DEFAULT_SHORTCUTS: DesktopShortcut[] = [
  {
    id: 'sc-gemini',
    title: 'Google Gemini Desktop',
    icon: 'Sparkles',
    targetWindow: 'gemini-app',
    x: 24,
    y: 24,
    badge: 'KI',
  },
  {
    id: 'sc-shortcut-gen',
    title: 'Startverknüpfung erstellen',
    icon: 'Download',
    targetWindow: 'shortcut-creator',
    x: 24,
    y: 130,
  },
  {
    id: 'sc-image-studio',
    title: 'Gemini Bild-Studio',
    icon: 'Image',
    targetWindow: 'image-studio',
    x: 24,
    y: 236,
  },
  {
    id: 'sc-settings',
    title: 'Desktop Einstellungen',
    icon: 'Sliders',
    targetWindow: 'settings',
    x: 24,
    y: 342,
  },
];

export const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const loadConversations = (): Conversation[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load conversations:', e);
  }
  return [createInitialConversation()];
};

export const saveConversations = (conversations: Conversation[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations:', e);
  }
};

export const loadShortcuts = (): DesktopShortcut[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHORTCUTS);
    return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
  } catch (e) {
    return DEFAULT_SHORTCUTS;
  }
};

export const saveShortcuts = (shortcuts: DesktopShortcut[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHORTCUTS, JSON.stringify(shortcuts));
  } catch (e) {
    console.error('Failed to save shortcuts:', e);
  }
};

export function createInitialConversation(): Conversation {
  return {
    id: 'conv-' + Date.now(),
    title: 'Willkommen bei Gemini Desktop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model: 'gemini-3.6-flash',
    messages: [
      {
        id: 'msg-welcome',
        role: 'model',
        content: `### 🚀 Willkommen bei Google Gemini Desktop!

Deine persönliche KI-Desktop-Anwendung ist startbereit.

**Neue Funktionen in dieser PC-Version:**
* ⚡ **Schnelle Desktop-Verknüpfung**: Lade eine echte \`.url\`- oder \`.bat\`-Startdatei direkt auf deinen PC-Desktop herunter.
* 💬 **Google Gemini 3.6 Flash**: Antworten mit Websuche, Code-Highlighting & Audio-Vorlesen.
* 🎨 **Integriertes Bild-Studio**: Generiere hochauflösende KI-Bilder direkt in der App.
* ⌨️ **Quick-Spotlight**: Drücke **Alt + Leertaste** auf deiner Tastatur für den Gemini Schnellzugriff!

Wie kann ich dir heute helfen?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };
}
