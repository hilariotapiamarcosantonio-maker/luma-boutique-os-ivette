# Migration Guide

## Migrating from Mock Data to Live Google Sheets

The system is designed to work with mock data by default, allowing development without Google Sheets access. To migrate to live data:

### Steps
1. Obtain Google Sheet ID and service account credentials (see SETUP_CREDENTIALS.md)
2. Create `.env.local` with the required variables (copy from `.env.example`)
3. Ensure the service account has Viewer access to the Google Sheet
4. Restart the development server
5. The system will automatically detect credentials and switch to live data

## Migrating to a New Google Sheet
1. Create a new Google Sheet with the same structure (columns and sheet names)
2. Share it with the service account email as Viewer
3. Update `SPREADSHEET_ID` in `.env.local` (or Vercel environment variables)
4. Restart the application

## Data Structure Expectations
The system expects specific sheets and column structures. Refer to the mock data files or SETUP_CREDENTIALS.md for details.

## Rolling Back to Mock Data
1. Remove or clear the Google-related environment variables
2. Restart the application