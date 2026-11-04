import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { db } from '@/api/db';

type AuthState = { ready: boolean; session: Session | null; user: User | null };
const AuthContext = createContext<AuthState>({ ready: false, session: null, user: null });

/** Keeps the signed-in session for the whole app. The session itself lives in the phone's secure storage. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ ready: false, session: null, user: null });
  useEffect(() => {
    const auth = db().auth;
    auth.getSession().then(({ data }) => setState({ ready: true, session: data.session, user: data.session?.user ?? null }))
      .catch(() => setState({ ready: true, session: null, user: null }));
    const { data } = auth.onAuthStateChange((_event, session) => setState({ ready: true, session, user: session?.user ?? null }));
    return () => data.subscription.unsubscribe();
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
