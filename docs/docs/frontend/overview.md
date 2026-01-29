# Frontend Overview

## Introduction

The Authentication Test Frontend is a Next.js 15 application that provides a modern, secure web interface for accessing user schedules through IBM watsonx Orchestrate. The application demonstrates proper OAuth 2.0 authentication with Keycloak and follows best practices for token management and security.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Next.js Frontend Application                │  │
│  │                                                        │  │
│  │  ┌──────────────┐         ┌──────────────────────┐   │  │
│  │  │  Home Page   │         │  Application Page    │   │  │
│  │  │  (Public)    │────────▶│  (Protected)         │   │  │
│  │  └──────────────┘         │                      │   │  │
│  │                           │  ┌────────────────┐  │   │  │
│  │                           │  │   Orchestrate  │  │   │  │
│  │                           │  │     Widget     │  │   │  │
│  │                           │  └────────────────┘  │   │  │
│  │                           └──────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ OAuth 2.0 Authentication
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Keycloak Server                          │
│              https://keycloak.lab.home                      │
│                                                             │
│  - User Authentication                                      │
│  - JWT Token Issuance                                       │
│  - Token Refresh                                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ JWT Bearer Token
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              IBM watsonx Orchestrate                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Orchestrate Widget (Embedded in Frontend)            │  │
│  │                                                        │  │
│  │  - Receives user JWT via Token Exchange               │  │
│  │  - Makes API calls on behalf of user                  │  │
│  │  - Displays schedule data                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP + JWT Bearer Token
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Server                               │
│              http://localhost:9080                          │
│                                                             │
│  - Validates JWT tokens                                     │
│  - Enforces role-based access control                       │
│  - Returns user schedule data                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **No Direct API Access**: The frontend NEVER calls the API server directly. All schedule data access is through the Orchestrate widget.

2. **Token Exchange Pattern**: The frontend implements OAuth 2.0 Token Exchange (RFC 8693) to securely pass the user's JWT to Orchestrate.

3. **Separation of Concerns**:
   - Frontend: User interface and authentication
   - Orchestrate: Business logic and API integration
   - API Server: Data access and authorization

## Technology Stack

### Core Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **NextAuth.js 4.24**: Authentication library

### Authentication

- **Keycloak**: OAuth 2.0 / OpenID Connect provider
- **JWT**: JSON Web Tokens for stateless authentication
- **OAuth 2.0 Token Exchange (RFC 8693)**: Secure token delegation

### Integration

- **IBM watsonx Orchestrate**: AI-powered widget for schedule management
- **Watson Assistant Chat Widget**: Embedded conversational interface

## Key Features

### 1. Secure Authentication

- OAuth 2.0 Authorization Code Flow with Keycloak
- Automatic token refresh
- Secure session management
- Protected routes

### 2. Orchestrate Integration

- Embedded Watson Assistant Chat widget
- Token exchange for secure API access
- User context passing
- Configurable integration settings

### 3. Responsive Design

- Mobile-first approach
- Tailwind CSS for consistent styling
- Accessible components
- Modern UI/UX

### 4. Developer Experience

- TypeScript for type safety
- ESLint for code quality
- Hot module replacement
- Clear project structure

## Project Structure

```
Frontend/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   └── token-exchange/       # Token exchange endpoint
│   ├── app/                      # Protected application pages
│   │   ├── layout.tsx            # App layout
│   │   └── page.tsx              # Main application page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── layout/                   # Layout components
│   ├── orchestrate/              # Orchestrate widget
│   ├── providers/                # Context providers
│   └── ui/                       # UI components
├── lib/                          # Utility libraries
│   └── auth.ts                   # NextAuth configuration
├── types/                        # TypeScript type definitions
│   ├── auth.ts                   # Authentication types
│   ├── components.ts             # Component prop types
│   └── index.ts                  # Type exports
├── docs/                         # Project documentation
├── .env.example                  # Environment variable template
├── .env.local                    # Local environment variables
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Security Considerations

### Authentication Security

- All tokens stored in HTTP-only cookies (managed by NextAuth)
- No tokens in localStorage or sessionStorage
- Automatic token refresh before expiration
- Secure session management

### API Security

- No direct API calls from frontend
- All API access through Orchestrate widget
- Token exchange endpoint validates user session
- CORS properly configured

### Best Practices

- Environment variables for sensitive configuration
- Type-safe code with TypeScript
- Input validation and sanitization
- Secure headers and CSP policies

## Getting Started

To get started with the frontend application:

1. [Setup Guide](setup.md) - Installation and initial configuration
2. [Configuration Guide](configuration.md) - Environment variables and settings
3. [Authentication Guide](authentication.md) - Understanding the auth flow
4. [Orchestrate Integration](orchestrate-integration.md) - Widget setup and usage

## Related Documentation

- [API Server Documentation](../api/endpoints.md)
- [Keycloak Setup](../keycloak/installation.md)
- [Orchestrate Documentation](../orchestrate/installation.md)

## Support

For issues, questions, or contributions, please refer to:

- [Troubleshooting Guide](../troubleshooting/common-issues.md)
- [Development Guide](development.md)
- Project README