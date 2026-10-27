# Event Portal Studio — Frontend Prototype

A zero-build HTML/CSS/JavaScript prototype for a reusable event registration website and configurable CMS.

## What works
- Multiple events from one HTML page (`/univers`, `/banca`, and new slugs)
- Create and duplicate events
- Event branding: title, subtitle, colour, hero/KV image, optional mobile image and logo
- Form builder: add, remove, reorder and edit questions, including file-input controls
- Configuration toggles for invitation-only, OTP verification, unique email and editing
- Capacity-question configuration (options and quotas)
- Confirmation email design preview
- Export individual/all event configurations as JSON
- Participant-facing preview with demo confirmation

## IMPORTANT — not production-ready
This is **frontend only**. Admin has NO authentication. CMS configuration is stored only in the browser's `localStorage`. Event images are stored as data URLs in localStorage and limited to 500 KB each. Uploaded participant files are NOT sent or stored. Submissions are NOT saved. No real email, eligibility validation, uniqueness, capacity enforcement, registration database, XLSX export or privacy/security controls exist.

**Do not collect real names, email addresses, passport details or other participant information with this prototype.** Anyone who knows `/admin` can change their own browser-local demo configuration. This does not change other visitors' configurations.

## Run locally
Use any static HTTP server from this folder:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/admin`. Direct event routes may require an SPA fallback (see deployment).

## Cloudflare Pages deployment
1. Create a Cloudflare Pages project using Direct Upload (or Git integration).
2. Upload the **contents** of this folder, including `_redirects`.
3. Visit `/admin` and configure events in your browser.
4. The `_redirects` rule serves `index.html` for event routes. It is suitable only for this frontend demo.

**Important:** Because this version uses localStorage, settings you change in the CMS are **not shared with other visitors**. For sharing a branded preview across devices, the next iteration should load a checked-in static JSON configuration, or a real backend. The `/admin` page must be protected/removed before production.

## Planned production architecture
- Static frontend on agency-controlled Cloudflare Pages
- Workers API for server-side validation, OTP, capacity reservations, and XLSX export
- D1 for event settings, eligibility and registrations
- R2 for private participant file uploads
- Transactional email service
- Agency-owned accounts, credentials, domain and backups

## Files
- `index.html`: shared SPA entry point
- `styles.css`: all styling
- `app.js`: prototype CMS, form renderer and localStorage demo state
- `_redirects`: Cloudflare Pages SPA routing
- `404.html`: fallback

## Handover
The agency should deploy into accounts it owns. No participant data should be placed in the frontend prototype or in a public GitHub repository.
