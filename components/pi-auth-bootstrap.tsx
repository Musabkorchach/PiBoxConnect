"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function PiAuthBootstrap() {
  const [status, setStatus] = useState("Sign in with Pi");
  const [username, setUsername] = useState("");
  const startedRef = useRef(false);

  const signIn = useCallback(async () => {
    if (startedRef.current) return;

    startedRef.current = true;
    setStatus("Signing in...");

    try {
      if (!window.Pi) {
        throw new Error("Pi SDK not loaded");
      }

      await window.Pi.init({
        version: "2.0",
        sandbox: true,
      });

      const auth = await window.Pi.authenticate(["username"], () => {});

      const res = await fetch("/api/auth/pi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: auth.accessToken,
        }),
      });

      if (!res.ok) {
        throw new Error("Backend validation failed");
      }

      const data = await res.json();

      setUsername(data.user?.username || auth.user.username);
      setStatus("Signed in");
    } catch (error) {
      console.error(error);
      startedRef.current = false;
      setStatus("Sign in with Pi");
    }
  }, []);

  useEffect(() => {
    signIn();
  }, [signIn]);

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        type="button"
        onClick={signIn}
        className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white shadow"
      >
        {username ? `Signed in: ${username}` : status}
      </button>
    </div>
  );
}