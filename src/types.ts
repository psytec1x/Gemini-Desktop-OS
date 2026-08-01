export type DesktopTheme = 'dark-cyber' | 'minimal-light' | 'google-dark' | 'windows-eleven' | 'sonoma-dusk';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  images?: string[];
  timestamp: string;
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  generatedImage?: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  model: string;
  systemInstruction?: string;
}

export interface DesktopShortcut {
  id: string;
  title: string;
  icon: string; // lucide icon name or type
  targetWindow: 'gemini-app' | 'image-studio' | 'shortcut-creator' | 'settings' | 'trash';
  x: number;
  y: number;
  badge?: string;
}

export type WindowState = {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  activeTab: 'chat' | 'image-studio' | 'voice' | 'code' | 'settings' | 'shortcuts';
};

export interface AppSettings {
  wallpaper: DesktopTheme;
  defaultModel: string;
  enableSearchGrounding: boolean;
  systemPrompt: string;
  windowStyle: 'windows' | 'mac';
  desktopIconsEnabled: boolean;
  soundEnabled: boolean;
  darkAppTheme: boolean;
}

// Widget System Types
export type WidgetCategory = 'ki' | 'nuetzlich' | 'andere';

export interface WidgetDefinition {
  type: string;
  title: string;
  description: string;
  category: WidgetCategory;
  icon: string; // Lucide icon name
  defaultWidth: number;
  defaultHeight: number;
  badge?: string;
  initialData?: any;
}

export interface ActiveWidget {
  id: string;
  type: string;
  title: string;
  category: WidgetCategory;
  width: number;
  height: number;
  isCollapsed?: boolean;
  order: number;
  data?: any;
}

export interface UserLayoutConfig {
  chatWidth: number;
  widgetPanelWidth: number;
  activeWidgets: ActiveWidget[];
  updatedAt?: string;
}

