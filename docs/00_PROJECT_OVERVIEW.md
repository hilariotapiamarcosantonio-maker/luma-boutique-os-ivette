# Project Overview

## CRM En Sheets - Real Estate Admin Panel

This is the administrative dashboard for the Luma Premium / Vista del Río real estate ecosystem. It connects to Google Sheets to manage leads, properties, visits, closures, pipeline, and commercial metrics.

### Key Features
- Lead management and tracking
- Property catalog and details
- Visit scheduling and tracking
- Commercial pipeline visualization
- Closure and contract management
- Real-time metrics and dashboards
- Google Sheets integration as backend

### Technology Stack
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Google Sheets API
- Modular data layer with mock fallback

### Architecture
- **Frontend**: React components in `/src/components`
- **Pages**: Next.js pages in `/src/app`
- **Data Layer**:
  - Read operations: `/src/lib/crm-data`
  - Write operations: `/src/lib/crm-write`
  - Google Sheets client: `/src/lib/google-sheets.ts`
- **Types**: Shared TypeScript interfaces in `/src/types`

### Environment Variables
Required variables (see `.env.example`):
- `SPREADSHEET_ID`: Google Sheet ID
- `GOOGLE_CLIENT_EMAIL`: Service account email
- `GOOGLE_PRIVATE_KEY`: Service account private key
- `NEXT_PUBLIC_APP_URL`: Application URL

### Security Notes
- Credentials must never be committed to version control
- `.env.local` is ignored by git
- Use Vercel Environment Variables for production deployments
- The system includes intelligent fallback to mock data when credentials are missing