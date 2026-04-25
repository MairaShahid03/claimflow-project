# ClaimFlow Pakistan - Next.js 15 Migration

This is a migration of the ClaimFlow Pakistan application from **React with Vite** to **Next.js 15** with the App Router.

## Migration Summary

### What Changed

| Aspect | React (Vite) | Next.js 15 |
|--------|--------------|-----------|
| **Routing** | React Router v6 | Next.js App Router |
| **Build Tool** | Vite | Next.js (built-in) |
| **Navigation** | `useNavigate()` hook | `useRouter()` hook + `next/navigation` |
| **Links** | `<Link>` from React Router | `<Link>` from `next/link` |
| **Entry Point** | `src/main.tsx` | `src/app/layout.tsx` |
| **Pages** | `src/pages/` (components) | `src/app/[route]/page.tsx` |
| **Client Components** | Implicit | Explicit with `'use client'` directive |

### Key Features Preserved

✅ All UI components (shadcn/ui with Radix UI)  
✅ Authentication context and role-based access control  
✅ Claim management context  
✅ Supabase integration  
✅ React Hook Form with Zod validation  
✅ TanStack Query (React Query)  
✅ Tailwind CSS with dark mode support  
✅ All 13 role-based dashboards  
✅ Responsive design and animations  

## Project Structure

```
claimflow-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Login page
│   │   ├── [route]/page.tsx    # All role-based pages
│   │   └── not-found.tsx       # 404 page
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── AuthGuard.tsx       # Protected route wrapper
│   │   ├── DashboardLayout.tsx # Main dashboard layout
│   │   └── ...
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ClaimContext.tsx    # Claim management state
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/           # External service integrations
│   │   └── supabase/           # Supabase client
│   ├── lib/                    # Utility functions
│   ├── pages/                  # Page components (used by App Router)
│   ├── index.css               # Global styles
│   └── App.css                 # Component styles
├── public/                     # Static assets
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── next.config.ts              # Next.js configuration
```

## Installation & Setup

### Prerequisites

- Node.js 18+ (Next.js 15 requires Node 18 or higher)
- npm or yarn

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Migration Notes

### Client Components

In Next.js 15, components that use browser APIs (like `useState`, `useContext`, event handlers) must be marked with the `'use client'` directive at the top of the file. This has been applied to:

- `src/contexts/AuthContext.tsx`
- `src/contexts/ClaimContext.tsx`
- All page components in `src/app/`
- `src/components/AuthGuard.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/Login.tsx`
- `src/components/DashboardLayout.tsx`

### Navigation Changes

**Before (React Router):**
```typescript
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/path');
```

**After (Next.js):**
```typescript
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/path');
```

### Routing Changes

**Before (React Router):**
```typescript
<Route path="/claim-intimation" element={<ClaimIntimation />} />
```

**After (Next.js App Router):**
```
src/app/claim-intimation/page.tsx
```

### Protected Routes

Protected routes are now handled using the `AuthGuard` component wrapper:

```typescript
'use client';

import { AuthGuard } from "@/components/AuthGuard";
import ClaimIntimation from "@/pages/ClaimIntimation";

export default function ClaimIntimationPage() {
  return (
    <AuthGuard>
      <ClaimIntimation />
    </AuthGuard>
  );
}
```

## Available Routes

| Route | Role |
|-------|------|
| `/` | Login |
| `/settings` | All authenticated users |
| `/claim-intimation` | Claim Intimation |
| `/requirements-manager` | Requirements Manager |
| `/claim-payment-voucher` | Claim Payment Voucher |
| `/cpv-checking` | CPV Checking |
| `/claim-incharge` | Claim Incharge |
| `/phs-incharge` | PHS Incharge |
| `/fa-incharge` | F&A Incharge |
| `/auditor` | Auditor |
| `/zhs` | ZHS |
| `/cheque-preparation` | Cheque Preparation |
| `/claim-forwarding-letter` | Claim Forwarding Letter |
| `/dispatching` | Dispatching |
| `/zonal-head` | Zonal Head |

## Benefits of Next.js 15

1. **Server-Side Rendering (SSR)** - Better SEO and initial page load performance
2. **Static Site Generation (SSG)** - Pre-render pages at build time
3. **API Routes** - Built-in backend API endpoints (no separate server needed)
4. **Image Optimization** - Automatic image optimization with `next/image`
5. **Font Optimization** - Automatic font optimization
6. **Code Splitting** - Automatic code splitting for better performance
7. **Built-in Middleware** - Handle authentication, redirects, etc.
8. **Incremental Static Regeneration (ISR)** - Update static pages without full rebuild
9. **TypeScript Support** - First-class TypeScript support
10. **Vercel Deployment** - Optimized for deployment on Vercel

## Troubleshooting

### Issue: "useAuth must be used within AuthProvider"

**Solution:** Ensure the page component has the `'use client'` directive at the top.

### Issue: Navigation not working

**Solution:** Make sure you're using `useRouter` from `'next/navigation'` (not `'next/router'` which is for Pages Router).

### Issue: Styles not loading

**Solution:** Ensure `src/index.css` is imported in `src/app/layout.tsx`.

## Next Steps

1. Test all role-based dashboards
2. Verify Supabase integration works correctly
3. Test dark mode functionality
4. Verify responsive design on mobile devices
5. Deploy to Vercel or your preferred hosting platform

## Support

For issues or questions about the migration, refer to:
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Next.js Migration Guide](https://nextjs.org/docs/pages/building-your-application/upgrading)

---

**Migration Date:** April 25, 2026  
**Next.js Version:** 15.1.0  
**React Version:** 18.3.1
