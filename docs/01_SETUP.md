# Setup Guide

## Prerequisites
- Node.js 18.x or later
- npm or yarn
- Google Cloud account with access to Google Sheets API
- A Google Sheet configured for the CRM (see SETUP_CREDENTIALS.md for details)

## Installation Steps

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd crm-admin
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   - Copy `.env.example` to `.env.local`
   - Fill in the required values:
     - `SPREADSHEET_ID`: From your Google Sheet URL
     - `GOOGLE_CLIENT_EMAIL`: From your service account JSON
     - `GOOGLE_PRIVATE_KEY`: From your service account JSON (with \n replaced by actual newlines)
     - `NEXT_PUBLIC_APP_URL`: Usually http://localhost:3000 for development

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## Important Notes
- The `.env.local` file should never be committed to version control
- For production deployment (e.g., Vercel), set environment variables in the platform settings
- The system will automatically fall back to mock data if credentials are not provided or are invalid