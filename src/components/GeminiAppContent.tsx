import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Send,
  Image as ImageIcon,
  Mic,
  Volume2,
  Globe,
  Trash2,
  Bot,
  User,
  RefreshCw,
  X,
  Code,
  Sliders,
  Download,
  Terminal,
  MessageSquare,
  Wand2,
  FileText,
  Copy,
  Check,
  LayoutGrid,
  CloudCheck,
  GripVertical,
  LogIn,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { Conversation, ChatMessage, AppSettings, ActiveWidget, WidgetDefinition } from '../types';
import { MarkdownMessage } from './MarkdownMessage';
import { WidgetRenderer } from './widgets/WidgetRenderer';
import { WidgetMenuModal } from './widgets/WidgetMenuModal';
import {
  listenToAuth,
  subscribeUserLayout,
  saveUserLayoutToFirebase,
  loginWithGoogle,
  logoutUser,
  getGuestUserId,
  SavedUserLayout,
} from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface GeminiAppContentProps {
  conversations: Conversation[];
  currentConvId: string;
  settings: AppSettings;
  activeTab: 'chat' | 'image-studio' | 'voice' | 'code' | 'settings' | 'shortcuts';
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onUpdateConversation: (conv: Conversation) => void;
  onOpenShortcutModal: () => void;
}

const DEFAULT_ACTIVE_WIDGETS: ActiveWidget[] = [
  {
    id: 'w-translator-1',
    type: 'ki-translator',
    title: 'Gemini KI Übersetzer',
    category: 'ki',
    width: 320,
    height: 250,
    order: 1,
    data: { sourceLang: 'Deutsch', targetLang: 'Englisch', inputText: '', translatedText: '' },
  },
  {
    id: 'w-sticky-1',
    type: 'sticky-note',
    title: 'Desktop Notizblock',
    category: 'nuetzlich',
    width: 320,
    height: 200,
    order: 2,
    data: { noteText: '📌 Gemini Desktop: Widgets & Chat-Größe werden in Firebase gespeichert!', color: 'yellow' },
  },
  {
    id: 'w-sysmon-1',
    type: 'system-monitor',
    title: 'PC Performance Monitor',
    category: 'nuetzlich',
    width: 320,
    height: 200,
    order: 3,
    data: {},
  },
];

