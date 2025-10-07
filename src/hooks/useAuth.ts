import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuth, startEmailLinkSignIn, finishEmailLinkSignInIfNeeded, signOutNow, initAnalytics } from '@/lib/firebase';

type AuthCtx = {
  user: User | null;
  signInWithEmailLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, signInWithEmailLink: async () => {}, signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Set up auth + finish email-link flows on load
    finishEmailLinkSignInIfNeeded().catch(console.error);
    const unsub = onAuth(setUser);
    initAnalytics().catch(() => {}); // non-fatal if unsupported
    return () => unsub();
  }, []);

  return (
    <Ctx.Provider value={{ user, signInWithEmailLink: startEmailLinkSignIn, signOut: signOutNow }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
