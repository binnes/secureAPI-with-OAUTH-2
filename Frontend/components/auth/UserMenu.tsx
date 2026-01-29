"use client";

import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        {/* User Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
          {session.user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white">
            {session.user.name || "User"}
          </p>
          <p className="text-xs text-slate-400">
            {session.user.email || ""}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <LogoutButton />
    </div>
  );
}

// Made with Bob
