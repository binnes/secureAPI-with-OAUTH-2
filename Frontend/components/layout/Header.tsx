"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import LoginButton from "@/components/auth/LoginButton";
import UserMenu from "@/components/auth/UserMenu";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-dark-surface border-b border-dark-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TaskFlow</h1>
              <p className="text-xs text-slate-400">Project Management</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            {session && (
              <Link 
                href="/app" 
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}
            
            {/* Auth Section */}
            <div className="ml-4 pl-4 border-l border-dark-border">
              {session ? <UserMenu /> : <LoginButton />}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Made with Bob
