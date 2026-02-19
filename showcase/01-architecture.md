# Architecture Snapshot

## Goals
- Multilingual product surface (marketing + dashboard).
- Role-aware access control (client/admin/partner).
- Project lifecycle tracking (phases, comments, payments, revisions).
- Auditability for important user actions.

## High-Level Layers
- `Presentation`: Next.js pages/components.
- `Routing + Context`: locale middleware + session context.
- `Application`: API routes with authorization guards.
- `Domain/Data`: Prisma models for users, projects, phases, quotes, orders.
- `Integrations`: file upload + notifications (redacted in this showcase).

## Typical Request Flow
1. User hits locale-aware route.
2. Middleware resolves locale and lightweight referral state.
3. API validates session + role + ownership.
4. Request is applied to relational models (Prisma).
5. Audit/notification hooks run for critical operations.
