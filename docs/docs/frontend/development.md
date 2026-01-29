# Development Guide

## Getting Started

This guide covers development workflows, best practices, and common patterns for working with the frontend application.

## Development Environment

### Prerequisites

- Node.js 18.17 or later
- npm 9 or later
- VS Code (recommended) or your preferred editor
- Git

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Development Server

Start the development server:

```bash
cd Frontend
npm run dev
```

The server will start at http://localhost:3000 with:

- **Hot Module Replacement**: Changes reflect immediately
- **Fast Refresh**: React state preserved on edits
- **Error Overlay**: Compilation errors shown in browser
- **Source Maps**: Debug original TypeScript code

## Project Structure

```
Frontend/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── token-exchange/       # Token exchange endpoint
│   │       └── route.ts
│   ├── app/                      # Protected application pages
│   │   ├── layout.tsx            # App layout
│   │   └── page.tsx              # Main application page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   │   ├── LoginButton.tsx
│   │   ├── LogoutButton.tsx
│   │   └── UserMenu.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── orchestrate/              # Orchestrate integration
│   │   └── OrchestrateWidget.tsx
│   ├── providers/                # Context providers
│   │   └── SessionProvider.tsx
│   └── ui/                       # UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Spinner.tsx
│       ├── ScheduleItem.tsx
│       └── ScheduleList.tsx
│
├── lib/                          # Utility libraries
│   └── auth.ts                   # NextAuth configuration
│
├── types/                        # TypeScript type definitions
│   ├── auth.ts                   # Authentication types
│   ├── components.ts             # Component prop types
│   └── index.ts                  # Type exports
│
├── public/                       # Static assets
│   └── ...
│
├── .env.local                    # Local environment variables
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Development Workflow

### 1. Create a New Feature

```bash
# Create a new branch
git checkout -b feature/my-feature

# Make changes
# ...

# Test locally
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Commit changes
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature
```

### 2. Component Development

#### Creating a New Component

```typescript
// components/ui/MyComponent.tsx
'use client'; // If using hooks or browser APIs

import { MyComponentProps } from '@/types/components';

export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Component content */}
    </div>
  );
}
```

#### Adding Component Types

```typescript
// types/components.ts
export interface MyComponentProps {
  prop1: string;
  prop2?: number;
  children?: React.ReactNode;
}
```

### 3. Page Development

#### Creating a New Page

```typescript
// app/my-page/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  // Server-side authentication check
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Page</h1>
      {/* Page content */}
    </div>
  );
}
```

#### Adding Page Metadata

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Page | Authentication Test',
  description: 'Description of my page',
};
```

### 4. API Route Development

#### Creating an API Route

```typescript
// app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Validate authentication
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Process request
  return NextResponse.json({ data: 'Success' });
}

export async function POST(request: NextRequest) {
  // Handle POST request
}
```

## Coding Standards

### TypeScript

#### Use Strict Types

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

#### Avoid `any`

```typescript
// ✅ Good
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}

// ❌ Bad
function processData(data: any) {
  // No type safety
}
```

### React Components

#### Use Functional Components

```typescript
// ✅ Good
export default function MyComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

// ❌ Bad (class components)
export default class MyComponent extends React.Component {
  // ...
}
```

#### Extract Complex Logic

```typescript
// ✅ Good
function useScheduleData() {
  const [data, setData] = useState(null);
  // Complex logic here
  return data;
}

export default function MyComponent() {
  const data = useScheduleData();
  return <div>{/* Use data */}</div>;
}

// ❌ Bad (all logic in component)
export default function MyComponent() {
  const [data, setData] = useState(null);
  // Lots of complex logic here
  return <div>{/* Use data */}</div>;
}
```

### Styling with Tailwind

#### Use Utility Classes

```typescript
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  {/* Content */}
</div>

// ❌ Bad (inline styles)
<div style={{ display: 'flex', padding: '16px', background: 'white' }}>
  {/* Content */}
</div>
```

#### Extract Repeated Patterns

```typescript
// ✅ Good
const cardClasses = "p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow";

<div className={cardClasses}>Card 1</div>
<div className={cardClasses}>Card 2</div>

// Or create a component
<Card>Card 1</Card>
<Card>Card 2</Card>
```

## Common Patterns

### Authentication Check

```typescript
// Server Component
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session) {
  redirect('/');
}

// Client Component
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();
if (status === 'loading') return <Spinner />;
if (status === 'unauthenticated') return <LoginPrompt />;
```

### Loading States

```typescript
'use client';

import { useState, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';

export default function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

### Error Handling

```typescript
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setError(null);
      await someAsyncOperation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <button onClick={handleAction}>Do Something</button>
    </div>
  );
}
```

## Testing

### Manual Testing Checklist

- [ ] Application starts without errors
- [ ] Can sign in with Keycloak
- [ ] Can sign out
- [ ] Protected routes redirect when not authenticated
- [ ] Orchestrate widget loads
- [ ] No console errors
- [ ] Responsive design works on mobile
- [ ] All links work
- [ ] Environment variables load correctly

### Browser Testing

Test in multiple browsers:

- Chrome/Edge (Chromium)
- Firefox
- Safari (if on macOS)

### Responsive Testing

Test at different viewport sizes:

- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

## Debugging

### Enable Debug Mode

```bash
# In .env.local
DEBUG=true
NODE_ENV=development
```

### Browser DevTools

#### Console Logs

```typescript
console.log('Debug info:', data);
console.error('Error:', error);
console.warn('Warning:', warning);
```

#### React DevTools

Install React DevTools browser extension to:

- Inspect component tree
- View component props and state
- Profile performance

### Next.js Debugging

#### Server Logs

Check terminal output for server-side errors:

```
 ⨯ Error: Something went wrong
    at MyComponent (./app/page.tsx:10:5)
```

#### Build Errors

```bash
npm run build
```

Shows TypeScript errors and build issues.

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // For above-the-fold images
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false, // Disable server-side rendering if needed
});
```

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

## Common Issues

### Issue: Changes not reflecting

**Solution**: Restart dev server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: TypeScript errors

**Solution**: Check types and run type check

```bash
npx tsc --noEmit
```

### Issue: Environment variables not loading

**Solution**: Restart dev server after changing `.env.local`

### Issue: Build fails

**Solution**: Check for TypeScript errors and fix them

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Git Workflow

### Commit Messages

Follow conventional commits:

```bash
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Branch Naming

```bash
feature/feature-name
fix/bug-description
docs/documentation-update
refactor/code-improvement
```

## Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Set production environment variables in your hosting platform:

- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- Docker: Use environment file or `-e` flags

## Next Steps

- [Authentication Guide](authentication.md) - Understand auth flow
- [Orchestrate Integration](orchestrate-integration.md) - Setup widget
- [API Integration](api-integration.md) - Understand architecture
- [Troubleshooting](../troubleshooting/common-issues.md) - Common issues

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)