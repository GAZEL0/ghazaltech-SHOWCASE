# Public Portfolio Version

This repository is a public-safe version of a production web platform.  
Sensitive credentials and private operational data were removed and replaced with demo-safe defaults.

## Stack
- Next.js 15 (App Router) + React 19
- Prisma + PostgreSQL
- NextAuth (credentials auth)
- Tailwind CSS
- next-intl (ar / en / tr)
- Nodemailer (optional)
- Cloudinary (optional)

## What This Demo Shows
- Multilingual marketing website
- Auth + role-based dashboard routes
- Admin APIs and data workflows
- Template/services/case-study style content flows
- Contact/support pipeline integration points

## Public-Safety Changes Included
- No `.env` secrets committed
- No hardcoded admin login credentials
- Contact/social/map data moved to public env placeholders
- Temporary/internal scratch files removed from version control

## Run Locally
1. Install dependencies:
```bash
npm install
```
2. Create local env file:
```powershell
Copy-Item .env.example .env.local
```
3. Update `.env.local` with your own values.
4. Run database migrations:
```bash
npx prisma migrate dev
```
5. (Optional) Seed demo admin user:
```bash
npx prisma db seed
```
6. Start development server:
```bash
npm run dev
```

## Environment Variables
See `.env.example` for the full list.

Required core variables:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Useful demo variables:
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`
- `NEXT_PUBLIC_SOCIAL_*`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
