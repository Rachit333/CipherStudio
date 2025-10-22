"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import firebaseClient, {
  loginWithGitHub,
  getIdToken as fetchIdToken,
  getAuthInstance,
} from "@/lib/firebaseClient";
import { signOut as firebaseSignOut } from "firebase/auth";

type AuthContextType = {
  user: any | null;
  displayName?: string | null;
  email?: string | null;
  uid?: string | null;
  loginWithGitHub: () => Promise<any>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  useEffect(() => {
    const auth = getAuthInstance();
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const value: AuthContextType = {
    user,
    displayName: user ? user.displayName : null,
    email: user ? user.email : null,
    uid: user ? user.uid : null,
    loginWithGitHub: async () => {
      return await loginWithGitHub();
    },
    signOut: async () => {
      const auth = getAuthInstance();
      await firebaseSignOut(auth);
    },
    getIdToken: async () => {
      return await fetchIdToken();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
