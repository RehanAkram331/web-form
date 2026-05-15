# Advance Heating & Cooling — Next.js Site

A full Next.js 14 site for Advance Heating & Cooling with a multi-step service request form that submits leads directly to **GoHighLevel (GHL) CRM**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Then edit .env.local with your GHL credentials (see below)

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

---

## 🔑 GoHighLevel API Setup

1. Log in to your GHL account
2. Go to **Settings → Integrations → API Keys**
3. Create an API key with **Contacts** and **Notes** permissions
4. Copy your **Location ID** from **Settings → Business Profile**

Edit `.env.local`:

```env
GHL_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GHL_LOCATION_ID=abc123xyz
GHL_API_BASE_URL=https://services.leadconnectorhq.com
```

---

## 📋 Form Flow

| Step | Screen | Data Collected |
|------|--------|----------------|
| 1 | Postal Code | Validates Canadian postal code, resolves city name |
| 2 | Service Type | Heating / Cooling / Heat Pumps / etc. + action + equipment age |
| 3 | Contact Info | First name, last name, phone, email |
| 4 | Preferences | Preferred contact method (Phone/Email), address, notes |
| 5 | Review & Submit | Summary of all data before submitting |

On submit, the API route at `/api/service-request`:
1. Creates or upserts a **contact** in GHL with tags
2. Adds a structured **note** with all service details

---

## 🏗️ Project Structure

```
advance-hvac/
├── app/
│   ├── api/
│   │   └── service-request/
│   │       └── route.ts          # GHL API integration
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Homepage with hero
├── components/
│   ├── ServiceRequestModal.tsx   # Multi-step form modal
│   └── ServiceIcons.tsx          # SVG service icons
├── lib/
│   └── ghl.ts                    # GHL API utility
├── .env.local.example
└── tailwind.config.js
```

---

## 🎨 Design

- **Colors**: Brand red `#D32F2F`, brand blue `#1565C0`
- **Fonts**: Bebas Neue (display) + Outfit (body) via Google Fonts
- **Theme**: Dark hero + white modal — clean and professional

---

## 🚢 Deploy to Vercel

```bash
npx vercel
# Add GHL_API_KEY and GHL_LOCATION_ID as environment variables in Vercel dashboard
```
"# web-form" 
