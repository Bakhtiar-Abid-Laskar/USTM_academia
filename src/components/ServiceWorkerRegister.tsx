"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[SW] Registered:", registration.scope);

            // Listen for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "activated" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New version available, could show a toast
                    console.log("[SW] New version available");
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("[SW] Registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
