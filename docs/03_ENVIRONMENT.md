# Variables de Entorno

## Google Sheets privado

| Variable | Uso |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email del service account con acceso editor al Sheet privado |
| `GOOGLE_PRIVATE_KEY` | Private key del service account, con saltos `\n` escapados |
| `IVETTE_SPREADSHEET_ID` | ID de `Luma Boutique OS - Ivette Berroa CRM` |

## Admin

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_ADMIN_PROTECTED` | `false` para auditoria visual inicial; `true` antes de datos reales o deploy publico |
| `CRM_BASIC_AUTH_USER` | Usuario de Basic Auth |
| `CRM_BASIC_AUTH_PASSWORD` | Password de Basic Auth |

## Tienda

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_ACTIVE_NICHE` | `boutique` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numero comercial de WhatsApp |
| `NEXT_PUBLIC_APP_URL` | URL base del sitio |

No guardar `.env.local`, credenciales, CSV, XLSX ni contactos reales en Git.
