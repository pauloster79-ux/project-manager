# AI PM Hub - Web App

This is the web application for the AI PM Hub, built with Next.js 14 and Tailwind CSS.

## Features Implemented (Packet 0)

- ✅ App shell with left sidebar layout
- ✅ Responsive design (sidebar on desktop, sheet on mobile)
- ✅ Project selector with navigation
- ✅ Project-scoped navigation (Overview, Risks, Decisions, Documents, Q&A)
- ✅ Placeholder pages for all sections
- ✅ Accessibility features (aria-current, focus management)
- ✅ Real Tailwind Catalyst components integrated

## Project Structure

```
apps/web/
├── app/
│   ├── layout.tsx                    # Root layout with CatalystProvider
│   ├── page.tsx                      # Home page (redirects to /projects/demo)
│   ├── globals.css                   # Global styles with Tailwind
│   └── (app)/
│       └── projects/
│           └── [projectId]/
│               ├── layout.tsx        # Project layout with sidebar
│               ├── page.tsx          # Project dashboard
│               ├── risks/page.tsx    # Risks page
│               ├── decisions/page.tsx # Decisions page
│               ├── documents/page.tsx # Documents page
│               └── qa/page.tsx       # Q&A page
├── components/
│   ├── providers/
│   │   └── CatalystProvider.tsx      # Catalyst provider wrapper
│   ├── app/
│   │   ├── AppSidebar.tsx           # Main sidebar component
│   │   ├── MobileTopBar.tsx         # Mobile navigation bar
│   │   ├── ProjectSelector.tsx      # Project selection dropdown
│   │   └── NavLink.tsx              # Navigation link component
│   └── catalyst/                    # Real Catalyst components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── listbox.tsx
│       ├── link.tsx
│       └── ... (all other Catalyst components)
└── lib/
    └── utils.ts                     # Utility functions (cn helper)
```

## Getting Started

1. Install dependencies:
   ```bash
   cd apps/web
   npm install
   ```

2. Install Catalyst component dependencies:
   ```bash
   npm install @headlessui/react@^1.7.17 clsx@^2.0.0
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Navigation

- The app automatically redirects to `/projects/demo` from the root
- Use the project selector to switch between projects (currently demo projects)
- Navigate between sections using the sidebar (desktop) or mobile menu
- All navigation preserves the project context

## Next Steps

This implementation provides the visual foundation. The next packets will add:
- Real API endpoints for projects, risks, and decisions
- Form components with validation
- Issues panel and quality gateway integration
- Document upload and processing
- Q&A functionality

## Notes

- Real Catalyst components are now integrated (requires @headlessui/react and clsx)
- Project data is stubbed (will be replaced with real API calls in Packet 7a)
- All pages show placeholder content until real functionality is implemented
- The layout is fully responsive and accessible
- Mobile navigation uses Dialog instead of Sheet (as per available Catalyst components)
