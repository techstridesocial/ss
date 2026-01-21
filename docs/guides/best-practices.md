# Best Practices: Stride Social Dashboard

## Overview

This document outlines the best practices for building, scaling, and maintaining the Stride Social Dashboard. These guidelines ensure the platform remains modular, secure, performant, and adaptable as new features are introduced.

All practices reflect the latest standards as of **Next.js 15.3.1** (April 2025) and the updated use of **OAuth for social media data access**.

---

## Project Structure

- Organize by feature using folders like `app/`, `components/`, `lib/`, `db/`, `utils/`, and `hooks/`.
- Separate portals by route group (`/brand`, `/influencer`, `/admin`).
- Centralize shared logic in `lib/` and API wrappers in `services/`.

---

## Important info

- images should be hosted on Vercel Blob
- CDN is cloudfare
---

## Next.js 15 Practices

### App Router
- Use the App Router exclusively under `app/`.
- Apply layouts, loading states, and error boundaries for each role-based area.

### Server Components First
- Default to Server Components to optimize performance and bundle size.
- Use `"use client"` only for interactive components like forms, modals, dropdowns.

### Server Actions
- Use Server Actions for data mutations (create, update, delete).
- Use API routes only for external service communication (OAuth, webhooks).

### Route Grouping
- Group role-specific features by domain:
  - `/brand/`
  - `/influencer/`
  - `/admin/`

### SEO & Metadata
- Use `generateMetadata()` to dynamically inject metadata for SEO and sharing.

### Data Fetching
- Fetch on the server where possible, using Next.js caching strategies.
- Use `revalidateTag()` and `cache` headers for smart invalidation.

---

## Frontend Development

### Styling
- Use **TailwindCSS 3.4+** with utility-first approach.
- Limit `@apply` usage to `globals.css` for shared layout primitives.

### UI Components
- Use **shadcn/ui** components for UI consistency.
- Wrap and extend components with `components/ui/` overrides where necessary.

### Animations
- Use **Framer Motion** for page transitions and interaction animations.
- Keep animation logic in isolated components to preserve readability.

### Responsiveness
- Every screen must be mobile-friendly and testable on common breakpoints (360px 768px).

---

## Backend/API Development

### Authentication & Authorization
- Use **Clerk** for login, signup, role management, and session validation.
- Wrap all server actions and API routes with role-based access control middleware.

### OAuth for Social Media Access
- Trigger OAuth flows from the Influencer Portal post-login (not for authentication).
- Handle OAuth redirects and token exchange via secure API routes.
- Store access tokens encrypted in Neon and refresh them automatically as needed.

### API Keys & Secrets
- Store all sensitive keys (Clerk, Modash, OpenAI) as Vercel environment variables.
- Do not expose API keys on the frontend or commit secrets to Git.

### Financial Data Handling
- Encrypt financial details (e.g., PayPal, bank info) at the application layer.
- Mask values in the UI; store encrypted in Neon.

### Database Design
- Use **Neon** PostgreSQL with a normalized schema.
- Index foreign keys and fields used in filters or sorts.
- Keep influencer data modular — including synced (Modash, OAuth) vs. manual attributes.

---

## CI/CD and Deployment

### Vercel Deployment
- All deployments are serverless on Vercel.
- HTTPS, cold start optimization, and scalability handled automatically.
- Preview deployments on PRs for QA and staging reviews.

### GitHub Actions
- Set up CI workflows to lint, test, and deploy on PR merge.
- Only merge into `main` after QA-approved preview.
- Rollbacks via Vercels dashboard in case of deployment failure.

---

## Security Best Practices

- Use Clerks session, token, and JWT infrastructure.
- Validate all routes with role-based middlewares.
- Enforce SSL/TLS between frontend and Neon DB.
- Store access tokens and sensitive data encrypted.
- Comply with GDPR — include user data deletion requests and clear data use statements.

---

## Monitoring and Error Handling

- Use Vercel and Neon dashboards for error tracking and uptime monitoring.
- Handle API and OAuth errors gracefully in the UI (status feedback, retries).
- Implement backend logging for key actions (influencer connections, campaign changes).

---

## Statement

These best practices ensure the Stride Social Dashboard delivers a clean, secure, and highly usable experience for all user types. Every piece — from social data syncing to role-based workflows — is built for clarity, maintainability, and professional-grade reliability.

---

## Modash API Credit Usage Best Practices

To ensure cost-effective and sustainable use of the Modash Discovery API, adhere to the following best practices regarding credit consumption and influencer data updates:

### 1. **Tiered Update Strategy**
- **GOLD Tier**: Update every 4 weeks - Top performers, active campaigns, high-value influencers
- **SILVER Tier**: Update every 6 weeks - Regular roster, good performance metrics
- **PARTNERED Tier**: Update every 6 weeks - External collaborators, potential signees
- **BRONZE Tier**: Update every 8 weeks - Lower engagement, inactive, or low-value influencers

### 2. **Automatic Tier Assignment**
- Tiers are automatically assigned based on:
  - **Follower count** (higher = better tier)
  - **Engagement rate** (higher = better tier)
  - **Campaign participation** (active campaigns = higher tier)
  - **Performance history** (successful campaigns = tier upgrades)

### 3. **Priority-Based Processing**
- **Never updated influencers** get highest priority regardless of tier
- **GOLD tier influencers** are processed first in each sync cycle
- **Active campaign participants** get priority boosts
- **High engagement/follower growth** increases update priority

### 4. **Credit Management**
- **Daily sync limit**: 100 credits (approximately 30% of monthly allowance)
- **Weekly comprehensive sync**: 200 credits for missed updates
- **Emergency updates**: 50 credits reserved for urgent campaign needs
- **Monthly buffer**: 300+ credits reserved for new influencer discovery

### 5. **Minimize Redundant Requests**
- Before making a Modash API call, check if the requested data is already up-to-date within the tier's interval
- Only trigger a new API request if the data is stale or missing
- Batch process updates during scheduled sync windows

### 6. **Smart Update Distribution**
- Spread updates across the month to avoid credit spikes
- Prioritize influencers with active campaigns or high business value
- Automatically disable updates for consistently inactive influencers

### 7. **Monitor Credit Usage**
- Track daily, weekly, and monthly credit consumption via automated monitoring
- Set up alerts when approaching 80% of monthly limits (2,400/3,000 credits)
- Generate monthly usage reports with tier breakdown and ROI analysis

### 8. **Leverage Rolling Credits**
- Take advantage of Modash's rolling credits: unused credits roll over as long as the plan is active
- Plan batch updates to maximize rollover benefits
- Schedule comprehensive syncs during low-usage periods

### 9. **Quality Control**
- Validate Modash data before updating internal records
- Flag inconsistencies or anomalies for manual review
- Maintain audit logs of all API calls and data updates

### 10. **Documentation & Transparency**
- Document all scheduled update jobs and their frequency in the codebase
- Communicate the tiered update policy to all team members and stakeholders
- Provide clear tier assignment criteria and upgrade paths

---

**Enhanced Summary:**
> To optimize Modash API costs and ensure platform scalability, implement a tiered update strategy (Gold: 4 weeks, Silver/Partnered: 6 weeks, Bronze: 8 weeks), prioritize high-value influencers, and monitor credit usage closely with automated daily sync jobs. This approach reduces costs by up to 40% while maintaining data freshness for business-critical influencers. 