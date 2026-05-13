# Replication Playbook

## How to Replicate This CRM for a New Real Estate Client

This guide outlines the steps to replicate the CRM En Sheets system for a new real estate client, using this project as a base.

### Step 1: Fork or Clone the Repository
- Create a new repository for the client (or clone this one and rename)
- Ensure the repository is private if it contains client-specific data

### Step 2: Set Up the Google Sheet
1. Create a new Google Sheet for the client's CRM data
2. Define the required sheets and columns (refer to the mock data structure in the code or SETUP_CREDENTIALS.md)
3. Share the sheet with a service account email (will be created in Step 3)

### Step 3: Create Google Cloud Service Account
1. Go to Google Cloud Console
2. Create a new project (or use an existing one)
3. Enable the Google Sheets API
4. Create a service account
5. Generate a new JSON key for the service account
6. Share the Google Sheet with the service account email (Viewer access is sufficient)

### Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in:
   - `SPREADSHEET_ID`: From the new Google Sheet URL
   - `GOOGLE_CLIENT_EMAIL`: From the service account JSON
   - `GOOGLE_PRIVATE_KEY`: From the service account JSON (with newlines)
   - `NEXT_PUBLIC_APP_URL`: Set to the client's domain (or localhost for dev)

### Step 5: Customize for the Client
1. Update the branding in `src/lib/brand.ts` (if applicable)
2. Modify the UI components in `/src/components` to match the client's workflow
3. Adjust the data structure in `/src/types/crm.ts` if the client needs different fields
4. Update the Google Sheets column mappings in the data layer functions (in `/src/lib/crm-data` and `/src/lib/crm-write`)
5. Adjust the dashboard metrics in `/src/lib/crm-data/get-dashboard-data.ts`

### Step 6: Test and Deploy
1. Run `npm run dev` to test locally
2. Verify that data is being read from and written to the Google Sheet
3. Deploy to Vercel (or another hosting provider)
4. Set the environment variables in the hosting platform

### Step 7: Handover to Client
1. Provide the client with access to the admin panel (if hosted)
2. Document any client-specific customizations
3. Provide training on how to use the CRM
4. Ensure the client understands that the Google Sheet is the source of truth

## Notes
- The system is designed to be non-destructive: it only reads and writes to the specified Google Sheet
- The mock data fallback allows development without a Google Sheet
- All client-specific configuration is done via environment variables and data layer adjustments