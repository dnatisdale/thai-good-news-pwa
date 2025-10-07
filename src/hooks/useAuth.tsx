import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuth,
  startEmailLinkSignIn,
  finishEmailLinkSignInIfNeeded,
  signOutNow,
  initAnalytics
} from '@/lib/firebase';

type AuthCtx = {
  user: User | null;
  signInWithEmailLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  signInWithEmailLink: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    finishEmailLinkSignInIfNeeded().catch(console.error);
    const unsub = onAuth(setUser);
    initAnalytics().catch(() => {}); // non-fatal in dev
    return () => unsub();
  }, []);

  return (
    <Ctx.Provider value={{ user, signInWithEmailLink: startEmailLinkSignIn, signOut: signOutNow }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
