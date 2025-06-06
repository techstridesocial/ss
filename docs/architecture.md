# System Architecture: Stride Social Dashboard

## Overview
The Stride Social Dashboard is architected for scalability, security, and speed. It follows a modern, serverless-first design, leveraging a single Next.js 15 application to unify the frontend and backend. Third-party services like Clerk, Modash, OpenAI, and Neon are integrated securely to extend functionality without adding heavy operational overhead.

---

## High-Level Architecture Diagram

[ User (Brand / Influencer (signed to agency) / Influencer (Partnered to Agency) / Admin) ]
|
v
[ Vercel Hosting (Next.js 15 App) ]
|
v
[ Next.js API Routes ] ---> [ Neon (PostgreSQL) ]
|
+--> [ Clerk (Auth - Email/Password) ]
|
+--> [ Modash API (Influencer Discovery & Data) ]
|
+--> [ OpenAI API (AI Suggestions) ]
|
---

## Frontend Architecture

- Built with **Next.js 15**, using App Router and Server Components for optimized performance.
- Styled using **TailwindCSS 3.4**, with UI components from **shadcn/ui**.
- **Framer Motion** provides rich, smooth animation effects.
- Role-based routing and UI visibility based on user type (Brand, Influencer, Admin).
- Influencer OAuth connection flows are embedded in the Influencer Portal and are triggered post-login.

---

## Backend Architecture

- **Next.js API Routes** serve all backend logic including:
  - Influencer syncing and metrics display.
  - Brand shortlists, campaign creation, and admin summaries.
  - OAuth token management for influencer accounts.
  - Secure form handling for financial data.

- Deployed as **Serverless Functions via Vercel**, auto-scaling with demand and ensuring fast cold starts and zero idle cost.

---

## Database Architecture

- **Neon (PostgreSQL)** hosts:
  - User accounts and roles.
  - Enriched influencer records from Modash and social media OAuth.
  - Brand shortlists, notes, campaign assignments, and statuses.
  - Financial information (securely encrypted at rest).
  - OAuth tokens and token refresh metadata (non-login purpose only).

- Neon enables:
  - Instant branching for safe feature testing
  - Fully serverless scalability
  - Automated backups and SSL-secured connections

---

## Authentication & Authorization

- **Clerk** is the sole login/auth provider for:
  - Brands, influencers, and admin users
  - Email/password-based signup and session handling
  - Role-based access enforcement across portals


## API Integrations

- **Modash API**:
  - Used to discover public influencers and import key metrics
  - Supplements internal influencer database
  - Provides verified analytics and audience breakdowns

- **OpenAI API**:
  - Used for generating ranked influencer suggestions
  - Enhances filter intelligence based on campaign history and niche data

- All third-party keys are stored in Vercel's encrypted environment variables.

---

## Hosting & Deployment

- Hosted on **Vercel**, delivering:
  - Global edge network performance
  - Automated deployment from GitHub
  - Previews for every pull request
  - Easy rollbacks and one-click production pushes
  - Host images on Vercel's blob webp

---

## Security Measures

- **Clerk Auth** protects all login and session flows.
- **OAuth tokens** are encrypted and used only for analytics, not user identity.
- **Financial submissions** are encrypted and masked before database storage.
- **Neon** ensures secure connections (SSL) and has automated daily backups.
- All API routes and frontend views enforce **strict role-based access controls**.

---

## Statement

This architecture prioritizes scalability, modularity, and security — ensuring Stride Social operates with real-time data accuracy, seamless team workflows, and a polished experience for clients and influencers alike. With clear separation between platform authentication and social media data access, the system maintains high reliability while enabling powerful analytics. 