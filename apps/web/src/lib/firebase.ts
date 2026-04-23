import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedAuth: Auth | null = null;

function resolveAuth(): Auth {
  if (cachedAuth) {
    return cachedAuth;
  }
  if (!firebaseConfig.apiKey) {
    throw new Error(
      'Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables to enable phone login.',
    );
  }
  const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
  cachedAuth = getAuth(app);
  return cachedAuth;
}

export const firebaseAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = resolveAuth();
    const value = Reflect.get(auth, prop, auth) as unknown;
    return typeof value === 'function' ? value.bind(auth) : value;
  },
  set(_target, prop, value) {
    const auth = resolveAuth();
    return Reflect.set(auth, prop, value);
  },
  has(_target, prop) {
    return Reflect.has(resolveAuth(), prop);
  },
  ownKeys() {
    return Reflect.ownKeys(resolveAuth());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(resolveAuth(), prop);
  },
  getPrototypeOf() {
    return Reflect.getPrototypeOf(resolveAuth());
  },
});
