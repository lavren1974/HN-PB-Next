"use client";

import { createBrowserClient } from "@/lib/pocketbase/client";
import { TypedPocketBase } from "@/lib/pocketbase/types";
import { AuthRecord, ClientResponseError } from "pocketbase";
import { createContext, useContext, useEffect, useRef } from "react";

const PocketBaseContext = createContext<TypedPocketBase | null>(null);

export function usePocketBase() {
  return useContext(PocketBaseContext)!;
}

export function useUser() {
  const client = usePocketBase();
  return client.authStore.record;
}

export function PocketBaseProvider({
  initialToken,
  initialUser,
  children,
}: {
  initialToken: string;
  initialUser: AuthRecord;
  children?: React.ReactNode;
}) {
  const clientRef = useRef<TypedPocketBase>(createBrowserClient());
  clientRef.current.authStore.save(initialToken, initialUser);

  useEffect(() => {
    async function authRefresh() {
      if (clientRef.current.authStore.isValid) {
        try {
          await clientRef.current.collection("users").authRefresh();
        } catch (err) {
          // Only clear the auth store if the token is invalid (401)
          // unexpected errors (network, server 500 code) shouldn't log out the user
          if (err instanceof ClientResponseError && err.status === 401) {
            clientRef.current.authStore.clear();
          }
        }
      }
    }

    authRefresh();

    // Refresh the token periodically (every 5 minutes) to avoid expiration
    const interval = setInterval(authRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [initialToken, initialUser]);

  return (
    <PocketBaseContext.Provider value={clientRef.current}>
      {children}
    </PocketBaseContext.Provider>
  );
}
