# Environment Variables

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SPREADSHEET_ID` | The ID of the Google Sheet used as the database | `your-google-sheet-id` |
| `GOOGLE_CLIENT_EMAIL` | The email of the service account with access to the sheet | `crm-sheets-reader@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | The private key of the service account, copied from the JSON credentials | `paste-private-key-from-service-account-json` |
| `NEXT_PUBLIC_APP_URL` | The base URL of the application (used for absolute links) | `http://localhost:3000` |
| `CRM_BASIC_AUTH_USER` | Optional username for basic access protection | `admin` |
| `CRM_BASIC_AUTH_PASSWORD` | Optional password for basic access protection | `use-a-strong-password` |

## How to Set Up

### Local Development
1. Copy `.env.example` to `.env.local`
2. Edit `.env.local` and fill in the values from your Google Cloud service account and Google Sheet
3. Never commit `.env.local` to version control (it's in `.gitignore`)

### Production (Vercel)
1. Go to your project settings in Vercel
2. Navigate to Environment Variables
3. Add the same variables (without the `.local` suffix)
4. For `GOOGLE_PRIVATE_KEY`, paste the full private key value from the service account JSON and keep the newline formatting intact

## Security Notes
- The `GOOGLE_PRIVATE_KEY` is sensitive and must be kept secret
- In production, set `CRM_BASIC_AUTH_USER` and `CRM_BASIC_AUTH_PASSWORD` or enable Vercel Deployment Protection before exposing live CRM data
- The system will fall back to mock data if credentials are missing or invalid
- In development, you can leave the credentials empty to work with mock data
- In production, you must provide valid credentials for the integration to work

## Fallback Mechanism
The `getSheetsClient()` function in `/src/lib/google-sheets.ts` checks for the presence of all three Google-related variables. If any are missing, it returns `{ sheets: null, spreadsheetId: null }`, which causes the data layer functions to use mock data.
