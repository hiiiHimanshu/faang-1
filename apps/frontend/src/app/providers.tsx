"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useEffect, useState } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import FcmBootstrapper from "@/components/fcm-bootstrapper";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(() => {
        console.info("FCM service worker registered");
      })
      .catch((error) => {
        console.warn("Failed to register service worker", error);
      });
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <FcmBootstrapper />
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        ) : null}
      </QueryClientProvider>
    </AuthProvider>
  );
}
