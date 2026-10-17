import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

function createFirestoreInstance() {
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      return initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      }, firebaseConfig.firestoreDatabaseId || '(default)');
    }
  } catch {
    // If already initialized or unsupported, use getFirestore
  }
  try {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  } catch {
    return getFirestore(app);
  }
}

export const db = createFirestoreInstance();

