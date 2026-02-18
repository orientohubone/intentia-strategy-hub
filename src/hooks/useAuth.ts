import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

let authState: AuthState = {
  user: null,
  session: null,
  loading: true,
};

let authInitialized = false;
let authInitPromise: Promise<void> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;
const listeners = new Set<(next: AuthState) => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(authState));
};

const ensureAuthInitialized = async () => {
  if (authInitialized) return;
  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    if (!authSubscription) {
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        authState = {
          user: nextSession?.user ?? null,
          session: nextSession ?? null,
          loading: false,
        };
        authInitialized = true;
        notifyListeners();
      });
      authSubscription = data.subscription;
    }

    const { data } = await supabase.auth.getSession();
    authState = {
      user: data.session?.user ?? null,
      session: data.session ?? null,
      loading: false,
    };
    authInitialized = true;
    notifyListeners();
  })().catch((error) => {
    console.error('Error initializing auth:', error);
    authState = { ...authState, loading: false };
    authInitialized = true;
    notifyListeners();
  }).finally(() => {
    authInitPromise = null;
  });

  return authInitPromise;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(authState);

  useEffect(() => {
    listeners.add(setState);
    setState(authState);
    void ensureAuthInitialized();

    return () => {
      listeners.delete(setState);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    signOut,
  };
}
