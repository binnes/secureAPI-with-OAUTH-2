# TaskFlow - Project Management Application

A modern, professional task management application built with Next.js 15, featuring OAuth 2.0 authentication via Keycloak and AI assistance through IBM watsonx Orchestrate.

## Features

- 🔐 **Secure Authentication** - OAuth 2.0/OpenID Connect via Keycloak
- 📋 **Kanban Board** - Visual task management with drag-and-drop (coming soon)
- 🤖 **AI Assistant** - Integrated IBM watsonx Orchestrate for intelligent task help
- 🎨 **Dark Mode** - Professional dark theme optimized for productivity
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast Performance** - Built with Next.js 15 App Router and React Server Components
- 🔒 **Secure API Integration** - JWT-based authentication with backend API

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Authentication**: NextAuth.js 4.x with Keycloak provider
- **UI Components**: Custom components with Tailwind
- **AI Integration**: IBM watsonx Orchestrate
- **API Client**: Fetch API with JWT bearer tokens

## Quick Start

**Total setup time: ~10 minutes**

### Prerequisites

- Node.js 18 or higher
- Access to Keycloak instance at `https://keycloak.lab.home`
- API server running (see `../API_server/`)

### 1. Create Keycloak Client

See the main project documentation at `../docs/docs/keycloak/frontend-client-setup.md` for detailed setup instructions.

**Quick steps:**
1. Create `authentication-test-frontend` client in Keycloak
2. Set Client Type to "Confidential"
3. Configure Valid Redirect URIs: `http://localhost:3000/*`
4. Configure Web Origins: `http://localhost:3000`
5. Obtain the client secret from Credentials tab

### 2. Configure Environment

```bash
# Copy the environment template
cp .env.local.example .env.local

# Edit .env.local and add:
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - KEYCLOAK_SECRET (from Keycloak Credentials tab)
```

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

For detailed setup and configuration instructions, see the main project documentation:
- **Keycloak Setup**: `../docs/docs/keycloak/frontend-client-setup.md`
- **API Documentation**: `../docs/docs/api/`
- **Full Project Docs**: `../docs/` (MkDocs site)

## Project Structure

```
Frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home page (marketing/landing)
│   ├── app/                     # Dashboard application
│   │   └── page.tsx            # Main dashboard with Kanban board
│   ├── api/                     # API routes
│   │   └── auth/               # NextAuth.js authentication
│   ├── layout.tsx              # Root layout with providers
│   └── globals.css             # Global styles
│
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   │   ├── LoginButton.tsx
│   │   ├── LogoutButton.tsx
│   │   └── UserMenu.tsx
│   ├── kanban/                  # Kanban board components
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── TaskCard.tsx
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── SessionProvider.tsx
│   ├── orchestrate/             # IBM watsonx Orchestrate
│   │   └── OrchestrateWidget.tsx
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Spinner.tsx
│
├── lib/                         # Utility functions
│   ├── auth.ts                 # NextAuth configuration
│   └── api.ts                  # API client utilities
│
├── types/                       # TypeScript definitions
│   ├── auth.ts                 # Authentication types
│   ├── schedule.ts             # Schedule/API types
│   └── task.ts                 # Task/Kanban types
│
├── public/                      # Static assets
├── .env.local                   # Environment variables (not in git)
├── .env.local.example          # Environment template
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Environment Variables

Required environment variables (see `.env.local.example` for details):

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-random-secret>

# Keycloak
KEYCLOAK_ID=authentication-test-frontend
KEYCLOAK_SECRET=<from-keycloak>
KEYCLOAK_ISSUER=https://keycloak.otterburn.home/realms/secure-test

# API Server
NEXT_PUBLIC_API_URL=http://localhost:9080

# Orchestrate (optional)
NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID=<your-id>
NEXT_PUBLIC_ORCHESTRATE_REGION=us-south
NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID=<your-id>
```

## Development

### Available Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type check
npx tsc --noEmit
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Formatting**: Consistent with Prettier-compatible settings
- **Components**: Functional components with TypeScript
- **Styling**: Tailwind CSS utility classes

## Authentication Flow

1. User clicks "Sign In" button
2. NextAuth redirects to Keycloak login page
3. User enters credentials
4. Keycloak validates and redirects back with authorization code
5. NextAuth exchanges code for tokens
6. Session created with user info and access token
7. Access token used for API calls via Authorization header

## API Integration

The frontend communicates with the backend API using JWT bearer tokens:

```typescript
// Example API call
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/schedule`, {
  headers: {
    'Authorization': `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

## Deployment

### Production Checklist

- [ ] Update `NEXTAUTH_URL` to production URL
- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Update Keycloak client redirect URIs for production domain
- [ ] Configure production API URL
- [ ] Enable HTTPS (required for production)
- [ ] Set up environment variables in hosting platform
- [ ] Configure CORS in API server for production domain
- [ ] Test authentication flow in production
- [ ] Monitor error logs and performance

### Deployment Platforms

This application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (see Dockerfile if needed)
- **Traditional hosting** (Node.js server)

## Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Verify redirect URIs in Keycloak match your application URL
- Must include `/api/auth/callback/keycloak` path

**"CORS error"**
- Check API server CORS configuration
- Verify Web origins in Keycloak clients

**"401 Unauthorized"**
- Verify user has `schedule-user` role in Keycloak
- Check token is being sent in Authorization header
- Verify API server is running

**Session not persisting**
- Verify `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Check browser console for errors

For more troubleshooting help, see the main project documentation at `../docs/`.

## Security

- All authentication handled by Keycloak (industry-standard OAuth 2.0)
- Tokens stored in HTTP-only cookies (not accessible to JavaScript)
- CSRF protection enabled by NextAuth
- API calls use JWT bearer tokens
- No sensitive data stored in client-side code
- Environment variables for secrets (never committed to git)

## Performance

- Server-side rendering for initial page load
- Client-side navigation for instant page transitions
- Optimized images with Next.js Image component
- Code splitting for smaller bundle sizes
- Lazy loading for Orchestrate widget
- Minimal JavaScript for better performance

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow the existing code style
2. Write TypeScript with proper types
3. Use Tailwind CSS for styling
4. Test authentication flow after changes
5. Update documentation as needed

## License

Apache 2.0 - See LICENSE file for details

## Support

For issues or questions:
1. Check the documentation in this directory
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify Keycloak configuration

## Related Projects

- **API Server**: `../API_server/` - Backend REST API with OpenLiberty
- **Orchestrate**: `../orchestrate/` - IBM watsonx Orchestrate configuration
- **Documentation**: `../docs/` - Project-wide documentation

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-29  
**Built with**: Next.js 15, TypeScript, Tailwind CSS