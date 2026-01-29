/**
 * Session Provider Wrapper
 * Wraps the application with NextAuth SessionProvider
 */

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProviderWrapperProps } from "@/types";

export default function SessionProvider({
  children,
}: SessionProviderWrapperProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

// Made with Bob
