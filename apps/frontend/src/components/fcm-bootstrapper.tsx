"use client";

import { useEffect, useState } from "react";
import { fetchFcmToken } from "@/lib/fcm";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

export default function FcmBootstrapper() {
  const { status, idToken } = useAuth();
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !idToken) {
      return;
    }

    let cancelled = false;

    async function register() {
      const token = await fetchFcmToken();
      if (!token || cancelled || token === registeredToken) {
        return;
      }

      await apiFetch("/notifications/register-token", "POST", { token }, {
        token: idToken,
      });
      setRegisteredToken(token);
    }

    void register();

    return () => {
      cancelled = true;
    };
  }, [status, idToken, registeredToken]);

  return null;
}