export const GeminiAppContent: React.FC<GeminiAppContentProps> = ({
  conversations,
  currentConvId,
  settings,
  activeTab: initialTab = 'chat',
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateConversation,
  onOpenShortcutModal,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'image-studio' | 'voice' | 'code'>(
    initialTab === 'image-studio' ? 'image-studio' : initialTab === 'code' ? 'code' : 'chat'
  );

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [enableSearch, setEnableSearch] = useState(settings.enableSearchGrounding);
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  // Firebase State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);

  // Resizable Layout & Widget State
  const [widgetPanelWidth, setWidgetPanelWidth] = useState<number>(360);
  const [activeWidgets, setActiveWidgets] = useState<ActiveWidget[]>(DEFAULT_ACTIVE_WIDGETS);
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);

  // Image Studio state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; prompt: string }>>([]);

  // Voice mode state
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentConv = conversations.find((c) => c.id === currentConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages, loading]);

  // Listen to Firebase Auth & Subscribe to Firestore User Layout
  useEffect(() => {
    const unsubscribeAuth = listenToAuth((user) => {
      setFirebaseUser(user);
      const effectiveUid = user?.uid || getGuestUserId();
      setIsFirebaseSynced(true);
      // Subscribe to Firestore changes for this user's layout & widgets
      const unsubscribeLayout = subscribeUserLayout(effectiveUid, (data: SavedUserLayout | null) => {
        if (data) {
          if (data.widgetPanelWidth) setWidgetPanelWidth(data.widgetPanelWidth);
          if (data.widgets && Array.isArray(data.widgets)) setActiveWidgets(data.widgets);
        }
      });
      return () => unsubscribeLayout();
    });

    return () => unsubscribeAuth();
  }, []);

  // Helper to sync layout state to Firebase Firestore
  const syncLayoutToFirebase = (newWidgets: ActiveWidget[], newWidth: number) => {
    const effectiveUid = firebaseUser?.uid || getGuestUserId();
    saveUserLayoutToFirebase(effectiveUid, {
      widgetPanelWidth: newWidth,
      widgets: newWidgets,
    });
  };

  // Splitter Drag Handler (Resize Chat vs Widget Panel)
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
    const startX = e.clientX;
    const startWidth = widgetPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX; // drag left expands widget panel
      const newWidth = Math.max(260, Math.min(650, startWidth + deltaX));
      setWidgetPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      syncLayoutToFirebase(activeWidgets, widgetPanelWidth);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Widget Actions
  const handleAddWidget = (def: WidgetDefinition) => {
    const newWidget: ActiveWidget = {
      id: `w-${def.type}-${Date.now()}`,
      type: def.type,
      title: def.title,
      category: def.category,
      width: def.defaultWidth,
      height: def.defaultHeight,
      order: activeWidgets.length + 1,
      data: def.initialData ? JSON.parse(JSON.stringify(def.initialData)) : {},
    };
    const updated = [...activeWidgets, newWidget];
    setActiveWidgets(updated);
    setIsWidgetMenuOpen(false);
    syncLayoutToFirebase(updated, widgetPanelWidth);
  };

  const handleRemoveWidget = (id: string) => {
    const updated = activeWidgets.filter((w) => w.id !== id);
    setActiveWidgets(updated);
    syncLayoutToFirebase(updated, widgetPanelWidth);
  };

  const handleUpdateWidget = (updatedWidget: ActiveWidget) => {
    const updated = activeWidgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w));
    setActiveWidgets(updated);
    syncLayoutToFirebase(updated, widgetPanelWidth);
  };

  // Handle Image Upload File
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setAttachedImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file as unknown as Blob);
      });
    }
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Send Message in Chat
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if ((!text.trim() && attachedImages.length === 0) || loading) return;

    const userMsgId = 'msg-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      images: attachedImages.length > 0 ? [...attachedImages] : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...currentConv.messages, userMsg];
    let newTitle = currentConv.title;
    if (currentConv.messages.length <= 1 && text.trim()) {
      newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }

    onUpdateConversation({
      ...currentConv,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    });

    setInputMessage('');
    setAttachedImages([]);
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            images: m.images,
          })),
          model: selectedModel,
          systemInstruction: settings.systemPrompt,
          enableSearch,
          images: userMsg.images,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model',
        content: data.text || 'Entschuldigung, es gab keine Antwort.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: data.groundingChunks,
      };

      onUpdateConversation({
        ...currentConv,
        title: newTitle,
        messages: [...updatedMessages, botMsg],
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'model',
        content: `⚠️ **Gemini API Hinweis:** ${err.message || 'Fehler bei der Verbindung.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      onUpdateConversation({
        ...currentConv,
        messages: [...updatedMessages, errorMsg],
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Text to Speech Vorlesen
  const handleSpeak = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking === msgId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[\#\*`]/g, ''));
      utterance.lang = 'de-DE';
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);

      setIsSpeaking(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Generate Image Handler
  const handleGenerateImage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imagePrompt.trim() || generatingImage) return;

    setGeneratingImage(true);
    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert('Fehler bei der Bildgenerierung: ' + data.error);
      } else if (data.imageUrl) {
        setGeneratedImages((prev) => [{ url: data.imageUrl, prompt: imagePrompt }, ...prev]);
        setImagePrompt('');
      }
    } catch (err: any) {
      alert('Fehler: ' + err.message);
    } finally {
      setGeneratingImage(false);
    }
  };

  // Simulate Voice input mic
  const handleToggleMic = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setInputMessage('Welche Möglichkeiten habe ich mit Google Gemini Desktop?');
        setIsRecording(false);
      }, 2500);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 overflow-hidden select-text relative">
      {/* Left Navigation Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 hidden md:flex">
        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Neue Unterhaltung</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-3 py-1 space-y-1 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'chat'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Gemini Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('image-studio')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'image-studio'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span>KI Bild-Studio</span>
          </button>

          <button
            onClick={onOpenShortcutModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-600/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Verknüpfung exportieren</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Verlauf
          </div>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setActiveTab('chat');
                onSelectConversation(conv.id);
              }}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                currentConv.id === conv.id && activeTab === 'chat'
                  ? 'bg-slate-800 text-white font-medium border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                  title="Unterhaltung löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Model Indicator & Firebase Session Indicator Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-2 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="truncate font-medium">{selectedModel}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
            <div className="flex items-center gap-1 text-emerald-400">
              <CloudCheck className="w-3 h-3" />
              <span>Firebase Synchronsiert</span>
            </div>
            {firebaseUser && (
              <span className="text-slate-500 truncate max-w-[90px]" title={firebaseUser.uid}>
                ID: {firebaseUser.uid.slice(0, 6)}...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Center Area (Chat / Image Studio) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 min-w-0">
        {/* Top Header Controls Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <h2 className="font-bold text-sm sm:text-base text-white truncate">
              {activeTab === 'chat' ? currentConv.title : activeTab === 'image-studio' ? 'Gemini Bild-Studio' : 'Live Voice Studio'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle Widget Panel (Mobile & Desktop) */}
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                !isPanelCollapsed
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Widget-Seitenleiste ein/ausblenden"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Widgets ({activeWidgets.length})</span>
            </button>

            {/* Search Grounding Toggle */}
            <button
              onClick={() => setEnableSearch(!enableSearch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                enableSearch
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Google Websuche-Ergebnisse miteinbeziehen"
            >
              <Globe className={`w-3.5 h-3.5 ${enableSearch ? 'text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Google Suche</span>
            </button>

            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
            </select>
          </div>
        </div>

        {/* TAB 1: Chat View */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {currentConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 space-y-2 shadow-lg max-w-[88%] sm:max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : msg.isError
                        ? 'bg-red-950/80 border border-red-800 text-slate-100 rounded-tl-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {/* User Attached Images */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.images.map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt="Angehängtes Bild"
                            className="w-32 h-32 object-cover rounded-xl border border-white/20 shadow-md"
                          />
                        ))}
                      </div>
                    )}

                    {/* Content Message */}
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-line text-sm sm:text-base font-sans">{msg.content}</p>
                    ) : (
                      <MarkdownMessage content={msg.content} groundingChunks={msg.groundingChunks} />
                    )}

                    {/* Footer bar for Bot messages */}
                    {msg.role === 'model' && !msg.isError && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                        <span>{msg.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeak(msg.id, msg.content)}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                              isSpeaking === msg.id ? 'text-blue-400 animate-pulse' : 'text-slate-400'
                            }`}
                            title="Vorlesen"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 max-w-4xl mx-auto justify-start">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 animate-spin">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 text-slate-300 text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Gemini denkt nach...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Pills if conversation is fresh */}
            {currentConv.messages.length <= 1 && !loading && (
              <div className="px-4 py-2 max-w-4xl mx-auto w-full flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleSendMessage('Erkläre mir in einfachen Worten, wie Künstliche Intelligenz funktioniert.')}
                  className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs text-blue-300 border border-slate-800 transition-colors"
                >
                  💡 Wie funktioniert KI?
                </button>
                <button
                  onClick={() => handleSendMessage('Schreibe einen Python-Code für einen einfachen Rechner.')}
                  className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs text-emerald-300 border border-slate-800 transition-colors"
                >
                  💻 Python Rechner Code
                </button>
                <button
                  onClick={() => handleSendMessage('Suche nach den neuesten Trends im Bereich Technologie.')}
                  className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs text-amber-300 border border-slate-800 transition-colors"
                >
                  🌐 Aktuelle Tech-News
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 shrink-0">
              <div className="max-w-4xl mx-auto space-y-2">
                {/* Image Attachments Preview */}
                {attachedImages.length > 0 && (
                  <div className="flex gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                    {attachedImages.map((img, i) => (
                      <div key={i} className="relative group shrink-0">
                        <img src={img} alt="Vorschau" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                        <button
                          onClick={() => removeAttachedImage(i)}
                          className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2 p-2 rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-blue-500/80 transition-all">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Bild anhängen"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleToggleMic}
                    className={`p-2.5 rounded-xl transition-colors ${
                      isRecording ? 'text-red-400 bg-red-950/60 border border-red-600 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Spracheingabe"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <textarea
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={isRecording ? 'Spreche jetzt...' : 'Nachricht an Gemini senden (Enter)...'}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 py-2"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={(!inputMessage.trim() && attachedImages.length === 0) || loading}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold transition-all shadow-md shrink-0 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Gemini Image Studio */}
        {activeTab === 'image-studio' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  <span>KI Bild-Generierung mit Gemini (nano banana)</span>
                </h3>

                <form onSubmit={handleGenerateImage} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Bild-Beschreibung (Prompt)</label>
                    <textarea
                      rows={3}
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Z.B. Ein futuristisches Computer-Desktop-Zimmer bei Nacht mit Neonlicht..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Seitenverhältnis:</span>
                      {['1:1', '16:9', '9:16', '4:3'].map((ar) => (
                        <button
                          key={ar}
                          type="button"
                          onClick={() => setImageAspectRatio(ar)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            imageAspectRatio === ar
                              ? 'bg-purple-600 text-white border-purple-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {ar}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={!imagePrompt.trim() || generatingImage}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all"
                    >
                      {generatingImage ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generiere Bild...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          <span>Bild generieren</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Generated Gallery */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">Generierte Bilder</h4>
                {generatedImages.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-500 text-xs">
                    Noch keine Bilder in dieser Sitzung generiert.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedImages.map((img, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 group">
                        <img
                          src={img.url}
                          alt={img.prompt}
                          className="w-full h-64 object-cover rounded-xl border border-slate-700"
                        />
                        <p className="text-xs text-slate-400 line-clamp-2 italic">{img.prompt}</p>
                        <a
                          href={img.url}
                          download={`gemini-generated-${idx}.png`}
                          className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Bild herunterladen</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DRAGGABLE VERTICAL SPLITTER HANDLE (Between Chat & Right Widget Drawer) */}
      {!isPanelCollapsed && (
        <div
          onMouseDown={handleSplitterMouseDown}
          title="Chat- und Widget-Größe anpassen (Ziehen)"
          className={`w-2 hover:w-2.5 bg-slate-800 hover:bg-blue-500 cursor-col-resize transition-all shrink-0 flex items-center justify-center relative group ${
            isDraggingSplitter ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : ''
          }`}
        >
          <GripVertical className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
        </div>
      )}

      {/* RIGHT-SIDE WIDGET PANEL (Rechts neben dem Chat-Fenster) */}
      {!isPanelCollapsed && (
        <div
          style={{ width: `${widgetPanelWidth}px` }}
          className="bg-slate-900/95 border-l border-slate-800 flex flex-col h-full shrink-0 overflow-hidden relative shadow-2xl transition-all duration-75"
        >
          {/* Panel Top Header */}
          <div className="flex items-center justify-between px-3.5 py-3 bg-slate-900 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-white truncate">Widgets & Tools</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-semibold shrink-0">
                {activeWidgets.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsWidgetMenuOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Widget</span>
              </button>
            </div>
          </div>

          {/* Firebase Persistence Status Header */}
          <div className="px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <CloudCheck className="w-3.5 h-3.5" />
              <span>Größen in Firebase gespeichert</span>
            </div>
            <span className="text-[10px] text-slate-500">Auto-Sync</span>
          </div>

          {/* Active Widgets Scroll Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {activeWidgets.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 space-y-3 my-8">
                <LayoutGrid className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">Keine aktiven Widgets</p>
                  <p className="text-[11px] text-slate-500">
                    Klicke auf <strong>+ Widget</strong> oben, um KI-Tools, Notizen, Weltuhr & Rechner hinzuzufügen.
                  </p>
                </div>
                <button
                  onClick={() => setIsWidgetMenuOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Katalog öffnen</span>
                </button>
              </div>
            ) : (
              activeWidgets.map((widget) => (
                <WidgetRenderer
                  key={widget.id}
                  widget={widget}
                  userId={firebaseUser?.uid}
                  onRemove={handleRemoveWidget}
                  onUpdateWidget={handleUpdateWidget}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Widget Catalog Modal */}
      <WidgetMenuModal
        isOpen={isWidgetMenuOpen}
        activeWidgets={activeWidgets}
        onClose={() => setIsWidgetMenuOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
};

