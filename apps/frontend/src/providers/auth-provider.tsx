"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api-client";

const googleProvider = new GoogleAuthProvider();

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  idToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [idToken, setIdToken] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      const mockToken = "demo-user";
      setMockMode(true);
      setUser(null);
      setIdToken(mockToken);
      setStatus("authenticated");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIdToken(null);
        setStatus("unauthenticated");
        return;
      }

      const token = await firebaseUser.getIdToken();
      setUser(firebaseUser);
      setIdToken(token);
      setStatus("authenticated");
      setMockMode(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!mockMode || status !== "authenticated" || !idToken) {
      return;
    }

    void apiFetch(
      "/auth/register",
      "POST",
      {
        firebaseUid: idToken,
        email: `${idToken}@prototype.local`,
      },
      { token: idToken },
    );
  }, [mockMode, status, idToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      idToken,
      signInWithGoogle: async () => {
        const auth = getFirebaseAuth();
        if (!auth) {
          setMockMode(true);
          setUser(null);
          setIdToken("demo-user");
          setStatus("authenticated");
          return;
        }
        await signInWithPopup(auth, googleProvider);
      },
      signOutUser: async () => {
        const auth = getFirebaseAuth();
        if (!auth) {
          setMockMode(true);
          setIdToken("demo-user");
          setStatus("authenticated");
          return;
        }
        await signOut(auth);
        setStatus("unauthenticated");
        setIdToken(null);
      },
    }),
    [user, status, idToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
