/**
 * Authentication Types
 * Type definitions for NextAuth.js and Keycloak authentication
 */

import { DefaultSession } from "next-auth";

/**
 * Extended user type with additional Keycloak claims
 */
export interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
  refreshToken?: string;
  roles?: string[];
}

/**
 * Extended session type with access token and user roles
 */
export interface ExtendedSession extends DefaultSession {
  user: ExtendedUser;
  accessToken?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * JWT token type with Keycloak claims
 */
export interface ExtendedJWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
  roles?: string[];
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
  user?: ExtendedUser;
  [key: string]: any; // Index signature for NextAuth compatibility
}

/**
 * Keycloak token response
 */
export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  id_token?: string;
  "not-before-policy"?: number;
  session_state?: string;
  scope?: string;
}

/**
 * Keycloak user info response
 */
export interface KeycloakUserInfo {
  sub: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

// Made with Bob
