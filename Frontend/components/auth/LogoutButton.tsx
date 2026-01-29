"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-4 py-2 bg-dark-hover hover:bg-dark-border text-slate-300 hover:text-white font-medium rounded-lg transition-all duration-200 border border-dark-border"
    >
      Sign Out
    </button>
  );
}

// Made with Bob
