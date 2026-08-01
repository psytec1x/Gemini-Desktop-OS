import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { ActiveWidget } from '../types';

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: Firestore;

// Load config from firebase-applet-config.json
let firebaseConfig: any = null;

try {
  // Try loading from root config file
  firebaseConfig = {
    apiKey: "AIzaSyBqDEh_Mm8WCIrs0S9gF24ONaehMOrCVkE",
    authDomain: "gen-lang-client-0933467146.firebaseapp.com",
    projectId: "gen-lang-client-0933467146",
    storageBucket: "gen-lang-client-0933467146.firebasestorage.app",
    messagingSenderId: "1000408054088",
    appId: "1:1000408054088:web:8a64ade06b239e433b1b7d"
  };
} catch (e) {
  console.warn('Fallback Firebase config loaded');
}

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
// Use specific database ID if present in config, otherwise default
const customDbId = "ai-studio-googlegeminidesk-162b25b3-a94f-49c1-b645-1ea4b53c54fd";
db = getFirestore(app, customDbId);

export { auth, db };

export function getGuestUserId(): string {
  try {
    let guestId = localStorage.getItem('gemini_guest_user_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('gemini_guest_user_id', guestId);
    }
    return guestId;
  } catch (e) {
    return 'guest_default';
  }
}

export function listenToAuth(onUserChanged: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Auto sign in anonymously for instant persistent session if enabled on Firebase Console
      signInAnonymously(auth).catch((err) => {
        // Gracefully handle auth/admin-restricted-operation when anonymous auth is restricted
        if (err?.code === 'auth/admin-restricted-operation') {
          // Silent fallback for restricted anonymous auth operation
        } else {
          console.warn('Firebase auth note:', err?.message || err);
        }
      });
    }
    onUserChanged(user);
  });
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

export async function logoutUser() {
  return signOut(auth);
}

// User Layout & Widgets Firestore Sync
export interface SavedUserLayout {
  chatWidth: number;
  widgetPanelWidth: number;
  widgets: ActiveWidget[];
  updatedAt: string;
}

export async function saveUserLayoutToFirebase(userId: string, layout: Partial<SavedUserLayout>): Promise<void> {
  if (!userId) return;
  try {
    const layoutRef = doc(db, 'users', userId, 'settings', 'layout');
    await setDoc(
      layoutRef,
      {
        ...layout,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving user layout to Firebase:', error);
  }
}

export function subscribeUserLayout(
  userId: string,
  onData: (data: SavedUserLayout | null) => void
) {
  if (!userId) return () => {};
  const layoutRef = doc(db, 'users', userId, 'settings', 'layout');
  return onSnapshot(
    layoutRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as SavedUserLayout);
      } else {
        onData(null);
      }
    },
    (error) => {
      console.error('Error listening to user layout:', error);
      onData(null);
    }
  );
}

// Save & Sync Individual Widget State
export async function saveWidgetStateToFirebase(
  userId: string,
  widgetId: string,
  widgetData: any
): Promise<void> {
  if (!userId || !widgetId) return;
  try {
    const widgetRef = doc(db, 'users', userId, 'widgets', widgetId);
    await setDoc(
      widgetRef,
      {
        data: widgetData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving widget state:', error);
  }
}
