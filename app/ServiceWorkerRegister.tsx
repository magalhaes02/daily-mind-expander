"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("Service Worker registado com sucesso.");
        })
        .catch((error) => {
          console.error("Erro ao registar Service Worker:", error);
        });
    }
  }, []);

  return null;
}