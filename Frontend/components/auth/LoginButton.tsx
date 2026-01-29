"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("keycloak", { callbackUrl: "/app" })}
      className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30"
    >
      Sign In
    </button>
  );
}

// Made with Bob
