"use client";

import { useEffect } from "react";

// #region agent log
const DEBUG_INGEST =
  "http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3";
const SESSION = "c666a0";

function sendLog(payload: Record<string, unknown>) {
  fetch(DEBUG_INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION,
    },
    body: JSON.stringify({
      sessionId: SESSION,
      timestamp: Date.now(),
      runId: "verify-repro",
      ...payload,
    }),
  }).catch(() => {});
}
// #endregion

type EthereumLike = { request?: (args: { method: string }) => Promise<unknown> };

/** Dev-only: logs wallet-related runtime facts for debugging MetaMask overlay noise (session `c666a0`). */
export function DevWalletProbe() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const w = window as Window & { ethereum?: EthereumLike };
    const eth = w.ethereum;

    // #region agent log
    sendLog({
      location: "dev-wallet-probe.tsx:mount",
      message: "probe mounted",
      hypothesisId: "H1",
      data: {
        hasInjectedProvider: Boolean(eth),
        pathname: window.location.pathname,
      },
    });
    // #endregion

    const onRejection = (event: PromiseRejectionEvent) => {
      const msg = String(
        (event.reason && typeof event.reason === "object" && "message" in event.reason
          ? (event.reason as Error).message
          : event.reason) ?? ""
      );
      if (/metamask|ethereum|inpage|nkbihfbeogaeaoehlefnkodbefgpgknn/i.test(msg)) {
        // #region agent log
        sendLog({
          location: "dev-wallet-probe.tsx:unhandledrejection",
          message: "wallet-string rejection",
          hypothesisId: "H2",
          data: { reasonSnippet: msg.slice(0, 240) },
        });
        // #endregion
      }
    };
    window.addEventListener("unhandledrejection", onRejection);

    let originalRequest: EthereumLike["request"] | undefined;
    if (eth && typeof eth.request === "function") {
      originalRequest = eth.request.bind(eth);
      eth.request = async (args: { method: string }) => {
        // #region agent log
        sendLog({
          location: "dev-wallet-probe.tsx:ethereum.request",
          message: "ethereum.request invoked from page",
          hypothesisId: "H3",
          data: { method: args?.method ?? "unknown" },
        });
        // #endregion
        return originalRequest!(args);
      };
    }

    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      if (eth && originalRequest) {
        eth.request = originalRequest;
      }
    };
  }, []);

  return null;
}
