# GDPR Compliance Implementation Plan

This platform collects personal data (name, email, phone, address, docType/docNumber) about users
tied to client tenants. We need to meet GDPR requirements: lawful consent, user rights (access,
erasure, portability, rectification), audit logging, data retention, and transparency via a
Privacy Policy.

## User Review Required

> [!IMPORTANT]
> **Right to erasure** will **anonymize** the user (not hard-delete) to preserve referential integrity with Invoices, ServiceRecords, etc. Fields zeroed: `name → "[DELETED]"`, `email → null`, `phone → null`, `address → null`, `docType/docNumber → null`, `status → DISABLED`.
> If you need **full hard deletion**, that requires a cascade strategy — let me know and I'll add it.

> [!NOTE]
> No third-party analytics or marketing cookies are currently used, so the cookie banner will pre-check "necessary" only and show analytics/marketing as unchecked options. This covers future integrations.

---

## Proposed Changes

### Component: Prisma / Database

#### [MODIFY] [schema.prisma](file:///c:/dev/onehorizone_clientes/backend/prisma/schema.prisma)
- Add `deletedAt DateTime?` and `consentedAt DateTime?` to `User`
- Add new model **`ConsentLog`** — records each consent event (userId, type, value, ip, userAgent, timestamp)
- Add new model **`GdprRequest`** — tracks access/delete/export/rectify requests and their status
- Add new model **`AuditLog`** — general access log for sensitive personal data endpoints

---

### Component: Backend — Middleware

#### [NEW] `backend/src/middleware/auditLog.js`
Express middleware factory: `auditLog(action)` → writes an `AuditLog` entry for the requesting user, endpoint, and timestamp. Attached to GDPR and sensitive routes.

---

### Component: Backend — GDPR Routes

#### [NEW] `backend/src/routes/gdpr.js`
All routes require [requireAuth](file:///c:/dev/onehorizone_clientes/backend/src/middleware/auth.js#4-18). Endpoints:

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/gdpr/consent` | Store consent (type: necessary/analytics/marketing, value: true/false) |
| `GET` | `/api/gdpr/me/data` | Right to access — returns all personal data for the current user |
| `GET` | `/api/gdpr/me/export` | Right to portability — JSON download of all user data |
| `POST` | `/api/gdpr/me/delete` | Right to erasure — anonymizes the user record |
| `PUT` | `/api/gdpr/me/rectify` | Right to rectification — updates name/phone/address |
| `GET` | `/api/gdpr/admin/requests` | (PLATFORM_ADMIN) List all GDPR requests |

#### [MODIFY] [server.js](file:///c:/dev/onehorizone_clientes/backend/src/server.js)
- Register `gdprRoutes` under `/api/gdpr`
- Add `POST /api/gdpr/consent` as a **public** route (before requireAuth) so unauthenticated users can store cookie consent

---

### Component: Backend — Data Retention

#### [NEW] `backend/src/services/dataRetention.js`
A simple function `runDataRetention()` that:
- Finds users with `deletedAt` older than 90 days and hard-deletes or further anonymizes them
- Can be called via a cron job or manually via admin endpoint
- Exported and called on server start in dev (configurable via env `DATA_RETENTION_RUN_ON_START`)

---

### Component: Frontend — Cookie Consent Banner

#### [NEW] `frontend/src/components/CookieConsentBanner.jsx`
- **Granular checkboxes**: Necessary (always on), Analytics (opt-in), Marketing (opt-in)
- Reads from `localStorage` → if preferences already saved, banner is hidden
- On "Accept Selected": saves to localStorage + calls `POST /api/gdpr/consent` for each type
- On "Accept All": accepts all three categories
- Includes link to Privacy Policy

#### [NEW] `frontend/src/hooks/useConsent.js`
Custom hook that manages consent state (localStorage) and exposes `hasConsent(type)` helper for blocking analytics/marketing code until consent given.

#### [MODIFY] [frontend/src/App.jsx](file:///c:/dev/onehorizone_clientes/frontend/src/App.jsx)
- Import and render `<CookieConsentBanner />` at the root level

---

### Component: Frontend — Privacy Policy Page

#### [NEW] `frontend/src/pages/PrivacyPolicy.jsx`
Full Privacy Policy page in Spanish/English covering:
- What data is collected and why
- Legal basis (GDPR Art. 6)
- Data retention periods
- User rights and how to exercise them
- Contact / DPO information
- Third-party services list (Railway hosting, PostgreSQL)

#### [MODIFY] [frontend/src/App.jsx](file:///c:/dev/onehorizone_clientes/frontend/src/App.jsx)
- Add route `/privacy-policy` → `<PrivacyPolicy />`

---

### Component: Frontend — Privacy Settings (User Rights UI)

#### [NEW] `frontend/src/pages/PrivacySettings.jsx`
Panel accessible from the dashboard (or `/privacy-settings` route) with:
- **"View My Data"** — calls `GET /api/gdpr/me/data` and displays the JSON
- **"Export My Data (JSON)"** — calls `GET /api/gdpr/me/export` and triggers browser download
- **"Rectify My Data"** — form to update name/phone/address
- **"Delete My Account"** — confirmation dialog, then calls `POST /api/gdpr/me/delete`
- **"Cookie Preferences"** — opens consent banner again

#### [MODIFY] [frontend/src/App.jsx](file:///c:/dev/onehorizone_clientes/frontend/src/App.jsx)
- Add protected route `/privacy-settings` → `<PrivacySettings />`

---

## Verification Plan

### Backend Endpoints (manual with curl / browser)

After running `cd backend && npm run dev`:

```powershell
# 1. Store consent (public, no auth needed)
Invoke-RestMethod -Uri "http://localhost:4000/api/gdpr/consent" -Method POST `
  -ContentType "application/json" `
  -Body '{"type":"analytics","value":true,"source":"cookie_banner"}'
# Expected: { "ok": true }

# 2. Get JWT first
$r = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'
$token = $r.token

# 3. Right to access
Invoke-RestMethod -Uri "http://localhost:4000/api/gdpr/me/data" `
  -Headers @{Authorization="Bearer $token"}
# Expected: JSON with user profile, consent logs, invoices

# 4. Export (portability)
Invoke-RestMethod -Uri "http://localhost:4000/api/gdpr/me/export" `
  -Headers @{Authorization="Bearer $token"}
# Expected: JSON file download

# 5. Rectify
Invoke-RestMethod -Uri "http://localhost:4000/api/gdpr/me/rectify" -Method PUT `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"name":"Updated Name","phone":"+34 600 000 001"}'
# Expected: { "ok": true, "user": { ... } }
```

### Frontend (manual)
1. Open `http://localhost:5173`
2. **Cookie banner** should appear at the bottom on first visit
3. Check/uncheck analytics & marketing → click "Accept Selected"
4. Refresh → banner should NOT reappear
5. Navigate to `/privacy-policy` → policy page renders
6. Login and navigate to `/privacy-settings` → all 4 actions visible and functional

### Migration
```powershell
cd backend
npx prisma migrate dev --name gdpr_compliance
npx prisma generate
```
