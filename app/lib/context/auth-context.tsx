'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

/**
 * @typedef AuthContextType
 * @property {Session | null} session - The current user session, if one exists.
 * @property {User | null} user - The current user, if one is authenticated.
 * @property {() => void} signOut - Function to sign the user out.
 * @property {boolean} loading - True while the initial user session is being fetched.
 */

/**
 * Context for authentication.
 * Provides session, user, and signOut function to its children.
 * This allows any component in the app to access the current user's authentication state.
 * @type {React.Context<AuthContextType>}
 */
const AuthContext = createContext<{ 
  session: Session | null;
  user: User | null;
  signOut: () => void;
  loading: boolean;
}>({ 
  session: null, 
  user: null,
  signOut: () => {},
  loading: true,
});

/**
 * Provider component for the authentication context.
 * It manages the authentication state and provides it to its children.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    /**
     * Fetches the initial user data from Supabase.
     * This is crucial for determining the auth state when the app loads.
     */
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      }
      if (mounted) {
        setUser(data.user ?? null);
        // Session is set via onAuthStateChange, so we can set it to null here initially
        setSession(null);
        setLoading(false);
      }
    };

    getUser();

    // Listen for changes in authentication state (login, logout).
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Cleanup function to unsubscribe from the auth listener when the component unmounts.
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * Signs the user out by calling Supabase's signOut method.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily access the authentication context.
 * @returns {AuthContextType} The authentication context.
 */
export const useAuth = () => useContext(AuthContext);
