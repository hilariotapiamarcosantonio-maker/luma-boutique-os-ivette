# Routes Overview

## Next.js App Router Structure

The application uses the Next.js 13+ App Router. Each route corresponds to a page in the admin panel.

### Main Routes
- `/` - Dashboard overview with key metrics and funnel chart
- `/leads` - List of all leads with filtering and search
- `/leads/[id]` - Detailed view of a specific lead
- `/propiedades` - List of all properties
- `/propiedades/[id]` - Detailed view of a specific property
- `/visitas` - List of all visits/scheduled appointments
- `/cierres` - List of all closed deals and contracts
- `/pipeline` - Commercial pipeline visualization

### API Routes
- `/api/leads` - GET: Retrieve leads, POST: Create new lead
- Additional API routes may exist in `/src/app/api/` for other entities

### Route Protection
Currently, routes are not protected by authentication. This is intended for internal use within a trusted network or behind a VPN/firewall.

### Navigation
- Sidebar navigation in `/src/components/layout/Sidebar.tsx`
- Header in `/src/components/layout/Header.tsx`
- Layout wrapper in `/src/components/layout/AppShell.tsx`

### Custom 404 Page
- `/src/app/error.tsx` handles 404 and 500 errors